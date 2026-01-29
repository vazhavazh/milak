import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface RAGResponse {
  answer: string;
  sources: Array<{
    id: string;
    filename: string;
  }>;
}

export async function askClaude(
  question: string,
  documents: Array<{ id: string; filename: string; content: string }>
): Promise<RAGResponse> {
  if (documents.length === 0) {
    return {
      answer: "I don't have any documents to answer this question. Please upload some documents first.",
      sources: []
    };
  }

  // Build context from documents
  const context = documents
    .map((doc, i) => `[DOC-${i + 1}: ${doc.filename}]\n${doc.content.substring(0, 2000)}`)
    .join('\n\n---\n\n');

  // Ask Claude
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: `You are a scientific research assistant for MilaK, a biotechnology company developing functional proteins via precision fermentation.

CRITICAL RULES:
1. Answer ONLY based on the provided documents
2. ALWAYS cite sources using [DOC-X] format
3. If information is not in the documents, say "I don't have enough information in the provided documents"
4. Never make up or hallucinate information
5. Be precise and scientific in your language`,
    messages: [
      {
        role: 'user',
        content: `Here are the relevant documents from our database:

${context}

Question: ${question}

Please provide a detailed answer based ONLY on these documents. Include citations in [DOC-X] format.`
      }
    ]
  });

  return {
    answer: response.content[0].type === 'text' ? response.content[0].text : '',
    sources: documents.map(doc => ({ id: doc.id, filename: doc.filename }))
  };
}
