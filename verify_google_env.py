
import os
from dotenv import load_dotenv

def verify_env():
    # Load .env file
    load_dotenv()
    
    print("Checking Google Auth Environment Variables...")
    
    google_client_id = os.getenv("GOOGLE_CLIENT_ID")
    next_public_id = os.getenv("NEXT_PUBLIC_GOOGLE_CLIENT_ID")
    
    print(f"GOOGLE_CLIENT_ID present: {bool(google_client_id)}")
    if google_client_id:
        print(f"GOOGLE_CLIENT_ID length: {len(google_client_id)}")
        print(f"GOOGLE_CLIENT_ID prefix: {google_client_id[:10]}...")
        
    print(f"NEXT_PUBLIC_GOOGLE_CLIENT_ID present: {bool(next_public_id)}")
    if next_public_id:
        print(f"NEXT_PUBLIC_GOOGLE_CLIENT_ID length: {len(next_public_id)}")
        
    if google_client_id != next_public_id:
        print("\nWARNING: GOOGLE_CLIENT_ID and NEXT_PUBLIC_GOOGLE_CLIENT_ID do not match!")
    else:
        print("\nIDs match.")
        
    if not google_client_id:
        print("\nERROR: GOOGLE_CLIENT_ID is missing in .env")
        
    if not next_public_id:
        print("\nERROR: NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing in .env")

if __name__ == "__main__":
    verify_env()
