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

// Render multiple annotations
export const renderAnnotations = (
  context: CanvasRenderingContext2D,
  annotations: Annotation[],
  viewport: { width: number; height: number },
  strokeColor: string,
  fillColor: string,
  highlightColor: string,
  strokeWidth: number,
  hexToRgb: (hex: string) => { r: number; g: number; b: number }
) => {
  annotations.forEach(ann => {
    renderAnnotation(context, ann, viewport, strokeColor, fillColor, highlightColor, strokeWidth);
    
    // Handle additional annotation types not in renderAnnotation
    if (ann.type === 'link' && ann.width && ann.height) {
      context.strokeStyle = ann.strokeColor || '#0066cc';
      context.fillStyle = 'rgba(0, 102, 204, 0.1)';
      context.lineWidth = 2;
      context.setLineDash([5, 5]);
      context.fillRect(ann.x, ann.y, ann.width, ann.height);
      context.strokeRect(ann.x, ann.y, ann.width, ann.height);
      context.setLineDash([]);
      if (ann.url) {
        context.fillStyle = '#0066cc';
        context.font = '12px Arial';
        context.fillText('🔗', ann.x + 5, ann.y + 15);
      }
    } else if (ann.type === 'note' && ann.width && ann.height) {
      context.fillStyle = ann.fillColor || '#FFFF99';
      context.strokeStyle = ann.strokeColor || '#FFD700';
      context.lineWidth = 2;
      context.fillRect(ann.x, ann.y, ann.width, ann.height);
      context.strokeRect(ann.x, ann.y, ann.width, ann.height);
      if (ann.comment) {
        context.fillStyle = '#000000';
        context.font = '12px Arial';
        context.textAlign = 'left';
        const lines = ann.comment.split('\n');
        lines.forEach((line, i) => {
          context.fillText(line.substring(0, 20), ann.x + 5, ann.y + 15 + i * 15);
        });
      }
    } else if (ann.type === 'freehand' && ann.freehandPath && ann.freehandPath.length > 0) {
      context.strokeStyle = ann.strokeColor || strokeColor;
      context.lineWidth = strokeWidth;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.beginPath();
      context.moveTo(ann.freehandPath[0].x, ann.freehandPath[0].y);
      for (let i = 1; i < ann.freehandPath.length; i++) {
        context.lineTo(ann.freehandPath[i].x, ann.freehandPath[i].y);
      }
      context.stroke();
    } else if (ann.type === 'watermark' && ann.watermarkText) {
      context.save();
      context.globalAlpha = ann.watermarkOpacity || 0.3;
      context.fillStyle = ann.color || '#CCCCCC';
      context.font = `${ann.fontSize || 48}px ${ann.fontFamily || 'Arial'}`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.rotate(-Math.PI / 4);
      context.fillText(ann.watermarkText, ann.x, ann.y);
      context.restore();
    } else if (ann.type === 'signature' && ann.width && ann.height) {
      context.strokeStyle = ann.strokeColor || '#000000';
      context.lineWidth = 2;
      context.setLineDash([5, 5]);
      context.strokeRect(ann.x, ann.y, ann.width, ann.height);
      context.setLineDash([]);
      context.fillStyle = '#000000';
      context.font = '12px Arial';
      context.textAlign = 'center';
      context.fillText('Signature', ann.x + ann.width / 2, ann.y + ann.height / 2);
    } else if (ann.type === 'redaction' && ann.width && ann.height) {
      context.fillStyle = ann.fillColor || '#000000';
      context.fillRect(ann.x, ann.y, ann.width, ann.height);
    } else if (ann.type === 'stamp' && ann.text && ann.width && ann.height) {
      context.save();
      const stampColor = ann.color || '#10b981';
      const rgbColor = hexToRgb(stampColor);
      context.strokeStyle = stampColor;
      context.fillStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.1)`;
      context.lineWidth = 3;
      context.strokeRect(ann.x, ann.y, ann.width, ann.height);
      context.fillRect(ann.x, ann.y, ann.width, ann.height);
      context.fillStyle = stampColor;
      context.font = `bold ${ann.fontSize || 24}px Arial`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(ann.text, ann.x + ann.width / 2, ann.y + ann.height / 2);
      context.restore();
    } else if (ann.type === 'ruler' && ann.endX !== undefined) {
      context.strokeStyle = ann.strokeColor || '#000000';
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(ann.x, ann.y);
      context.lineTo(ann.endX, ann.y);
      context.stroke();
      if (ann.distance !== undefined) {
        context.fillStyle = '#000000';
        context.font = '12px Arial';
        context.textAlign = 'center';
        context.fillText(
          `${ann.distance.toFixed(2)}${ann.measurementUnit || 'px'}`,
          (ann.x + ann.endX) / 2,
          ann.y - 10
        );
      }
    } else if (ann.type === 'measure' && ann.endX !== undefined && ann.endY !== undefined) {
      context.strokeStyle = ann.strokeColor || '#3b82f6';
      context.lineWidth = 2;
      context.setLineDash([5, 5]);
      context.beginPath();
      context.moveTo(ann.x, ann.y);
      context.lineTo(ann.endX, ann.endY);
      context.stroke();
      context.setLineDash([]);
      if (ann.distance !== undefined) {
        context.fillStyle = '#3b82f6';
        context.font = '12px Arial';
        context.textAlign = 'center';
        context.fillText(
          `${ann.distance.toFixed(2)}${ann.measurementUnit || 'px'}`,
          (ann.x + ann.endX) / 2,
          (ann.y + ann.endY) / 2 - 10
        );
      }
      context.fillStyle = '#3b82f6';
      context.beginPath();
      context.arc(ann.x, ann.y, 4, 0, 2 * Math.PI);
      context.fill();
      context.beginPath();
      context.arc(ann.endX, ann.endY, 4, 0, 2 * Math.PI);
      context.fill();
    } else if (ann.type === 'polygon' && ann.points && ann.points.length > 2) {
      context.strokeStyle = ann.strokeColor || strokeColor;
      context.fillStyle = ann.fillColor || fillColor;
      context.lineWidth = strokeWidth;
      context.beginPath();
      context.moveTo(ann.points[0].x, ann.points[0].y);
      for (let i = 1; i < ann.points.length; i++) {
        context.lineTo(ann.points[i].x, ann.points[i].y);
      }
      context.closePath();
      context.fill();
      context.stroke();
    } else if (ann.type === 'callout' && ann.calloutPoints && ann.calloutPoints.length >= 3) {
      context.strokeStyle = ann.strokeColor || strokeColor;
      context.fillStyle = ann.fillColor || fillColor;
      context.lineWidth = strokeWidth;
      context.beginPath();
      if (ann.calloutPoints.length >= 3) {
        context.moveTo(ann.calloutPoints[0].x, ann.calloutPoints[0].y);
        context.lineTo(ann.calloutPoints[1].x, ann.calloutPoints[1].y);
        context.lineTo(ann.calloutPoints[2].x, ann.calloutPoints[2].y);
        context.closePath();
        context.fill();
        context.stroke();
        if (ann.calloutPoints.length > 3) {
          context.beginPath();
          context.moveTo(ann.calloutPoints[2].x, ann.calloutPoints[2].y);
          for (let i = 3; i < ann.calloutPoints.length; i++) {
            context.lineTo(ann.calloutPoints[i].x, ann.calloutPoints[i].y);
          }
          context.closePath();
          context.fill();
          context.stroke();
        }
      }
    } else if (ann.type === 'form-field' && ann.width && ann.height) {
      context.strokeStyle = ann.strokeColor || '#3b82f6';
      context.fillStyle = ann.fillColor || '#f0f9ff';
      context.lineWidth = 2;
      context.fillRect(ann.x, ann.y, ann.width, ann.height);
      context.strokeRect(ann.x, ann.y, ann.width, ann.height);
      context.fillStyle = '#3b82f6';
      context.font = '12px Arial';
      context.textAlign = 'left';
      const label = ann.formFieldName || ann.formFieldType || 'Field';
      const required = ann.formFieldRequired ? '*' : '';
      context.fillText(`${label}${required}`, ann.x + 5, ann.y + 15);
      if (ann.formFieldValue) {
        context.fillStyle = '#000000';
        context.font = '14px Arial';
        context.fillText(ann.formFieldValue, ann.x + 5, ann.y + 35);
      }
    }
  });
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



