import { useState, useEffect } from 'react';
import { 
  Languages, 
  ArrowLeftRight, 
  Volume2, 
  Copy, 
  Trash2, 
  Check, 
  Loader2, 
  Sparkles, 
  VolumeX 
} from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'la', name: 'Latin', nativeName: 'Latina' },
];

export default function Translator() {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [speakingInput, setSpeakingInput] = useState(false);
  const [speakingOutput, setSpeakingOutput] = useState(false);

  // Trigger translation when typing stops (debounced)
  useEffect(() => {
    if (!inputText.trim()) {
      setTranslatedText('');
      return;
    }

    const delayDebounce = setTimeout(() => {
      handleTranslate();
    }, 800); // 800ms debounce

    return () => clearTimeout(delayDebounce);
  }, [inputText, sourceLang, targetLang]);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          sourceLang: sourceLang === 'auto' ? '' : LANGUAGES.find(l => l.code === sourceLang)?.name || '',
          targetLang: LANGUAGES.find(l => l.code === targetLang)?.name || 'Spanish',
        }),
      });

      if (!response.ok) {
        throw new Error('Translation request failed.');
      }

      const data = await response.json();
      setTranslatedText(data.translatedText);
    } catch (err: any) {
      setError(err.message || 'An error occurred during translation.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    if (sourceLang === 'auto') return;
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const copyToClipboard = async (text: string, isInput: boolean) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      if (isInput) {
        setCopiedInput(true);
        setTimeout(() => setCopiedInput(false), 2000);
      } else {
        setCopiedOutput(true);
        setTimeout(() => setCopiedOutput(false), 2000);
      }
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const speakText = (text: string, langCode: string, isInput: boolean) => {
    if (!text || !('speechSynthesis' in window)) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    if (isInput && speakingInput) {
      setSpeakingInput(false);
      return;
    }
    if (!isInput && speakingOutput) {
      setSpeakingOutput(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;

    utterance.onend = () => {
      if (isInput) setSpeakingInput(false);
      else setSpeakingOutput(false);
    };

    utterance.onerror = () => {
      if (isInput) setSpeakingInput(false);
      else setSpeakingOutput(false);
    };

    if (isInput) {
      setSpeakingInput(true);
      setSpeakingOutput(false);
    } else {
      setSpeakingOutput(true);
      setSpeakingInput(false);
    }

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8" id="translator-task">
      
      {/* Task Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-200">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-neon text-white text-[10px] font-black uppercase tracking-widest font-mono mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            AI_TRANSLATOR_NODE
          </span>
          <h2 className="text-3xl font-display font-black text-zinc-900 uppercase tracking-tighter">
            Language Translation Tool
          </h2>
          <p className="text-xs text-zinc-500 mt-1.5 font-sans">
            Real-time context-aware neural translation backed by full client-side speech synthesis (TTS).
          </p>
        </div>
      </div>

      {/* Translator Box (Brutalist Solid Light) */}
      <div className="bg-white border border-zinc-200 rounded-none overflow-hidden shadow-sm">
        
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-zinc-50 border-b border-zinc-200 gap-4">
          
          {/* Source Lang Selector */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto bg-white p-2 border border-zinc-200">
            <Languages className="w-4 h-4 text-brand-neon" />
            <select
              id="source-language"
              className="bg-transparent text-xs font-mono font-bold text-zinc-800 border-none focus:outline-none focus:ring-0 cursor-pointer py-1 pr-6"
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
            >
              <option value="auto" className="bg-white text-zinc-800 font-mono">Auto-Detect Language</option>
              {LANGUAGES.map((lang) => (
                <option key={`src-${lang.code}`} value={lang.code} className="bg-white text-zinc-800 font-mono">
                  {lang.name.toUpperCase()} ({lang.nativeName})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button
            id="swap-languages-btn"
            onClick={handleSwap}
            disabled={sourceLang === 'auto'}
            className="p-3 bg-zinc-100 hover:bg-brand-neon text-zinc-700 hover:text-white border border-zinc-200 hover:border-brand-neon transition-all disabled:opacity-30 disabled:pointer-events-none group cursor-pointer"
            title="Swap Languages"
          >
            <ArrowLeftRight className="w-4 h-4 transition-transform group-hover:scale-110" />
          </button>

          {/* Target Lang Selector */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end sm:justify-start bg-white p-2 border border-zinc-200">
            <Languages className="w-4 h-4 text-brand-neon" />
            <select
              id="target-language"
              className="bg-transparent text-xs font-mono font-bold text-zinc-800 border-none focus:outline-none focus:ring-0 cursor-pointer py-1 pr-6"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
            >
              {LANGUAGES.map((lang) => (
                <option key={`tgt-${lang.code}`} value={lang.code} className="bg-white text-zinc-800 font-mono">
                  {lang.name.toUpperCase()} ({lang.nativeName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Translation Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-200 min-h-[300px]">
          
          {/* Input Panel */}
          <div className="flex flex-col p-6 bg-white relative">
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-2">
              Source Token Input
            </div>
            <textarea
              id="translator-input-textarea"
              placeholder="Type or paste text to translate..."
              className="w-full flex-grow text-zinc-800 placeholder-zinc-400 bg-transparent border-none resize-none outline-none focus:ring-0 text-lg min-h-[180px] font-sans font-medium"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              maxLength={2000}
            />

            {/* Input Action Controls */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-100">
              <div className="flex items-center gap-2">
                <button
                  id="speak-input-btn"
                  onClick={() => speakText(inputText, sourceLang === 'auto' ? 'en' : sourceLang, true)}
                  disabled={!inputText.trim()}
                  className={`p-2.5 border transition-all ${
                    speakingInput 
                      ? 'bg-brand-neon text-white border-brand-neon font-black' 
                      : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-800'
                  } disabled:opacity-30 disabled:pointer-events-none cursor-pointer`}
                  title={speakingInput ? 'Stop Speaking' : 'Synthesize Playback'}
                >
                  {speakingInput ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  id="copy-input-btn"
                  onClick={() => copyToClipboard(inputText, true)}
                  disabled={!inputText.trim()}
                  className="p-2.5 bg-zinc-50 text-zinc-500 border border-zinc-200 hover:bg-zinc-100 hover:text-zinc-800 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  title="Copy Raw Tokens"
                >
                  {copiedInput ? <Check className="w-4 h-4 text-brand-neon" /> : <Copy className="w-4 h-4" />}
                </button>
                {inputText && (
                  <button
                    id="clear-input-btn"
                    onClick={() => { setInputText(''); setTranslatedText(''); }}
                    className="p-2.5 bg-zinc-50 text-zinc-500 border border-zinc-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all cursor-pointer"
                    title="Clear panel"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase">
                {inputText.length} / 2000 CHR
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="flex flex-col p-6 bg-zinc-50/50 relative">
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-2">
              Neural Network Output
            </div>
            
            {loading ? (
              <div className="flex-grow flex flex-col items-center justify-center min-h-[180px] text-zinc-400 font-mono">
                <Loader2 className="w-8 h-8 animate-spin text-brand-neon mb-3" />
                <span className="text-xs uppercase tracking-widest text-zinc-500 animate-pulse">Running Neural Translation...</span>
              </div>
            ) : error ? (
              <div className="flex-grow flex items-center justify-center min-h-[180px] text-red-600 text-center">
                <div className="bg-red-50 p-4 border border-red-200 max-w-sm">
                  <p className="font-mono text-xs uppercase tracking-wider font-bold mb-1">SYSTEM_ERR: MATCH_FAILED</p>
                  <p className="text-xs text-red-500 mb-3 font-mono">{error}</p>
                  <button 
                    onClick={handleTranslate}
                    className="bg-red-600 text-white font-mono text-[10px] font-black uppercase px-3 py-1.5 hover:bg-red-700"
                  >
                    RETRY_SYNC
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-grow flex flex-col justify-between">
                <div 
                  id="translated-output-div"
                  className={`text-lg min-h-[180px] whitespace-pre-wrap select-text font-sans ${
                    translatedText ? 'text-zinc-800 font-medium' : 'text-zinc-400'
                  }`}
                >
                  {translatedText || 'Neural output buffer waiting...'}
                </div>

                {/* Output Action Controls */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-200">
                  <div className="flex items-center gap-2">
                    <button
                      id="speak-output-btn"
                      onClick={() => speakText(translatedText, targetLang, false)}
                      disabled={!translatedText}
                      className={`p-2.5 border transition-all ${
                        speakingOutput 
                          ? 'bg-brand-neon text-white border-brand-neon font-black' 
                          : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-800'
                      } disabled:opacity-30 disabled:pointer-events-none cursor-pointer`}
                      title={speakingOutput ? 'Stop Speaking' : 'Synthesize Translation'}
                    >
                      {speakingOutput ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <button
                      id="copy-output-btn"
                      onClick={() => copyToClipboard(translatedText, false)}
                      disabled={!translatedText}
                      className="p-2.5 bg-zinc-50 text-zinc-500 border border-zinc-200 hover:bg-zinc-100 hover:text-zinc-800 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      title="Copy Output"
                    >
                      {copiedOutput ? <Check className="w-4 h-4 text-brand-neon" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {translatedText && (
                    <span className="text-[10px] font-mono bg-brand-neon text-white px-2 py-0.5 font-black uppercase tracking-widest shadow-sm">
                      SYNTH_OK
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
