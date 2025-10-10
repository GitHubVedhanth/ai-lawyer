// ==============================================================================
// Lex Veritas - Frontend User Interface (React)
// ==============================================================================
// This component provides the full user experience: a setup screen and the
// courtroom chat interface.

import React, { useState, useEffect, useRef } from 'react';

// The backend server is expected to be running on localhost:5000
const API_BASE_URL = 'http://localhost:5000';

// --- Main App Component ---
export default function App() {
  const [step, setStep] = useState('setup'); // 'setup' or 'courtroom'
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [role, setRole] = useState('Defence Counsel for Mr. Sharma');
  const [objective, setObjective] = useState('To prove my client innocent by highlighting contradictions in the witness statements.');
  const [documents, setDocuments] = useState([{ name: 'Police Report', text: '' }]);

  // Chat state
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const chatEndRef = useRef(null);

  // Effect to scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Event Handlers ---

  function handleDocChange(index, field, value) {
    const newDocs = [...documents];
    newDocs[index][field] = value;
    setDocuments(newDocs);
  }

  function addDocumentField() {
    setDocuments([...documents, { name: '', text: '' }]);
  }

  async function handleStartCase() {
    setIsLoading(true);
    const docsObject = {};
    documents.forEach(doc => {
      if (doc.name.trim() && doc.text.trim()) {
        docsObject[doc.name.trim()] = doc.text.trim();
      }
    });

    try {
      const response = await fetch(`${API_BASE_URL}/start_case`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, objective, documents: docsObject }),
      });

      if (!response.ok) throw new Error('Failed to start case on the server.');

      const data = await response.json();
      setSessionId(data.session_id);
      setMessages([{ who: 'system', text: 'Case created successfully. You may now present your opening argument.' }]);
      setStep('courtroom');
    } catch (error) {
      console.error(error);
      alert(`Error starting case: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSendMessage(text) {
    if (!text.trim() || !sessionId || isLoading) return;

    const userMessage = text.trim();
    setMessages(prev => [...prev, { who: 'user', text: userMessage }]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, text: userMessage }),
      });

      if (!response.ok) throw new Error('The server returned an error.');

      const data = await response.json();
      setMessages(prev => [...prev, { who: 'ai', text: data.ai_reply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { who: 'system', text: `Error: Could not get a response. Is the backend server running?` }]);
    } finally {
      setIsLoading(false);
    }
  }

  // --- Render Logic ---

  if (step === 'setup') {
    return <SetupScreen {...{ role, setRole, objective, documents, setObjective, handleDocChange, addDocumentField, handleStartCase, isLoading }} />;
  }

  return <CourtroomScreen {...{ messages, userInput, setUserInput, handleSendMessage, isLoading, chatEndRef }} />;
}

// --- UI Components ---

const SetupScreen = ({ role, setRole, objective, setObjective, documents, handleDocChange, addDocumentField, handleStartCase, isLoading }) => (
  <div style={styles.container}>
    <div style={styles.formCard}>
      <h1 style={styles.title}>Lex Veritas Setup</h1>
      <p style={styles.subtitle}>Define your case, upload documents, and begin the simulation.</p>

      <label style={styles.label}>Your Role:</label>
      <input type="text" value={role} onChange={e => setRole(e.target.value)} style={styles.input} />

      <label style={styles.label}>Your Objective:</label>
      <textarea value={objective} onChange={e => setObjective(e.target.value)} rows={3} style={styles.textarea} />

      <h2 style={styles.docTitle}>Case Documents</h2>
      {documents.map((doc, i) => (
        <div key={i} style={styles.docItem}>
          <input
            type="text"
            placeholder="Document Name (e.g., Exhibit A)"
            value={doc.name}
            onChange={e => handleDocChange(i, 'name', e.target.value)}
            style={{ ...styles.input, marginBottom: '8px' }}
          />
          <textarea
            placeholder="Paste the full text of the document here..."
            value={doc.text}
            onChange={e => handleDocChange(i, 'text', e.target.value)}
            rows={5}
            style={styles.textarea}
          />
        </div>
      ))}
      <button onClick={addDocumentField} style={styles.secondaryButton}>Add Another Document</button>
      <hr style={styles.hr} />
      <button onClick={handleStartCase} style={styles.primaryButton} disabled={isLoading}>
        {isLoading ? 'Starting Case...' : 'Start Case Simulation'}
      </button>
    </div>
  </div>
);

const CourtroomScreen = ({ messages, userInput, setUserInput, handleSendMessage, isLoading, chatEndRef }) => (
  <div style={styles.container}>
    <div style={styles.chatCard}>
      <h1 style={styles.title}>Lex Veritas Courtroom</h1>
      <div style={styles.chatWindow}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.messageContainer,
              display: 'flex',
              justifyContent: msg.who === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                backgroundColor:
                  msg.who === 'user' ? '#1877f2' :
                  msg.who === 'ai' ? '#e4e6eb' :
                  '#ffd700',
                color: msg.who === 'ai' ? '#050505' : 'white',
                padding: '10px 15px',
                borderRadius: '15px',
                maxWidth: '100%',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6',
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={styles.loadingIndicator}>Opposing counsel is thinking...</div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div style={styles.inputArea}>
        <input
          type="text"
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(userInput) }}
          style={styles.input}
          placeholder="Make your submission..."
          disabled={isLoading}
        />
        <button onClick={() => handleSendMessage(userInput)} style={styles.primaryButton} disabled={isLoading}>Send</button>
        <button onClick={() => handleSendMessage('/judge')} style={{ ...styles.secondaryButton, marginLeft: '8px' }} disabled={isLoading}>Ask Judge</button>
      </div>
    </div>
  </div>
);

// --- Styling ---
const styles = {
  container: { padding: '20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  formCard: { backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', width: '100%', maxWidth: '700px' },
  chatCard: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', height: '90vh' },
  title: { color: '#1c1e21', textAlign: 'center', marginBottom: '10px' },
  subtitle: { color: '#606770', textAlign: 'center', marginBottom: '30px' },
  label: { fontWeight: 'bold', color: '#333', marginBottom: '8px', display: 'block' },
  docTitle: { borderBottom: '1px solid #ddd', paddingBottom: '10px', marginTop: '30px' },
  input: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box', resize: 'vertical' },
  docItem: { marginBottom: '20px' },
  hr: { border: 'none', borderTop: '1px solid #eee', margin: '30px 0' },
  primaryButton: { backgroundColor: '#1877f2', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '6px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
  secondaryButton: { backgroundColor: '#e4e6eb', color: '#4b4f56', border: 'none', padding: '12px 20px', borderRadius: '6px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
  chatWindow: { flex: 1, overflowY: 'auto', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '15px' },
  messageContainer: { marginBottom: '15px' },
  inputArea: { display: 'flex' },
  loadingIndicator: { textAlign: 'center', color: '#606770', fontStyle: 'italic', padding: '10px' },
};
