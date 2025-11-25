'use client';

import React from 'react';
import { toast } from '@/components/Toast';

interface CloudSyncPanelProps {
  show: boolean;
  onClose: () => void;
  pdfEngineRef: React.RefObject<any>;
  file: File | null;
}

export const CloudSyncPanel: React.FC<CloudSyncPanelProps> = ({
  show,
  onClose,
  pdfEngineRef,
  file,
}) => {
  if (!show || !pdfEngineRef.current) return null;

  const handleSync = async () => {
    if (pdfEngineRef.current && file) {
      const pdfBytes = await pdfEngineRef.current.savePdf();
      const result = await pdfEngineRef.current.setupCloudSync({
        provider: 'google-drive',
        fileId: `file-${Date.now()}`,
        lastSync: Date.now(),
      });
      if (result.success) {
        const syncResult = await pdfEngineRef.current.getGodLevelFeatures().syncToCloud(pdfBytes);
        if (syncResult.success) {
          toast.success('Synced to cloud');
        } else {
          toast.error(syncResult.error || 'Sync failed');
        }
      }
    }
  };

  return (
    <div className="absolute top-20 right-4 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-300 dark:border-slate-700 p-4 min-w-[300px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">☁️ Cloud Sync</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-3">
        <select className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm" defaultValue="">
          <option value="">Select cloud provider...</option>
          <option value="google-drive">Google Drive</option>
          <option value="dropbox">Dropbox</option>
          <option value="onedrive">OneDrive</option>
        </select>
        <button onClick={handleSync} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Sync to Cloud
        </button>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Keep your PDFs synchronized across devices
        </div>
      </div>
    </div>
  );
};




