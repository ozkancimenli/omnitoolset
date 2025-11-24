/**
 * Canvas Optimization Utilities
 * Provides advanced canvas rendering optimizations
 */

/**
 * Optimize canvas context settings
 */
export function optimizeCanvasContext(
  canvas: HTMLCanvasElement,
  options: {
    alpha?: boolean;
    desynchronized?: boolean;
    willReadFrequently?: boolean;
    colorSpace?: 'srgb' | 'display-p3';
  } = {}
): CanvasRenderingContext2D | null {
  const {
    alpha = false, // Disable alpha for better performance
    desynchronized = true, // Allow async rendering
    willReadFrequently = false, // Optimize for write operations
    colorSpace = 'srgb',
  } = options;

  return canvas.getContext('2d', {
    alpha,
    desynchronized,
    willReadFrequently,
    colorSpace,
  } as any);
}

/**
 * Create offscreen canvas for heavy operations
 */
export function createOffscreenCanvas(
  width: number,
  height: number
): OffscreenCanvas | HTMLCanvasElement {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(width, height);
  }

  // Fallback to regular canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * Render to offscreen canvas and transfer to main canvas
 */
export function renderToOffscreen(
  renderFn: (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => void,
  targetCanvas: HTMLCanvasElement,
  width: number,
  height: number
): void {
  const offscreen = createOffscreenCanvas(width, height);
  const ctx = offscreen.getContext('2d');

  if (!ctx) return;

  // Render to offscreen
  renderFn(ctx);

  // Transfer to main canvas
  const targetCtx = targetCanvas.getContext('2d');
  if (targetCtx) {
    if (offscreen instanceof OffscreenCanvas) {
      // Use transferFromImageBitmap for OffscreenCanvas
      offscreen.convertToBlob().then(blob => {
        const img = new Image();
        img.onload = () => {
          targetCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
          targetCtx.drawImage(img, 0, 0);
        };
        img.src = URL.createObjectURL(blob);
      });
    } else {
      // Regular canvas, direct draw
      targetCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
      targetCtx.drawImage(offscreen as HTMLCanvasElement, 0, 0);
    }
  }
}

/**
 * Batch canvas operations
 */
export class CanvasOperationBatcher {
  private operations: Array<() => void> = [];
  private scheduled: boolean = false;

  add(operation: () => void): void {
    this.operations.push(operation);

    if (!this.scheduled) {
      this.scheduled = true;
      requestAnimationFrame(() => {
        this.flush();
      });
    }
  }

  private flush(): void {
    const ops = [...this.operations];
    this.operations = [];
    this.scheduled = false;

    ops.forEach(op => op());
  }
}

/**
 * Optimize image data for canvas
 */
export function optimizeImageData(
  imageData: ImageData,
  options: {
    quality?: number; // 0-1, lower = smaller size
    format?: 'png' | 'jpeg' | 'webp';
  } = {}
): Promise<Blob> {
  const { quality = 0.92, format = 'webp' } = options;

  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.reject(new Error('Could not get canvas context'));

  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      `image/${format}`,
      quality
    );
  });
}

/**
 * Clear canvas efficiently
 */
export function clearCanvas(
  canvas: HTMLCanvasElement,
  ctx?: CanvasRenderingContext2D
): void {
  const context = ctx || canvas.getContext('2d');
  if (!context) return;

  // Use clearRect for better performance
  context.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Save canvas state and restore later
 */
export class CanvasStateManager {
  private states: Array<ImageData> = [];
  private maxStates: number = 10;

  save(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    this.states.push(imageData);

    // Limit states
    if (this.states.length > this.maxStates) {
      this.states.shift();
    }
  }

  restore(canvas: HTMLCanvasElement, index: number = -1): boolean {
    const ctx = canvas.getContext('2d');
    if (!ctx || this.states.length === 0) return false;

    const stateIndex = index < 0 ? this.states.length + index : index;
    if (stateIndex < 0 || stateIndex >= this.states.length) return false;

    ctx.putImageData(this.states[stateIndex], 0, 0);
    return true;
  }

  clear(): void {
    this.states = [];
  }
}

