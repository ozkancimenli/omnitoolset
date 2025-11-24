// Touch Gesture Support for Mobile Devices
// Provides pinch-to-zoom, swipe, and other touch gestures

interface GestureEvent {
  type: 'pinch' | 'swipe' | 'pan' | 'tap' | 'doubleTap' | 'longPress';
  deltaX?: number;
  deltaY?: number;
  scale?: number;
  rotation?: number;
  centerX?: number;
  centerY?: number;
  duration?: number;
}

type GestureHandler = (event: GestureEvent) => void;

export class GestureSupport {
  private handlers: Map<string, GestureHandler[]> = new Map();
  private touchStart: { x: number; y: number; time: number } | null = null;
  private lastTap: { time: number; x: number; y: number } | null = null;
  private longPressTimer: NodeJS.Timeout | null = null;
  private pinchStart: { distance: number; centerX: number; centerY: number } | null = null;

  /**
   * Register a gesture handler
   */
  on(gesture: string, handler: GestureHandler): () => void {
    if (!this.handlers.has(gesture)) {
      this.handlers.set(gesture, []);
    }
    this.handlers.get(gesture)!.push(handler);

    // Return unregister function
    return () => {
      const handlers = this.handlers.get(gesture);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Handle touch start
   */
  handleTouchStart(e: TouchEvent): void {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      this.touchStart = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };

      // Long press detection
      this.longPressTimer = setTimeout(() => {
        this.emit('longPress', {
          type: 'longPress',
          centerX: touch.clientX,
          centerY: touch.clientY,
        });
      }, 500);
    } else if (e.touches.length === 2) {
      // Pinch start
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = this.getDistance(touch1, touch2);
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;

      this.pinchStart = { distance, centerX, centerY };
    }
  }

  /**
   * Handle touch move
   */
  handleTouchMove(e: TouchEvent): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    if (e.touches.length === 1 && this.touchStart) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - this.touchStart.x;
      const deltaY = touch.clientY - this.touchStart.y;

      this.emit('pan', {
        type: 'pan',
        deltaX,
        deltaY,
        centerX: touch.clientX,
        centerY: touch.clientY,
      });
    } else if (e.touches.length === 2 && this.pinchStart) {
      // Pinch zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = this.getDistance(touch1, touch2);
      const scale = distance / this.pinchStart.distance;
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;

      this.emit('pinch', {
        type: 'pinch',
        scale,
        centerX,
        centerY,
      });
    }
  }

  /**
   * Handle touch end
   */
  handleTouchEnd(e: TouchEvent): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    if (e.changedTouches.length === 1 && this.touchStart) {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - this.touchStart.x;
      const deltaY = touch.clientY - this.touchStart.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const duration = Date.now() - this.touchStart.time;

      // Tap detection
      if (distance < 10 && duration < 300) {
        // Check for double tap
        if (this.lastTap && 
            Date.now() - this.lastTap.time < 300 &&
            Math.abs(touch.clientX - this.lastTap.x) < 10 &&
            Math.abs(touch.clientY - this.lastTap.y) < 10) {
          this.emit('doubleTap', {
            type: 'doubleTap',
            centerX: touch.clientX,
            centerY: touch.clientY,
          });
          this.lastTap = null;
        } else {
          this.emit('tap', {
            type: 'tap',
            centerX: touch.clientX,
            centerY: touch.clientY,
          });
          this.lastTap = {
            time: Date.now(),
            x: touch.clientX,
            y: touch.clientY,
          };
        }
      } else if (distance > 50) {
        // Swipe detection
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        let direction = '';

        if (Math.abs(angle) < 45) direction = 'right';
        else if (Math.abs(angle) > 135) direction = 'left';
        else if (angle > 0) direction = 'down';
        else direction = 'up';

        this.emit('swipe', {
          type: 'swipe',
          deltaX,
          deltaY,
          duration,
        });
      }

      this.touchStart = null;
    }

    if (e.touches.length < 2) {
      this.pinchStart = null;
    }
  }

  /**
   * Calculate distance between two touches
   */
  private getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Emit gesture event
   */
  private emit(gesture: string, event: GestureEvent): void {
    const handlers = this.handlers.get(gesture);
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }
  }

  /**
   * Attach to element
   */
  attach(element: HTMLElement): () => void {
    const touchStart = (e: TouchEvent) => this.handleTouchStart(e);
    const touchMove = (e: TouchEvent) => this.handleTouchMove(e);
    const touchEnd = (e: TouchEvent) => this.handleTouchEnd(e);

    element.addEventListener('touchstart', touchStart, { passive: false });
    element.addEventListener('touchmove', touchMove, { passive: false });
    element.addEventListener('touchend', touchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', touchStart);
      element.removeEventListener('touchmove', touchMove);
      element.removeEventListener('touchend', touchEnd);
    };
  }
}

// Singleton instance
let gestureInstance: GestureSupport | null = null;

export const getGestureSupport = (): GestureSupport => {
  if (!gestureInstance) {
    gestureInstance = new GestureSupport();
  }
  return gestureInstance;
};

