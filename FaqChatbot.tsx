import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Trash2, 
  HelpCircle, 
  Sparkles, 
  Info,
  Sliders,
  Check,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { FAQItem, ChatMessage } from '../types';

// Initial Seed FAQs about the AI Cognitive Suite
const SEED_FAQS: FAQItem[] = [
  {
    id: 'seed-1',
    category: 'Algorithms',
    question: 'How is the similarity score calculated?',
    answer: 'The system uses a custom TF-IDF (Term Frequency-Inverse Document Frequency) vectorizer combined with Cosine Similarity. When you input a query, it preprocesses the text, filters stop words, maps it to a shared multi-dimensional term space, and computes the cosine of the angle between the query vector and the pre-indexed documents.'
  },
  {
    id: 'seed-2',
    category: 'Integration',
    question: 'What is the generative AI fallback mechanism?',
    answer: 'If the mathematical cosine similarity score of your query falls below the set similarity threshold, the chatbot automatically hands off the query to our integrated server-side Gemini AI model. This provides a smart, conversational response even when there is no direct keyword match.'
  },
  {
    id: 'seed-3',
    category: 'Machine Vision',
    question: 'How does the Object Tracker identify coordinates?',
    answer: 'The Computer Vision Tracker is powered by a quantized TensorFlow.js COCO-SSD model. It runs client-side inside your browser, extracting frame buffers and executing convolutional bounding box regressors to locate objects, assigning them unique persistent track IDs using a centroid-association algorithm.'
  },
  {
    id: 'seed-4',
    category: 'Translation',
    question: 'Which translation systems are supported?',
    answer: 'The translation module uses state-of-the-art server-side Gemini NLP engines. This allows for deep semantic understanding, multi-turn context retention, and structural accuracy across complex technical domains, supplemented by localized HTML5 Speech Synthesis.'
  },
  {
    id: 'seed-5',
    category: 'Customization',
    question: 'Can I add or delete custom FAQ documents?',
    answer: 'Yes! Use the DB_STORE panel on the left to add custom categories, questions, and answers. These will automatically compile into the active TF-IDF vocabulary on your next query. Custom documents can be deleted via the trash icon.'
  },
  {
    id: 'seed-6',
    category: 'Data Storage',
    question: 'Are my custom database records persisted?',
    answer: 'Your custom FAQ records and system options are securely persisted in your browser’s LocalStorage. This ensures your customized cognitive environment is maintained across active browser session reloads.'
  }
];

// List of English stop words for preprocessing
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at', 
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'did', 'do', 
  'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having', 
  'he', 'her', 'here', 'hers', 'him', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'me', 'more', 
  'most', 'my', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'out', 
  'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 
  'them', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 
  'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'you', 
  'your', 'yours', 'yourself', 'yourselves'
]);

export default function FaqChatbot() {
  const [faqs, setFaqs] = useState<FAQItem[]>(() => {
    const saved = localStorage.getItem('codealpha_faqs');
    return saved ? JSON.parse(saved) : SEED_FAQS;
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hello! I am your AI Cognitive Assistant. Ask me anything about our TF-IDF algorithms, TensorFlow computer vision tracking, or neural machine translation! I calculate similarity scores mathematically in real-time.",
      timestamp: new Date()
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [similarityThreshold, setSimilarityThreshold] = useState(0.25);
  const [isBotTyping, setIsBotTyping] = useState(false);
  
  // Custom FAQ Form State
  const [showFaqManager, setShowFaqManager] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newCategory, setNewCategory] = useState('CUSTOM');
  const [formSuccess, setFormSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save FAQs to localStorage
  useEffect(() => {
    localStorage.setItem('codealpha_faqs', JSON.stringify(faqs));
  }, [faqs]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isBotTyping]);

  // Preprocessing function (clean, tokenize, lowercase, remove stop words)
  const preprocessText = (text: string): string[] => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.trim().length > 0 && !STOP_WORDS.has(word));
  };

  // Mathematical TF-IDF and Cosine Similarity Matching Engine
  const findBestFAQMatch = (query: string): { faq: FAQItem | null; score: number } => {
    const queryTokens = preprocessText(query);
    if (queryTokens.length === 0 || faqs.length === 0) {
      return { faq: null, score: 0 };
    }

    // 1. Build vocabulary and token lists for documents
    const docTokensList = faqs.map(faq => preprocessText(faq.question + " " + faq.category));
    
    // Create list of unique words (vocabulary)
    const vocabulary = new Set<string>();
    queryTokens.forEach(t => vocabulary.add(t));
    docTokensList.forEach(list => list.forEach(t => vocabulary.add(t)));
    const vocabArray = Array.from(vocabulary);

    // 2. Compute Inverse Document Frequency (IDF)
    const N = faqs.length;
    const idf: { [key: string]: number } = {};
    vocabArray.forEach(term => {
      const docFreq = docTokensList.filter(tokens => tokens.includes(term)).length;
      // standard IDF with smoothing
      idf[term] = Math.log((1 + N) / (1 + docFreq)) + 1;
    });

    // Helper to vectorize tokens list
    const getVector = (tokens: string[]): number[] => {
      const termCounts: { [key: string]: number } = {};
      tokens.forEach(t => {
        termCounts[t] = (termCounts[t] || 0) + 1;
      });

      return vocabArray.map(term => {
        const tf = termCounts[term] || 0;
        return tf * (idf[term] || 0);
      });
    };

    // 3. Compute cosine similarity between query and each FAQ document
    const queryVector = getVector(queryTokens);
    
    let bestFaq: FAQItem | null = null;
    let maxSimilarity = 0;

    faqs.forEach((faq, index) => {
      const docVector = getVector(docTokensList[index]);
      
      // Calculate dot product and magnitudes
      let dotProduct = 0;
      let queryMagSquared = 0;
      let docMagSquared = 0;

      for (let i = 0; i < vocabArray.length; i++) {
        dotProduct += queryVector[i] * docVector[i];
        queryMagSquared += queryVector[i] * queryVector[i];
        docMagSquared += docVector[i] * docVector[i];
      }

      const queryMag = Math.sqrt(queryMagSquared);
      const docMag = Math.sqrt(docMagSquared);
      
      const similarity = (queryMag > 0 && docMag > 0) ? (dotProduct / (queryMag * docMag)) : 0;

      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        bestFaq = faq;
      }
    });

    return { faq: bestFaq, score: maxSimilarity };
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: inputQuery,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setInputQuery('');
    setIsBotTyping(true);

    // Calculate match score
    const { faq, score } = findBestFAQMatch(userMessage.text);

    // Simulated short delay for natural typing feel
    setTimeout(async () => {
      if (faq && score >= similarityThreshold) {
        // High similarity: Serve the exact FAQ match
        const botMessage: ChatMessage = {
          id: `msg-${Date.now()}-bot`,
          sender: 'bot',
          text: faq.answer,
          timestamp: new Date(),
          matchScore: score,
          matchedQuestion: faq.question,
          isFallback: false
        };
        setChatHistory(prev => [...prev, botMessage]);
        setIsBotTyping(false);
      } else {
        // Low similarity: Call Gemini AI fallback as a smart assistant
        try {
          const response = await fetch('/api/faq-fallback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              question: userMessage.text,
              faqs: faqs
            }),
          });

          if (!response.ok) {
            throw new Error('Fallback failed');
          }

          const data = await response.json();
          const botMessage: ChatMessage = {
            id: `msg-${Date.now()}-bot`,
            sender: 'bot',
            text: data.answer,
            timestamp: new Date(),
            matchScore: score, // show original similarity score to reveal reasoning
            isFallback: true
          };
          setChatHistory(prev => [...prev, botMessage]);
        } catch (err) {
          // If server fails, fallback to simple default text
          const botMessage: ChatMessage = {
            id: `msg-${Date.now()}-bot`,
            sender: 'bot',
            text: "I couldn't find a direct FAQ match for that and my advanced AI brain is momentarily disconnected. Please reach out to services@codealpha.tech for direct assistance!",
            timestamp: new Date(),
            matchScore: score,
            isFallback: true
          };
          setChatHistory(prev => [...prev, botMessage]);
        } finally {
          setIsBotTyping(false);
        }
      }
    }, 600);
  };

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const newItem: FAQItem = {
      id: `custom-${Date.now()}`,
      question: newQuestion,
      answer: newAnswer,
      category: newCategory.toUpperCase()
    };

    setFaqs(prev => [...prev, newItem]);
    setNewQuestion('');
    setNewAnswer('');
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 3000);
  };

  const handleDeleteFaq = (id: string) => {
    setFaqs(prev => prev.filter(f => f.id !== id));
  };

  const handleResetFaqs = () => {
    if (window.confirm('Reset FAQ database back to official CodeAlpha seed questions?')) {
      setFaqs(SEED_FAQS);
    }
  };  return (
    <div className="w-full max-w-5xl mx-auto space-y-8" id="faq-task">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-200">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-neon text-white text-[10px] font-black uppercase tracking-widest font-mono mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            AI_INTENT_MATCHER_NODE
          </span>
          <h2 className="text-3xl font-display font-black text-zinc-900 uppercase tracking-tighter">
            FAQ Matcher Chatbot
          </h2>
          <p className="text-xs text-zinc-500 mt-1.5 font-sans">
            Applies local mathematical TF-IDF and Cosine Similarity metrics, with standard Gemini fallback logic.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sidebar - FAQ Manager */}
        <div className="lg:col-span-1 bg-white p-6 border border-zinc-200 flex flex-col space-y-5 max-h-[660px] overflow-y-auto rounded-none shadow-sm">
          
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <h3 className="font-display font-black text-zinc-800 uppercase text-xs tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-neon" />
              DB_STORE ({faqs.length})
            </h3>
            <button
              id="toggle-faq-manager-btn"
              onClick={() => setShowFaqManager(!showFaqManager)}
              className="text-[10px] font-mono font-black text-brand-neon hover:underline uppercase tracking-wider cursor-pointer"
            >
              {showFaqManager ? 'VIEW_FAQS' : 'ADD_CUSTOM'}
            </button>
          </div>

          {showFaqManager ? (
            /* Add custom FAQ Form */
            <form id="add-faq-form" onSubmit={handleAddFaq} className="space-y-4 bg-zinc-50 p-4 border border-zinc-200 rounded-none">
              <h4 className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest mb-1">
                CREATE NEW ENTRY
              </h4>
              
              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-1">Category</label>
                <input
                  id="faq-category-input"
                  type="text"
                  className="w-full p-2.5 bg-white border border-zinc-200 rounded-none text-xs text-zinc-800 font-mono placeholder-zinc-400 outline-none focus:border-brand-neon"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. GENERAL"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-1">Question</label>
                <input
                  id="faq-question-input"
                  type="text"
                  className="w-full p-2.5 bg-white border border-zinc-200 rounded-none text-xs text-zinc-800 font-mono placeholder-zinc-400 outline-none focus:border-brand-neon"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="e.g. Is training stipend provided?"
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-1">Answer</label>
                <textarea
                  id="faq-answer-textarea"
                  rows={4}
                  className="w-full p-2.5 bg-white border border-zinc-200 rounded-none text-xs text-zinc-800 font-mono placeholder-zinc-400 outline-none focus:border-brand-neon resize-none"
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="e.g. Yes, performance bonuses apply..."
                  required
                />
              </div>

              <button
                id="submit-custom-faq-btn"
                type="submit"
                className="w-full bg-brand-neon hover:bg-brand-neon/90 text-white font-black text-xs py-2.5 rounded-none transition-colors flex items-center justify-center gap-1.5 uppercase cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" /> SAVE_RECORD
              </button>
              
              {formSuccess && (
                <div className="text-center text-[10px] text-brand-neon font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1 py-1">
                  <Check className="w-3.5 h-3.5 text-brand-neon" /> SYNC_OK
                </div>
              )}
            </form>
          ) : (
            /* List Existing FAQs */
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {faqs.map((faq) => (
                <div 
                  key={faq.id} 
                  className="p-3.5 border border-zinc-200 hover:border-brand-neon transition-all bg-zinc-50 hover:bg-white rounded-none group relative shadow-sm"
                >
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <span className="text-[9px] font-mono font-bold bg-zinc-100 text-brand-neon px-1.5 py-0.5 border border-zinc-200">
                      {faq.category.toUpperCase()}
                    </span>
                    {faq.id.startsWith('custom-') && (
                      <button
                        id={`delete-faq-btn-${faq.id}`}
                        onClick={() => handleDeleteFaq(faq.id)}
                        className="text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                        title="Delete custom FAQ"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <h4 className="text-xs font-black text-zinc-800 mb-1 leading-snug uppercase tracking-tight">
                    {faq.question}
                  </h4>
                  <p className="text-[11px] text-zinc-500 font-sans leading-relaxed line-clamp-3">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Engine Tuning Parameters */}
          <div className="pt-4 border-t border-zinc-200 space-y-4">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest font-mono">
              <Sliders className="w-3.5 h-3.5" />
              Similarity Tuning
            </div>
            
            <div>
              <div className="flex justify-between text-[11px] font-mono text-zinc-500 mb-2">
                <span>MATCHING THRESHOLD</span>
                <span className="font-mono text-brand-neon font-black">
                  {Math.round(similarityThreshold * 100)}%
                </span>
              </div>
              <input
                id="similarity-threshold-slider"
                type="range"
                min="0.05"
                max="0.80"
                step="0.05"
                className="w-full accent-brand-neon cursor-pointer"
                value={similarityThreshold}
                onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
              />
              <p className="text-[9px] text-zinc-400 font-mono leading-relaxed mt-2 uppercase tracking-wide">
                Lower yields aggressive matcher. Higher routes queries to Gemini fallbacks instantly.
              </p>
            </div>

            <button
              id="reset-faqs-btn"
              onClick={handleResetFaqs}
              className="w-full bg-zinc-50 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 border border-zinc-200 text-[10px] font-mono font-bold py-2 rounded-none transition-all uppercase tracking-wider cursor-pointer shadow-sm"
            >
              Reset Seed Database
            </button>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-none flex flex-col h-[600px] overflow-hidden shadow-sm">
          
          {/* Chat Header */}
          <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-neon text-white rounded-none">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-zinc-800 text-sm uppercase tracking-tight">FAQ Similarity Matcher</h3>
                  <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-mono font-bold bg-white text-brand-neon border border-zinc-200 uppercase tracking-widest">
                    NLP_ACTIVE
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wide mt-0.5">Vector Space Similarity Engine</p>
              </div>
            </div>
          </div>

          {/* Conversation Bubbles */}
          <div className="flex-grow p-5 overflow-y-auto space-y-5 bg-zinc-50/30 select-text">
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                {/* Bubble text */}
                <div
                  className={`p-4 rounded-none text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-brand-neon text-white font-bold border border-brand-neon'
                      : 'bg-white text-zinc-800 border border-zinc-200'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Similarity score logs (Metadata display) */}
                {msg.sender === 'bot' && msg.matchScore !== undefined && (
                  <div className="flex items-center gap-1.5 mt-2 px-1 text-[9px] text-zinc-400 font-mono uppercase tracking-wider">
                    <Info className="w-3.5 h-3.5 text-zinc-400" />
                    <span>
                      Cosine: <strong className="text-brand-neon">{Math.round(msg.matchScore * 100)}%</strong>
                    </span>
                    {msg.isFallback ? (
                      <span className="text-amber-600 font-black flex items-center gap-0.5">
                        <ArrowRight className="w-2.5 h-2.5" /> BELOW_THRESHOLD (GEMINI_FAILSAFE)
                      </span>
                    ) : (
                      <span className="text-brand-neon font-black flex items-center gap-0.5" title={msg.matchedQuestion}>
                        <ArrowRight className="w-2.5 h-2.5" /> FAQ_MATCHED_OK
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isBotTyping && (
              <div className="mr-auto flex items-center gap-2 max-w-[85%]">
                <div className="bg-white border border-zinc-200 rounded-none p-4 flex space-x-2 items-center shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-brand-neon animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-brand-neon animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-brand-neon animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-4 py-3 border-t border-zinc-200 bg-zinc-50 overflow-x-auto whitespace-nowrap flex gap-2">
            {[
              'How is the similarity score calculated?',
              'What is the generative AI fallback mechanism?',
              'How does the Object Tracker identify coordinates?',
              'Can I add or delete custom FAQ documents?'
            ].map((suggestion, idx) => (
              <button
                id={`chat-suggestion-btn-${idx}`}
                key={`suggest-${idx}`}
                onClick={() => setInputQuery(suggestion)}
                className="text-[10px] font-mono font-black bg-white hover:bg-zinc-100 text-zinc-700 hover:text-brand-neon border border-zinc-200 hover:border-brand-neon px-3.5 py-1.5 rounded-none transition-all uppercase cursor-pointer shadow-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-zinc-200 bg-zinc-50 flex items-center gap-2">
            <input
              id="chat-query-input"
              type="text"
              className="flex-grow p-3 bg-white border border-zinc-200 text-zinc-850 placeholder-zinc-400 rounded-none outline-none focus:border-brand-neon text-xs font-mono"
              placeholder="Query matching engine buffer..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
            />
            <button
              id="send-chat-message-btn"
              type="submit"
              disabled={!inputQuery.trim() || isBotTyping}
              className="p-3 bg-brand-neon hover:bg-brand-neon/90 text-white rounded-none disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center cursor-pointer shadow-sm"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
