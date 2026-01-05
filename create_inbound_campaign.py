import requests
import json

# Login to get access token
login_data = {
    "username": "admin",
    "password": "admin"
}

response = requests.post("http://localhost:8000/auth/login", json=login_data)
if response.status_code == 200:
    token_data = response.json()
    access_token = token_data["access_token"]
    print(f"Access token: {access_token}")
    
    # Create inbound campaign
    campaign_data = {
        "name": "Test Inbound Campaign",
        "type": "inbound",
        "goal": "Answer customer questions about our products and services"
    }
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    response = requests.post("http://localhost:8000/campaigns", json=campaign_data, headers=headers)
    if response.status_code == 200:
        campaign = response.json()
        print(f"Created campaign: {campaign}")
        
        # Start the campaign
        response = requests.post(f"http://localhost:8000/campaigns/{campaign['id']}/start", headers=headers)
        if response.status_code == 200:
            started_campaign = response.json()
            print(f"Started campaign: {started_campaign}")
        else:
            print(f"Failed to start campaign: {response.status_code} - {response.text}")
    else:
        print(f"Failed to create campaign: {response.status_code} - {response.text}")
else:
    print(f"Failed to login: {response.status_code} - {response.text}")