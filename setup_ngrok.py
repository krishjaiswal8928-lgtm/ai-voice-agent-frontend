import os
import subprocess
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def setup_ngrok():
    """Setup ngrok to point to the backend server"""
    try:
        # Kill any existing ngrok processes
        print("Stopping any existing ngrok processes...")
        subprocess.run(["taskkill", "/IM", "ngrok.exe", "/F"], capture_output=True)
        time.sleep(2)
        
        # Start ngrok pointing to backend (port 8000)
        print("Starting ngrok tunnel for backend on port 8000...")
        ngrok_process = subprocess.Popen([
            "ngrok", "http", "8000"
        ])
        
        print("Waiting for ngrok to start...")
        time.sleep(5)
        
        # Get the public URL from ngrok
        import requests
        try:
            response = requests.get("http://localhost:4040/api/tunnels")
            tunnels = response.json()
            if "tunnels" in tunnels and len(tunnels["tunnels"]) > 0:
                public_url = tunnels["tunnels"][0]["public_url"]
                print(f"✅ Ngrok tunnel established: {public_url}")
                
                # Update the .env file with the new domain
                env_file = ".env"
                if os.path.exists(env_file):
                    with open(env_file, "r") as f:
                        lines = f.readlines()
                    
                    # Update NGROK_DOMAIN line
                    with open(env_file, "w") as f:
                        for line in lines:
                            if line.startswith("NGROK_DOMAIN="):
                                f.write(f"NGROK_DOMAIN={public_url.replace('https://', '')}\n")
                            else:
                                f.write(line)
                    
                    print(f"✅ Updated NGROK_DOMAIN in .env file")
                return public_url
            else:
                print("❌ No tunnels found")
                return None
        except Exception as e:
            print(f"❌ Error getting ngrok tunnel info: {e}")
            return None
            
    except Exception as e:
        print(f"❌ Error setting up ngrok: {e}")
        return None

if __name__ == "__main__":
    setup_ngrok()