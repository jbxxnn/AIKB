# Google Calendar Integration Guide

## 🎯 How It Works

This implementation uses **function calling** instead of MCP connectors, which is more reliable and gives you full control.

## 📋 What's Been Built

### 1. **Backend Functions** (`app/api/calendar/functions/route.ts`)
- Direct Google Calendar API integration
- Handles: `search_events`, `create_event`, `update_event`, `delete_event`
- Automatic token refresh and error handling

### 2. **Function Definitions** (`lib/calendar-functions.ts`)
- Complete function schemas for the AI agent
- Strict mode enabled for reliable function calls
- Comprehensive parameter validation

### 3. **AI Endpoint** (`app/api/ai/calendar/route.ts`)
- Simple endpoint for AI agent to call calendar functions
- Authentication and error handling included

## 🚀 How to Configure Agent Builder

### Step 1: Add Function Calling to Your Workflow

1. **Go to Agent Builder**: https://platform.openai.com/agent-builder
2. **Open your workflow** (the one with ID from `OPENAI_ADMIN_WORKFLOW_ID`)
3. **Add a Function node** (not a Connector node)
4. **Configure the function** with these details:

#### Function Configuration:
```json
{
  "name": "calendar_manager",
  "description": "Manage Google Calendar events - search, create, update, and delete calendar events",
  "url": "https://aikb-mu.vercel.app/api/ai/calendar",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "parameters": {
    "type": "object",
    "properties": {
      "function_name": {
        "type": "string",
        "enum": ["search_events", "create_event", "update_event", "delete_event"],
        "description": "The calendar function to execute"
      },
      "arguments": {
        "type": "object",
        "description": "Arguments for the calendar function"
      }
    },
    "required": ["function_name", "arguments"]
  }
}
```

### Step 2: Add System Instructions

Add this to your Agent Builder workflow's system prompt:

```
You have access to Google Calendar through the calendar_manager function. You can:

1. **Search Events** (`search_events`):
   - Check availability for specific time ranges
   - Find existing events by query or time
   - Use this before scheduling to avoid conflicts

2. **Create Events** (`create_event`):
   - Schedule meetings, appointments, reminders
   - Include attendees, location, description
   - Always check availability first

3. **Update Events** (`update_event`):
   - Modify existing events
   - Change time, attendees, or details
   - Requires the event ID

4. **Delete Events** (`delete_event`):
   - Cancel or remove events
   - Requires the event ID

**Important Guidelines:**
- Always search for conflicts before creating events
- Use proper RFC3339 timestamps with timezone
- Be specific about event details (title, time, attendees)
- Confirm details with users before creating events
- Handle timezone conversions properly

**Example Usage:**
- "Schedule a meeting with John tomorrow at 2 PM"
- "What's on my calendar today?"
- "Find a free slot next week for a 1-hour meeting"
- "Move my 3 PM meeting to 4 PM"
```

## 🧪 Testing the Integration

### 1. **Deploy Your Code**
```bash
git add .
git commit -m "Add Google Calendar function calling integration"
git push origin main
```

### 2. **Set Up Environment Variables in Vercel**
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://aikb-mu.vercel.app/api/calendar/callback
```

### 3. **Run Database Migration**
```bash
psql $NEON_DATABASE_URL -f scripts/004_add_calendar_settings.sql
```

### 4. **Connect Calendar**
- Go to `/dashboard/schedule` as an admin
- Connect your Google Calendar

### 5. **Test with AI Agent**
- Go to `/dashboard/chat`
- Ask: "Schedule a meeting tomorrow at 2 PM"
- The AI should use the calendar functions to create the event

## 🔧 Function Details

### Search Events
```javascript
{
  "function_name": "search_events",
  "arguments": {
    "timeMin": "2025-01-20T00:00:00-05:00",
    "timeMax": "2025-01-20T23:59:59-05:00",
    "query": "meeting"
  }
}
```

### Create Event
```javascript
{
  "function_name": "create_event",
  "arguments": {
    "eventData": {
      "summary": "Team Meeting",
      "description": "Weekly team sync",
      "start": {
        "dateTime": "2025-01-20T14:00:00-05:00",
        "timeZone": "America/New_York"
      },
      "end": {
        "dateTime": "2025-01-20T15:00:00-05:00", 
        "timeZone": "America/New_York"
      },
      "attendees": [
        {"email": "john@example.com", "displayName": "John Doe"}
      ],
      "location": "Conference Room A"
    }
  }
}
```

## ✅ Benefits of This Approach

1. **Full Control**: You control the calendar integration completely
2. **Reliable**: No dependency on external MCP connectors
3. **Flexible**: Easy to add more calendar functions
4. **Debuggable**: Clear error messages and logging
5. **Secure**: Tokens are managed securely in your backend

## 🎉 What Users Can Do

Once configured, users can naturally ask the AI:
- "Schedule a meeting with Sarah next Tuesday at 3 PM"
- "What meetings do I have today?"
- "Find a free hour tomorrow afternoon"
- "Move my 2 PM meeting to 3 PM"
- "Cancel my meeting with John"

The AI will automatically use the appropriate calendar functions to fulfill these requests!
