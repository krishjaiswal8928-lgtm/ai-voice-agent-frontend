
---

### 2️⃣ **API_REFERENCE.md**

```markdown
# 📘 API Reference

## 1. Voice Routes
`POST /voice/start-call`
- Starts a new call and triggers STT → LLM → TTS pipeline.

`POST /voice/handle-response`
- Handles Twilio webhook for ongoing call.

## 2. Client Routes
`POST /client/register`
- Registers new business client.

`GET /client/{id}`
- Fetch client profile and active goals.

## 3. Report Routes
`GET /report/export`
- Export data to Excel or CSV.

## Authentication
Each API request must include a header:
