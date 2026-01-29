import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { askClaude } from '@/lib/claude';

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Find relevant documents (simple search for MVP)
    const documents = await prisma.document.findMany({
      where: {
        content: {
          contains: question,
          mode: 'insensitive'
        }
      },
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    // Ask Claude
    const response = await askClaude(question, documents);

    // Save query to history
    await prisma.query.create({
      data: {
        question,
        answer: response.answer
      }
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Query error:', error);
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    );
  }
}
