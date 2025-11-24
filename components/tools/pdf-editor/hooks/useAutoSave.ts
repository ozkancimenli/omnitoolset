// Auto-save Hook
import { useEffect, useState } from 'react';
import { toast } from '@/components/Toast';
import { logError, measurePerformance } from '../utils';
import { AUTO_SAVE_INTERVAL } from '../constants';
import type { Annotation } from '../types';
import type { PdfTextRun } from '../types';

interface UseAutoSaveProps {
  autoSaveEnabled: boolean;
  annotations: Annotation[];
  pageNum: number;
  pdfTextRuns: Record<number, PdfTextRun[]>;
  pdfLibDocRef: React.MutableRefObject<any>;
  file: File | null;
}

export const useAutoSave = (props: UseAutoSaveProps) => {
  const { autoSaveEnabled, annotations, pageNum, pdfTextRuns, pdfLibDocRef, file } = props;
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoSaveEnabled && annotations.length > 0) {
      const interval = setInterval(async () => {
        try {
          if (pdfLibDocRef.current && file) {
            await measurePerformance('autoSave', async () => {
              // Auto-save to localStorage as backup
              const saveData = {
                annotations,
                timestamp: Date.now(),
                pageNum,
                pdfTextRuns, // Include text runs for recovery
              };
              
              try {
                localStorage.setItem(`pdf-editor-autosave-${file.name}`, JSON.stringify(saveData));
                // Only log in development
                if (process.env.NODE_ENV === 'development') {
                  console.log('Auto-saved');
                }
              } catch (storageError) {
                // Handle quota exceeded error
                if (storageError instanceof DOMException && storageError.code === 22) {
                  logError(storageError as Error, 'autoSave - storage quota exceeded');
                  toast.warning('Auto-save failed: Storage quota exceeded');
                } else {
                  logError(storageError as Error, 'autoSave - storage error');
                }
              }
            });
          }
        } catch (error) {
          logError(error as Error, 'autoSave', { fileName: file?.name });
        }
      }, AUTO_SAVE_INTERVAL);
      
      setAutoSaveInterval(interval);
      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        setAutoSaveInterval(null);
      }
    }
  }, [autoSaveEnabled, annotations, file, pageNum, pdfTextRuns, pdfLibDocRef]);

  return { autoSaveInterval };
};


