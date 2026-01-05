import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_api_keys():
    """Test if all required API keys are present"""
    print("Testing API key configuration...")
    
    # Test Deepgram API key
    deepgram_key = os.getenv("DEEPGRAM_API_KEY")
    if deepgram_key:
        print(f"✅ Deepgram API Key: Present ({len(deepgram_key)} characters)")
    else:
        print("❌ Deepgram API Key: Missing")
    
    # Test Twilio credentials
    twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
    twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
    if twilio_sid and twilio_token:
        print(f"✅ Twilio Credentials: Present (SID: {twilio_sid[:10]}...)")
    else:
        print("❌ Twilio Credentials: Missing")
    
    # Test AWS credentials
    aws_key = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret = os.getenv("AWS_SECRET_ACCESS_KEY")
    if aws_key and aws_secret:
        print(f"✅ AWS Credentials: Present (Key: {aws_key[:10]}...)")
    else:
        print("❌ AWS Credentials: Missing")
    
    # Test OpenAI API key
    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key:
        print(f"✅ OpenAI API Key: Present ({len(openai_key)} characters)")
    else:
        print("❌ OpenAI API Key: Missing")
    
    # Test DeepSeek API key
    deepseek_key = os.getenv("DEEPSEEK_API_KEY")
    if deepseek_key:
        print(f"✅ DeepSeek API Key: Present ({len(deepseek_key)} characters)")
    else:
        print("❌ DeepSeek API Key: Missing")
    
    # Test Gladia API key
    gladia_key = os.getenv("GLADIA_API_KEY")
    if gladia_key:
        print(f"✅ Gladia API Key: Present ({len(gladia_key)} characters)")
    else:
        print("❌ Gladia API Key: Missing")
    
    # Test AssemblyAI API key
    assembly_key = os.getenv("ASSEMBLY_AI_API_KEY")
    if assembly_key:
        print(f"✅ AssemblyAI API Key: Present ({len(assembly_key)} characters)")
    else:
        print("❌ AssemblyAI API Key: Missing")
    
    # Test Firebase credentials
    firebase_creds = os.getenv("FIREBASE_CREDENTIALS")
    if firebase_creds:
        print(f"✅ Firebase Credentials Path: {firebase_creds}")
        if os.path.exists(firebase_creds):
            print("✅ Firebase Credentials File: Exists")
        else:
            print("❌ Firebase Credentials File: Not Found")
    else:
        print("❌ Firebase Credentials Path: Missing")

if __name__ == "__main__":
    test_api_keys()