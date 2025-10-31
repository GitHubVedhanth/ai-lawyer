import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Scale, Shield, BookOpen, Gavel } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Scale className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Lex Veritas</h1>
          </Link>
          <Link to="/">
            <Button variant="outline">Back to Simulation</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-5xl font-bold text-foreground">
            About <span className="text-primary">Lex Veritas</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            A professional legal debate simulation platform powered by advanced AI, 
            designed to help legal professionals and students practice courtroom arguments 
            and receive expert feedback.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Scale className="h-12 w-12 text-primary" />}
            title="AI-Powered Debates"
            description="Engage with sophisticated AI that understands Indian legal framework and provides realistic opposing arguments."
          />
          <FeatureCard
            icon={<Shield className="h-12 w-12 text-primary" />}
            title="Dynamic Evidence"
            description="Add documents and evidence dynamically during your case to simulate real courtroom conditions."
          />
          <FeatureCard
            icon={<BookOpen className="h-12 w-12 text-primary" />}
            title="Case Documentation"
            description="Build comprehensive case files with multiple documents, witness statements, and legal precedents."
          />
          <FeatureCard
            icon={<Gavel className="h-12 w-12 text-primary" />}
            title="Judge Verdicts"
            description="Request impartial AI judge verdicts based on the strength of arguments and evidence presented."
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 bg-card/50 rounded-lg">
        <h2 className="text-3xl font-bold text-center text-foreground mb-12">How It Works</h2>
        <div className="max-w-4xl mx-auto space-y-8">
          <Step
            number="1"
            title="Define Your Case"
            description="Set your role (Defense or Prosecution), objective, and upload initial case documents."
          />
          <Step
            number="2"
            title="Present Arguments"
            description="Engage in a realistic legal debate. The AI will counter your arguments based on Indian law."
          />
          <Step
            number="3"
            title="Add Evidence"
            description="Submit new evidence dynamically as the case progresses, just like in a real courtroom."
          />
          <Step
            number="4"
            title="Request Verdict"
            description="Ask the AI judge to render a verdict based on the complete case file and debate history."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-foreground">Ready to Practice Your Legal Skills?</h2>
          <p className="text-muted-foreground">
            Start your first case simulation and experience realistic courtroom debates.
          </p>
          <Link to="/">
            <Button size="lg" className="gap-2">
              <Scale className="h-5 w-5" />
              Start Simulation
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2025 Lex Veritas. Built for legal professionals and students.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="p-6 rounded-lg border border-border/40 bg-card hover:shadow-lg transition-shadow space-y-4">
    <div className="flex justify-center">{icon}</div>
    <h3 className="text-xl font-semibold text-foreground text-center">{title}</h3>
    <p className="text-muted-foreground text-center text-sm">{description}</p>
  </div>
);

const Step = ({ number, title, description }: { number: string; title: string; description: string }) => (
  <div className="flex gap-6 items-start">
    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
      {number}
    </div>
    <div className="space-y-2">
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default About;
