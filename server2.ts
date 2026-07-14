import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK lazily to avoid crashing on start if API key is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Warning: GEMINI_API_KEY environment variable is not set. API features will fail.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || 'MOCK_KEY',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Translate API Endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLang, targetLang } = req.body;
    if (!text || !targetLang) {
      return res.status(400).json({ error: 'Text and target language are required.' });
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Translate the following text from ${sourceLang || 'Auto-detect'} to ${targetLang}. 
Only return the direct translated text. Do not include any explanations, greetings, quotes, markdown formatting (like backticks), or extra text.

Original text:
${text}`,
      config: {
        systemInstruction: 'You are a highly professional, context-aware translation machine. You output the exact translation and absolutely nothing else.',
      },
    });

    const translatedText = response.text || '';
    res.json({ translatedText: translatedText.trim() });
  } catch (error: any) {
    console.error('Translation error:', error);
    res.status(500).json({ error: error.message || 'Failed to translate text.' });
  }
});

// Chatbot Fallback API Endpoint
app.post('/api/faq-fallback', async (req, res) => {
  try {
    const { question, faqs } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const ai = getGeminiClient();
    
    // Format FAQs for model context
    const faqsContext = Array.isArray(faqs) 
      ? faqs.map((f: any) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')
      : 'No standard FAQs loaded.';

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `The user asked: "${question}"
This question did not perfectly match our pre-set FAQ database.
Answer the user's question. If the question is related to CodeAlpha, internships, or the listed FAQs, answer based on the FAQs context. If it is completely unrelated, answer politely as a helpful AI assistant.
Keep your response short (1-3 sentences) and friendly. Do not use markdown headers, just plain text or simple bullet lists.

Listed FAQs for reference:
${faqsContext}`,
      config: {
        systemInstruction: 'You are a friendly customer service assistant representing CodeAlpha. Answer user queries accurately and politely.',
      },
    });

    const answer = response.text || '';
    res.json({ answer: answer.trim() });
  } catch (error: any) {
    console.error('FAQ Fallback chatbot error:', error);
    res.status(500).json({ error: error.message || 'Failed to get chatbot response.' });
  }
});

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
