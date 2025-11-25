// Text Templates Utilities
import { toast } from '@/components/Toast';

/**
 * Load auto-saved data
 */
export const loadAutoSave = (
  file: File | null,
  setAnnotations: (annotations: any[]) => void,
  setPageNum: (page: number) => void
): void => {
  if (!file) return;
  try {
    const saved = localStorage.getItem(`pdf-editor-autosave-${file.name}`);
    if (saved) {
      const data = JSON.parse(saved);
      if (confirm('Found auto-saved data. Load it?')) {
        setAnnotations(data.annotations || []);
        setPageNum(data.pageNum || 1);
        toast.success('Auto-saved data loaded');
      }
    }
  } catch (error) {
    console.error('Error loading auto-save:', error);
  }
};

/**
 * Apply text template
 */
export const applyTextTemplate = (
  template: { name: string; text: string; format?: any },
  setCurrentText: (text: string) => void,
  setFontSize: (size: number) => void,
  setFontFamily: (family: string) => void,
  setFontWeight: (weight: 'normal' | 'bold') => void,
  setFontStyle: (style: 'normal' | 'italic') => void,
  setTextColor: (color: string) => void,
  setTool: (tool: any) => void,
  fontSize: number,
  fontFamily: string,
  fontWeight: 'normal' | 'bold',
  fontStyle: 'normal' | 'italic',
  textColor: string
): void => {
  setCurrentText(template.text);
  if (template.format) {
    setFontSize(template.format.fontSize || fontSize);
    setFontFamily(template.format.fontFamily || fontFamily);
    setFontWeight(template.format.fontWeight || fontWeight);
    setFontStyle(template.format.fontStyle || fontStyle);
    setTextColor(template.format.color || textColor);
  }
  setTool('text');
  toast.success(`Template "${template.name}" applied`);
};


