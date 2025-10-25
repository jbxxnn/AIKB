#!/usr/bin/env python3
"""
Simple ChatKit Server Implementation
Direct OpenAI API integration without ChatKit SDK
"""

import os
import asyncio
import json
import logging
from typing import Dict, List, Any
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import StreamingResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Simple ChatKit Server", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://aikb-mu.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Simple in-memory store for conversations
class ConversationStore:
    def __init__(self):
        self.conversations: Dict[str, List[Dict[str, Any]]] = {}
    
    def add_message(self, thread_id: str, role: str, content: str):
        if thread_id not in self.conversations:
            self.conversations[thread_id] = []
        
        self.conversations[thread_id].append({
            "role": role,
            "content": content,
            "timestamp": asyncio.get_event_loop().time()
        })
    
    def get_messages(self, thread_id: str) -> List[Dict[str, Any]]:
        return self.conversations.get(thread_id, [])
    
    def clear_thread(self, thread_id: str):
        if thread_id in self.conversations:
            del self.conversations[thread_id]

# Initialize conversation store
conversation_store = ConversationStore()

@app.post("/chatkit")
async def chatkit_endpoint(request: Request):
    """Main ChatKit endpoint for streaming responses."""
    try:
        body = await request.json()
        thread_id = body.get("thread_id")
        message = body.get("message")
        user_id = request.headers.get("x-user-id", "anonymous")
        
        if not thread_id or not message:
            raise HTTPException(status_code=400, detail="Missing thread_id or message")
        
        logger.info(f"Processing message for thread {thread_id}: {message[:50]}...")
        
        # Add user message to conversation
        conversation_store.add_message(thread_id, "user", message)
        
        # Get conversation history
        messages = conversation_store.get_messages(thread_id)
        
        # Prepare messages for OpenAI API
        openai_messages = [
            {
                "role": "system",
                "content": """You are a helpful AI assistant. You can help users with various tasks including:
                - Answering questions
                - Providing explanations
                - Helping with problem-solving
                - Offering suggestions and recommendations
                
                Be helpful, accurate, and friendly in your responses. Keep responses concise but informative."""
            }
        ]
        
        # Add conversation history
        for msg in messages[-10:]:  # Keep last 10 messages for context
            openai_messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })
        
        # Create streaming response
        async def generate_response():
            try:
                stream = openai_client.chat.completions.create(
                    model="gpt-4o",
                    messages=openai_messages,
                    stream=True,
                    temperature=0.7,
                    max_tokens=1000
                )
                
                assistant_response = ""
                
                for chunk in stream:
                    if chunk.choices[0].delta.content is not None:
                        content = chunk.choices[0].delta.content
                        assistant_response += content
                        
                        # Send SSE data
                        yield f"data: {json.dumps({'type': 'assistant_message', 'content': content})}\n\n"
                
                # Store the complete assistant response
                conversation_store.add_message(thread_id, "assistant", assistant_response)
                
                # Send completion signal
                yield f"data: {json.dumps({'type': 'complete', 'content': assistant_response})}\n\n"
                
            except Exception as e:
                logger.error(f"Error in OpenAI API call: {e}")
                yield f"data: {json.dumps({'type': 'error', 'content': f'Error: {str(e)}'})}\n\n"
        
        return StreamingResponse(
            generate_response(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )
            
    except Exception as e:
        logger.error(f"Error in chatkit endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "ChatKit server is running"}

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Advanced ChatKit Server", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
