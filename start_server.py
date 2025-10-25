#!/usr/bin/env python3
"""
Start the ChatKit server with environment variables
"""

import os
import sys

# Set the OpenAI API key from your existing environment
# You can also set this in your .env.local file
openai_key = os.getenv("OPENAI_API_SECRET_KEY") or os.getenv("OPENAI_API_KEY")

if not openai_key:
    print("❌ Error: OPENAI_API_SECRET_KEY or OPENAI_API_KEY environment variable not set")
    print("Please set your OpenAI API key in your environment variables")
    sys.exit(1)

# Set the environment variable for the server
os.environ["OPENAI_API_KEY"] = openai_key

print(f"✅ Using OpenAI API key: {openai_key[:10]}...")
print("🚀 Starting ChatKit server...")

# Import and run the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("chatkit_server:app", host="0.0.0.0", port=8000, reload=True)

