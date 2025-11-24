import { useState, useCallback } from 'react';
import { toast } from '@/components/Toast';
import type { Annotation } from '../types';

export interface UsePageManagementOptions {
  numPages: number;
  pageNum: number;
  setPageNum: (page: number) => void;
  annotations: Annotation[];
  setAnnotations: (annotations: Annotation[]) => void;
  onHistorySave: (annotations: Annotation[]) => void;
}

export function usePageManagement({
  numPages,
  pageNum,
  setPageNum,
  annotations,
  setAnnotations,
  onHistorySave,
}: UsePageManagementOptions) {
  const [pageRotations, setPageRotations] = useState<Record<number, number>>({});
  const [deletedPages, setDeletedPages] = useState<Set<number>>(new Set());
  const [insertedPages, setInsertedPages] = useState<Array<{ afterPage: number; count: number }>>([]);
  const [pageHeaders, setPageHeaders] = useState<Record<number, { text: string; format?: any }>>({});
  const [pageFooters, setPageFooters] = useState<Record<number, { text: string; format?: any }>>({});
  const [pageBackgroundColors, setPageBackgroundColors] = useState<Record<number, string>>({});
  const [showPageNumbering, setShowPageNumbering] = useState(false);
  const [pageNumberFormat, setPageNumberFormat] = useState<'1' | '1/10' | 'Page 1' | '1 of 10'>('1');
  const [pageNumberPosition, setPageNumberPosition] = useState<'header' | 'footer'>('footer');

  const rotatePage = useCallback((page: number, degrees: number) => {
    setPageRotations(prev => ({
      ...prev,
      [page]: (prev[page] || 0) + degrees
    }));
    toast.success(`Page ${page} rotated ${degrees}°`);
  }, []);

  const deletePage = useCallback((page: number) => {
    if (numPages <= 1) {
      toast.error('Cannot delete the last page');
      return;
    }
    if (confirm(`Delete page ${page}? This action cannot be undone.`)) {
      setDeletedPages(prev => new Set([...prev, page]));
      // Move annotations from deleted page to previous page or remove them
      const newAnnotations = annotations.map(ann => {
        if (ann.page === page) {
          return { ...ann, page: Math.max(1, page - 1) };
        } else if (ann.page > page) {
          return { ...ann, page: ann.page - 1 };
        }
        return ann;
      });
      setAnnotations(newAnnotations);
      onHistorySave(newAnnotations);
      if (page <= pageNum) {
        setPageNum(Math.max(1, pageNum - 1));
      }
      toast.success(`Page ${page} marked for deletion`);
    }
  }, [numPages, annotations, pageNum, setPageNum, setAnnotations, onHistorySave]);

  const insertBlankPage = useCallback((afterPage: number) => {
    setInsertedPages(prev => [...prev, { afterPage, count: 1 }]);
    // Move annotations on pages after insertion point
    const newAnnotations = annotations.map(ann => {
      if (ann.page > afterPage) {
        return { ...ann, page: ann.page + 1 };
      }
      return ann;
    });
    setAnnotations(newAnnotations);
    onHistorySave(newAnnotations);
    toast.success(`Blank page inserted after page ${afterPage}`);
  }, [annotations, setAnnotations, onHistorySave]);

  const addPageHeader = useCallback((page: number, text: string, format?: any) => {
    setPageHeaders(prev => ({
      ...prev,
      [page]: { text, format: format || { fontSize: 12, color: '#666666' } }
    }));
    toast.success(`Header added to page ${page}`);
  }, []);

  const addPageFooter = useCallback((page: number, text: string, format?: any) => {
    setPageFooters(prev => ({
      ...prev,
      [page]: { text, format: format || { fontSize: 12, color: '#666666' } }
    }));
    toast.success(`Footer added to page ${page}`);
  }, []);

  const applyPageNumbering = useCallback(() => {
    if (!showPageNumbering) {
      setShowPageNumbering(true);
      toast.success('Page numbering enabled');
    } else {
      // Add page numbers to all pages
      for (let i = 1; i <= numPages; i++) {
        let pageNumText = '';
        switch (pageNumberFormat) {
          case '1':
            pageNumText = `${i}`;
            break;
          case '1/10':
            pageNumText = `${i}/${numPages}`;
            break;
          case 'Page 1':
            pageNumText = `Page ${i}`;
            break;
          case '1 of 10':
            pageNumText = `${i} of ${numPages}`;
            break;
        }
        
        if (pageNumberPosition === 'header') {
          addPageHeader(i, pageNumText, { fontSize: 10, color: '#666666', textAlign: 'center' });
        } else {
          addPageFooter(i, pageNumText, { fontSize: 10, color: '#666666', textAlign: 'center' });
        }
      }
      toast.success(`Page numbering applied to all pages`);
    }
  }, [showPageNumbering, pageNumberFormat, pageNumberPosition, numPages, addPageHeader, addPageFooter]);

  const setPageBackground = useCallback((page: number, color: string) => {
    setPageBackgroundColors(prev => ({
      ...prev,
      [page]: color
    }));
    toast.success(`Background color set for page ${page}`);
  }, []);

  return {
    pageRotations,
    deletedPages,
    insertedPages,
    pageHeaders,
    pageFooters,
    pageBackgroundColors,
    showPageNumbering,
    pageNumberFormat,
    pageNumberPosition,
    setShowPageNumbering,
    setPageNumberFormat,
    setPageNumberPosition,
    rotatePage,
    deletePage,
    insertBlankPage,
    addPageHeader,
    addPageFooter,
    applyPageNumbering,
    setPageBackground,
  };
}


