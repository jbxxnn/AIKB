# Advanced ChatKit Setup Guide

## 🚀 Quick Start (Recommended)

The Advanced ChatKit is now set up to work **with your Agent Builder workflows** and **without** iframe issues. This gives you a clean, custom chat interface that uses your existing infrastructure.

### ✅ What's Already Done:

1. **Custom React Chat Interface** - No more iframe dependencies
2. **Agent Builder Integration** - Uses your existing workflows and vector store
3. **Role-based Workflows** - Admin vs User workflows automatically selected
4. **Clean UI** - Modern, responsive chat interface
5. **Real-time Streaming** - Messages appear as they're generated
6. **Tool & Widget Support** - Handles Agent Builder tools and widgets

### 🔧 Setup Steps:

1. **Add Environment Variable** to your `.env.local`:
   ```env
   USE_DIRECT_OPENAI=true
   ```

2. **Deploy Your App** - The chat will now work at `/dashboard/chat`

### 🎯 How It Works:

- **Frontend**: Custom React chat interface at `/dashboard/chat/advanced`
- **Backend**: Agent Builder API calls via Next.js API routes
- **Workflows**: Uses your existing Agent Builder workflows and vector store
- **Role-based**: Automatically selects Admin vs User workflow based on user role
- **No Iframe**: Complete custom implementation
- **Streaming**: Real-time message streaming with tool/widget support

### 🔄 Alternative: Python Server (Optional)

If you want to use the Python server instead:

1. **Set Environment Variable**:
   ```env
   USE_DIRECT_OPENAI=false
   CHATKIT_SERVER_URL=http://localhost:8000
   ```

2. **Start Python Server**:
   ```bash
   python start_server.py
   ```

3. **Deploy Your App**

### 🎉 Benefits of This Approach:

- ✅ **No Iframe Issues** - Custom React UI
- ✅ **Better Performance** - Direct API calls
- ✅ **Full Control** - Complete customization
- ✅ **Reliable** - No external dependencies
- ✅ **Scalable** - Easy to add features

### 🛠️ Customization:

The chat interface is in `app/dashboard/chat/advanced-page.tsx`. You can easily:
- Modify the UI design
- Add new features
- Integrate with your existing systems
- Add custom tools and functions

### 📱 Testing:

1. Visit `/dashboard/chat` in your app
2. You'll be redirected to the advanced chat interface
3. Start chatting - messages will stream in real-time!

The Advanced ChatKit solution is now ready to use and will work reliably in production without any iframe issues.
