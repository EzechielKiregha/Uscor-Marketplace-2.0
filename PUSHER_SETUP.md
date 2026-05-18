# Pusher Real-Time Messaging Setup Guide

Complete integration of Pusher for real-time chat messaging in your monorepo (NestJS + Next.js).

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Your Monorepo                            │
├─────────────────────────────┬───────────────────────────────────┤
│                             │                                   │
│  BACKEND (NestJS)           │  FRONTEND (Next.js)               │
│  - apps/back-api            │  - apps/front-ui                 │
│                             │                                   │
│  1. Message saved to DB     │  1. User types message            │
│  2. PubSub (GraphQL)        │  2. GraphQL subscription          │
│  3. Pusher triggered        │  3. Pusher listener (optional)    │
│                             │  4. De-duplication logic         │
│                             │  5. UI updates                    │
│  ┌─────────────────┐        │                                   │
│  │ PusherService   │        │  ┌───────────────────┐           │
│  │  .trigger()     │───────────►│ Pusher Channel  │           │
│  └─────────────────┘        │  └─────────┬─────────┘           │
│                             │            │                      │
│  ┌──────────────────┐       │  ┌─────────▼─────────┐           │
│  │ GraphQL PubSub   │───────────►│ Subscription    │           │
│  │  messageReceived │       │  └─────────┬─────────┘           │
│  └──────────────────┘       │            │                      │
│                             │  ┌─────────▼──────────────┐       │
│                             │  │ useRealTimeMessages    │       │
│                             │  │ - Deduplicates         │       │
│                             │  │ - Handles both sources │       │
│                             │  └─────────┬──────────────┘       │
│                             │            │                      │
│                             │  ┌─────────▼──────────────┐       │
│                             │  │ ChatThread Component   │       │
│                             │  │ - Displays messages    │       │
│                             │  └────────────────────────┘       │
│                             │                                   │
└─────────────────────────────┴───────────────────────────────────┘
```

## Quick Setup

### 1. Backend Configuration

**apps/back-api/.env**
```env
PUSHER_APP_ID=2155970
PUSHER_KEY=c17e46fbfce6e014e136
PUSHER_SECRET=d64776a3841e33ff5376
PUSHER_CLUSTER=mt1
PUSHER_ENCRYPTED=true
```

### 2. Frontend Configuration

**apps/front-ui/.env**
```env
NEXT_PUBLIC_PUSHER_KEY=c17e46fbfce6e014e136
NEXT_PUBLIC_PUSHER_CLUSTER=mt1
NEXT_PUBLIC_USE_PUSHER=false  # Set to 'true' for production
NODE_ENV=development
```

### 3. Install Dependencies

Backend:
```bash
cd apps/back-api
npm install pusher
```

Frontend:
```bash
cd apps/front-ui
npm install pusher-js
```

---

## How It Works

### Message Flow

1. **User sends message** → Frontend mutation `sendMessage`
2. **Backend receives** → ChatResolver.sendMessage()
3. **Save to database** → PrismaService.chatMessage.create()
4. **Trigger event** → Two channels:
   - **GraphQL PubSub**: For active WebSocket connections
   - **Pusher**: For cross-connection reliability & scalability

5. **Frontend receives**:
   - GraphQL subscription (primary)
   - Pusher event (fallback/redundancy)
   - De-duplication prevents duplicates

---

## File Structure

```
apps/
├── back-api/
│   └── src/chat/
│       ├── chat.resolver.ts     ✅ Updated - triggers Pusher
│       ├── chat.service.ts      ✅ Has sendMessage()
│       └── pusher.service.ts    ✅ Existing
│
└── front-ui/
    ├── lib/
    │   ├── pusher-client.ts     ✅ New - Pusher singleton
    │   └── message-deduplicator.ts ✅ New - De-duplication
    ├── hooks/
    │   └── useRealTimeMessages.ts ✅ New - Combined handler
    ├── components/chat/
    │   ├── ChatThread.tsx       ✅ Updated - uses hook
    │   └── ChatList.tsx
    ├── graphql/
    │   └── chat.gql.ts          ✅ Has ON_MESSAGE_RECEIVED
    └── .env                     ✅ Needs NEXT_PUBLIC_PUSHER_*
```

---

## Development Mode

In **development**, Pusher is **optional**. GraphQL subscriptions handle all real-time updates:

```env
# apps/front-ui/.env
NEXT_PUBLIC_USE_PUSHER=false
```

Benefits:
- ✅ Works offline (mock subscriptions)
- ✅ Faster setup
- ✅ No external dependencies during dev
- ✅ Focus on feature development

### Test in dev:
```bash
# Terminal 1: Backend
cd apps/back-api
npm run dev

# Terminal 2: Frontend  
cd apps/front-ui
npm run dev

# Open http://localhost:3000 and test messaging
```

---

## Production Setup

### Enable Pusher

**apps/front-ui/.env.production**
```env
NEXT_PUBLIC_USE_PUSHER=true
NEXT_PUBLIC_PUSHER_KEY=YOUR_PROD_KEY
NEXT_PUBLIC_PUSHER_CLUSTER=YOUR_PROD_CLUSTER
```

### Secure Pusher Channels (Recommended)

**apps/back-api/src/chat/chat.controller.ts** (new)
```typescript
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { PusherService } from './pusher.service';

@Controller('api/pusher')
export class PusherController {
  constructor(private pusherService: PusherService) {}

  @UseGuards(JwtAuthGuard)
  @Post('auth')
  authenticate(@Body() body: { socket_id: string; channel_name: string }) {
    const { socket_id, channel_name } = body;
    
    // Verify channel access
    if (!channel_name.startsWith('chat-')) {
      throw new Error('Invalid channel');
    }

    const authResponse = this.pusherService.authenticate(
      socket_id,
      channel_name,
    );
    return authResponse;
  }
}
```

**apps/front-ui/lib/pusher-client.ts** (update)
```typescript
import Pusher from 'pusher-js';

let pusherInstance: Pusher | null = null;

export function getPusherClient(): Pusher {
  if (!pusherInstance) {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!pusherKey || !pusherCluster) {
      throw new Error('Pusher credentials not configured');
    }

    pusherInstance = new Pusher(pusherKey, {
      cluster: pusherCluster,
      logToConsole: process.env.NODE_ENV === 'development',
      encrypted: true,
      // Add authentication for private channels
      authorizer: async (channel) => {
        const response = await fetch('/api/pusher/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            socket_id: pusher.connection.socket_id,
            channel_name: channel.name,
          }),
        });
        return response.json();
      },
    });
  }

  return pusherInstance;
}
```

---

## Environment Variables Reference

### Backend (apps/back-api/.env)

| Variable | Value | Description |
|----------|-------|-------------|
| `PUSHER_APP_ID` | 2155970 | From Pusher dashboard |
| `PUSHER_KEY` | c17e46fbfce6e014e136 | Public key |
| `PUSHER_SECRET` | d64776a3... | Secret key (never expose) |
| `PUSHER_CLUSTER` | mt1 | Cluster (mt1, us2, eu, etc.) |
| `PUSHER_ENCRYPTED` | true | Use TLS encryption |

### Frontend (apps/front-ui/.env)

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_PUSHER_KEY` | c17e46fbfce6e014e136 | Public key (safe) |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | mt1 | Same cluster |
| `NEXT_PUBLIC_USE_PUSHER` | false/true | Enable/disable |
| `NODE_ENV` | development/production | Mode |

---

## Key Features Implemented

✅ **De-duplication**: Messages from GraphQL + Pusher are de-duplicated
✅ **Graceful Fallback**: If Pusher fails, GraphQL subscriptions handle it
✅ **Development Mode**: Works without Pusher enabled
✅ **Production Ready**: Supports authenticated channels
✅ **Performance**: Single Pusher instance (singleton pattern)
✅ **Logging**: Debug logging in development only

---

## Troubleshooting

### "Pusher credentials not configured"
- Check `.env` file in front-ui app
- Ensure `NEXT_PUBLIC_PUSHER_KEY` and `NEXT_PUBLIC_PUSHER_CLUSTER` are set
- Restart dev server: `npm run dev`

### Messages not received
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_USE_PUSHER=true`
3. Check backend is running and sending Pusher events
4. Verify GraphQL subscription is connected (should work as fallback)

### High message latency
- GraphQL subscriptions may be slower than Pusher
- Enable Pusher: `NEXT_PUBLIC_USE_PUSHER=true`
- Check backend PusherService is properly triggering events

### Duplicate messages
- De-duplication should handle this
- Check browser console for `[Duplicate message]` logs
- Verify message IDs are unique on backend

---

## Scaling Considerations

### For 100-1000 concurrent users
- **Current setup**: GraphQL subscriptions
- ✅ Sufficient (WebSocket is scalable)

### For 1000+ concurrent users  
- **Recommended**: Add Pusher as primary
- Enable `NEXT_PUBLIC_USE_PUSHER=true`
- Use authenticated channels
- Monitor Pusher metrics

### Load Balancing
- If using multiple backend instances, Pusher handles cross-instance messaging
- GraphQL subscriptions require sticky sessions with load balancers

---

## Testing

### Test Message Flow
```bash
# 1. Start backend
cd apps/back-api && npm run dev

# 2. Start frontend
cd apps/front-ui && npm run dev

# 3. Open Chrome DevTools → Network → WebSocket
# Should see active WebSocket connection

# 4. Test messaging
# Send message → Check Network tab for events
# Should see GraphQL subscription activity

# 5. Enable Pusher and repeat
# NEXT_PUBLIC_USE_PUSHER=true in .env
# Should see Pusher in console logs
```

---

## Next Steps

1. ✅ Configure environment variables
2. ✅ Install dependencies
3. ✅ Run backend & frontend
4. ✅ Test messaging
5. [ ] Deploy to staging
6. [ ] Monitor in production
7. [ ] Fine-tune message latency
8. [ ] Consider database-backed message queue for even higher scale

