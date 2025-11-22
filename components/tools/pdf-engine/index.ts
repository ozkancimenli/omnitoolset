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

