# Inbound Call Fix Guide: Correct Campaign, Agent, and Goal Resolution

## Problem Identified

Your Twilio phone number is **NOT configured to call your voice webhook**. Instead, Twilio is connecting directly to the WebSocket with hardcoded/stale parameters:

```
Stream parameters: {
  'goal': 'Handle incoming customer queries',
  'custom_agent_id': 'qw6ISLFaSsiKDvbZyDMl',  ❌ WRONG (doesn't exist)
  'campaign_id': 'nMqYhvCwI5GeUmoQrIXW',      ❌ WRONG (doesn't exist)
  'phone_number': '+918928795173'              ❌ WRONG (caller's number, not business line)
}
```

Your Firestore data shows the CORRECT mapping:
```
Phone Number: +16692313371
  ↓ assigned to agent
Agent: SPH5LutOqgiGQDEndx9x (Aditi)
  ↓ used in campaign
Campaign: NnNVRlyGutorgtii7Yru
  ↓ with goal
Goal: "Try to sell our Marketing Services."
```

---

## Root Cause

Twilio is configured to connect directly to `/twilio/ws` WebSocket without first calling `/twilio/voice/webhook`. This means:
- Your backend webhook never runs
- Stream parameters are never resolved from Firestore
- Stale/wrong parameters are passed directly to WebSocket

---

## Solution: Two-Part Fix

### Part 1: Configure Twilio to Call Your Webhook (REQUIRED)

Your Twilio phone number must be configured to call your voice webhook first. This is the **critical missing step**.

**Steps:**

1. Go to [Twilio Console](https://console.twilio.com)
2. Navigate to **Phone Numbers** → **Manage Numbers** → **Active Numbers**
3. Click on your phone number: **+16692313371**
4. Under **Voice & Fax** section, find **"A Call Comes In"**
5. Set it to:
   - **Webhook URL**: `https://{NGROK_DOMAIN}/twilio/voice/webhook`
   - **Method**: `POST`
6. Click **Save**

**Expected URL format:**
```
https://armand-literary-shakingly.ngrok-free.dev/twilio/voice/webhook
```
(Replace with your actual NGROK_DOMAIN from .env)

**Verification:**
Run this script to verify the configuration:
```bash
python check_twilio_voice_config.py
```

Expected output:
```
✅ Voice URL is correctly configured!
   Voice URL: https://armand-literary-shakingly.ngrok-free.dev/twilio/voice/webhook
```

---

### Part 2: Backend Enhancements (ALREADY APPLIED)

The backend now has multiple layers of protection:

#### Layer 1: Twilio Webhook (`app/routes/twilio_routes.py`)
- Resolves campaign/agent/goal from Firestore using the "To" number
- Generates TwiML with correct stream parameters
- Logs the resolution for debugging

#### Layer 2: WebSocket Handler (`app/services/twilio_media_ws.py`)
- Re-validates and overrides parameters using Firestore
- Attempts to resolve using the business phone number
- Falls back to any active inbound campaign if needed
- Logs all resolution attempts

#### Layer 3: Orchestrator (`app/agent/orchestrator.py`)
- Safely fetches the custom agent with comprehensive error handling
- Lists available agents if the requested one doesn't exist
- Falls back to default agent only as last resort

---

## Expected Behavior After Fix

### When someone calls +16692313371:

**1. Twilio calls your webhook:**
```
POST https://{NGROK_DOMAIN}/twilio/voice/webhook
From: +918928795173 (caller)
To: +16692313371 (your business number)
```

**2. Your webhook resolves the mapping:**
```
Logs:
  STRICT ROUTING: Business line +16692313371 assigned to agent SPH5LutOqgiGQDEndx9x
  ✅ Found inbound campaign NnNVRlyGutorgtii7Yru for agent SPH5LutOqgiGQDEndx9x
  Resolved Inbound Context - Campaign: NnNVRlyGutorgtii7Yru, Agent: SPH5LutOqgiGQDEndx9x, Goal: Try to sell our Marketing Services.
```

**3. Webhook returns TwiML with correct parameters:**
```xml
<Response>
  <Connect>
    <Stream url="wss://{NGROK_DOMAIN}/twilio/ws">
      <Parameter name="campaign_id" value="NnNVRlyGutorgtii7Yru"/>
      <Parameter name="custom_agent_id" value="SPH5LutOqgiGQDEndx9x"/>
      <Parameter name="goal" value="Try to sell our Marketing Services."/>
      <Parameter name="phone_number" value="+16692313371"/>
    </Stream>
  </Connect>
</Response>
```

**4. Twilio connects to WebSocket with correct parameters:**
```
Logs:
  Stream parameters: {
    'campaign_id': 'NnNVRlyGutorgtii7Yru',
    'custom_agent_id': 'SPH5LutOqgiGQDEndx9x',
    'goal': 'Try to sell our Marketing Services.',
    'phone_number': '+16692313371'
  }
```

**5. WebSocket handler validates and confirms:**
```
Logs:
  WS: Attempting to resolve mapping using phone_number: +16692313371
  WS: Found 1 phone record(s) for +16692313371
  WS: Resolved agent from phone: SPH5LutOqgiGQDEndx9x
  WS: ✅ Resolved campaign NnNVRlyGutorgtii7Yru for agent SPH5LutOqgiGQDEndx9x
  WS: Goal: Try to sell our Marketing Services.
  ✅ WS parameters OVERRIDDEN using Firestore mapping
```

**6. Orchestrator loads the correct agent:**
```
Logs:
  🔍 Fetching custom agent with ID: 'SPH5LutOqgiGQDEndx9x' from collection 'custom_agents'
  ✅ Loaded custom agent: Aditi (ID: SPH5LutOqgiGQDEndx9x)
  Initialized autonomous agent for call CA...
```

**7. Agent uses correct personality and goal:**
```
Logs:
  Custom agent details - Name: Aditi, ID: SPH5LutOqgiGQDEndx9x
  Personality: persuasive
  Goal: Try to sell our Marketing Services.
```

---

## Verification Checklist

After configuring Twilio:

- [ ] Twilio console shows Voice URL = `https://{NGROK_DOMAIN}/twilio/voice/webhook`
- [ ] Run `python check_twilio_voice_config.py` → shows ✅ configured
- [ ] Make a test call to +16692313371
- [ ] Backend logs show webhook being called
- [ ] Backend logs show correct campaign/agent/goal resolution
- [ ] WebSocket logs show parameters being overridden
- [ ] Orchestrator logs show agent "Aditi" being loaded
- [ ] Agent responds with persuasive tone (not default generic tone)

---

## Troubleshooting

### Issue: Webhook not being called
**Solution:** Verify Twilio console configuration. The Voice URL must be set to your webhook endpoint.

### Issue: "No exact phone match" in logs
**Solution:** Check that your phone number in Firestore matches exactly (including country code and formatting).

### Issue: "Could not resolve agent from phone number"
**Solution:** Verify that the phone number document has `assigned_agents` array with the agent ID.

### Issue: Agent still not loading
**Solution:** Check that the agent ID exists in `custom_agents` collection in Firestore.

---

## Files Modified

1. **app/routes/twilio_routes.py** - Webhook now resolves campaign/agent/goal from Firestore
2. **app/services/twilio_media_ws.py** - WebSocket handler validates and overrides parameters
3. **app/agent/orchestrator.py** - Enhanced agent fetching with diagnostics
4. **app/database/firestore.py** - Improved initialization logging

---

## Next Steps

1. **Configure Twilio** (manual step in console)
2. **Restart backend:**
   ```bash
   python main.py
   ```
3. **Test with a call** to your Twilio number
4. **Monitor logs** for the expected resolution flow
5. **Verify agent behavior** matches the configured personality and goal

---

## Support

If issues persist after configuration:
1. Check Twilio console Voice URL setting
2. Verify Firestore data integrity (phone number, campaign, agent exist)
3. Review backend logs for specific error messages
4. Run diagnostic scripts to verify Firestore connectivity

