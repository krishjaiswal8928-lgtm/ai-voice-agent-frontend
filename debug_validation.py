import requests

# Test the exact endpoint with minimal data to see validation error
url = "http://localhost:8000/rag/upload-url/0"
data = {
    "url": "https://example.com"
    # Don't include agent_id to see if that's required
}

print("Testing upload-url endpoint with minimal data...")
print(f"URL: {url}")
print(f"Data: {data}")

try:
    response = requests.post(url, data=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

# Test with missing URL
print("\nTesting with missing URL...")
data_missing_url = {
    # Missing required 'url' field
    "agent_id": 5
}

try:
    response = requests.post(url, data=data_missing_url)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")