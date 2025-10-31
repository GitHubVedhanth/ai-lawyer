import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SetupForm } from '@/components/SetupForm';
import { CourtroomChat } from '@/components/CourtroomChat';
import { Button } from '@/components/ui/button';
import { Scale } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:5000';

interface Document {
  name: string;
  text: string;
}

interface Message {
  who: 'user' | 'ai' | 'system';
  text: string;
}

const Index = () => {
  const [step, setStep] = useState<'setup' | 'courtroom'>('setup');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleStartCase = async (role: string, objective: string, documents: Document[]) => {
    setIsLoading(true);
    
    const docsObject: Record<string, string> = {};
    documents.forEach(doc => {
      docsObject[doc.name] = doc.text;
    });

    try {
      const response = await fetch(`${API_BASE_URL}/start_case`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, objective, documents: docsObject }),
      });

      if (!response.ok) {
        throw new Error('Failed to start case. Please ensure the backend server is running on localhost:5000');
      }

      const data = await response.json();
      setSessionId(data.session_id);
      setMessages([
        { 
          who: 'system', 
          text: 'Case session created successfully. The court is now in session. You may present your opening argument.' 
        }
      ]);
      setStep('courtroom');
      toast.success('Case session initialized');
    } catch (error) {
      console.error('Error starting case:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start case session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !sessionId || isLoading) return;

    const userMessage = text.trim();
    setMessages(prev => [...prev, { who: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, text: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from opposing counsel');
      }

      const data = await response.json();
      
      // Check if this is a judge verdict
      const isJudgeVerdict = userMessage.toLowerCase() === '/judge';
      
      setMessages(prev => [
        ...prev, 
        { 
          who: isJudgeVerdict ? 'system' : 'ai', 
          text: data.ai_reply 
        }
      ]);

      if (isJudgeVerdict) {
        toast.success('Judge has rendered the verdict');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        { 
          who: 'system', 
          text: 'Error: Could not receive response. Please ensure the backend server is running.' 
        }
      ]);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEvidence = async (documentName: string, documentContent: string) => {
    if (!sessionId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/add_evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          document_name: documentName,
          document_content: documentContent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add evidence');
      }

      const data = await response.json();
      setMessages(prev => [
        ...prev,
        {
          who: 'system',
          text: `New evidence "${documentName}" has been submitted to the court. Total documents: ${data.total_documents}`,
        },
      ]);
      toast.success(`Evidence "${documentName}" added successfully`);
    } catch (error) {
      console.error('Error adding evidence:', error);
      toast.error('Failed to add evidence');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'setup') {
    return (
      <>
        <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Scale className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Lex Veritas</h1>
            </div>
            <Link to="/about">
              <Button variant="outline">About</Button>
            </Link>
          </div>
        </header>
        <SetupForm onStartCase={handleStartCase} isLoading={isLoading} />
      </>
    );
  }

  return <CourtroomChat messages={messages} onSendMessage={handleSendMessage} onAddEvidence={handleAddEvidence} isLoading={isLoading} />;
};

export default Index;
