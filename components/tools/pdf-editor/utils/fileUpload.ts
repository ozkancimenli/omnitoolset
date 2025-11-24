// File Upload Utilities
import type { React } from 'react';

/**
 * Create a file input element and handle file selection
 * This utility handles the complex file input creation and polling logic
 */
export const createFileInputHandler = (
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
): void => {
  const tempInput = document.createElement('input');
  tempInput.type = 'file';
  tempInput.accept = '.pdf,application/pdf';
  tempInput.style.display = 'none';
  
  // Use native addEventListener for maximum compatibility
  tempInput.addEventListener('change', (event) => {
    console.log('[PDF Editor] Native change event fired');
    const target = event.target as HTMLInputElement;
    if (target.files?.[0]) {
      console.log('[PDF Editor] File selected via native event:', target.files[0].name);
      const syntheticEvent = {
        target: { files: target.files },
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(syntheticEvent);
    }
    // Clean up
    setTimeout(() => {
      if (tempInput.parentNode) {
        tempInput.parentNode.removeChild(tempInput);
      }
    }, 1000);
  });
  
  // Also poll for file in case change event doesn't fire
  const pollForFile = () => {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max
    const interval = setInterval(() => {
      attempts++;
      if (tempInput.files?.[0]) {
        console.log('[PDF Editor] File detected via polling:', tempInput.files[0].name);
        clearInterval(interval);
        const syntheticEvent = {
          target: { files: tempInput.files },
        } as React.ChangeEvent<HTMLInputElement>;
        handleFileSelect(syntheticEvent);
        if (tempInput.parentNode) {
          tempInput.parentNode.removeChild(tempInput);
        }
      } else if (attempts >= maxAttempts) {
        console.log('[PDF Editor] Polling timeout, no file selected');
        clearInterval(interval);
        if (tempInput.parentNode) {
          tempInput.parentNode.removeChild(tempInput);
        }
      }
    }, 100);
  };
  
  document.body.appendChild(tempInput);
  tempInput.click();
  pollForFile();
};

/**
 * Handle file upload area click
 */
export const handleUploadAreaClick = (
  e: React.MouseEvent,
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
): void => {
  e.preventDefault();
  e.stopPropagation();
  console.log('[PDF Editor] Upload area clicked');
  createFileInputHandler(handleFileSelect);
};

/**
 * Handle keyboard events on upload area
 */
export const handleUploadAreaKeyDown = (
  e: React.KeyboardEvent,
  fileInputRef: React.RefObject<HTMLInputElement>
): void => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }
};


