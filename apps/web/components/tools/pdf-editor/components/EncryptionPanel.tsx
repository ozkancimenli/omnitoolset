'use client';

import React from 'react';
import { toast } from '@/components/Toast';

interface EncryptionPanelProps {
  show: boolean;
  onClose: () => void;
  pdfEngineRef: React.RefObject<any>;
  encryptionPassword: string;
  setEncryptionPassword: (password: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export const EncryptionPanel: React.FC<EncryptionPanelProps> = ({
  show,
  onClose,
  pdfEngineRef,
  encryptionPassword,
  setEncryptionPassword,
  isProcessing,
  setIsProcessing,
}) => {
  if (!show || !pdfEngineRef.current) return null;

  const handleEncrypt = async () => {
    if (!pdfEngineRef.current || !encryptionPassword) {
      toast.error('Please enter a password');
      return;
    }
    setIsProcessing(true);
    try {
      const result = await pdfEngineRef.current.encryptPdf(encryptionPassword);
      if (result.success) toast.success('PDF encrypted successfully');
      else toast.error(result.error || 'Encryption failed');
    } catch (error) {
      console.error('Encryption error:', error);
      toast.error('Encryption failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecrypt = async () => {
    if (!pdfEngineRef.current || !encryptionPassword) {
      toast.error('Please enter a password');
      return;
    }
    setIsProcessing(true);
    try {
      const result = await pdfEngineRef.current.decryptPdf(encryptionPassword);
      if (result.success) toast.success('PDF decrypted successfully');
      else toast.error(result.error || 'Decryption failed');
    } catch (error) {
      console.error('Decryption error:', error);
      toast.error('Decryption failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">PDF Encryption</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Encryption Status</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">{pdfEngineRef.current.isEncrypted() ? 'Encrypted' : 'Not Encrypted'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
            <input
              type="password"
              value={encryptionPassword}
              onChange={(e) => setEncryptionPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
              placeholder="Enter password..."
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleEncrypt} disabled={isProcessing} className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors disabled:opacity-50">
              Encrypt PDF
            </button>
            <button onClick={handleDecrypt} disabled={isProcessing} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50">
              Decrypt PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};




