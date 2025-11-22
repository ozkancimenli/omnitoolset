/**
 * PDF Optimizer - Advanced PDF Optimization and Compression
 * 
 * Provides PDF optimization, compression, and structure analysis
 */

import { PDFDocument } from 'pdf-lib';

export interface OptimizationOptions {
  compressImages?: boolean;
  removeUnusedFonts?: boolean;
  removeUnusedObjects?: boolean;
  linearize?: boolean;
  compressContentStreams?: boolean;
  optimizeFonts?: boolean;
}

export interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  removedObjects: number;
  removedFonts: number;
}

export class PdfOptimizer {
  /**
   * Optimize PDF document
   */
  static async optimize(
    pdfDoc: PDFDocument,
    options: OptimizationOptions = {}
  ): Promise<OptimizationResult> {
    const originalBytes = await pdfDoc.save();
    const originalSize = originalBytes.length;
    
    let removedObjects = 0;
    let removedFonts = 0;
    
    // Remove unused fonts if requested
    if (options.removeUnusedFonts) {
      // Note: pdf-lib doesn't expose font usage directly
      // This would require deeper PDF structure analysis
      // For now, we'll skip this optimization
    }
    
    // Compress content streams if requested
    if (options.compressContentStreams) {
      // pdf-lib handles compression automatically
      // Additional compression would require manual content stream manipulation
    }
    
    // Linearize PDF if requested (for fast web view)
    if (options.linearize) {
      // pdf-lib doesn't support linearization directly
      // This would require post-processing with another tool
    }
    
    // Save optimized PDF
    const optimizedBytes = await pdfDoc.save({
      useObjectStreams: true, // Enable object streams for compression
    });
    const optimizedSize = optimizedBytes.length;
    
    const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100;
    
    return {
      originalSize,
      optimizedSize,
      compressionRatio,
      removedObjects,
      removedFonts,
    };
  }

  /**
   * Analyze PDF structure
   */
  static async analyzeStructure(pdfDoc: PDFDocument): Promise<{
    pageCount: number;
    hasForms: boolean;
    hasAnnotations: boolean;
    hasImages: boolean;
    hasFonts: boolean;
    encryptionLevel: number;
    metadata: {
      title?: string;
      author?: string;
      subject?: string;
      creator?: string;
      producer?: string;
      creationDate?: Date;
      modificationDate?: Date;
    };
  }> {
    const pages = pdfDoc.getPages();
    const pageCount = pages.length;
    
    // Check for forms (simplified - would need deeper analysis)
    const hasForms = false; // Would need to check for form fields
    
    // Check for annotations (simplified)
    const hasAnnotations = false; // Would need to check annotation dictionary
    
    // Check for images (simplified)
    const hasImages = false; // Would need to check XObject streams
    
    // Check for fonts
    const hasFonts = true; // pdf-lib embeds fonts
    
    // Get encryption level
    const encryptionLevel = 0; // pdf-lib doesn't expose encryption info directly
    
    // Get metadata
    const metadata = {
      title: pdfDoc.getTitle(),
      author: pdfDoc.getAuthor(),
      subject: pdfDoc.getSubject(),
      creator: pdfDoc.getCreator(),
      producer: pdfDoc.getProducer(),
      creationDate: pdfDoc.getCreationDate(),
      modificationDate: pdfDoc.getModificationDate(),
    };
    
    return {
      pageCount,
      hasForms,
      hasAnnotations,
      hasImages,
      hasFonts,
      encryptionLevel,
      metadata,
    };
  }

  /**
   * Merge multiple PDFs
   */
  static async mergePdfs(pdfs: PDFDocument[]): Promise<PDFDocument> {
    const mergedPdf = await PDFDocument.create();
    
    for (const pdf of pdfs) {
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach(page => mergedPdf.addPage(page));
    }
    
    return mergedPdf;
  }

  /**
   * Split PDF into multiple PDFs
   */
  static async splitPdf(
    pdfDoc: PDFDocument,
    pageRanges: Array<{ start: number; end: number }>
  ): Promise<PDFDocument[]> {
    const results: PDFDocument[] = [];
    
    for (const range of pageRanges) {
      const newPdf = await PDFDocument.create();
      const pages = pdfDoc.getPages();
      
      for (let i = range.start; i <= range.end && i < pages.length; i++) {
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(copiedPage);
      }
      
      results.push(newPdf);
    }
    
    return results;
  }

  /**
   * Extract pages from PDF
   */
  static async extractPages(
    pdfDoc: PDFDocument,
    pageIndices: number[]
  ): Promise<PDFDocument> {
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
    copiedPages.forEach(page => newPdf.addPage(page));
    return newPdf;
  }
}

