import Pusher from 'pusher-js';

// Initialize Pusher only once
let pusherInstance: Pusher | null = null;

export function getPusherClient(): Pusher {
  if (!pusherInstance) {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    console.log('[Pusher] Initializing with:', {
      pusherKey: pusherKey ? '✓ Configured' : '✗ Missing',
      pusherCluster: pusherCluster ? `✓ ${pusherCluster}` : '✗ Missing',
    });

    if (!pusherKey || !pusherCluster) {
      throw new Error('Pusher credentials not configured');
    }

    // Enable logging in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('[Pusher] Development mode - enabling logging');
      Pusher.logToConsole = true;
    }

    try {
      pusherInstance = new Pusher(pusherKey, {
        cluster: pusherCluster,
      });
      
      console.log('[Pusher] ✓ Successfully initialized');

      // Add connection state listeners
      pusherInstance.connection.bind('connected', () => {
        console.log('[Pusher] ✓ Connected');
      });

      pusherInstance.connection.bind('disconnected', () => {
        console.log('[Pusher] ✗ Disconnected');
      });

      pusherInstance.connection.bind('error', (error: any) => {
        console.error('[Pusher] ✗ Connection error:', error);
      });
    } catch (error) {
      console.error('[Pusher] ✗ Initialization failed:', error);
      throw error;
    }
  }

  return pusherInstance;
}

export function disconnectPusher(): void {
  if (pusherInstance) {
    console.log('[Pusher] Disconnecting');
    pusherInstance.disconnect();
    pusherInstance = null;
  }
}
