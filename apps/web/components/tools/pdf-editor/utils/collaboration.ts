// Real-time Collaboration System
// Supports multiple users editing the same PDF simultaneously

import type { Annotation } from '../types';

export interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number; page: number };
  selection?: { start: number; end: number; page: number };
}

export interface CollaborationEvent {
  type: 'annotation_add' | 'annotation_update' | 'annotation_delete' | 'cursor_move' | 'selection_change' | 'user_join' | 'user_leave';
  userId: string;
  timestamp: number;
  data: any;
}

export class CollaborationManager {
  private ws: WebSocket | null = null;
  private users: Map<string, CollaborationUser> = new Map();
  private currentUserId: string;
  private eventHandlers: Map<string, Set<(event: CollaborationEvent) => void>> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  constructor(userId: string, userName: string) {
    this.currentUserId = userId;
    this.users.set(userId, {
      id: userId,
      name: userName,
      color: this.generateColor(),
    });
  }

  /**
   * Connect to collaboration server
   */
  async connect(roomId: string, serverUrl: string = 'wss://collab.example.com'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${serverUrl}/room/${roomId}`);

        this.ws.onopen = () => {
          console.log('[Collaboration] Connected');
          this.reconnectAttempts = 0;
          
          // Send join message
          this.send({
            type: 'user_join',
            userId: this.currentUserId,
            timestamp: Date.now(),
            data: {
              user: this.users.get(this.currentUserId),
            },
          });

          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: CollaborationEvent = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('[Collaboration] Message parse error:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[Collaboration] WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[Collaboration] Disconnected');
          this.attemptReconnect(roomId, serverUrl);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from collaboration server
   */
  disconnect(): void {
    if (this.ws) {
      this.send({
        type: 'user_leave',
        userId: this.currentUserId,
        timestamp: Date.now(),
        data: {},
      });
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Send collaboration event
   */
  send(event: CollaborationEvent): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    }
  }

  /**
   * Broadcast annotation change
   */
  broadcastAnnotation(annotation: Annotation, type: 'add' | 'update' | 'delete'): void {
    this.send({
      type: `annotation_${type}` as any,
      userId: this.currentUserId,
      timestamp: Date.now(),
      data: { annotation },
    });
  }

  /**
   * Broadcast cursor position
   */
  broadcastCursor(x: number, y: number, page: number): void {
    const user = this.users.get(this.currentUserId);
    if (user) {
      user.cursor = { x, y, page };
      this.send({
        type: 'cursor_move',
        userId: this.currentUserId,
        timestamp: Date.now(),
        data: { cursor: user.cursor },
      });
    }
  }

  /**
   * Broadcast text selection
   */
  broadcastSelection(start: number, end: number, page: number): void {
    const user = this.users.get(this.currentUserId);
    if (user) {
      user.selection = { start, end, page };
      this.send({
        type: 'selection_change',
        userId: this.currentUserId,
        timestamp: Date.now(),
        data: { selection: user.selection },
      });
    }
  }

  /**
   * Handle incoming message
   */
  private handleMessage(message: CollaborationEvent): void {
    // Update user list
    if (message.type === 'user_join') {
      this.users.set(message.userId, message.data.user);
    } else if (message.type === 'user_leave') {
      this.users.delete(message.userId);
    } else if (message.type === 'cursor_move') {
      const user = this.users.get(message.userId);
      if (user) {
        user.cursor = message.data.cursor;
      }
    } else if (message.type === 'selection_change') {
      const user = this.users.get(message.userId);
      if (user) {
        user.selection = message.data.selection;
      }
    }

    // Trigger event handlers
    const handlers = this.eventHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => handler(message));
    }
  }

  /**
   * Register event handler
   */
  on(eventType: string, handler: (event: CollaborationEvent) => void): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler);

    // Return unregister function
    return () => {
      const handlers = this.eventHandlers.get(eventType);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  /**
   * Get all users
   */
  getUsers(): CollaborationUser[] {
    return Array.from(this.users.values());
  }

  /**
   * Get current user
   */
  getCurrentUser(): CollaborationUser | undefined {
    return this.users.get(this.currentUserId);
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(roomId: string, serverUrl: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[Collaboration] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      console.log(`[Collaboration] Reconnecting (attempt ${this.reconnectAttempts})...`);
      this.connect(roomId, serverUrl).catch(() => {
        // Will retry automatically
      });
    }, delay);
  }

  /**
   * Generate random color for user
   */
  private generateColor(): string {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
      '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

