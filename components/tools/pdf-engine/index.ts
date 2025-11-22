export { PdfEngine } from './PdfEngine';
export type { PdfTextRun, TextModification, PdfEngineConfig } from './PdfEngine';

export { ContentStreamParser } from './ContentStreamParser';
export type { ContentStreamOperator, TextOperator } from './ContentStreamParser';

export { TextLayoutEngine } from './TextLayoutEngine';
export type { TextMetrics, TextLayout, TextLine } from './TextLayoutEngine';

export { PdfOptimizer } from './PdfOptimizer';
export type { OptimizationOptions, OptimizationResult } from './PdfOptimizer';

export { FontManager } from './FontManager';
export type { FontMetrics, FontSubset } from './FontManager';

export { CoordinateTransformer } from './CoordinateTransformer';
export type { TransformMatrix, CoordinateSystem } from './CoordinateTransformer';

export { PerformanceOptimizer } from './PerformanceOptimizer';
export type { PerformanceMetrics, CacheStrategy } from './PerformanceOptimizer';

export { PdfStructureAnalyzer } from './PdfStructureAnalyzer';
export type { PdfStructureInfo, PdfIssue, PdfRepairOptions } from './PdfStructureAnalyzer';

export { PdfObjectTree } from './PdfObjectTree';
export type { PdfObject, PdfObjectReference, PdfTraversalContext } from './PdfObjectTree';

export { BinaryPdfParser } from './BinaryPdfParser';
export type { PdfHeader, PdfXrefTable, PdfXrefEntry, PdfObjectHeader } from './BinaryPdfParser';

export { AdvancedRenderingPipeline } from './AdvancedRenderingPipeline';
export type { RenderLayer, RenderContext, RenderOptions } from './AdvancedRenderingPipeline';

export { AdvancedUndoRedo } from './AdvancedUndoRedo';
export type { HistoryNode, HistoryBranch } from './AdvancedUndoRedo';

export { StreamProcessor } from './StreamProcessor';
export type { StreamChunk, StreamProcessorOptions } from './StreamProcessor';

export { WebAssemblyProcessor } from './WebAssemblyProcessor';
export type { WasmModule } from './WebAssemblyProcessor';

export { WorkerPool } from './WorkerPool';
export type { WorkerTask, WorkerResult } from './WorkerPool';

export { AdvancedFontManager } from './AdvancedFontManager';
export type { FontSubset, FontMetrics } from './AdvancedFontManager';

export { PdfEncryption } from './PdfEncryption';
export type { EncryptionOptions, EncryptionInfo } from './PdfEncryption';

export { DigitalSignature } from './DigitalSignature';
export type { SignatureInfo, SignatureField } from './DigitalSignature';

export { ContentStreamOptimizer } from './ContentStreamOptimizer';
export type { OptimizationResult } from './ContentStreamOptimizer';

export { MemoryMappedFile } from './MemoryMappedFile';
export type { MemoryMap } from './MemoryMappedFile';

export { AdvancedCache } from './AdvancedCache';
export type { CacheEntry, CacheOptions } from './AdvancedCache';

