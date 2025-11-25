'use client';

import React, { useState } from 'react';
import { toast } from '@/components/Toast';

interface CollaborationSession {
  id: string;
  participants: string[];
  version: number;
}

interface CollaborationPanelProps {
  show: boolean;
  onClose: () => void;
  pdfEngineRef: React.RefObject<any>;
  collaborationSession: CollaborationSession | null;
  setCollaborationSession: (session: CollaborationSession | null) => void;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  show,
  onClose,
  pdfEngineRef,
  collaborationSession,
  setCollaborationSession,
}) => {
  const [nameInput, setNameInput] = useState('');

  if (!show || !pdfEngineRef.current) return null;

  const handleCreateSession = async (name: string) => {
    if (!name || !pdfEngineRef.current) return;
    const session = pdfEngineRef.current.createCollaborationSession(name);
    setCollaborationSession(session);
    toast.success(`Session created: ${session.id}`);
    setNameInput('');
  };

  return (
    <div className="absolute top-20 right-4 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-300 dark:border-slate-700 p-4 min-w-[300px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">👥 Collaboration</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-3">
        {!collaborationSession ? (
          <>
            <input
              type="text"
              placeholder="Your name..."
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && nameInput.trim()) {
                  handleCreateSession(nameInput.trim());
                }
              }}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
            />
            <button
              onClick={() => {
                const name = prompt('Your name:');
                if (name) {
                  handleCreateSession(name);
                }
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Session
            </button>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Share session ID with others to collaborate in real-time
            </div>
          </>
        ) : (
          <>
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Session ID:</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">{collaborationSession.id}</div>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Participants: {collaborationSession.participants.length}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Version: {collaborationSession.version}
            </div>
            <button
              onClick={() => {
                setCollaborationSession(null);
                toast.info('Left collaboration session');
              }}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Leave Session
            </button>
          </>
        )}
      </div>
    </div>
  );
};




