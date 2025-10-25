#!/bin/bash

echo "🚀 Setting up Advanced ChatKit Server..."

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv chatkit_env

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source chatkit_env/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Set environment variables
echo "⚙️ Setting up environment variables..."
export OPENAI_API_KEY="$OPENAI_API_SECRET_KEY"
export CHATKIT_SERVER_URL="http://localhost:8000"

echo "✅ Setup complete!"
echo ""
echo "To start the ChatKit server:"
echo "1. source chatkit_env/bin/activate"
echo "2. python chatkit_server.py"
echo ""
echo "The server will run on http://localhost:8000"
echo "Make sure to set CHATKIT_SERVER_URL=http://localhost:8000 in your .env.local"

