/**
 * Memory-Mapped File Operations - Efficient Large File Handling
 * 
 * Provides memory-mapped file operations for efficient large PDF handling
 */

export interface MemoryMap {
  offset: number;
  length: number;
  data: Uint8Array;
}

export class MemoryMappedFile {
  private file: Uint8Array;
  private maps: Map<string, MemoryMap> = new Map();

  constructor(file: Uint8Array) {
    this.file = file;
  }

  /**
   * Create memory map
   */
  map(name: string, offset: number, length: number): MemoryMap {
    const end = Math.min(offset + length, this.file.length);
    const actualLength = end - offset;
    const data = this.file.slice(offset, end);

    const memoryMap: MemoryMap = {
      offset,
      length: actualLength,
      data,
    };

    this.maps.set(name, memoryMap);
    return memoryMap;
  }

  /**
   * Get memory map
   */
  getMap(name: string): MemoryMap | undefined {
    return this.maps.get(name);
  }

  /**
   * Read from memory map
   */
  read(name: string, offset: number, length: number): Uint8Array | null {
    const map = this.maps.get(name);
    if (!map) return null;

    const start = map.offset + offset;
    const end = Math.min(start + length, map.offset + map.length);

    if (start >= map.offset + map.length) return null;

    return this.file.slice(start, end);
  }

  /**
   * Write to memory map (creates new array, doesn't modify original)
   */
  write(name: string, offset: number, data: Uint8Array): boolean {
    const map = this.maps.get(name);
    if (!map) return false;

    const start = map.offset + offset;
    const end = start + data.length;

    if (end > map.offset + map.length) return false;

    // Create new array with written data
    const newFile = new Uint8Array(this.file.length);
    newFile.set(this.file);
    newFile.set(data, start);

    this.file = newFile;
    return true;
  }

  /**
   * Unmap memory region
   */
  unmap(name: string): boolean {
    return this.maps.delete(name);
  }

  /**
   * Get all maps
   */
  getAllMaps(): MemoryMap[] {
    return Array.from(this.maps.values());
  }

  /**
   * Get file size
   */
  getSize(): number {
    return this.file.length;
  }

  /**
   * Get file data
   */
  getFile(): Uint8Array {
    return this.file;
  }

  /**
   * Clear all maps
   */
  clear(): void {
    this.maps.clear();
  }
}






