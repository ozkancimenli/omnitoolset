// Image Handling Utility Functions
import { toast } from '@/components/Toast';
import type { Annotation } from '../types';

export interface HandleImageSelectOptions {
  file: File;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  pageNum: number;
  annotations: Annotation[];
  setAnnotations: (annotations: Annotation[]) => void;
  saveToHistory: (annotations: Annotation[]) => void;
}

export const handleImageSelect = (
  e: React.ChangeEvent<HTMLInputElement>,
  options: HandleImageSelectOptions
): void => {
  const { file, canvasRef, pageNum, annotations, setAnnotations, saveToHistory } = options;
  
  if (!e.target.files?.[0]) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    const imageData = event.target?.result as string;
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: 'image',
        x: canvas.width / 2 - 50,
        y: canvas.height / 2 - 50,
        width: 100,
        height: 100,
        imageData,
        page: pageNum,
      };
      const newAnnotations = [...annotations, newAnnotation];
      setAnnotations(newAnnotations);
      saveToHistory(newAnnotations);
      toast.success('Image added');
    }
  };
  reader.readAsDataURL(e.target.files[0]);
};

