import os
import sys
import socket
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("render_diagnostics")

print("--- DIAGNOSTICS START ---")

# 1. Environment Check
print(f"User: {os.getenv('USER', 'unknown')}")
print(f"CWD: {os.getcwd()}")
port = os.getenv("PORT")
print(f"PORT env var: {port}")

if not port:
    print("❌ WARNING: PORT environment variable is not set!")
else:
    print(f"✅ PORT is set to {port}")

# 2. File Check
required_files = ["main.py", "serviceAccountKey.json"]
for f in required_files:
    if os.path.exists(f):
        print(f"✅ Found {f}")
    else:
        print(f"❌ MISSING {f}")

# 3. Import Check (Critical Modules)
print("Testing imports...")
try:
    import fastapi
    print("✅ fastapi imported")
    import uvicorn
    print("✅ uvicorn imported")
    import firebase_admin
    print("✅ firebase_admin imported")
    
    # Try importing app components
    print("Attempting to import app.main...")
    from main import app
    print("✅ Successfully imported main.app")
    
except ImportError as e:
    print(f"❌ IMPORT ERROR: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ UNEXPECTED ERROR during import: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# 4. Network Binding Check (Simulation)
if port:
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.bind(('0.0.0.0', int(port)))
        sock.close()
        print(f"✅ Successfully bound to 0.0.0.0:{port} (Test only)")
    except Exception as e:
        print(f"❌ FAILED to bind to port {port}: {e}")

print("--- DIAGNOSTICS COMPLETE ---")
