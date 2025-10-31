import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Scale, Send, Gavel, Loader2, FileText } from 'lucide-react';

interface Message {
  who: 'user' | 'ai' | 'system';
  text: string;
}

interface CourtroomChatProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  onAddEvidence: (documentName: string, documentContent: string) => void;
  isLoading: boolean;
}

export function CourtroomChat({ messages, onSendMessage, onAddEvidence, isLoading }: CourtroomChatProps) {
  const [input, setInput] = useState('');
  const [evidenceName, setEvidenceName] = useState('');
  const [evidenceContent, setEvidenceContent] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleJudgeVerdict = () => {
    if (!isLoading) {
      onSendMessage('/judge');
    }
  };

  const handleSubmitEvidence = () => {
    if (evidenceName.trim() && evidenceContent.trim() && !isLoading) {
      onAddEvidence(evidenceName, evidenceContent);
      setEvidenceName('');
      setEvidenceContent('');
      setDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/30">
      <Card className="w-full max-w-5xl h-[90vh] flex flex-col shadow-elegant border-primary/10">
        {/* Header */}
        <div className="border-b border-border/50 p-6 gradient-judicial">
          <div className="flex items-center justify-center gap-3">
            <Scale className="h-7 w-7 text-white" />
            <h1 className="text-3xl font-bold text-white">
              Lex Veritas Courtroom
            </h1>
          </div>
          <p className="text-center text-white/80 mt-2 text-sm">
            Present your arguments with clarity and legal precision
          </p>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((msg, index) => (
              <MessageBubble key={index} message={msg} />
            ))}
            
            {isLoading && (
              <div className="flex items-center justify-center gap-3 py-4 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="italic">Opposing counsel is preparing their response...</span>
              </div>
            )}
            
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <Separator />

        {/* Input Area */}
        <div className="p-6 bg-muted/20">
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Present your argument to the court..."
                disabled={isLoading}
                className="flex-1 text-base transition-smooth focus:shadow-glow"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="gradient-judicial text-white hover:opacity-90 transition-smooth px-6"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit
              </Button>
            </div>
            
            <div className="flex justify-center gap-3">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    disabled={isLoading}
                    variant="outline"
                    className="border-primary/20 text-foreground hover:bg-primary/5 transition-smooth"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Add Evidence
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Submit New Evidence
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="evidence-name">Document Name</Label>
                      <Input
                        id="evidence-name"
                        value={evidenceName}
                        onChange={(e) => setEvidenceName(e.target.value)}
                        placeholder="e.g., Exhibit B, Witness Statement"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="evidence-content">Document Content</Label>
                      <Textarea
                        id="evidence-content"
                        value={evidenceContent}
                        onChange={(e) => setEvidenceContent(e.target.value)}
                        placeholder="Enter the full text of the evidence..."
                        rows={8}
                        disabled={isLoading}
                      />
                    </div>
                    <Button
                      onClick={handleSubmitEvidence}
                      disabled={!evidenceName.trim() || !evidenceContent.trim() || isLoading}
                      className="w-full gradient-judicial text-white"
                    >
                      Submit to Court
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button
                onClick={handleJudgeVerdict}
                disabled={isLoading}
                variant="outline"
                className="gradient-gold border-0 text-foreground hover:opacity-90 transition-smooth"
              >
                <Gavel className="h-4 w-4 mr-2" />
                Request Judge's Verdict
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.who === 'user';
  const isSystem = message.who === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-6">
        <div className="gradient-gold text-foreground px-6 py-3 rounded-xl text-sm font-medium shadow-md">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className="max-w-[80%]">
        <div className="text-xs font-medium mb-2 px-1">
          {isUser ? 'You' : 'Opposing Counsel'}
        </div>
        <div
          className={`
            px-5 py-4 rounded-2xl shadow-sm
            ${isUser 
              ? 'gradient-judicial text-white ml-auto' 
              : 'bg-card text-card-foreground border border-border/50'
            }
          `}
        >
          <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
        </div>
      </div>
    </div>
  );
}
