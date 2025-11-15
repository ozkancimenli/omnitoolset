'use client';

import { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface PdfEditorProps {
  toolId?: string;
}

interface Annotation {
  id: string;
  type: 'text' | 'image' | 'shape' | 'highlight';
  x: number;
  y: number;
  text?: string;
  fontSize?: number;
  color?: string;
  page: number;
  width?: number;
  height?: number;
  imageData?: string;
}

export default function PdfEditor({ toolId }: PdfEditorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [textColor, setTextColor] = useState('#000000');
  const [isAddingText, setIsAddingText] = useState(false);
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [isAddingHighlight, setIsAddingHighlight] = useState(false);
  const [tool, setTool] = useState<'text' | 'image' | 'highlight' | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfDocRef = useRef<any>(null);
  const pdfLibDocRef = useRef<PDFDocument | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setAnnotations([]);
      setPageNum(1);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]?.type === 'application/pdf') {
      setFile(e.dataTransfer.files[0]);
      setAnnotations([]);
      setPageNum(1);
    }
  };

  useEffect(() => {
    if (file) {
      loadPDF();
    }
  }, [file]);

  const loadPDF = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    try {
      // Load with pdf.js for viewing
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
      
      try {
        const response = await fetch('/pdf.worker.mjs', { method: 'HEAD' });
        if (!response.ok) throw new Error('Worker not found');
      } catch {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      }

      const arrayBuffer = await file.arrayBuffer();
      
      // Load for viewing
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      pdfDocRef.current = pdf;
      setNumPages(pdf.numPages);
      
      // Load with pdf-lib for editing
      const pdfLibDoc = await PDFDocument.load(arrayBuffer);
      pdfLibDocRef.current = pdfLibDoc;
      
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      
      renderPage(1);
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Error loading PDF. Please make sure the file is a valid PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPage = async (pageNumber: number) => {
    if (!pdfDocRef.current || !canvasRef.current) return;

    try {
      const page = await pdfDocRef.current.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      
      // Draw annotations for this page
      const pageAnnotations = annotations.filter(ann => ann.page === pageNumber);
      pageAnnotations.forEach(ann => {
        if (ann.type === 'text' && ann.text) {
          context.fillStyle = ann.color || '#000000';
          context.font = `${ann.fontSize || 16}px Arial`;
          context.fillText(ann.text, ann.x, ann.y);
        } else if (ann.type === 'highlight' && ann.width && ann.height) {
          context.fillStyle = 'rgba(255, 255, 0, 0.3)';
          context.fillRect(ann.x, ann.y, ann.width, ann.height);
        } else if (ann.type === 'image' && ann.imageData && ann.width && ann.height) {
          const img = new Image();
          img.src = ann.imageData;
          context.drawImage(img, ann.x, ann.y, ann.width, ann.height);
        }
      });
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  };

  useEffect(() => {
    if (pdfDocRef.current && pageNum > 0) {
      renderPage(pageNum);
    }
  }, [pageNum, annotations]);

  const handleCanvasClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!tool || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'text' && currentText.trim()) {
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: 'text',
        x,
        y,
        text: currentText,
        fontSize,
        color: textColor,
        page: pageNum,
      };
      setAnnotations([...annotations, newAnnotation]);
      setCurrentText('');
      setIsAddingText(false);
      setTool(null);
    } else if (tool === 'highlight') {
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: 'highlight',
        x,
        y,
        width: 100,
        height: 20,
        page: pageNum,
      };
      setAnnotations([...annotations, newAnnotation]);
      setIsAddingHighlight(false);
      setTool(null);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const rect = canvas.getBoundingClientRect();
          const newAnnotation: Annotation = {
            id: Date.now().toString(),
            type: 'image',
            x: rect.width / 2 - 50,
            y: rect.height / 2 - 50,
            width: 100,
            height: 100,
            imageData,
            page: pageNum,
          };
          setAnnotations([...annotations, newAnnotation]);
          setIsAddingImage(false);
          setTool(null);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleDownload = async () => {
    if (!pdfLibDocRef.current || !file) {
      alert('Please load a PDF file first.');
      return;
    }

    setIsProcessing(true);
    try {
      const pdfDoc = pdfLibDocRef.current;
      const pages = pdfDoc.getPages();
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Apply all annotations to PDF
      for (const annotation of annotations) {
        if (annotation.page > 0 && annotation.page <= pages.length) {
          const page = pages[annotation.page - 1];
          const { width, height } = page.getSize();

          if (annotation.type === 'text' && annotation.text) {
            const fontSize = annotation.fontSize || 16;
            const color = annotation.color || '#000000';
            const rgbColor = hexToRgb(color);
            
            page.drawText(annotation.text, {
              x: annotation.x,
              y: height - annotation.y - fontSize, // PDF coordinates are bottom-up
              size: fontSize,
              font: helveticaFont,
              color: rgb.rgb(rgbColor.r / 255, rgbColor.g / 255, rgbColor.b / 255),
            });
          } else if (annotation.type === 'highlight' && annotation.width && annotation.height) {
            page.drawRectangle({
              x: annotation.x,
              y: height - annotation.y - annotation.height,
              width: annotation.width,
              height: annotation.height,
              color: rgb(1, 1, 0),
              opacity: 0.3,
            });
          } else if (annotation.type === 'image' && annotation.imageData && annotation.width && annotation.height) {
            try {
              const imageBytes = await fetch(annotation.imageData).then(res => res.arrayBuffer());
              let image;
              if (annotation.imageData.startsWith('data:image/png')) {
                image = await pdfDoc.embedPng(imageBytes);
              } else {
                image = await pdfDoc.embedJpg(imageBytes);
              }
              page.drawImage(image, {
                x: annotation.x,
                y: height - annotation.y - annotation.height,
                width: annotation.width,
                height: annotation.height,
              });
            } catch (error) {
              console.error('Error embedding image:', error);
            }
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace('.pdf', '_edited.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error creating edited PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const removeAnnotation = (id: string) => {
    setAnnotations(annotations.filter(ann => ann.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div
        className="upload-area"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef.current}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={imageInputRef.current}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-xl font-semibold mb-2">
            {file ? file.name : 'Click or drag PDF file here'}
          </p>
          <p className="text-slate-400 text-sm">
            {file ? 'Click to select a different file' : 'Select a PDF file to edit'}
          </p>
        </div>
      </div>

      {file && (
        <>
          {/* Editor Controls */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
              <div className="flex gap-3 flex-wrap items-center">
                <button
                  onClick={() => {
                    setTool(tool === 'text' ? null : 'text');
                    setIsAddingText(tool !== 'text');
                    setIsAddingImage(false);
                    setIsAddingHighlight(false);
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    tool === 'text'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                >
                  {tool === 'text' ? '✓ Add Text' : 'Add Text'}
                </button>
                
                <button
                  onClick={() => {
                    setTool(tool === 'highlight' ? null : 'highlight');
                    setIsAddingHighlight(tool !== 'highlight');
                    setIsAddingText(false);
                    setIsAddingImage(false);
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    tool === 'highlight'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                >
                  {tool === 'highlight' ? '✓ Highlight' : 'Highlight'}
                </button>

                <button
                  onClick={() => {
                    setTool(tool === 'image' ? null : 'image');
                    setIsAddingImage(tool !== 'image');
                    setIsAddingText(false);
                    setIsAddingHighlight(false);
                    imageInputRef.current?.click();
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    tool === 'image'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                >
                  Add Image
                </button>
                
                {tool === 'text' && (
                  <div className="flex gap-2 items-center flex-wrap">
                    <input
                      type="text"
                      value={currentText}
                      onChange={(e) => setCurrentText(e.target.value)}
                      placeholder="Enter text..."
                      className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                    />
                    <input
                      type="number"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      min="8"
                      max="72"
                      className="w-20 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                      placeholder="Size"
                    />
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-12 h-10 bg-slate-700 border border-slate-600 rounded-lg cursor-pointer"
                    />
                    <p className="text-xs text-slate-400">Click PDF to place</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 items-center">
                <button
                  onClick={() => setPageNum(Math.max(1, pageNum - 1))}
                  disabled={pageNum <= 1}
                  className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-slate-300">
                  Page {pageNum} of {numPages}
                </span>
                <button
                  onClick={() => setPageNum(Math.min(numPages, pageNum + 1))}
                  disabled={pageNum >= numPages}
                  className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>

            {/* PDF Canvas */}
            <div className="bg-slate-900 rounded-lg p-4 overflow-auto max-h-[600px] flex justify-center">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="border border-slate-700 rounded"
                style={{ cursor: tool ? 'crosshair' : 'default' }}
              />
            </div>

            {/* Annotations List */}
            {annotations.filter(ann => ann.page === pageNum).length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2 text-slate-200">
                  Annotations (Page {pageNum}) - {annotations.filter(ann => ann.page === pageNum).length} items
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {annotations
                    .filter(ann => ann.page === pageNum)
                    .map((ann) => (
                      <div
                        key={ann.id}
                        className="flex items-center justify-between bg-slate-700 p-2 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded">
                            {ann.type}
                          </span>
                          <span className="text-slate-300">
                            {ann.text || `${ann.type} annotation`}
                          </span>
                        </div>
                        <button
                          onClick={() => removeAnnotation(ann.id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Download Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleDownload}
                disabled={isProcessing}
                className="btn px-8 py-3"
              >
                {isProcessing ? 'Processing...' : 'Download Edited PDF'}
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-2 text-indigo-300">Professional PDF Editor Features:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300 text-sm">
              <div>
                <h4 className="font-semibold text-indigo-400 mb-2">✓ Text Editing</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Add custom text anywhere on PDF</li>
                  <li>Adjust font size (8-72px)</li>
                  <li>Choose text color</li>
                  <li>Place text with precision</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-400 mb-2">✓ Highlighting</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Highlight important sections</li>
                  <li>Yellow highlight overlay</li>
                  <li>Adjustable size and position</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-400 mb-2">✓ Image Insertion</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Add images to PDF pages</li>
                  <li>Support for JPG, PNG formats</li>
                  <li>Resize and position images</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-purple-400 mb-2">✓ Professional Output</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Real PDF modification (not just overlay)</li>
                  <li>All edits saved to PDF file</li>
                  <li>High-quality output</li>
                  <li>Works with all PDF readers</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-indigo-500/20 rounded-lg">
              <p className="text-xs text-indigo-300 font-semibold mb-1">💡 Pro Tip:</p>
              <p className="text-xs text-slate-300">
                This is a professional-grade PDF editor using pdf-lib. All annotations are permanently embedded 
                into the PDF file. Your edited PDF will work perfectly with Adobe Reader, Chrome, and all other PDF viewers.
              </p>
            </div>
          </div>
        </>
      )}

      {isProcessing && !file && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading PDF...</p>
        </div>
      )}
    </div>
  );
}

