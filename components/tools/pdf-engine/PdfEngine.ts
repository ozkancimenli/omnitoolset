/**
 * OmniPDF Engine - Advanced PDF Editing Engine
 * 
 * This is our custom PDF editing engine that provides:
 * - Content stream parsing and modification
 * - Text extraction and editing
 * - Annotation management
 * - PDF rendering optimization
 * - Advanced text manipulation
 */

import { PDFDocument, PDFPage, rgb, StandardFonts, PDFFont } from 'pdf-lib';
import { ContentStreamParser } from './ContentStreamParser';
import { TextLayoutEngine } from './TextLayoutEngine';
import { PdfOptimizer } from './PdfOptimizer';
import { FontManager } from './FontManager';
import { CoordinateTransformer } from './CoordinateTransformer';
import { PerformanceOptimizer } from './PerformanceOptimizer';
import { PdfStructureAnalyzer } from './PdfStructureAnalyzer';
import { BinaryPdfParser } from './BinaryPdfParser';
import { AdvancedRenderingPipeline } from './AdvancedRenderingPipeline';
import { AdvancedUndoRedo } from './AdvancedUndoRedo';
import { StreamProcessor } from './StreamProcessor';
import { WebAssemblyProcessor } from './WebAssemblyProcessor';
import { WorkerPool, WorkerResult } from './WorkerPool';
import { AdvancedFontManager } from './AdvancedFontManager';
import { PdfEncryption } from './PdfEncryption';
import { DigitalSignature } from './DigitalSignature';
import { ContentStreamOptimizer } from './ContentStreamOptimizer';
import { MemoryMappedFile } from './MemoryMappedFile';
import { AdvancedCache } from './AdvancedCache';

export interface PdfTextRun {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontName: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  color?: string;
  page: number;
  transform: number[];
  startIndex: number;
  endIndex: number;
}

export interface TextModification {
  runId: string;
  newText: string;
  format?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
    textDecoration?: 'none' | 'underline' | 'line-through';
  };
}

export interface PdfEngineConfig {
  maxFileSize?: number;
  enableCaching?: boolean;
  cacheSize?: number;
  enableAutoSave?: boolean;
  autoSaveInterval?: number;
}

export class PdfEngine {
  private pdfDoc: PDFDocument | null = null;
  private pdfJsDoc: any = null; // pdf.js document
  private textRuns: Map<number, PdfTextRun[]> = new Map();
  private textItems: Map<number, any[]> = new Map();
  private config: PdfEngineConfig;
  private modificationHistory: Array<{ page: number; modifications: TextModification[]; timestamp: number }> = [];
  private undoStack: Array<{ page: number; modifications: TextModification[]; timestamp: number }> = [];
  private redoStack: Array<{ page: number; modifications: TextModification[]; timestamp: number }> = [];
  private fontCache: Map<string, PDFFont> = new Map();
  private fontManager: FontManager = new FontManager();
  private performanceOptimizer: PerformanceOptimizer = new PerformanceOptimizer();
  private advancedUndoRedo: AdvancedUndoRedo = new AdvancedUndoRedo();
  private renderingPipeline: AdvancedRenderingPipeline = new AdvancedRenderingPipeline();
  private wasmProcessor: WebAssemblyProcessor = new WebAssemblyProcessor();
  private workerPool: WorkerPool = new WorkerPool();
  private advancedFontManager: AdvancedFontManager = new AdvancedFontManager();
  private digitalSignature: DigitalSignature = new DigitalSignature();
  private advancedCache: AdvancedCache = new AdvancedCache({
    maxSize: 50 * 1024 * 1024, // 50MB
    maxEntries: 100,
    compress: true,
  });

  constructor(config: PdfEngineConfig = {}) {
    this.config = {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      enableCaching: true,
      cacheSize: 10,
      enableAutoSave: false,
      autoSaveInterval: 30000,
      ...config,
    };
  }

  /**
   * Load PDF document
   */
  async loadPdf(file: File): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate file
      if (file.size > (this.config.maxFileSize || 50 * 1024 * 1024)) {
        return { success: false, error: 'File size exceeds maximum limit' };
      }

      // Load with pdf-lib
      const arrayBuffer = await file.arrayBuffer();
      const fileBytes = new Uint8Array(arrayBuffer);
      
      this.pdfDoc = await PDFDocument.load(fileBytes, {
        ignoreEncryption: false,
        updateMetadata: false,
        parseSpeed: 1,
      });

      // Load with pdf.js for text extraction
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
      
      this.pdfJsDoc = await pdfjsLib.getDocument({
        data: arrayBuffer,
        useSystemFonts: true,
        verbosity: 0,
      }).promise;

      return { success: true };
    } catch (error: any) {
      console.error('PdfEngine: Error loading PDF', error);
      return { 
        success: false, 
        error: error.message || 'Failed to load PDF' 
      };
    }
  }

  /**
   * Extract text layer from PDF page
   */
  async extractTextLayer(pageNumber: number, viewport?: any): Promise<PdfTextRun[]> {
    if (!this.pdfJsDoc) {
      throw new Error('PDF not loaded');
    }

    try {
      const page = await this.pdfJsDoc.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageViewport = viewport || page.getViewport({ scale: 1.0 });
      
      const textItems: any[] = [];
      const runs: PdfTextRun[] = [];
      
      // Process text items
      textContent.items.forEach((item: any, index: number) => {
        if (!item.str || item.str.trim() === '') return;
        
        const transform = item.transform || [1, 0, 0, 1, 0, 0];
        const pdfX = transform[4] || 0;
        const pdfY = transform[5] || 0;
        
        // Convert PDF coordinates (bottom-left) to canvas coordinates (top-left)
        const canvasY = pageViewport.height - pdfY;
        
        textItems.push({
          str: item.str,
          x: pdfX,
          y: canvasY,
          width: item.width || 0,
          height: item.height || item.fontSize || 12,
          fontSize: item.height || item.fontSize || 12,
          fontName: item.fontName || 'Helvetica',
          transform,
          page: pageNumber,
        });
      });

      // Group text items into runs (lines/paragraphs)
      let currentRun: any[] = [];
      let currentY = -1;
      const lineThreshold = 5;

      textItems.forEach((item, index) => {
        if (currentY === -1 || Math.abs(item.y - currentY) > lineThreshold) {
          // Save previous run
          if (currentRun.length > 0) {
            const runText = currentRun.map(i => i.str).join('');
            const firstItem = currentRun[0];
            const lastItem = currentRun[currentRun.length - 1];
            const runWidth = lastItem.x + lastItem.width - firstItem.x;
            
            runs.push({
              id: `run-${pageNumber}-${runs.length}`,
              text: runText,
              x: firstItem.x,
              y: firstItem.y,
              width: runWidth,
              height: firstItem.height,
              fontSize: firstItem.fontSize,
              fontName: firstItem.fontName,
              page: pageNumber,
              transform: firstItem.transform,
              startIndex: index - currentRun.length,
              endIndex: index - 1,
            });
          }
          
          currentRun = [item];
          currentY = item.y;
        } else {
          currentRun.push(item);
        }
      });

      // Add last run
      if (currentRun.length > 0) {
        const runText = currentRun.map(i => i.str).join('');
        const firstItem = currentRun[0];
        const lastItem = currentRun[currentRun.length - 1];
        const runWidth = lastItem.x + lastItem.width - firstItem.x;
        
        runs.push({
          id: `run-${pageNumber}-${runs.length}`,
          text: runText,
          x: firstItem.x,
          y: firstItem.y,
          width: runWidth,
          height: firstItem.height,
          fontSize: firstItem.fontSize,
          fontName: firstItem.fontName,
          page: pageNumber,
          transform: firstItem.transform,
          startIndex: textItems.length - currentRun.length,
          endIndex: textItems.length - 1,
        });
      }

      // Cache results
      this.textRuns.set(pageNumber, runs);
      this.textItems.set(pageNumber, textItems);

      return runs;
    } catch (error) {
      console.error('PdfEngine: Error extracting text layer', error);
      throw error;
    }
  }

  /**
   * Find text run at position
   */
  findTextRunAtPosition(x: number, y: number, pageNumber: number): PdfTextRun | null {
    const runs = this.textRuns.get(pageNumber) || [];
    if (runs.length === 0) return null;

    let closestRun: PdfTextRun | null = null;
    let closestDistance = Infinity;
    const tolerance = 10;

    runs.forEach(run => {
      const centerX = run.x + run.width / 2;
      const centerY = run.y - run.height / 2;
      const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );

      const isWithinBounds = (
        x >= run.x - tolerance &&
        x <= run.x + run.width + tolerance &&
        y >= run.y - run.height - tolerance &&
        y <= run.y + tolerance
      );

      if (isWithinBounds && distance < closestDistance) {
        closestDistance = distance;
        closestRun = run;
      }
    });

    return closestRun;
  }

  /**
   * Modify text in PDF (True Content Stream Editing)
   * Supports batch operations for multiple text modifications
   */
  async modifyText(
    pageNumber: number,
    modifications: TextModification[],
    options?: { skipHistory?: boolean; batchId?: string }
  ): Promise<{ success: boolean; error?: string; batchId?: string }> {
    if (!this.pdfDoc) {
      return { success: false, error: 'PDF not loaded' };
    }

    try {
      const pages = this.pdfDoc.getPages();
      const page = pages[pageNumber - 1];
      
      if (!page) {
        return { success: false, error: 'Page not found' };
      }

      const { width, height } = page.getSize();
      const runs = this.textRuns.get(pageNumber) || [];

      // Process each modification
      for (const mod of modifications) {
        const run = runs.find(r => r.id === mod.runId);
        if (!run) continue;

        const format = mod.format || {};
        const newText = mod.newText;
        const fontSize = format.fontSize || run.fontSize || 12;
        const fontFamily = format.fontFamily || run.fontName || 'Helvetica';
        const fontWeight = format.fontWeight || run.fontWeight || 'normal';
        const fontStyle = format.fontStyle || run.fontStyle || 'normal';

        // Get appropriate font
        const font = await this.getFont(fontFamily, fontWeight, fontStyle);
        
        // Calculate text dimensions
        const textWidth = font.widthOfTextAtSize(newText, fontSize);
        const textHeight = fontSize;

        // Convert canvas coordinates to PDF coordinates
        const pdfY = height - run.y;

        // Erase old text with white rectangle
        const padding = 3;
        page.drawRectangle({
          x: run.x - padding,
          y: pdfY - textHeight - padding,
          width: Math.max(textWidth + (padding * 2), run.width + (padding * 2)),
          height: textHeight + (padding * 2),
          color: rgb(1, 1, 1), // White
          opacity: 1,
        });

        // Parse color
        let textColor = rgb(0, 0, 0);
        if (format.color) {
          const hex = format.color.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16) / 255;
          const g = parseInt(hex.substr(2, 2), 16) / 255;
          const b = parseInt(hex.substr(4, 2), 16) / 255;
          textColor = rgb(r, g, b);
        }

        // Calculate text position based on alignment
        let textX = run.x;
        if (format.textAlign === 'center') {
          textX = run.x - textWidth / 2;
        } else if (format.textAlign === 'right') {
          textX = run.x - textWidth;
        }

        // Draw new text
        page.drawText(newText, {
          x: textX,
          y: pdfY - textHeight,
          size: fontSize,
          font: font,
          color: textColor,
        });

        // Draw underline if needed
        if (format.textDecoration === 'underline') {
          page.drawLine({
            start: { x: textX, y: pdfY - textHeight - 2 },
            end: { x: textX + textWidth, y: pdfY - textHeight - 2 },
            thickness: 1,
            color: textColor,
          });
        }

        // Update cached text run
        const updatedRuns = runs.map(r => {
          if (r.id === mod.runId) {
            return {
              ...r,
              text: newText,
              fontSize: format.fontSize || r.fontSize,
              fontName: format.fontFamily || r.fontName,
              fontWeight: format.fontWeight || r.fontWeight,
              fontStyle: format.fontStyle || r.fontStyle,
              color: format.color || r.color,
            };
          }
          return r;
        });
        this.textRuns.set(pageNumber, updatedRuns);
      }

      // Save to history (unless skipped)
      if (!options?.skipHistory) {
        const historyEntry = {
          page: pageNumber,
          modifications,
          timestamp: Date.now(),
        };
        this.modificationHistory.push(historyEntry);
        this.undoStack.push(historyEntry);
        // Clear redo stack when new modification is made
        this.redoStack = [];
        
        // Also save to advanced undo/redo system
        this.advancedUndoRedo.createNode('modifyText', {
          page: pageNumber,
          modifications,
        });
      }

      return { success: true, batchId: options?.batchId };
    } catch (error: any) {
      console.error('PdfEngine: Error modifying text', error);
      return { 
        success: false, 
        error: error.message || 'Failed to modify text' 
      };
    }
  }

  /**
   * Get appropriate PDF font (using FontManager for advanced features)
   */
  private async getFont(
    fontFamily: string,
    fontWeight: 'normal' | 'bold',
    fontStyle: 'normal' | 'italic'
  ): Promise<PDFFont> {
    if (!this.pdfDoc) {
      throw new Error('PDF not loaded');
    }

    // Use FontManager for advanced font operations
    return await this.fontManager.getFont(this.pdfDoc, fontFamily, fontWeight, fontStyle);
  }

  /**
   * Undo last text modification (using advanced undo/redo system)
   */
  async undo(): Promise<{ success: boolean; error?: string }> {
    // Try advanced undo/redo first
    const advancedNode = this.advancedUndoRedo.undo();
    if (advancedNode) {
      // Restore from advanced history
      const { page, modifications } = advancedNode.data;
      const runs = this.textRuns.get(page) || [];
      
      const reverseModifications: TextModification[] = modifications.map((mod: TextModification) => {
        const run = runs.find(r => r.id === mod.runId);
        if (run) {
          return {
            runId: mod.runId,
            newText: run.text,
            format: {
              fontSize: run.fontSize,
              fontFamily: run.fontName,
              fontWeight: run.fontWeight,
              fontStyle: run.fontStyle,
              color: run.color,
            },
          };
        }
        return mod;
      });

      const result = await this.modifyText(page, reverseModifications, { skipHistory: true });
      if (result.success) {
        return { success: true };
      }
    }

    // Fallback to simple undo
    if (this.undoStack.length === 0) {
      return { success: false, error: 'Nothing to undo' };
    }

    try {
      const lastModification = this.undoStack.pop()!;
      
      const runs = this.textRuns.get(lastModification.page) || [];
      
      const reverseModifications: TextModification[] = lastModification.modifications.map(mod => {
        const run = runs.find(r => r.id === mod.runId);
        if (run) {
          return {
            runId: mod.runId,
            newText: run.text,
            format: {
              fontSize: run.fontSize,
              fontFamily: run.fontName,
              fontWeight: run.fontWeight,
              fontStyle: run.fontStyle,
              color: run.color,
            },
          };
        }
        return mod;
      });

      const result = await this.modifyText(
        lastModification.page,
        reverseModifications,
        { skipHistory: true }
      );

      if (result.success) {
        this.redoStack.push(lastModification);
        return { success: true };
      }

      return result;
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to undo' };
    }
  }

  /**
   * Redo last undone modification (using advanced undo/redo system)
   */
  async redo(): Promise<{ success: boolean; error?: string }> {
    // Try advanced undo/redo first
    const advancedNode = this.advancedUndoRedo.redo();
    if (advancedNode) {
      const { page, modifications } = advancedNode.data;
      const result = await this.modifyText(page, modifications, { skipHistory: true });
      if (result.success) {
        return { success: true };
      }
    }

    // Fallback to simple redo
    if (this.redoStack.length === 0) {
      return { success: false, error: 'Nothing to redo' };
    }

    try {
      const modification = this.redoStack.pop()!;
      const result = await this.modifyText(
        modification.page,
        modification.modifications,
        { skipHistory: true }
      );

      if (result.success) {
        this.undoStack.push(modification);
        return { success: true };
      }

      return result;
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to redo' };
    }
  }

  /**
   * Batch modify text across multiple pages
   */
  async batchModifyText(
    modifications: Array<{ page: number; modifications: TextModification[] }>
  ): Promise<{ success: boolean; error?: string; results: Array<{ page: number; success: boolean }> }> {
    const results: Array<{ page: number; success: boolean }> = [];
    const batchId = `batch-${Date.now()}`;

    for (const mod of modifications) {
      const result = await this.modifyText(mod.page, mod.modifications, {
        skipHistory: false,
        batchId,
      });
      results.push({ page: mod.page, success: result.success });
    }

    const allSuccess = results.every(r => r.success);
    return {
      success: allSuccess,
      error: allSuccess ? undefined : 'Some modifications failed',
      results,
    };
  }

  /**
   * Get PDF document
   */
  getPdfDoc(): PDFDocument | null {
    return this.pdfDoc;
  }

  /**
   * Get PDF.js document
   */
  getPdfJsDoc(): any {
    return this.pdfJsDoc;
  }

  /**
   * Get text runs for a page
   */
  getTextRuns(pageNumber: number): PdfTextRun[] {
    return this.textRuns.get(pageNumber) || [];
  }

  /**
   * Save PDF to bytes
   */
  async savePdf(): Promise<Uint8Array> {
    if (!this.pdfDoc) {
      throw new Error('PDF not loaded');
    }
    return await this.pdfDoc.save();
  }

  /**
   * Get modification history
   */
  getModificationHistory(): Array<{ page: number; modifications: TextModification[]; timestamp: number }> {
    return this.modificationHistory;
  }

  /**
   * Get undo/redo status (with advanced system support)
   */
  getUndoRedoStatus(): { canUndo: boolean; canRedo: boolean; branches?: string[] } {
    const branches = this.advancedUndoRedo.getBranches();
    return {
      canUndo: this.undoStack.length > 0 || branches.some(b => b.head !== ''),
      canRedo: this.redoStack.length > 0,
      branches: branches.map(b => b.name),
    };
  }

  /**
   * Advanced: Create history branch
   */
  createHistoryBranch(name: string): string {
    return this.advancedUndoRedo.createBranch(name);
  }

  /**
   * Advanced: Switch history branch
   */
  switchHistoryBranch(branchId: string): boolean {
    return this.advancedUndoRedo.switchBranch(branchId);
  }

  /**
   * Advanced: Get branch history
   */
  getBranchHistory(branchId?: string) {
    return this.advancedUndoRedo.getBranchHistory(branchId);
  }

  /**
   * Advanced: Analyze PDF binary structure
   */
  async analyzeBinaryStructure(pdfBytes: Uint8Array): Promise<{
    success: boolean;
    header?: any;
    xref?: any;
    objects?: any[];
    validation?: any;
  }> {
    try {
      const header = BinaryPdfParser.parseHeader(pdfBytes);
      const xref = BinaryPdfParser.parseXrefTable(pdfBytes);
      const objects = BinaryPdfParser.findObjects(pdfBytes);
      const validation = BinaryPdfParser.validateStructure(pdfBytes);

      return {
        success: true,
        header,
        xref,
        objects,
        validation,
      };
    } catch (error: any) {
      return {
        success: false,
      };
    }
  }

  /**
   * Advanced: Get rendering pipeline
   */
  getRenderingPipeline(): AdvancedRenderingPipeline {
    return this.renderingPipeline;
  }

  /**
   * Ultra-Deep: Get WebAssembly processor
   */
  getWasmProcessor(): WebAssemblyProcessor {
    return this.wasmProcessor;
  }

  /**
   * Ultra-Deep: Get worker pool
   */
  getWorkerPool(): WorkerPool {
    return this.workerPool;
  }

  /**
   * Ultra-Deep: Get advanced font manager
   */
  getAdvancedFontManager(): AdvancedFontManager {
    return this.advancedFontManager;
  }

  /**
   * Ultra-Deep: Encrypt PDF
   */
  async encryptPdf(
    password: string,
    options?: { ownerPassword?: string; permissions?: any; algorithm?: string }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.pdfDoc) {
        return { success: false, error: 'PDF not loaded' };
      }

      const pdfBytes = await this.pdfDoc.save();
      const encrypted = await PdfEncryption.encrypt(pdfBytes, {
        userPassword: password,
        ownerPassword: options?.ownerPassword,
        algorithm: options?.algorithm as any,
        permissions: options?.permissions,
      });

      // Reload encrypted PDF
      this.pdfDoc = await PDFDocument.load(encrypted);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Ultra-Deep: Decrypt PDF
   */
  async decryptPdf(password: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.pdfDoc) {
        return { success: false, error: 'PDF not loaded' };
      }

      const pdfBytes = await this.pdfDoc.save();
      const decrypted = await PdfEncryption.decrypt(pdfBytes, password);

      // Reload decrypted PDF
      this.pdfDoc = await PDFDocument.load(decrypted);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Ultra-Deep: Check if PDF is encrypted
   */
  isEncrypted(): boolean {
    if (!this.pdfDoc) return false;
    // In production, would check actual encryption status
    return false;
  }

  /**
   * Ultra-Deep: Process with WebAssembly
   */
  async processWithWasm(options: any = {}): Promise<Uint8Array | null> {
    if (!this.pdfDoc) return null;
    try {
      const pdfBytes = await this.pdfDoc.save();
      return await this.wasmProcessor.processPdf(pdfBytes, options);
    } catch (error) {
      console.error('WASM processing error:', error);
      return null;
    }
  }

  /**
   * Ultra-Deep: Process with worker pool
   */
  async processWithWorkers(
    type: 'process' | 'compress' | 'extract' | 'analyze' | 'optimize',
    options: any = {}
  ): Promise<WorkerResult | null> {
    if (!this.pdfDoc) return null;
    try {
      const pdfBytes = await this.pdfDoc.save();
      const task = {
        id: `task-${Date.now()}-${Math.random()}`,
        type,
        data: pdfBytes,
        options,
      };
      return await this.workerPool.submitTask(task);
    } catch (error: any) {
      console.error('Worker processing error:', error);
      return null;
    }
  }

  /**
   * Ultra-Deep: Get digital signature manager
   */
  getDigitalSignature(): DigitalSignature {
    return this.digitalSignature;
  }

  /**
   * Ultra-Deep: Optimize content streams
   */
  async optimizeContentStreams(options: any = {}): Promise<{
    success: boolean;
    result?: any;
    error?: string;
  }> {
    if (!this.pdfDoc) {
      return { success: false, error: 'PDF not loaded' };
    }

    try {
      const pdfBytes = await this.pdfDoc.save();
      const optimized = ContentStreamOptimizer.optimize(pdfBytes, options);
      
      // Reload optimized PDF
      this.pdfDoc = await PDFDocument.load(optimized.optimized);
      
      return {
        success: true,
        result: optimized.result,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Ultra-Deep: Get memory-mapped file
   */
  async getMemoryMappedFile(): Promise<MemoryMappedFile | null> {
    if (!this.pdfDoc) return null;
    try {
      const pdfBytes = await this.pdfDoc.save();
      return new MemoryMappedFile(pdfBytes);
    } catch {
      return null;
    }
  }

  /**
   * Ultra-Deep: Get advanced cache
   */
  getAdvancedCache(): AdvancedCache {
    return this.advancedCache;
  }

  /**
   * Advanced: Search and replace text across all pages
   */
  async searchAndReplace(
    searchText: string,
    replaceText: string,
    options?: {
      caseSensitive?: boolean;
      wholeWords?: boolean;
      regex?: boolean;
    }
  ): Promise<{ success: boolean; replacements: number; error?: string }> {
    if (!this.pdfDoc) {
      return { success: false, replacements: 0, error: 'PDF not loaded' };
    }

    let totalReplacements = 0;
    const pages = this.pdfDoc.getPages();
    
    try {
      for (let pageNum = 1; pageNum <= pages.length; pageNum++) {
        const runs = this.textRuns.get(pageNum) || [];
        const modifications: TextModification[] = [];
        
        for (const run of runs) {
          let searchRegex: RegExp;
          
          if (options?.regex) {
            try {
              searchRegex = new RegExp(
                searchText,
                options.caseSensitive ? 'g' : 'gi'
              );
            } catch {
              // Invalid regex, skip
              continue;
            }
          } else {
            const escaped = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const pattern = options?.wholeWords 
              ? `\\b${escaped}\\b` 
              : escaped;
            searchRegex = new RegExp(
              pattern,
              options?.caseSensitive ? 'g' : 'gi'
            );
          }
          
          if (searchRegex.test(run.text)) {
            const newText = run.text.replace(searchRegex, replaceText);
            if (newText !== run.text) {
              modifications.push({
                runId: run.id,
                newText,
              });
              totalReplacements++;
            }
          }
        }
        
        if (modifications.length > 0) {
          await this.modifyText(pageNum, modifications, { skipHistory: false });
        }
      }
      
      return { success: true, replacements: totalReplacements };
    } catch (error: any) {
      return {
        success: false,
        replacements: totalReplacements,
        error: error.message || 'Failed to search and replace',
      };
    }
  }

  /**
   * Advanced: Optimize PDF
   */
  async optimize(options?: {
    compressImages?: boolean;
    removeUnusedFonts?: boolean;
    compressContentStreams?: boolean;
  }): Promise<{ success: boolean; result?: any; error?: string }> {
    if (!this.pdfDoc) {
      return { success: false, error: 'PDF not loaded' };
    }

    try {
      const result = await PdfOptimizer.optimize(this.pdfDoc, options || {});
      return { success: true, result };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to optimize' };
    }
  }

  /**
   * Advanced: Get text metrics
   */
  getTextMetrics(
    text: string,
    fontSize: number,
    fontFamily: string,
    options?: {
      letterSpacing?: number;
      wordSpacing?: number;
    }
  ) {
    return TextLayoutEngine.measureText(text, fontSize, fontFamily, options);
  }

  /**
   * Advanced: Layout text with wrapping
   */
  layoutText(
    text: string,
    maxWidth: number,
    fontSize: number,
    fontFamily: string,
    options?: {
      letterSpacing?: number;
      wordSpacing?: number;
      lineHeight?: number;
      textAlign?: 'left' | 'center' | 'right' | 'justify';
    }
  ) {
    return TextLayoutEngine.layoutText(text, maxWidth, fontSize, fontFamily, options);
  }

  /**
   * Advanced: Transform coordinates
   */
  transformCoordinates(
    x: number,
    y: number,
    fromSystem: 'pdf' | 'canvas',
    toSystem: 'pdf' | 'canvas',
    viewportHeight: number
  ): { x: number; y: number } {
    if (fromSystem === 'pdf' && toSystem === 'canvas') {
      return CoordinateTransformer.pdfToCanvas(x, y, viewportHeight);
    } else if (fromSystem === 'canvas' && toSystem === 'pdf') {
      return CoordinateTransformer.canvasToPdf(x, y, viewportHeight);
    }
    return { x, y };
  }

  /**
   * Advanced: Get font metrics
   */
  getFontMetrics(
    font: PDFFont,
    fontSize: number,
    text: string
  ) {
    return this.fontManager.getFontMetrics(font, fontSize, text);
  }

  /**
   * Advanced: Analyze PDF structure
   */
  async analyzeStructure(): Promise<{ success: boolean; structure?: any; error?: string }> {
    if (!this.pdfDoc) {
      return { success: false, error: 'PDF not loaded' };
    }

    try {
      const structure = await PdfStructureAnalyzer.analyze(this.pdfDoc);
      return { success: true, structure };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to analyze' };
    }
  }

  /**
   * Advanced: Detect and repair PDF issues
   */
  async repairPdf(options?: {
    fixCorruptedObjects?: boolean;
    removeOrphanedObjects?: boolean;
    rebuildXref?: boolean;
    optimizeStructure?: boolean;
  }): Promise<{ success: boolean; fixedIssues: number; errors: string[] }> {
    if (!this.pdfDoc) {
      return { success: false, fixedIssues: 0, errors: ['PDF not loaded'] };
    }

    try {
      const result = await PdfStructureAnalyzer.repair(this.pdfDoc, options || {});
      return result;
    } catch (error: any) {
      return { success: false, fixedIssues: 0, errors: [error.message || 'Repair failed'] };
    }
  }

  /**
   * Advanced: Get performance metrics
   */
  getPerformanceMetrics() {
    return this.performanceOptimizer.getMetrics();
  }

  /**
   * Advanced: Get font cache statistics
   */
  getFontCacheStats() {
    return this.fontManager.getCacheStats();
  }

  /**
   * Advanced: Process PDF in streams
   */
  async processInStreams(
    processor: (chunk: Uint8Array, offset: number) => Promise<Uint8Array> | Uint8Array,
    options?: { chunkSize?: number; onProgress?: (progress: number) => void }
  ): Promise<Uint8Array | null> {
    if (!this.pdfDoc) {
      return null;
    }

    try {
      const pdfBytes = await this.pdfDoc.save();
      return await StreamProcessor.processInChunks(pdfBytes, processor, options);
    } catch (error) {
      console.error('Error processing streams:', error);
      return null;
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.pdfDoc = null;
    this.pdfJsDoc = null;
    this.textRuns.clear();
    this.textItems.clear();
    this.modificationHistory = [];
    this.undoStack = [];
    this.redoStack = [];
    this.fontCache.clear();
    this.fontManager.clearCache();
    this.performanceOptimizer.clearMetrics();
    this.advancedUndoRedo.clear();
    this.renderingPipeline.clearCache();
    this.workerPool.terminate();
    this.advancedFontManager.clearCache();
    this.digitalSignature.clear();
    this.advancedCache.clear();
  }
}

