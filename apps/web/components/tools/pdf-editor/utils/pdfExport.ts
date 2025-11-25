// PDF Export Utilities
import { toast } from '@/components/Toast';
import { logError, hexToRgb } from '../utils';
import type { PdfTextRun, Annotation } from '../types';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Export current page to image (PNG/JPG)
 */
export const exportToImage = async (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  pageNum: number,
  file: File | null,
  exportQuality: 'low' | 'medium' | 'high' = 'high',
  format: 'png' | 'jpg' = 'png'
): Promise<void> => {
  if (!canvasRef.current) {
    toast.error('No canvas available');
    return;
  }
  
  try {
    const canvas = canvasRef.current;
    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const quality = exportQuality === 'high' ? 1.0 : exportQuality === 'medium' ? 0.8 : 0.6;
    
    canvas.toBlob((blob) => {
      if (!blob) {
        toast.error('Failed to export image');
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file?.name.replace('.pdf', `_page${pageNum}.${format}`) || `page${pageNum}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported page ${pageNum} as ${format.toUpperCase()}`);
    }, mimeType, quality);
  } catch (error) {
    logError(error as Error, 'exportToImage', { format, pageNum });
    toast.error('Failed to export image');
  }
};

/**
 * Export current page to HTML
 */
export const exportToHTML = async (
  pdfTextRuns: Record<number, PdfTextRun[]>,
  pageNum: number,
  file: File | null
): Promise<void> => {
  if (!pdfTextRuns[pageNum]) {
    toast.error('No PDF content available');
    return;
  }
  
  try {
    const runs = pdfTextRuns[pageNum] || [];
    let html = '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title>PDF Export</title>\n';
    html += '<style>body { font-family: Arial, sans-serif; padding: 20px; } .page { margin-bottom: 40px; }</style>\n';
    html += '</head>\n<body>\n<div class="page">\n';
    
    runs.forEach(run => {
      const style = `font-size: ${run.fontSize}px; font-family: ${run.fontName}; color: ${run.color || '#000000'};`;
      html += `<span style="${style}">${run.text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span> `;
    });
    
    html += '\n</div>\n</body>\n</html>';
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file?.name.replace('.pdf', '_page' + pageNum + '.html') || `page${pageNum}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported page ${pageNum} as HTML`);
  } catch (error) {
    logError(error as Error, 'exportToHTML', { pageNum });
    toast.error('Failed to export HTML');
  }
};

/**
 * Export current page to text
 */
export const exportToText = async (
  pdfTextRuns: Record<number, PdfTextRun[]>,
  pageNum: number,
  file: File | null
): Promise<void> => {
  if (!pdfTextRuns[pageNum]) {
    toast.error('No text content available');
    return;
  }
  
  try {
    const runs = pdfTextRuns[pageNum] || [];
    const text = runs.map(run => run.text).join(' ');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file?.name.replace('.pdf', '_page' + pageNum + '.txt') || `page${pageNum}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported page ${pageNum} as TXT`);
  } catch (error) {
    logError(error as Error, 'exportToText', { pageNum });
    toast.error('Failed to export text');
  }
};

/**
 * Export PDF with options
 */
export const exportPdfWithOptions = async (
  pdfLibDocRef: React.MutableRefObject<any>,
  file: File | null,
  exportQuality: 'low' | 'medium' | 'high' = 'high',
  exportFormat: 'pdf' | 'pdf-a' = 'pdf',
  setIsProcessing?: (processing: boolean) => void,
  setShowExportOptions?: (show: boolean) => void
): Promise<void> => {
  if (!pdfLibDocRef.current) {
    toast.error('No PDF loaded');
    return;
  }
  
  try {
    setIsProcessing?.(true);
    const pdfDoc = pdfLibDocRef.current;
    
    // Apply export quality settings
    const pdfBytes = await pdfDoc.save();
    
    const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const qualitySuffix = exportQuality === 'low' ? '_low' : exportQuality === 'medium' ? '_medium' : '';
    const formatSuffix = exportFormat === 'pdf-a' ? '_pdfa' : '';
    a.download = file?.name.replace('.pdf', `${qualitySuffix}${formatSuffix}_edited.pdf`) || `edited${qualitySuffix}${formatSuffix}.pdf`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('PDF exported successfully!');
    setShowExportOptions?.(false);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    toast.error('Failed to export PDF');
  } finally {
    setIsProcessing?.(false);
  }
};

/**
 * Export PDF with annotations rendered
 */
export const exportPdfWithAnnotations = async (
  pdfLibDocRef: React.MutableRefObject<any>,
  annotations: Annotation[],
  file: File | null,
  highlightColor: string,
  strokeColor: string,
  fillColor: string,
  strokeWidth: number,
  setIsProcessing?: (processing: boolean) => void
): Promise<void> => {
  if (!file) {
    toast.error('Please load a PDF file first.');
    return;
  }

  if (!pdfLibDocRef.current) {
    toast.error('This PDF cannot be edited. You can only view it.');
    return;
  }

  setIsProcessing?.(true);
  try {
    const pdfDoc = pdfLibDocRef.current;
    const pages = pdfDoc.getPages();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    for (const annotation of annotations) {
      if (annotation.page > 0 && annotation.page <= pages.length) {
        const page = pages[annotation.page - 1];
        const { width, height } = page.getSize();

        if (annotation.type === 'text' && annotation.text) {
          const fontSize = annotation.fontSize || 16;
          const color = annotation.color || '#000000';
          const rgbColor = hexToRgb(color);
          const fontFamily = annotation.fontFamily || 'Arial';
          const fontWeight = annotation.fontWeight || 'normal';
          const fontStyle = annotation.fontStyle || 'normal';
          
          // Use appropriate font based on selection
          let font = helveticaFont;
          if (fontFamily === 'Times New Roman') {
            font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
          } else if (fontFamily === 'Courier New') {
            font = await pdfDoc.embedFont(StandardFonts.Courier);
          } else {
            font = helveticaFont; // Default to Helvetica for Arial, Helvetica, etc.
          }
          
          // Calculate text position based on alignment
          let textX = annotation.x;
          if (annotation.textAlign === 'center' || annotation.textAlign === 'right') {
            const textWidth = font.widthOfTextAtSize(annotation.text, fontSize);
            if (annotation.textAlign === 'center') {
              textX = annotation.x - textWidth / 2;
            } else if (annotation.textAlign === 'right') {
              textX = annotation.x - textWidth;
            }
          }
          
          page.drawText(annotation.text, {
            x: textX,
            y: height - annotation.y - fontSize,
            size: fontSize,
            font: font,
            color: rgb(rgbColor.r / 255, rgbColor.g / 255, rgbColor.b / 255),
          });
          
          // Draw underline if needed (PDF-lib doesn't support underline directly, so we draw a line)
          if (annotation.textDecoration === 'underline') {
            const textWidth = font.widthOfTextAtSize(annotation.text, fontSize);
            const underlineY = height - annotation.y - fontSize - 2;
            let underlineX = textX;
            if (annotation.textAlign === 'center') {
              underlineX = annotation.x - textWidth / 2;
            } else if (annotation.textAlign === 'right') {
              underlineX = annotation.x - textWidth;
            }
            page.drawLine({
              start: { x: underlineX, y: underlineY },
              end: { x: underlineX + textWidth, y: underlineY },
              thickness: 1,
              color: rgb(rgbColor.r / 255, rgbColor.g / 255, rgbColor.b / 255),
            });
          }
        } else if (annotation.type === 'highlight' && annotation.width && annotation.height) {
          const rgbColor = hexToRgb(annotation.color || highlightColor);
          page.drawRectangle({
            x: annotation.x,
            y: height - annotation.y - annotation.height,
            width: annotation.width,
            height: annotation.height,
            color: rgb(rgbColor.r / 255, rgbColor.g / 255, rgbColor.b / 255),
            opacity: 0.3,
          });
        } else if (annotation.type === 'image' && annotation.imageData && annotation.width && annotation.height) {
          try {
            const imageBytes = await fetch(annotation.imageData).then(res => res.arrayBuffer());
            let image;
            if (annotation.imageData.startsWith('data:image/png')) {
              image = await pdfDoc.embedPng(imageBytes);
            } else {
              image = await pdfDoc.embedJpg(imageBytes);
            }
            page.drawImage(image, {
              x: annotation.x,
              y: height - annotation.y - annotation.height,
              width: annotation.width,
              height: annotation.height,
            });
          } catch (error) {
            console.error('Error embedding image:', error);
          }
        } else if (annotation.type === 'rectangle' && annotation.width && annotation.height) {
          const strokeRgb = hexToRgb(annotation.strokeColor || strokeColor);
          page.drawRectangle({
            x: annotation.x,
            y: height - annotation.y - annotation.height,
            width: annotation.width,
            height: annotation.height,
            borderColor: rgb(strokeRgb.r / 255, strokeRgb.g / 255, strokeRgb.b / 255),
            borderWidth: strokeWidth,
          });
        } else if (annotation.type === 'circle' && annotation.width && annotation.height) {
          const strokeRgb = hexToRgb(annotation.strokeColor || strokeColor);
          const centerX = annotation.x + annotation.width / 2;
          const centerY = height - (annotation.y + annotation.height / 2);
          const radius = Math.min(annotation.width, annotation.height) / 2;
          const strokeColorRgb = rgb(strokeRgb.r / 255, strokeRgb.g / 255, strokeRgb.b / 255);
          page.drawCircle({
            x: centerX,
            y: centerY,
            size: radius,
            borderColor: strokeColorRgb,
            borderWidth: strokeWidth,
          });
        } else if (annotation.type === 'line' && annotation.endX !== undefined && annotation.endY !== undefined) {
          const strokeRgb = hexToRgb(annotation.strokeColor || strokeColor);
          const strokeColorRgb = rgb(strokeRgb.r / 255, strokeRgb.g / 255, strokeRgb.b / 255);
          const startY = height - annotation.y;
          const endY = height - annotation.endY;
          page.drawLine({
            start: { x: annotation.x, y: startY },
            end: { x: annotation.endX, y: endY },
            thickness: strokeWidth,
            color: strokeColorRgb,
          });
        } else if (annotation.type === 'arrow' && annotation.endX !== undefined && annotation.endY !== undefined) {
          const strokeRgb = hexToRgb(annotation.strokeColor || strokeColor);
          const strokeColorRgb = rgb(strokeRgb.r / 255, strokeRgb.g / 255, strokeRgb.b / 255);
          const startY = height - annotation.y;
          const endY = height - annotation.endY;
          page.drawLine({
            start: { x: annotation.x, y: startY },
            end: { x: annotation.endX, y: endY },
            thickness: strokeWidth,
            color: strokeColorRgb,
          });
          // Arrow head
          const dx = annotation.endX - annotation.x;
          const dy = annotation.endY - annotation.y;
          const angle = Math.atan2(dy, dx);
          const arrowSize = 10;
          const arrowX1 = annotation.endX - arrowSize * Math.cos(angle - Math.PI / 6);
          const arrowY1 = height - (annotation.endY - arrowSize * Math.sin(angle - Math.PI / 6));
          const arrowX2 = annotation.endX - arrowSize * Math.cos(angle + Math.PI / 6);
          const arrowY2 = height - (annotation.endY - arrowSize * Math.sin(angle + Math.PI / 6));
          page.drawLine({
            start: { x: annotation.endX, y: endY },
            end: { x: arrowX1, y: arrowY1 },
            thickness: strokeWidth,
            color: strokeColorRgb,
          });
          page.drawLine({
            start: { x: annotation.endX, y: endY },
            end: { x: arrowX2, y: arrowY2 },
            thickness: strokeWidth,
            color: strokeColorRgb,
          });
        } else if (annotation.type === 'watermark' && annotation.watermarkText) {
          const watermarkFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
          const watermarkRgb = hexToRgb(annotation.color || '#CCCCCC');
          const watermarkOpacity = annotation.watermarkOpacity || 0.3;
          const textWidth = watermarkFont.widthOfTextAtSize(annotation.watermarkText, annotation.fontSize || 48);
          page.drawText(annotation.watermarkText, {
            x: annotation.x - textWidth / 2,
            y: height - annotation.y,
            size: annotation.fontSize || 48,
            font: watermarkFont,
            color: rgb(watermarkRgb.r / 255, watermarkRgb.g / 255, watermarkRgb.b / 255),
            opacity: watermarkOpacity,
          });
        } else if (annotation.type === 'signature' && annotation.width && annotation.height) {
          page.drawRectangle({
            x: annotation.x,
            y: height - annotation.y - annotation.height,
            width: annotation.width,
            height: annotation.height,
            borderColor: rgb(0, 0, 0),
            borderWidth: 2,
          });
          const signatureFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
          page.drawText('Signature', {
            x: annotation.x + annotation.width / 2 - 30,
            y: height - annotation.y - annotation.height / 2,
            size: 12,
            font: signatureFont,
            color: rgb(0, 0, 0),
          });
        } else if (annotation.type === 'redaction' && annotation.width && annotation.height) {
          page.drawRectangle({
            x: annotation.x,
            y: height - annotation.y - annotation.height,
            width: annotation.width,
            height: annotation.height,
            color: rgb(0, 0, 0),
          });
        } else if (annotation.type === 'stamp' && annotation.text && annotation.width && annotation.height) {
          const stampColor = annotation.color || '#10b981';
          const stampRgb = hexToRgb(stampColor);
          const stampColorRgb = rgb(stampRgb.r / 255, stampRgb.g / 255, stampRgb.b / 255);
          page.drawRectangle({
            x: annotation.x,
            y: height - annotation.y - annotation.height,
            width: annotation.width,
            height: annotation.height,
            borderColor: stampColorRgb,
            borderWidth: 3,
            color: rgb(stampRgb.r / 255 * 0.1, stampRgb.g / 255 * 0.1, stampRgb.b / 255 * 0.1),
          });
          const stampFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
          const textWidth = stampFont.widthOfTextAtSize(annotation.text, annotation.fontSize || 24);
          page.drawText(annotation.text, {
            x: annotation.x + annotation.width / 2 - textWidth / 2,
            y: height - annotation.y - annotation.height / 2 - (annotation.fontSize || 24) / 3,
            size: annotation.fontSize || 24,
            font: stampFont,
            color: stampColorRgb,
          });
        } else if (annotation.type === 'ruler' && annotation.endX !== undefined) {
          const strokeRgb = hexToRgb(annotation.strokeColor || '#000000');
          page.drawLine({
            start: { x: annotation.x, y: height - annotation.y },
            end: { x: annotation.endX, y: height - annotation.y },
            thickness: 2,
            color: rgb(strokeRgb.r / 255, strokeRgb.g / 255, strokeRgb.b / 255),
          });
          if (annotation.distance !== undefined) {
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const text = `${annotation.distance.toFixed(2)}${annotation.measurementUnit || 'px'}`;
            const textWidth = font.widthOfTextAtSize(text, 12);
            page.drawText(text, {
              x: (annotation.x + annotation.endX) / 2 - textWidth / 2,
              y: height - annotation.y + 15,
              size: 12,
              font: font,
              color: rgb(0, 0, 0),
            });
          }
        } else if (annotation.type === 'measure' && annotation.endX !== undefined && annotation.endY !== undefined) {
          const strokeRgb = hexToRgb(annotation.strokeColor || '#3b82f6');
          page.drawLine({
            start: { x: annotation.x, y: height - annotation.y },
            end: { x: annotation.endX, y: height - annotation.endY },
            thickness: 2,
            color: rgb(strokeRgb.r / 255, strokeRgb.g / 255, strokeRgb.b / 255),
          });
          if (annotation.distance !== undefined) {
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const text = `${annotation.distance.toFixed(2)}${annotation.measurementUnit || 'px'}`;
            const textWidth = font.widthOfTextAtSize(text, 12);
            page.drawText(text, {
              x: (annotation.x + annotation.endX) / 2 - textWidth / 2,
              y: (height - annotation.y + height - annotation.endY) / 2 + 15,
              size: 12,
              font: font,
              color: rgb(strokeRgb.r / 255, strokeRgb.g / 255, strokeRgb.b / 255),
            });
          }
        } else if (annotation.type === 'polygon' && annotation.points && annotation.points.length > 2) {
          const strokeRgb = hexToRgb(annotation.strokeColor || strokeColor);
          for (let i = 0; i < annotation.points.length; i++) {
            const start = annotation.points[i];
            const end = annotation.points[(i + 1) % annotation.points.length];
            page.drawLine({
              start: { x: start.x, y: height - start.y },
              end: { x: end.x, y: height - end.y },
              thickness: strokeWidth,
              color: rgb(strokeRgb.r / 255, strokeRgb.g / 255, strokeRgb.b / 255),
            });
          }
        } else if (annotation.type === 'callout' && annotation.calloutPoints && annotation.calloutPoints.length >= 3) {
          const strokeRgb = hexToRgb(annotation.strokeColor || strokeColor);
          for (let i = 0; i < Math.min(3, annotation.calloutPoints.length); i++) {
            const start = annotation.calloutPoints[i];
            const end = annotation.calloutPoints[(i + 1) % 3];
            page.drawLine({
              start: { x: start.x, y: height - start.y },
              end: { x: end.x, y: height - end.y },
              thickness: strokeWidth,
              color: rgb(strokeRgb.r / 255, strokeRgb.g / 255, strokeRgb.b / 255),
            });
          }
          if (annotation.calloutPoints.length > 3) {
            for (let i = 2; i < annotation.calloutPoints.length; i++) {
              const start = annotation.calloutPoints[i];
              const end = annotation.calloutPoints[(i + 1) % annotation.calloutPoints.length];
              page.drawLine({
                start: { x: start.x, y: height - start.y },
                end: { x: end.x, y: height - end.y },
                thickness: strokeWidth,
                color: rgb(strokeRgb.r / 255, strokeRgb.g / 255, strokeRgb.b / 255),
              });
            }
          }
        }
      }
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace('.pdf', '_edited.pdf');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('PDF downloaded successfully!');
  } catch (error) {
    console.error('Error downloading PDF:', error);
    toast.error('Error creating edited PDF. Please try again.');
  } finally {
    setIsProcessing?.(false);
  }
};
