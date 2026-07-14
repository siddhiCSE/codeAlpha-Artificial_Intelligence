import { useState, useEffect } from 'react';
import { 
  Languages, 
  MessageSquare, 
  Activity, 
  BookOpen, 
  GraduationCap, 
  Award, 
  CheckSquare, 
  User, 
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Cpu,
  Tv,
  Terminal,
  ShieldAlert
} from 'lucide-react';
import Translator from './components/Translator';
import FaqChatbot from './components/FaqChatbot';
import ObjectTracker from './components/ObjectTracker';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'hub' | 'translator' | 'chatbot' | 'tracker'>('hub');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uptime, setUptime] = useState('14:02:44:89');

  // Simulate a live ticking system clock for high-tech telemetry vibe
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      const ms = String(Math.floor(Math.random() * 100)).padStart(2, '0');
      setUptime(`${hours}:${mins}:${secs}:${ms}`);
    }, 110);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-800 font-sans flex flex-col md:flex-row antialiased">
      
      {/* SIDEBAR NAVIGATION - DESKTOP (Elegant Light Layout) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-zinc-200 p-5 shrink-0 select-none">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3 pb-6 border-b border-zinc-200 mb-6">
          <div className="p-2.5 bg-brand-neon text-white rounded-none font-bold shadow-sm">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-black text-zinc-900 text-base leading-none tracking-tighter uppercase">
              Omni_Cognitive
            </h1>
            <p className="text-[10px] text-brand-neon font-bold uppercase tracking-widest font-mono mt-1">
              AI Command Suite
            </p>
          </div>
        </div>

        {/* System Status Metrics HUD */}
        <div className="p-3 bg-zinc-50 border border-zinc-200 mb-6 space-y-2">
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
            <span>Core Diagnostics</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-neon animate-pulse" />
          </div>
          <div className="font-mono text-base font-bold text-zinc-900 tracking-wider" id="sidebar-uptime-hud">
            {uptime}
          </div>
          <div className="text-[9px] font-mono text-zinc-400 uppercase flex items-center justify-between">
            <span>Host: Port 3000</span>
            <span className="text-brand-neon font-bold">STABLE</span>
          </div>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-200 mb-6">
          <div className="p-1.5 bg-zinc-100 text-zinc-600 border border-zinc-200">
            <User className="w-4 h-4 text-zinc-600" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] text-zinc-400 font-bold uppercase font-mono">System Operator</p>
            <p className="text-xs font-bold text-zinc-800 truncate font-mono" title="siddhi29cse127@satiengg.in">
              siddhi29cse127
            </p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-grow space-y-1.5">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-3 mb-2 font-mono">
            ENGINE WORKSPACE
          </p>
          
          <button
            id="nav-hub-btn"
            onClick={() => setCurrentTab('hub')}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold uppercase tracking-wide transition-all cursor-pointer ${
              currentTab === 'hub'
                ? 'bg-brand-neon text-white font-black border border-brand-neon shadow-sm'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 border border-transparent'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4" />
              AI Command Center
            </span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${currentTab === 'hub' ? 'rotate-90' : ''}`} />
          </button>

          <button
            id="nav-translator-btn"
            onClick={() => setCurrentTab('translator')}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold uppercase tracking-wide transition-all cursor-pointer ${
              currentTab === 'translator'
                ? 'bg-brand-neon text-white font-black border border-brand-neon shadow-sm'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 border border-transparent'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Languages className="w-4 h-4" />
              Core Translator
            </span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${currentTab === 'translator' ? 'rotate-90' : ''}`} />
          </button>

          <button
            id="nav-chatbot-btn"
            onClick={() => setCurrentTab('chatbot')}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold uppercase tracking-wide transition-all cursor-pointer ${
              currentTab === 'chatbot'
                ? 'bg-brand-neon text-white font-black border border-brand-neon shadow-sm'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 border border-transparent'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4" />
              FAQ Chatbot
            </span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${currentTab === 'chatbot' ? 'rotate-90' : ''}`} />
          </button>

          <button
            id="nav-tracker-btn"
            onClick={() => setCurrentTab('tracker')}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold uppercase tracking-wide transition-all cursor-pointer ${
              currentTab === 'tracker'
                ? 'bg-brand-neon text-white font-black border border-brand-neon shadow-sm'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 border border-transparent'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Activity className="w-4 h-4" />
              Object Tracker
            </span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${currentTab === 'tracker' ? 'rotate-90' : ''}`} />
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-zinc-200 text-[9px] text-zinc-400 font-bold font-mono space-y-1">
          <p className="hover:text-brand-neon transition-colors">COGNITIVE SUITE v2.4</p>
          <p>STATUS: ONLINE (PORT_3000)</p>
        </div>
      </aside>

      {/* MOBILE HEADER & NAVIGATION */}
      <header className="md:hidden flex items-center justify-between bg-white border-b border-zinc-200 p-4 select-none shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-brand-neon text-white shadow-sm">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-display font-black text-zinc-900 text-sm tracking-tighter uppercase">Omni Cognitive</h1>
            <p className="text-[9px] text-brand-neon font-black tracking-wider uppercase font-mono">AI PORTAL</p>
          </div>
        </div>
        
        <button
          id="mobile-menu-toggle-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 bg-zinc-100 border border-zinc-200"
        >
          {mobileMenuOpen ? <X className="w-5 h-5 text-zinc-850" /> : <Menu className="w-5 h-5 text-zinc-850" />}
        </button>
      </header>

      {/* MOBILE MENU DROPDOWN */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-zinc-200 p-4 flex flex-col space-y-2 select-none z-50 shadow-md animate-fade-in">
          {[
            { id: 'hub', label: 'AI Command Center', icon: BookOpen },
            { id: 'translator', label: 'Core Translator', icon: Languages },
            { id: 'chatbot', label: 'FAQ Chatbot', icon: MessageSquare },
            { id: 'tracker', label: 'Object Tracker', icon: Activity }
          ].map((item) => (
            <button
              id={`mobile-nav-${item.id}`}
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id as any);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold uppercase transition-all ${
                currentTab === item.id
                  ? 'bg-brand-neon text-white font-black shadow-sm'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* MAIN CONTAINER CONTENT (Styled with clean borders) */}
      <main className="flex-grow p-4 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto bg-zinc-50/50 border-l border-zinc-200">
        
        {/* TAB 1: AI COMMAND CENTER */}
        {currentTab === 'hub' && (
          <div className="space-y-12 animate-fade-in">
            {/* Hero Welcome Banner */}
            <div className="bg-white border-2 border-zinc-200 p-6 md:p-10 rounded-none text-zinc-800 relative overflow-hidden shadow-sm">
              {/* Giant ghost watermark background */}
              <div className="absolute top-0 right-0 text-[180px] font-black leading-none opacity-5 text-zinc-900 select-none pointer-events-none -mr-8 -mt-8 font-display">
                OMNI
              </div>
              
              <div className="relative z-10 max-w-2xl space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-neon text-white text-[10px] font-black uppercase tracking-widest font-mono shadow-sm">
                  System State: Optimal
                </span>
                <h2 className="text-4xl md:text-5xl font-display font-black text-zinc-900 tracking-tighter leading-none uppercase">
                  COGNITIVE_WORKSPACE
                </h2>
                <p className="text-sm text-zinc-600 leading-relaxed font-sans max-w-xl">
                  Welcome to the Omni Cognitive AI suite. This dashboard unifies state-of-the-art server-side generative AI pipelines with fast client-side machine learning math. Access the dedicated neural modules below to run live computations.
                </p>
                <div className="pt-4 flex flex-wrap gap-3">
                  <span className="bg-zinc-50 px-3 py-1.5 text-xs font-mono font-bold border border-zinc-200 flex items-center gap-1.5 text-zinc-700">
                    <Cpu className="w-4 h-4 text-brand-neon animate-pulse" /> MODEL STACK: GEMINI-3.5 & COCO-SSD
                  </span>
                  <span className="bg-zinc-50 px-3 py-1.5 text-xs font-mono font-bold border border-zinc-200 flex items-center gap-1.5 text-zinc-700">
                    <CheckSquare className="w-4 h-4 text-brand-neon" /> LOCAL TF-IDF MATHEMATICS ACTIVE
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Launch Cards for Tasks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Task 1 Card */}
              <div className="bg-white border border-zinc-200 p-6 rounded-none flex flex-col justify-between hover:border-brand-neon hover:shadow-md transition-all duration-300 group relative overflow-hidden min-h-[300px]">
                {/* Background Giant Number */}
                <span className="text-[180px] font-black leading-none absolute -top-8 -left-4 opacity-[0.03] text-zinc-900 select-none pointer-events-none font-display">
                  01
                </span>
                
                <div className="relative z-10">
                  <div className="inline-block bg-brand-neon text-white text-[10px] font-black px-2.5 py-1 uppercase tracking-widest mb-4 shadow-sm">
                    NLP MODULE
                  </div>
                  <h3 className="font-display font-black text-zinc-900 text-3xl tracking-tighter leading-none uppercase mb-2 group-hover:text-brand-neon transition-colors">
                    Core<br />Translator
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono mb-4">
                    CONTEXT-AWARE TRANS
                  </p>
                  <p className="text-xs text-zinc-600 leading-relaxed mb-6">
                    Real-time deep semantic translation model utilizing modern Gemini context layers. Backed by fully integrated client-side Speech Synthesis (TTS).
                  </p>
                </div>
                <button
                  id="launch-task1-btn"
                  onClick={() => setCurrentTab('translator')}
                  className="relative z-10 w-full bg-zinc-50 group-hover:bg-brand-neon text-zinc-700 group-hover:text-white font-black uppercase text-xs py-3 rounded-none tracking-wider border border-zinc-200 group-hover:border-brand-neon transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  LOAD TRANSLATION UNIT <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Task 2 Card */}
              <div className="bg-white border border-zinc-200 p-6 rounded-none flex flex-col justify-between hover:border-brand-neon hover:shadow-md transition-all duration-300 group relative overflow-hidden min-h-[300px]">
                {/* Background Giant Number */}
                <span className="text-[180px] font-black leading-none absolute -top-8 -left-4 opacity-[0.03] text-zinc-900 select-none pointer-events-none font-display">
                  02
                </span>
                
                <div className="relative z-10">
                  <div className="inline-block bg-brand-neon text-white text-[10px] font-black px-2.5 py-1 uppercase tracking-widest mb-4 shadow-sm">
                    ALGORITHMIC ENGINE
                  </div>
                  <h3 className="font-display font-black text-zinc-900 text-3xl tracking-tighter leading-none uppercase mb-2 group-hover:text-brand-neon transition-colors">
                    FAQ<br />Chatbot
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono mb-4">
                    TF-IDF & COSINE VECTORIZER
                  </p>
                  <p className="text-xs text-zinc-600 leading-relaxed mb-6">
                    Processes incoming text tokens and resolves similarities via custom TF-IDF matrices and Cosine Distance checks. Includes robust Gemini generative fail-safes.
                  </p>
                </div>
                <button
                  id="launch-task2-btn"
                  onClick={() => setCurrentTab('chatbot')}
                  className="relative z-10 w-full bg-zinc-50 group-hover:bg-brand-neon text-zinc-700 group-hover:text-white font-black uppercase text-xs py-3 rounded-none tracking-wider border border-zinc-200 group-hover:border-brand-neon transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  LOAD SIMILARITY MATRICES <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Task 4 Card */}
              <div className="bg-white border border-zinc-200 p-6 rounded-none flex flex-col justify-between hover:border-brand-neon hover:shadow-md transition-all duration-300 group relative overflow-hidden min-h-[300px]">
                {/* Background Giant Number */}
                <span className="text-[180px] font-black leading-none absolute -top-8 -left-4 opacity-[0.03] text-zinc-900 select-none pointer-events-none font-display">
                  03
                </span>
                
                <div className="relative z-10">
                  <div className="inline-block bg-zinc-100 text-zinc-500 text-[10px] font-black px-2.5 py-1 uppercase tracking-widest mb-4 group-hover:bg-brand-neon group-hover:text-white transition-colors shadow-sm">
                    COMPUTER VISION
                  </div>
                  <h3 className="font-display font-black text-zinc-900 text-3xl tracking-tighter leading-none uppercase mb-2 group-hover:text-brand-neon transition-colors">
                    Object<br />Detection
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono mb-4">
                    TENSORFLOW.JS CV
                  </p>
                  <p className="text-xs text-zinc-600 leading-relaxed mb-6">
                    Connects standard webcams or video elements to execute localized TFJS models (COCO-SSD) over live canvas. Draws persistent ID bounding tags and trail logs.
                  </p>
                </div>
                <button
                  id="launch-task4-btn"
                  onClick={() => setCurrentTab('tracker')}
                  className="relative z-10 w-full bg-zinc-50 group-hover:bg-brand-neon text-zinc-700 group-hover:text-white font-black uppercase text-xs py-3 rounded-none tracking-wider border border-zinc-200 group-hover:border-brand-neon transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  LOAD TENSORFLOW CORES <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Diagnostics and Live Metrics (Replaces Perk & Instruction Lists) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Dynamic Neural Network Pulse */}
              <div className="bg-white border border-zinc-200 p-6 rounded-none space-y-4 shadow-sm">
                <h3 className="font-display font-black text-zinc-900 text-sm flex items-center gap-2 pb-2 border-b border-zinc-200 uppercase tracking-widest">
                  <Cpu className="w-4 h-4 text-brand-neon animate-pulse" />
                  Neural Signal Diagnostics
                </h3>
                
                <div className="relative bg-zinc-50 border border-zinc-200 p-4 h-48 flex items-center justify-center overflow-hidden">
                  {/* Subtle animated background grid */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#f4f4f5_1px,transparent_1px),linear-gradient(to_bottom,#f4f4f5_1px,transparent_1px)] bg-[size:16px_16px]" />
                  
                  {/* SVG representation of an active cognitive connection network */}
                  <svg className="w-full h-full relative z-10" viewBox="0 0 400 160">
                    <defs>
                      <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                      </linearGradient>
                    </defs>
                    
                    {/* Connection lines */}
                    <path d="M 40 80 Q 120 30 200 80 T 360 80" fill="none" stroke="url(#neonGradient)" strokeWidth="2" strokeDasharray="5,5" className="animate-[dash_15s_linear_infinite]" />
                    <path d="M 40 80 Q 120 130 200 80 T 360 80" fill="none" stroke="#4f46e5" strokeWidth="1" strokeOpacity="0.3" />
                    
                    {/* Interactive cluster nodes */}
                    <g>
                      <circle cx="40" cy="80" r="6" fill="#4f46e5" />
                      <circle cx="40" cy="80" r="12" fill="none" stroke="#4f46e5" strokeWidth="1" className="animate-ping" style={{ animationDuration: '3s' }} />
                      <text x="30" y="102" fill="#71717a" fontSize="8" fontFamily="monospace">INPUT_NODE</text>
                    </g>
                    
                    <g>
                      <circle cx="120" cy="45" r="4" fill="#3b82f6" />
                      <circle cx="120" cy="115" r="4" fill="#71717a" />
                    </g>

                    <g>
                      <circle cx="200" cy="80" r="8" fill="#4f46e5" />
                      <circle cx="200" cy="80" r="16" fill="none" stroke="#4f46e5" strokeWidth="1" className="animate-pulse" />
                      <text x="180" y="102" fill="#71717a" fontSize="8" fontFamily="monospace" fontWeight="bold">MATRIX_TFIDF</text>
                    </g>

                    <g>
                      <circle cx="280" cy="45" r="4" fill="#71717a" />
                      <circle cx="280" cy="115" r="4" fill="#3b82f6" />
                    </g>

                    <g>
                      <circle cx="360" cy="80" r="6" fill="#4f46e5" />
                      <circle cx="360" cy="80" r="12" fill="none" stroke="#4f46e5" strokeWidth="1" className="animate-ping" style={{ animationDuration: '4s' }} />
                      <text x="345" y="102" fill="#71717a" fontSize="8" fontFamily="monospace">GEN_OUT</text>
                    </g>
                  </svg>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-400 uppercase">
                  <span>Throughput: 104.2 MB/s</span>
                  <span className="text-brand-neon animate-pulse font-bold">● FEED STABLE</span>
                </div>
              </div>

              {/* Cognitive Telemetry Monitor */}
              <div className="bg-white border border-zinc-200 p-6 rounded-none space-y-4 shadow-sm">
                <h3 className="font-display font-black text-zinc-900 text-sm flex items-center gap-2 pb-2 border-b border-zinc-200 uppercase tracking-widest">
                  <Activity className="w-4 h-4 text-brand-neon" />
                  Cluster Telemetry
                </h3>
                
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-zinc-50 border border-zinc-200 flex justify-between items-center rounded-none shadow-sm">
                    <span className="text-zinc-500">TRANSLATION COMPUTE</span>
                    <span className="text-zinc-800 font-bold">READY (VITE_PROXY)</span>
                  </div>
                  
                  <div className="p-3 bg-zinc-50 border border-zinc-200 space-y-2 rounded-none shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">LOCAL INDEX SIMILARITY</span>
                      <span className="text-brand-neon font-black">100% SYNCD</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-1.5 border border-zinc-200">
                      <div className="bg-brand-neon h-full w-[85%] animate-pulse" />
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-50 border border-zinc-200 space-y-2 rounded-none shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">TENSOR FLOW VOLTAGE</span>
                      <span className="text-zinc-800 font-bold">ACTIVE (COCO_SSD_LITE)</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-1.5 border border-zinc-200">
                      <div className="bg-zinc-400 h-full w-[95%]" />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Telemetry HUD element (Match design HTML footer perfectly) */}
            <div className="mt-16 flex flex-col md:flex-row justify-between items-start md:items-end pt-8 border-t border-zinc-200 gap-6">
              <div className="flex flex-wrap gap-12">
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1 font-mono">Packet Loss</div>
                  <div className="text-lg font-black text-brand-neon font-mono">0.00%</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1 font-mono">Active Nodes</div>
                  <div className="text-lg font-bold text-zinc-800 font-mono">1,402</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1 font-mono">Thread Priority</div>
                  <div className="text-lg font-bold text-zinc-800 italic font-mono">OVERRIDE</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1 font-mono">Port Gateway</div>
                  <div className="text-lg font-bold text-zinc-500 font-mono">3000</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full border border-zinc-200 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-brand-neon rounded-full animate-ping" />
                </div>
                <div className="text-left font-mono">
                  <div className="text-[10px] text-zinc-400 uppercase leading-none">Engine Ready</div>
                  <div className="text-sm font-bold text-zinc-800">AWAITING_INPUT_05</div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: TRANSLATOR */}
        {currentTab === 'translator' && <Translator />}

        {/* TAB 3: FAQ CHATBOT */}
        {currentTab === 'chatbot' && <FaqChatbot />}

        {/* TAB 4: OBJECT TRACKER */}
        {currentTab === 'tracker' && <ObjectTracker />}

      </main>
    </div>
  );
}
