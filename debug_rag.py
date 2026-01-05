import requests
import json

# Test with actual validation to see what's wrong
url = "http://localhost:8000/rag/upload-url/0"
# Don't include Authorization header to see the actual validation error
data = {
    "url": "https://example.com",
    "agent_id": 5
}

print("Testing upload-url endpoint without auth...")
print(f"URL: {url}")
print(f"Data: {data}")

try:
    response = requests.post(url, data=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

# Also test with JSON to see if that's the issue
print("\nTesting with JSON data...")
headers = {"Content-Type": "application/json"}
json_data = {
    "url": "https://example.com",
    "agent_id": 5
}

try:
    response = requests.post(url, json=json_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")