// PDF Parsing Utility Functions

export interface ContentStreamOperator {
  operator: string;
  operands: any[];
  position: number;
  x: number;
  y: number;
  fontSize: number;
  fontName: string;
  transform: number[];
}

/**
 * Parse content stream for text operators
 * Enhanced parsing with position and font information
 */
export const parseContentStream = async (
  pdfDoc: any,
  pageNumber: number
): Promise<ContentStreamOperator[]> => {
  if (!pdfDoc) return [];
  
  try {
    // Use pdf.js to get text content with detailed information
    const page = await pdfDoc.getPage(pageNumber);
    const textContent = await page.getTextContent();
    
    // Map text items to operators with full context
    const operators: ContentStreamOperator[] = [];
    
    textContent.items.forEach((item: any, index: number) => {
      if (item.str && item.str.trim()) {
        operators.push({
          operator: 'Tj', // Text show operator
          operands: [item.str],
          position: index,
          x: item.transform[4] || 0,
          y: item.transform[5] || 0,
          fontSize: item.height || item.fontSize || 12,
          fontName: item.fontName || 'Helvetica',
          transform: item.transform || [1, 0, 0, 1, 0, 0],
        });
      }
    });
    
    return operators;
  } catch (error) {
    console.error('Error parsing content stream:', error);
    return [];
  }
};


