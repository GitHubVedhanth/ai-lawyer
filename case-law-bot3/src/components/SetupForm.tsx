import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, FileText, Scale, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Document {
  name: string;
  text: string;
}

interface SetupFormProps {
  onStartCase: (role: string, objective: string, documents: Document[]) => void;
  isLoading: boolean;
}

export function SetupForm({ onStartCase, isLoading }: SetupFormProps) {
  const [role, setRole] = useState('Defence Counsel for the Accused');
  const [objective, setObjective] = useState('To prove my client innocent by highlighting contradictions in the prosecution\'s case.');
  const [documents, setDocuments] = useState<Document[]>([
    { name: 'Police Report', text: '' }
  ]);

  const handleDocChange = (index: number, field: keyof Document, value: string) => {
    const newDocs = [...documents];
    newDocs[index][field] = value;
    setDocuments(newDocs);
  };

  const addDocument = () => {
    setDocuments([...documents, { name: '', text: '' }]);
    toast.success('Document field added');
  };

  const removeDocument = (index: number) => {
    if (documents.length === 1) {
      toast.error('You must have at least one document');
      return;
    }
    setDocuments(documents.filter((_, i) => i !== index));
    toast.success('Document removed');
  };

  const handleSubmit = () => {
    const filledDocs = documents.filter(doc => doc.name.trim() && doc.text.trim());
    if (filledDocs.length === 0) {
      toast.error('Please add at least one document with content');
      return;
    }
    if (!role.trim()) {
      toast.error('Please specify your role');
      return;
    }
    onStartCase(role, objective, filledDocs);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/30">
      <Card className="w-full max-w-4xl shadow-elegant border-primary/10">
        <CardHeader className="space-y-2 text-center border-b border-border/50 pb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Scale className="h-8 w-8 text-primary" />
            <CardTitle className="text-4xl font-bold bg-gradient-judicial bg-clip-text text-transparent">
              Lex Veritas
            </CardTitle>
          </div>
          <CardDescription className="text-base">
            Prepare your case with precision. Define your role, set objectives, and upload all relevant legal documents.
          </CardDescription>
        </CardHeader>
        
        <ScrollArea className="h-[calc(100vh-300px)] max-h-[600px]">
          <CardContent className="pt-8 space-y-8">
            {/* Role Section */}
            <div className="space-y-3">
              <Label htmlFor="role" className="text-base font-semibold flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary" />
                Your Role in This Case
              </Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Defence Counsel for Mr. Sharma"
                className="text-base transition-smooth focus:shadow-glow"
              />
            </div>

            {/* Objective Section */}
            <div className="space-y-3">
              <Label htmlFor="objective" className="text-base font-semibold">
                Case Objective
              </Label>
              <Textarea
                id="objective"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="What are you trying to achieve in this case?"
                rows={3}
                className="text-base resize-none transition-smooth focus:shadow-glow"
              />
            </div>

            {/* Documents Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Case Documents
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDocument}
                  className="text-primary hover:bg-primary/10"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Document
                </Button>
              </div>

              <div className="space-y-4">
                {documents.map((doc, index) => (
                  <Card key={index} className="border-muted bg-muted/30">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor={`doc-name-${index}`} className="text-sm">
                              Document Name
                            </Label>
                            <Input
                              id={`doc-name-${index}`}
                              value={doc.name}
                              onChange={(e) => handleDocChange(index, 'name', e.target.value)}
                              placeholder="e.g., Exhibit A, Police Report"
                              className="bg-background"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`doc-text-${index}`} className="text-sm">
                              Document Content
                            </Label>
                            <Textarea
                              id={`doc-text-${index}`}
                              value={doc.text}
                              onChange={(e) => handleDocChange(index, 'text', e.target.value)}
                              placeholder="Paste the full text of the document here..."
                              rows={6}
                              className="font-mono text-sm bg-background resize-none"
                            />
                          </div>
                        </div>
                        
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDocument(index)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </ScrollArea>

        <div className="border-t border-border/50 p-6 bg-muted/20">
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full gradient-judicial text-white hover:opacity-90 transition-smooth shadow-elegant text-base h-12"
          >
            {isLoading ? (
              <>
                <span className="animate-pulse">Initializing Case...</span>
              </>
            ) : (
              <>
                <Scale className="h-5 w-5 mr-2" />
                Begin Case Simulation
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
