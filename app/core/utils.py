from typing import Any, Dict, List, Optional
import re
import os

def validate_phone_number(phone: str) -> bool:
    """Validate a phone number format."""
    pattern = r"^\+?[1-9]\d{1,14}$"
    return re.match(pattern, phone) is not None

def format_phone_number(phone: str) -> str:
    """Format a phone number to E.164 format."""
    # Remove all non-digit characters
    digits = re.sub(r"\D", "", phone)
    
    # If it starts with 0, remove it (assuming it's a local format)
    if digits.startswith("0"):
        digits = digits[1:]
    
    # If it doesn't start with +, add +
    if not digits.startswith("+"):
        digits = "+1" + digits  # Default to US country code
    
    return digits

def sanitize_input(input_str: str) -> str:
    """Sanitize user input to prevent injection attacks."""
    # Remove potentially dangerous characters
    sanitized = re.sub(r"[<>'\"&]", "", input_str)
    return sanitized.strip()

def get_env_variable(var_name: str, default: Optional[str] = None) -> str:
    """Get environment variable with a default value."""
    return os.getenv(var_name, default)

def chunk_list(lst: List[Any], chunk_size: int) -> List[List[Any]]:
    """Split a list into chunks of specified size."""
    for i in range(0, len(lst), chunk_size):
        yield lst[i:i + chunk_size]