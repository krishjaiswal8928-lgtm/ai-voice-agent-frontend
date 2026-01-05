# LangGraph Implementation in AI Voice Agent

## Overview

This document describes the implementation of LangGraph in the AI Voice Agent project to enhance its autonomous capabilities, particularly for handling scheduled callbacks.

## Key Components Added

### 1. LangGraph Agent (`app/agent/autonomous/langgraph_agent.py`)

A new LangGraph-based agent that provides:
- State management using TypedDict
- Graph-based workflow with nodes and edges
- Conditional routing based on conversation context
- Integration with callback scheduling

### 2. Callback Scheduler (`app/services/callback_scheduler.py`)

A service for scheduling and managing callback requests:
- Schedule callbacks with specific timing
- Execute scheduled callbacks
- Track callback status
- Cancel scheduled callbacks

### 3. Dependencies (`requirements.txt`)

Added LangGraph and updated Pydantic to version 2.x for compatibility.

## Workflow

The LangGraph agent follows this workflow:

1. **Planner Node**: Determines the next action based on conversation context
2. **Conversation Node**: Continues the conversation using the existing LLM service
3. **Callback Scheduler Node**: Schedules callbacks when requested by the user
4. **End Node**: Ends the conversation when appropriate

## Features Implemented

### 1. Scheduled Callbacks

When a user says something like "Call me back in 30 minutes", the agent:
- Recognizes the callback request
- Extracts the timing information
- Schedules the callback using the callback scheduler
- Responds appropriately to the user

### 2. Enhanced State Management

LangGraph provides built-in state management that:
- Tracks conversation history
- Manages scheduled callbacks
- Maintains conversation goals and context
- Tracks completion status

### 3. Conditional Workflows

The agent can branch its behavior based on:
- User requests for callbacks
- Conversation completion signals
- Other conversation contexts

## Integration Points

### 1. Orchestrator Integration

The LangGraph agent is integrated into the existing orchestrator:
- Initialized alongside the existing autonomous agent
- Used as the primary agent for new conversations
- Falls back to the existing agent if needed

### 2. API Endpoints

Added a new endpoint to check scheduled callbacks:
- GET `/campaigns/callbacks` - Returns all scheduled callbacks

## Benefits of LangGraph Implementation

1. **Explicit State Management**: Better tracking of conversation state and scheduled actions
2. **Complex Workflows**: Ability to create more sophisticated conversation flows
3. **Persistence**: Built-in support for checkpointing and state persistence
4. **Conditional Logic**: Advanced routing based on conversation context
5. **Scalability**: Easier to extend with new nodes and workflows

## Testing

A test script (`test_langgraph.py`) is included to verify the functionality:
- Tests callback scheduling
- Tests conversation flow
- Tests conversation completion

## Future Enhancements

1. **Human-in-the-Loop**: Add support for human intervention in conversations
2. **Advanced Planning**: Use LLM-based planning instead of rule-based planning
3. **Multi-step Workflows**: Create more complex workflows for different scenarios
4. **Error Recovery**: Implement sophisticated error recovery mechanisms
5. **Analytics**: Add detailed analytics for conversation flows and callback performance