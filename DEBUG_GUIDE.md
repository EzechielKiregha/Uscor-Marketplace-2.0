# Real-Time Messaging Debug Guide

## Can You Use Both GraphQL and Pusher at Once?

**YES! 100% YES!** That's the entire point of this setup.

### How They Work Together

```
Message Flow with Both Systems:
┌──────────────┐
│ User sends   │
│ message      │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│ Backend: sendMessage()   │
└──────┬───────────────────┘
       │
       ├─────────┬──────────┐
       │         │          │
       ▼         ▼          ▼
     DB     GraphQL      Pusher
           PubSub        Trigger
       │         │          │
       └─────────┼──────────┘
               │
        De-duplication
        (prevents duplicates)
               │
               ▼
         UI Updates
               
Both channels send the same message, but only one update appears!
```

### Benefits of Using Both

| Feature | GraphQL Only | Pusher Only | Both |
|---------|--------------|------------|------|
| Real-time | ✓ | ✓ | ✓✓ |
| Scalability | Limited | ✓ | ✓✓ |
| Reliability | Medium | ✓ | ✓✓ (redundant) |
| Offline support | ✓ | ✗ | ✓ |
| Cost | Free (your server) | $ | Minimal (fallback) |
| Network efficiency | Good | Better | Best |

---

## Console Logs to Check

### Backend Logs (Terminal 1: `npm run dev` in back-api)

When you send a message, you should see:

```
[Chat Resolver] sendMessage called: {
  chatId: "chat-123",
  userId: "user-456",
  userRole: "business"
}
[Chat Resolver] Message saved to DB: {
  messageId: "msg-789",
  chatId: "chat-123"
}
[Chat Resolver] Publishing GraphQL PubSub event for chat: chat-123
[Chat Resolver] ✓ GraphQL PubSub published
[Chat Resolver] Triggering Pusher event: {
  channel: "chat-123",
  event: "message",
  payload: { ... }
}
[Chat Resolver] ✓ Pusher event triggered successfully
```

**If you don't see these:**
- ❌ Message mutation not being called
- ❌ Input variables not passed correctly
- ❌ Authentication issue (token missing)

### Frontend Logs (Browser DevTools → Console)

#### 1. Pusher Initialization

```
[Pusher] Initializing with: {
  pusherKey: "✓ Configured",
  pusherCluster: "✓ mt1"
}
[Pusher] Development mode - enabling logging
[Pusher] ✓ Successfully initialized
[Pusher] ✓ Connected
```

**If Pusher fails:**
- ❌ Missing `NEXT_PUBLIC_PUSHER_KEY` in `.env`
- ❌ Missing `NEXT_PUBLIC_PUSHER_CLUSTER` in `.env`
- ❌ Invalid credentials

#### 2. GraphQL Subscription Setup

```
[ChatThread] Setting up GraphQL subscription for chat: chat-123
[Real-Time] Pusher subscription skipped or:
[Real-Time] Checking Pusher config: {
  NEXT_PUBLIC_USE_PUSHER: "false",
  usePusherEnabled: false
}
[Real-Time] ⚠️  Pusher disabled via NEXT_PUBLIC_USE_PUSHER=false
[Real-Time] Attempting to subscribe to Pusher for chat: chat-123
[Real-Time] Channel subscription initiated: chat-123
```

#### 3. Message Received (Should See One of These)

**From GraphQL:**
```
[ChatThread] GraphQL subscription data received: {
  hasChatId: true,
  hasMessage: true,
  messageId: "msg-789"
}
[ChatThread] ✓ Processing GraphQL message: msg-789
[Real-Time] GRAPHQL message received: {
  messageId: "msg-789",
  senderId: "user-456",
  content: "Hello world"
}
[Real-Time] ✓ Marked as processed from graphql
[ChatThread] Message received, updating local state: msg-789
[ChatThread] ✓ Adding new message to state: msg-789
```

**From Pusher:**
```
[Real-Time] PUSHER message received: {
  messageId: "msg-789",
  senderId: "user-456",
  content: "Hello world"
}
[Real-Time] ⚠️  Duplicate message msg-789 (already processed from graphql), ignoring
```

**Deduplication in action!** ✓

---

## Debugging Checklist

### ✅ Is GraphQL subscription working?

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for: `[ChatThread] Setting up GraphQL subscription`
4. Send a message
5. Should see: `[ChatThread] GraphQL subscription data received`

**If not:**
- Check backend is running: `cd apps/back-api && npm run dev`
- Verify GraphQL endpoint is correct
- Check network tab: should see WebSocket connection
- Look for errors in console

### ✅ Is Pusher connecting?

1. Check `.env` file:
   ```
   NEXT_PUBLIC_PUSHER_KEY=c17e46fbfce6e014e136
   NEXT_PUBLIC_PUSHER_CLUSTER=mt1
   ```

2. Console should show:
   ```
   [Pusher] ✓ Successfully initialized
   [Pusher] ✓ Connected
   ```

3. Check if enabled:
   ```
   [Real-Time] Checking Pusher config: {
     NEXT_PUBLIC_USE_PUSHER: "false"
   }
   ```

**If disabled and you want to enable:**
```env
# apps/front-ui/.env
NEXT_PUBLIC_USE_PUSHER=true  # Change to true
```

### ✅ Is backend sending both events?

Backend should log both:
```
[Chat Resolver] ✓ GraphQL PubSub published
[Chat Resolver] ✓ Pusher event triggered successfully
```

**If Pusher fails:**
- Check backend `.env` has Pusher credentials
- Verify network connectivity
- Check Pusher dashboard for errors

---

## Common Issues & Solutions

### Issue 1: "Object literal may only specify known properties"

**Cause:** Invalid option passed to Pusher constructor

**Solution:** 
```typescript
// ✗ Wrong
new Pusher(key, {
  cluster: 'mt1',
  logToConsole: true,  // ← Invalid
  encrypted: true,     // ← Invalid
})

// ✓ Correct
Pusher.logToConsole = true;  // Set as static property
new Pusher(key, {
  cluster: 'mt1',
})
```

### Issue 2: Messages not appearing

**Checklist:**
1. ✓ Backend logs show `sendMessage called`?
2. ✓ Backend logs show GraphQL PubSub published?
3. ✓ Frontend console shows subscription data received?
4. ✓ Message ID matches between backend and frontend?

**Debug command:**
```bash
# Terminal 1: Backend
cd apps/back-api && npm run dev

# Terminal 2: Frontend
cd apps/front-ui && npm run dev

# Terminal 3: Watch backend logs
# Terminal 4: Open browser DevTools Console
# Send message and check logs in both terminals
```

### Issue 3: Duplicate messages

**If you see multiple copies of same message:**
```
[ChatThread] ✓ Adding new message to state: msg-789
[ChatThread] ✓ Adding new message to state: msg-789  # ← Duplicate
```

**Cause:** De-duplicator not working correctly

**Solution:**
1. Clear browser cache: `Ctrl+Shift+Delete`
2. Hard reload: `Ctrl+Shift+R`
3. Check message IDs are unique on backend

### Issue 4: "Pusher credentials not configured"

**Error in console:**
```
Error: Pusher credentials not configured
```

**Solution:**
1. Check `.env` file exists in `apps/front-ui/`
2. Verify variables are set:
   ```
   NEXT_PUBLIC_PUSHER_KEY=c17e46fbfce6e014e136
   NEXT_PUBLIC_PUSHER_CLUSTER=mt1
   ```
3. Restart dev server: `npm run dev`
4. Hard reload browser: `Ctrl+Shift+R`

---

## How to Enable/Disable Each System

### Disable Pusher (GraphQL Only)

```env
# apps/front-ui/.env
NEXT_PUBLIC_USE_PUSHER=false
```

**Result:** Messages via GraphQL subscription only, no Pusher events

### Enable Pusher

```env
# apps/front-ui/.env
NEXT_PUBLIC_USE_PUSHER=true
```

**Result:** Both GraphQL and Pusher send messages, de-duplication prevents duplicates

### Disable GraphQL (Pusher Only)

In `ChatThread.tsx`:
```typescript
// Comment out the GraphQL subscription
// useSubscription(ON_MESSAGE_RECEIVED, { ... })
```

**Result:** Messages via Pusher only

**Note:** Not recommended for production. Pusher is complementary, not a replacement.

---

## Performance Monitoring

### Watch for these logs

**Good signs:**
```
[Chat Resolver] ✓ GraphQL PubSub published
[Chat Resolver] ✓ Pusher event triggered successfully
[Real-Time] ⚠️  Duplicate message msg-789 (already processed from graphql)
```

**Bad signs:**
```
[Chat Resolver] ✗ Pusher trigger failed:
[Pusher] ✗ Connection error:
[ChatThread] GraphQL subscription error:
```

### Measure latency

1. Note the timestamp in backend log
2. Note when message appears in frontend
3. Difference is latency

**Typical latency:**
- GraphQL: 50-200ms
- Pusher: 10-100ms
- Both: ~100ms (whichever is faster wins)

---

## Next Steps

1. **Start both services:**
   ```bash
   # Terminal 1
   cd apps/back-api && npm run dev
   
   # Terminal 2
   cd apps/front-ui && npm run dev
   ```

2. **Open DevTools:**
   - Press `F12` in browser
   - Go to Console tab

3. **Send a test message:**
   - Look at Console logs
   - Check both terminal outputs

4. **Share logs if issues:**
   - Backend logs (Terminal 1)
   - Frontend console logs (DevTools Console)
   - Error messages

**Everything should work now with full visibility!** 🎉

