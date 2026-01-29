'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ id: string; filename: string }>;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input })
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
          sources: data.sources
        }
      ]);
    } catch (error) {
      console.error('Query failed:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="bg-white border-b px-8 py-4">
        <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
        <p className="text-sm text-gray-600 mt-1">
          Ask questions about your documents and get answers with citations
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-12">
            <p className="text-lg font-medium">Ask me anything about your documents</p>
            <p className="text-sm mt-2">Try: "What is the yield of Protein X?"</p>
          </div>
        )}

        {messages.map((message, index) => (
          <Card
            key={index}
            className={cn(
              'p-4',
              message.role === 'user' ? 'bg-blue-50 ml-12' : 'bg-gray-50 mr-12'
            )}
          >
            <p className="font-semibold mb-2 text-sm">
              {message.role === 'user' ? 'You' : '🤖 AI Assistant'}
            </p>
            <p className="whitespace-pre-wrap text-sm">{message.content}</p>

            {message.sources && message.sources.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">Sources:</p>
                <div className="space-y-1">
                  {message.sources.map((source) => (
                    <div key={source.id} className="text-xs text-blue-600">
                      📄 {source.filename}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}

        {isLoading && (
          <Card className="p-4 bg-gray-50 mr-12">
            <p className="font-semibold mb-2 text-sm">🤖 AI Assistant</p>
            <p className="text-sm text-gray-600">Thinking...</p>
          </Card>
        )}
      </div>

      <div className="bg-white border-t px-8 py-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleAsk()}
            placeholder="Ask a question about your documents..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleAsk} disabled={isLoading || !input.trim()}>
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
