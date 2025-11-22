// Annotation Rendering Utilities
import type { Annotation } from '../types';

export const renderAnnotation = (
  context: CanvasRenderingContext2D,
  ann: Annotation,
  viewport: { width: number; height: number },
  strokeColor: string,
  fillColor: string,
  highlightColor: string,
  strokeWidth: number
) => {
  context.save();

  if (ann.type === 'text' && ann.text) {
    context.save();
    
    // Apply text shadow
    if (ann.textShadow) {
      context.shadowOffsetX = ann.textShadow.offsetX;
      context.shadowOffsetY = ann.textShadow.offsetY;
      context.shadowBlur = ann.textShadow.blur;
      context.shadowColor = ann.textShadow.color;
    }
    
    context.fillStyle = ann.color || '#000000';
    const fontFamily = ann.fontFamily || 'Arial';
    const fontSize = ann.fontSize || 16;
    const fontWeight = ann.fontWeight || 'normal';
    const fontStyle = ann.fontStyle || 'normal';
    
    // Apply letter spacing (simulated with manual spacing)
    const letterSpacing = ann.letterSpacing || 0;
    context.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    context.textAlign = (ann.textAlign || 'left') as CanvasTextAlign;
    context.textBaseline = 'bottom';
    
    // Calculate text position based on alignment
    let textX = ann.x;
    const textContent = ann.text || '';
    
    if (letterSpacing > 0 && textContent) {
      const chars = textContent.split('');
      let currentX = textX;
      chars.forEach((char, index) => {
        if (ann.textAlign === 'center') {
          const metrics = context.measureText(textContent);
          currentX = ann.x - metrics.width / 2 + (index * (fontSize * 0.6 + letterSpacing));
        } else if (ann.textAlign === 'right') {
          const metrics = context.measureText(textContent);
          currentX = ann.x - metrics.width + (index * (fontSize * 0.6 + letterSpacing));
        } else {
          currentX = ann.x + (index * (fontSize * 0.6 + letterSpacing));
        }
        context.fillText(char, currentX, ann.y);
      });
    } else if (textContent) {
      if (ann.textAlign === 'center') {
        const metrics = context.measureText(textContent);
        textX = ann.x - metrics.width / 2;
      } else if (ann.textAlign === 'right') {
        const metrics = context.measureText(textContent);
        textX = ann.x - metrics.width;
      }
      context.fillText(textContent, textX, ann.y);
    }
    
    // Apply text outline
    if (ann.textOutline && ann.textOutline.width > 0 && textContent) {
      context.strokeStyle = ann.textOutline.color;
      context.lineWidth = ann.textOutline.width;
      context.strokeText(textContent, textX, ann.y);
    }
    
    // Apply text decoration
    if (ann.textDecoration === 'underline' && textContent) {
      const metrics = context.measureText(textContent);
      context.strokeStyle = ann.color || '#000000';
      context.lineWidth = 1;
      context.shadowOffsetX = 0;
      context.shadowOffsetY = 0;
      context.shadowBlur = 0;
      context.beginPath();
      const underlineY = ann.y + 2;
      if (ann.textAlign === 'center') {
        context.moveTo(ann.x - metrics.width / 2, underlineY);
        context.lineTo(ann.x + metrics.width / 2, underlineY);
      } else if (ann.textAlign === 'right') {
        context.moveTo(ann.x - metrics.width, underlineY);
        context.lineTo(ann.x, underlineY);
      } else {
        context.moveTo(ann.x, underlineY);
        context.lineTo(ann.x + metrics.width, underlineY);
      }
      context.stroke();
    }
    
    context.restore();
  } else if (ann.type === 'highlight' && ann.width && ann.height) {
    const rgbColor = hexToRgb(ann.color || highlightColor);
    context.fillStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.3)`;
    context.fillRect(ann.x, ann.y, ann.width, ann.height);
  } else if (ann.type === 'image' && ann.imageData && ann.width && ann.height) {
    const img = new Image();
    img.src = ann.imageData;
    img.onload = () => {
      context.drawImage(img, ann.x, ann.y, ann.width!, ann.height!);
    };
  } else if (ann.type === 'rectangle' && ann.width && ann.height) {
    context.strokeStyle = ann.strokeColor || strokeColor;
    context.fillStyle = ann.fillColor || 'transparent';
    context.lineWidth = strokeWidth;
    context.fillRect(ann.x, ann.y, ann.width, ann.height);
    context.strokeRect(ann.x, ann.y, ann.width, ann.height);
  } else if (ann.type === 'circle' && ann.width && ann.height) {
    context.strokeStyle = ann.strokeColor || strokeColor;
    context.fillStyle = ann.fillColor || 'transparent';
    context.lineWidth = strokeWidth;
    const centerX = ann.x + ann.width / 2;
    const centerY = ann.y + ann.height / 2;
    const radius = Math.min(ann.width, ann.height) / 2;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    context.fill();
    context.stroke();
  } else if (ann.type === 'line' && ann.endX !== undefined && ann.endY !== undefined) {
    context.strokeStyle = ann.strokeColor || strokeColor;
    context.lineWidth = strokeWidth;
    context.beginPath();
    context.moveTo(ann.x, ann.y);
    context.lineTo(ann.endX, ann.endY);
    context.stroke();
  } else if (ann.type === 'arrow' && ann.endX !== undefined && ann.endY !== undefined) {
    context.strokeStyle = ann.strokeColor || strokeColor;
    context.fillStyle = ann.strokeColor || strokeColor;
    context.lineWidth = strokeWidth;
    const dx = ann.endX - ann.x;
    const dy = ann.endY - ann.y;
    const angle = Math.atan2(dy, dx);
    const arrowLength = 15;
    const arrowAngle = Math.PI / 6;
    
    context.beginPath();
    context.moveTo(ann.x, ann.y);
    context.lineTo(ann.endX, ann.endY);
    context.lineTo(
      ann.endX - arrowLength * Math.cos(angle - arrowAngle),
      ann.endY - arrowLength * Math.sin(angle - arrowAngle)
    );
    context.moveTo(ann.endX, ann.endY);
    context.lineTo(
      ann.endX - arrowLength * Math.cos(angle + arrowAngle),
      ann.endY - arrowLength * Math.sin(angle + arrowAngle)
    );
    context.stroke();
    context.fill();
  }

  context.restore();
};

// Helper function to convert hex to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

