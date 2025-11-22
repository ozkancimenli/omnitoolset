// OCR API Route - Can call Python service with Tesseract/PaddleOCR

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const page = parseInt(formData.get('page') as string || '1');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // TODO: Call Python OCR service
    // Example:
    // const pythonServiceUrl = process.env.PYTHON_OCR_SERVICE_URL || 'http://localhost:8000/ocr';
    // const response = await fetch(pythonServiceUrl, {
    //   method: 'POST',
    //   body: formData,
    // });
    // const result = await response.json();
    // return NextResponse.json(result);

    return NextResponse.json({
      success: true,
      text: 'OCR result (placeholder - will call Python service)',
      confidence: 0.95,
      page,
    });
  } catch (error) {
    console.error('OCR error:', error);
    return NextResponse.json(
      { error: 'OCR processing failed' },
      { status: 500 }
    );
  }
}

