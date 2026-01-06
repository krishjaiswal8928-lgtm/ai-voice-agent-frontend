import os
import sys
import logging

# Configure logging to print immediately
logging.basicConfig(level=logging.DEBUG, stream=sys.stdout)
logger = logging.getLogger("render_debug")

print("--- RENDER DEBUG START ---")
print(f"Current Directory: {os.getcwd()}")
print(f"Files in root: {os.listdir('.')}")

# Check for Service Account Key
key_path = "serviceAccountKey.json"
if os.path.exists(key_path):
    print(f"✅ Found {key_path}")
else:
    print(f"❌ MISSING {key_path} - This might cause auth issues if environment variables aren't set.")

# Check ENV variables
print(f"PORT: {os.environ.get('PORT')}")
print(f"NGROK_DOMAIN: {os.environ.get('NGROK_DOMAIN', 'NOT_SET')}")

print("Attempting to import app.main...")
try:
    from main import app
    print("✅ Successfully imported main.app")
except Exception as e:
    print("❌ CRITICAL: Failed to import main.app")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("--- RENDER DEBUG END ---")
