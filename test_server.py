#!/usr/bin/env python3
"""
Test the ChatKit server
"""

import requests
import json
import time

def test_server():
    base_url = "http://localhost:8000"
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        print(f"✅ Health check: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False
    
    # Test chat endpoint
    try:
        test_data = {
            "thread_id": "test_thread_123",
            "message": "Hello, how are you?"
        }
        
        response = requests.post(
            f"{base_url}/chatkit",
            json=test_data,
            headers={"x-user-id": "test_user"},
            timeout=10
        )
        
        print(f"✅ Chat endpoint: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Server is working correctly!")
            return True
        else:
            print(f"❌ Chat endpoint error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Chat test failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing ChatKit server...")
    test_server()

