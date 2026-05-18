/**
 * Real-time Message Manager
 * 
 * Handles message updates from multiple sources:
 * 1. GraphQL Subscriptions (primary - websocket based)
 * 2. Pusher (secondary - for scalability and reliability)
 * 3. Optimistic updates (immediate UI feedback)
 * 
 * De-duplicates messages to prevent rendering duplicates
 */

interface MessageSource {
  type: 'graphql' | 'pusher' | 'optimistic';
  messageId: string;
  timestamp: number;
}

class MessageDeduplicator {
  private processedMessages = new Map<string, MessageSource>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(private ttlMs = 30000) {
    // Clean up old entries every 10 seconds
    this.cleanupInterval = setInterval(() => this.cleanup(), 10000);
  }

  private cleanup() {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.processedMessages.forEach((value, key) => {
      if (now - value.timestamp > this.ttlMs) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach((key) => this.processedMessages.delete(key));
  }

  /**
   * Check if message was already processed
   * Returns the source if already seen, undefined if new
   */
  isDuplicate(messageId: string): MessageSource | undefined {
    return this.processedMessages.get(messageId);
  }

  /**
   * Mark message as processed from a specific source
   */
  markProcessed(messageId: string, source: 'graphql' | 'pusher' | 'optimistic') {
    this.processedMessages.set(messageId, {
      type: source,
      messageId,
      timestamp: Date.now(),
    });
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.processedMessages.clear();
  }
}

export { MessageDeduplicator };
