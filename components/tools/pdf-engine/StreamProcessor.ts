/**
 * Stream Processor - Advanced PDF Stream Processing
 * 
 * Provides streaming PDF processing for large files
 */

export interface StreamChunk {
  offset: number;
  length: number;
  data: Uint8Array;
  processed: boolean;
}

export interface StreamProcessorOptions {
  chunkSize?: number;
  onProgress?: (progress: number) => void;
  onChunk?: (chunk: StreamChunk) => void;
}

export class StreamProcessor {
  /**
   * Process PDF in chunks
   */
  static async processInChunks(
    bytes: Uint8Array,
    processor: (chunk: Uint8Array, offset: number) => Promise<Uint8Array> | Uint8Array,
    options: StreamProcessorOptions = {}
  ): Promise<Uint8Array> {
    const chunkSize = options.chunkSize || 1024 * 1024; // 1MB chunks
    const chunks: Uint8Array[] = [];
    const totalChunks = Math.ceil(bytes.length / chunkSize);

    for (let i = 0; i < totalChunks; i++) {
      const offset = i * chunkSize;
      const end = Math.min(offset + chunkSize, bytes.length);
      const chunk = bytes.slice(offset, end);

      const processed = await processor(chunk, offset);
      chunks.push(processed);

      if (options.onProgress) {
        options.onProgress(((i + 1) / totalChunks) * 100);
      }

      if (options.onChunk) {
        options.onChunk({
          offset,
          length: chunk.length,
          data: processed,
          processed: true,
        });
      }
    }

    // Combine chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let position = 0;

    for (const chunk of chunks) {
      result.set(chunk, position);
      position += chunk.length;
    }

    return result;
  }

  /**
   * Stream PDF objects
   */
  static async streamObjects(
    bytes: Uint8Array,
    onObject: (object: { number: number; generation: number; data: Uint8Array }) => void
  ): Promise<void> {
    const text = new TextDecoder('latin1').decode(bytes);
    const objectRegex = /(\d+)\s+(\d+)\s+obj/g;
    let match;
    let lastOffset = 0;

    while ((match = objectRegex.exec(text)) !== null) {
      const objectNumber = parseInt(match[1]);
      const generation = parseInt(match[2]);
      const objStart = match.index + match[0].length;
      const objEnd = text.indexOf('endobj', objStart);

      if (objEnd !== -1) {
        const objData = bytes.slice(objStart, objEnd);
        onObject({ number: objectNumber, generation, data: objData });
        lastOffset = objEnd;
      }
    }
  }

  /**
   * Process with backpressure
   */
  static async processWithBackpressure<T>(
    items: T[],
    processor: (item: T) => Promise<void>,
    concurrency: number = 4
  ): Promise<void> {
    const queue = [...items];
    const workers: Promise<void>[] = [];

    const worker = async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (item) {
          await processor(item);
        }
      }
    };

    // Start workers
    for (let i = 0; i < concurrency; i++) {
      workers.push(worker());
    }

    // Wait for all workers
    await Promise.all(workers);
  }

  /**
   * Create readable stream from bytes
   */
  static createReadableStream(bytes: Uint8Array, chunkSize: number = 1024 * 64): ReadableStream<Uint8Array> {
    let offset = 0;

    return new ReadableStream({
      start(controller) {
        const push = () => {
          if (offset >= bytes.length) {
            controller.close();
            return;
          }

          const chunk = bytes.slice(offset, offset + chunkSize);
          offset += chunkSize;
          controller.enqueue(chunk);

          // Use setTimeout to allow backpressure
          setTimeout(push, 0);
        };

        push();
      },
    });
  }

  /**
   * Process stream with transform
   */
  static async processStream(
    stream: ReadableStream<Uint8Array>,
    transform: (chunk: Uint8Array) => Uint8Array
  ): Promise<Uint8Array> {
    const chunks: Uint8Array[] = [];
    const reader = stream.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const transformed = transform(value);
        chunks.push(transformed);
      }
    } finally {
      reader.releaseLock();
    }

    // Combine chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let position = 0;

    for (const chunk of chunks) {
      result.set(chunk, position);
      position += chunk.length;
    }

    return result;
  }
}



