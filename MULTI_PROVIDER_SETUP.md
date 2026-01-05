# Multi-Provider Setup Guide

This guide explains how to configure and use multiple LLM, TTS, and STT providers in the AI Voice Agent platform.

## Supported Providers

### LLM Providers
1. **Google Gemini** (default)
2. **OpenAI GPT**
3. **DeepSeek**

### TTS Providers
1. **AWS Polly** (default)
2. **OpenAI TTS**
3. **Google TTS** (partial support)

### STT Providers
1. **Deepgram** (default)
2. **AWS Transcribe** (partial support)
3. **OpenAI Whisper** (partial support)

## API Key Configuration

To use multiple providers, you need to configure the following API keys in your `.env` file:

```env
# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# DeepSeek
DEEPSEEK_API_KEY=your_deepseek_api_key

# AWS (for Polly and Transcribe)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1

# Deepgram
DEEPGRAM_API_KEY=your_deepgram_api_key
```

## Provider Selection

When creating a custom agent, you can select which providers to use:

1. **LLM Provider**: Choose between `gemini`, `openai`, or `deepseek`
2. **TTS Provider**: Choose between `aws_polly`, `openai`, or `gemini`
3. **STT Provider**: Choose between `deepgram`, `aws`, or `openai`

## Implementation Details

### LLM Service
The `llm_service.py` file now supports multiple providers through the `generate_response_with_provider()` function:

```python
# Example usage
response = generate_response_with_provider(
    provider="openai",
    transcript="Hello, how are you?",
    goal="Friendly conversation",
    personality="friendly"
)
```

### TTS Service
The `tts_service.py` file supports multiple providers through the `synthesize_speech_with_provider()` function:

```python
# Example usage
audio_bytes = await synthesize_speech_with_provider(
    provider="openai",
    text="Hello, how are you?"
)
```

### STT Service
The `stt_service.py` file supports multiple providers through the `transcribe_audio_with_provider()` function:

```python
# Example usage
transcript = await transcribe_audio_with_provider(
    provider="deepgram",
    audio_bytes=audio_data
)
```

## Orchestrator Integration

The orchestrator automatically uses the providers configured in the custom agent:

1. When a call starts, the orchestrator checks if a custom agent is associated with the campaign
2. If a custom agent exists, it retrieves the provider settings from the database
3. The orchestrator then uses the specified providers for LLM, TTS, and STT operations

## Fallback Mechanism

If a selected provider is not properly configured or fails, the system will fall back to default providers:

- **LLM**: Google Gemini
- **TTS**: AWS Polly
- **STT**: Deepgram

## Testing Providers

You can test the multi-provider implementation using the `test_multi_provider.py` script:

```bash
python test_multi_provider.py
```

This script will test each provider and display the results.

## Adding New Providers

To add support for new providers:

1. Update the service files (`llm_service.py`, `tts_service.py`, `stt_service.py`)
2. Add the new provider option to the frontend UI
3. Update the orchestrator to handle the new provider
4. Add any required API keys to the `.env.example` file
5. Update the requirements.txt file if new packages are needed