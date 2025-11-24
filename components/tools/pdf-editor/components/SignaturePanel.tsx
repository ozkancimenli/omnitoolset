'use client';

import React from 'react';
import { toast } from '@/components/Toast';

interface SignaturePanelProps {
  show: boolean;
  onClose: () => void;
  pdfEngineRef: React.RefObject<any>;
  signatureFields: any[];
  setSignatureFields: (fields: any[]) => void;
  pageNum: number;
}

export const SignaturePanel: React.FC<SignaturePanelProps> = ({
  show,
  onClose,
  pdfEngineRef,
  signatureFields,
  setSignatureFields,
  pageNum,
}) => {
  if (!show || !pdfEngineRef.current) return null;

  const handleCreateField = async () => {
    if (!pdfEngineRef.current) return;
    const sigMgr = pdfEngineRef.current.getDigitalSignature();
    const field = sigMgr.createSignatureField(`signature-${Date.now()}`, pageNum, 100, 100, 200, 50);
    setSignatureFields(sigMgr.getSignatureFields());
    toast.success('Signature field created');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Digital Signatures</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Signature Fields</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{signatureFields.length}</div>
          </div>
          <button onClick={handleCreateField} className="w-full px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors">
            Create Signature Field
          </button>
        </div>
      </div>
    </div>
  );
};




