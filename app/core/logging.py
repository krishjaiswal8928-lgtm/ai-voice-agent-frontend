import logging
import os
from typing import Optional

# Configure logging
def setup_logging(log_level: str = "INFO") -> None:
    """Set up basic logging configuration."""
    level = getattr(logging, log_level.upper(), logging.INFO)
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler("app.log")
        ]
    )

def get_logger(name: str) -> logging.Logger:
    """Get a logger instance with the specified name."""
    return logging.getLogger(name)