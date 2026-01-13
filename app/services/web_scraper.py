import aiohttp
import asyncio
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time
from typing import List, Set, Dict
import re
import random
import logging

# Set up logging
logger = logging.getLogger(__name__)

class WebScraper:
    """Web scraper for extracting content from websites with retry logic and robustness"""
    
    # User agents for rotation to avoid being blocked
    USER_AGENTS = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    ]
    
    def __init__(self, max_pages: int = 50, delay: float = 0.5, max_retries: int = 3, concurrency: int = 10):
        self.max_pages = max_pages
        self.delay = delay
        self.max_retries = max_retries
        self.concurrency = concurrency
        self.visited_urls: Set[str] = set()
        self.scraped_content: List[Dict] = []
        self.failed_urls: List[Dict] = []
        self.base_domain = ""
        
    async def scrape_website(self, base_url: str, progress_callback=None) -> Dict[str, any]:
        """Scrape all pages from a base URL asynchronously
        
        Args:
            base_url: The URL to start scraping from
            progress_callback: Optional async function(scraped_count, total_found) to report progress
            
        Returns:
            Dict with 'content' (list of scraped pages), 'total_pages', 'failed_urls'
        """
        self.visited_urls.clear()
        self.scraped_content.clear()
        self.failed_urls.clear()
        self.base_domain = urlparse(base_url).netloc
        
        try:
            # Start with the base URL
            queue = asyncio.Queue()
            queue.put_nowait(base_url)
            self.visited_urls.add(base_url)
            
            # Create workers
            workers = []
            for _ in range(self.concurrency):
                worker = asyncio.create_task(self._worker(queue, progress_callback))
                workers.append(worker)
            
            # Wait for the queue to be processed
            await queue.join()
            
            # Cancel workers
            for worker in workers:
                worker.cancel()
            
            # Wait for workers to finish cancelling
            await asyncio.gather(*workers, return_exceptions=True)
                
        except Exception as e:
            logger.error(f"Error scraping website: {e}")
            
        return {
            'content': self.scraped_content,
            'total_pages': len(self.scraped_content),
            'failed_urls': self.failed_urls
        }
    
    async def _worker(self, queue: asyncio.Queue, progress_callback=None):
        """Worker to process URLs from the queue"""
        async with aiohttp.ClientSession() as session:
            while True:
                try:
                    current_url = await queue.get()
                    
                    if len(self.visited_urls) > self.max_pages:
                        queue.task_done()
                        continue
                        
                    logger.info(f"Scraping: {current_url}")
                    content = await self._scrape_page(session, current_url)
                    
                    if content:
                        self.scraped_content.append(content)
                        
                        # Find more URLs to visit
                        new_urls = self._extract_links(current_url, content.get('html', ''))
                        for url in new_urls:
                            # Only visit URLs from the same domain and not visited yet
                            if self._is_same_domain(url) and url not in self.visited_urls:
                                if len(self.visited_urls) < self.max_pages:
                                    self.visited_urls.add(url)
                                    queue.put_nowait(url)
                    else:
                        self.failed_urls.append({
                            'url': current_url,
                            'reason': 'Failed to scrape after retries'
                        })
                    
                    if progress_callback:
                        try:
                            total_found = len(self.visited_urls)
                            scraped_count = len(self.scraped_content) + len(self.failed_urls)
                            if asyncio.iscoroutinefunction(progress_callback):
                                await progress_callback(scraped_count, total_found)
                            else:
                                progress_callback(scraped_count, total_found)
                        except Exception as e:
                            logger.error(f"Error in progress callback: {e}")

                    # Be respectful to the server with a small delay
                    if self.delay > 0:
                        await asyncio.sleep(self.delay)
                        
                    queue.task_done()
                    
                except asyncio.CancelledError:
                    break
                except Exception as e:
                    logger.error(f"Worker error: {e}")
                    queue.task_done()
    
    async def _scrape_page(self, session: aiohttp.ClientSession, url: str) -> Dict:
        """Scrape a single page with retry logic"""
        for attempt in range(self.max_retries):
            try:
                headers = {
                    'User-Agent': random.choice(self.USER_AGENTS)
                }
                
                async with session.get(url, headers=headers, timeout=15, ssl=False) as response:
                    if response.status != 200:
                        logger.warning(f"Failed to fetch {url}, status: {response.status}")
                        if attempt < self.max_retries - 1:
                            await asyncio.sleep(2 ** attempt)
                            continue
                        return {}
                        
                    html_content = await response.text()
                    
                    soup = BeautifulSoup(html_content, 'html.parser')
                    
                    # Remove script and style elements
                    for script in soup(["script", "style"]):
                        script.decompose()
                        
                    # Extract title
                    title = soup.title.string if soup.title else ""
                    
                    # Extract text content
                    text = soup.get_text()
                    
                    # Clean up text
                    lines = (line.strip() for line in text.splitlines())
                    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                    text = ' '.join(chunk for chunk in chunks if chunk)
                    
                    return {
                        'url': url,
                        'title': title,
                        'content': text,
                        'html': str(soup)
                    }
                
            except Exception as e:
                logger.warning(f"Error scraping page {url} on attempt {attempt + 1}: {e}")
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(2 ** attempt)
                else:
                    return {}
        return {}
    
    def _extract_links(self, base_url: str, html: str) -> List[str]:
        """Extract all links from HTML content"""
        soup = BeautifulSoup(html, 'html.parser')
        links = []
        
        for link in soup.find_all('a', href=True):
            href = link['href']
            # Skip empty links, anchors, javascript, mailto
            if not href or href.startswith('#') or href.startswith('javascript:') or href.startswith('mailto:'):
                continue
                
            absolute_url = urljoin(base_url, href)
            
            # Only include HTTP/HTTPS links
            if absolute_url.startswith(('http://', 'https://')):
                # Remove fragments and query params for cleaner URLs (optional, but good for deduplication)
                parsed = urlparse(absolute_url)
                clean_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
                links.append(clean_url)
                
        return links
    
    def _is_same_domain(self, url: str) -> bool:
        """Check if URL is from the same domain as base URL"""
        url_domain = urlparse(url).netloc
        return self.base_domain == url_domain

# Example usage
if __name__ == "__main__":
    async def main():
        scraper = WebScraper(max_pages=5)
        result = await scraper.scrape_website("https://example.com")
        print(f"Scraped {result['total_pages']} pages")
        for page in result['content']:
            print(f"Title: {page['title']}")
            print(f"URL: {page['url']}")
            print(f"Content length: {len(page['content'])} characters")
            print("-" * 50)
            
    asyncio.run(main())