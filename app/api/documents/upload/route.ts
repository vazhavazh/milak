import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Get file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text based on file type
    let text = '';
    
    if (file.type === 'application/pdf') {
      const pdfData = await pdfParse(buffer);
      text = pdfData.text;
    } else if (file.type.includes('word') || file.name.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (file.type === 'text/plain') {
      text = buffer.toString('utf-8');
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload PDF, DOCX, or TXT files.' },
        { status: 400 }
      );
    }

    // Save to database
    const document = await prisma.document.create({
      data: {
        filename: file.name,
        content: text,
        mimeType: file.type,
        fileSize: file.size
      }
    });

    return NextResponse.json({
      id: document.id,
      filename: document.filename,
      createdAt: document.createdAt
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
