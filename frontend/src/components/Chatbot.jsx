import { useState, useRef, useEffect, useCallback } from 'react';
import { useApiKey } from '../context/ApiKeyContext';
import { useFarmerProfile } from '../context/FarmerProfileContext';

const LANG_NAMES = {
  en: 'English', hi: 'Hindi', bn: 'Bengali',
  ta: 'Tamil',   te: 'Telugu', mr: 'Marathi',
};

const SENTIMENTS = {
  positive: { icon: '😊', label: 'Positive' },
  neutral:  { icon: '😐', label: 'Neutral' },
  negative: { icon: '😞', label: 'Negative' },
};

const QUICK_QS = [
  'Wheat price in Punjab?',
  'Yellow spots on paddy leaves',
  'PMKISAN scheme eligibility',
  'Best fertilizer for cotton',
];

const TAGS = ['#WheatHarvest', '#Monsoon2025', '#PMKisan', '#OrganicFarm', '#MandiPrices'];

const MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-2.0-flash'];

async function callGemini(apiKey, prompt, lang, profileCtx, signal) {
  if (!apiKey || apiKey.length < 20) {
    return { text: null, noKey: true };
  }

  const profileInfo = profileCtx?.name
    ? `Farmer profile: Name=${profileCtx.name}, State=${profileCtx.state}, Primary Crop=${profileCtx.primaryCrop}, Land=${profileCtx.landSize} ${profileCtx.unit}.`
    : '';

  const langName = LANG_NAMES[lang] || 'English';

  const systemPrompt = `You are FarmAI, an expert Indian agricultural advisor. ${profileInfo}

STRICT RULES:
1. You ONLY answer questions related to farming, agriculture, horticulture, animal husbandry, fisheries, crop diseases, fertilizers, pesticides, irrigation, mandi/market prices, government farming schemes (like PM-KISAN, PMFBY, KCC), weather impact on crops, soil health, and farm machinery.
2. If the user asks ANYTHING that is NOT related to farming or agriculture, politely reply: "I'm FarmAI — I'm here only to help with farming and agriculture topics. Please ask me about crops, diseases, prices, schemes, weather, or any farming advice! 🌾"
3. Respond ONLY in ${langName}.
4. Be concise (max 5 sentences), practical, and use relevant emojis.
5. For price queries, mention they are approximate and advise checking agmarknet.gov.in for live rates.
6. Do NOT answer general knowledge, politics, entertainment, coding, or any non-agricultural topic.
7. You MUST respond strictly in valid JSON format matching this exact schema:
{
  "reply": "Your detailed farming response in the requested language",
  "sentiment": "Analyze the user's tone. strictly output 'positive', 'neutral', or 'negative'"
}

User's Question: ${prompt}`;

  let quotaHit = false;

  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 512, responseMimeType: 'application/json' },
        }),
        signal,
      });

      if (signal?.aborted) return { text: null, aborted: true };

      const d = await r.json();

      if (d.error) {
        const code = d.error.code || 0;
        const msg  = d.error.message || '';
        if (code === 429 || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate')) {
          quotaHit = true;
          continue;
        }
        if (code === 503 || msg.toLowerCase().includes('high demand') || msg.toLowerCase().includes('overloaded')) {
          continue;
        }
        if (code === 403 || code === 401) {
          return { text: '🔑 Your API key is invalid or expired. Please update it by clicking the **🔑 Add API Key** button above.' };
        }

        if (code === 404) {
          continue;
        }
        return { text: `⚠️ API Error: ${msg}` };
      }

      const text = d.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        try {
          const parsed = JSON.parse(text);
          return { text: parsed.reply?.trim() || "I couldn't process this right now.", sentiment: parsed.sentiment?.toLowerCase() };
        } catch (e) {
          return { text: text.trim(), sentiment: 'neutral' };
        }
      }

    } catch (err) {
      if (err.name === 'AbortError') return { text: null, aborted: true };

    }
  }

  if (quotaHit) {
    return { text: '⚠️ Your Gemini API Key has no quota available (Limit 0) or you have hit rate limits. Please check your Google AI Studio billing/plan details or use a different API key. Click the 🔑 button in the header to change your key.' };
  }

  return { text: '⚠️ Unable to reach Gemini AI right now. Please check your internet connection and try again.' };
}

const STORAGE_KEY = 'farmAI_chatHistory';
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

const WELCOME = {
  role: 'bot',
  text: 'Namaste! 🙏 I am FarmAI — your AI-powered agricultural advisor.\n\nAsk me about:\n• 🌾 Crop diseases & remedies\n• 📊 Mandi prices & market rates\n• 🏛️ Government schemes (PM-KISAN, PMFBY, KCC)\n• 💧 Fertilizer, irrigation & soil health advice',
  time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
};

export default function Chatbot() {
  const [language, setLanguage]           = useState('en');
  const { apiKey, saveKey, setShowModal } = useApiKey();
  const { profile, addToast }             = useFarmerProfile();

  const [msgs, setMsgs]               = useState([WELCOME]);
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [sentiment, setSentiment]     = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory]         = useState(loadHistory);
  const [lastLang, setLastLang]       = useState(language);

  const scrollRef  = useRef(null);
  const abortRef   = useRef(null);
  const inputRef   = useRef(null);
  const inputVal   = useRef(input);

  useEffect(() => { inputVal.current = input; }, [input]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [msgs, loading]);

  useEffect(() => {
    if (language !== lastLang && msgs.length > 1) {
      const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      setMsgs(p => [
        ...p,
        {
          role: 'system',
          text: `🌐 Language switched to ${LANG_NAMES[language] || language}. New replies will be in ${LANG_NAMES[language] || language}.`,
          time,
        },
      ]);
    }
    setLastLang(language);
  }, [language]); // eslint-disable-line

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = useCallback(async (q) => {
    if (loading) return;
    const query = (typeof q === 'string' ? q : inputVal.current).trim();
    if (!query) return;

    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setSentiment(null); // Reset whilst loading
    setMsgs(p => [...p, { role: 'user', text: query, time }]);
    setInput('');
    setLoading(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const res = await callGemini(apiKey, query, language, profile, controller.signal);
    if (res.aborted) { setLoading(false); return; }

    const botTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setLoading(false);

    setSentiment(res.sentiment === 'positive' || res.sentiment === 'negative' ? res.sentiment : 'neutral');
    setMsgs(p => [...p, { role: 'bot', text: res.text, time: botTime }]);

    setTimeout(() => inputRef.current?.focus(), 50);
  }, [loading, apiKey, language, profile]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function saveChat() {
    if (msgs.length <= 1) { addToast('Nothing to save yet! Send a message first.', 'info'); return; }
    const entry = {
      id:      Date.now(),
      date:    new Date().toLocaleDateString('en-IN'),
      time:    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      preview: msgs.find(m => m.role === 'user')?.text || 'Chat session',
      msgs:    [...msgs],
    };
    const updated = [entry, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    addToast('Chat saved to history! 💾', 'success');
  }

  function clearChat() {
    abortRef.current?.abort();
    setLoading(false);
    setMsgs([{
      role: 'bot',
      text: 'Namaste! 🙏 New conversation started. Ask me anything about farming!',
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    }]);
    setSentiment(null);
    setInput('');
  }

  function loadHistorySession(session) {
    if (loading) { addToast('Please wait for the current response to finish.', 'info'); return; }
    setMsgs(session.msgs);
    setShowHistory(false);
    addToast('Chat history loaded! 📂', 'info');
  }

  function deleteHistory(id, e) {
    e.stopPropagation();
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    addToast('Chat deleted.', 'info');
  }

  return (
    <section id="chatbot" className="relative py-16 bg-gray-50 dark:bg-gray-950 overflow-hidden">
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-farm-green/8 dark:bg-farm-green/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-300/10 dark:bg-emerald-700/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-farm-green/10 dark:bg-green-900/30 text-farm-green dark:text-green-400 border border-farm-green/20 mb-4">Gemini AI Powered</span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
            Your AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-farm-green to-emerald-500">Farm Advisor</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto text-base">
            Ask about crop diseases, live market prices, government schemes, or anything farming — in your own language.
          </p>
        </div>

        <div className="flex gap-6 items-start">

          <div className="flex-1 min-w-0 flex flex-col rounded-[2rem] overflow-hidden shadow-2xl shadow-green-900/10 dark:shadow-black/40 border border-gray-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-900" style={{ height: 640 }}>

            <div className="bg-gradient-to-r from-farm-green via-emerald-500 to-teal-500 px-4 sm:px-5 py-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-shrink-0">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/></svg>
                </div>
                <div>
                  <p className="text-white font-extrabold text-sm sm:text-base tracking-tight truncate">FarmAI Assistant</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse flex-shrink-0" />
                    <p className="text-white/70 text-[11px] font-medium truncate">Gemini Live · {LANG_NAMES[language]}</p>
                  </div>
                </div>
              </div>
              <div className="w-full sm:w-auto sm:ml-auto flex items-center gap-2 flex-wrap">
                
                <div className="relative">
                  <select value={language} onChange={e => setLanguage(e.target.value)}
                    className="bg-white/15 hover:bg-white/25 text-white text-xs pl-3 pr-6 py-1.5 rounded-full font-bold transition cursor-pointer appearance-none outline-none border border-white/20 shadow-sm backdrop-blur-sm">
                    {Object.entries(LANG_NAMES).map(([val, label]) => (
                      <option key={val} value={val} className="text-gray-800 bg-white">{label}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-white/70">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7"/></svg>
                  </div>
                </div>
                <button onClick={saveChat} title="Save chat" className="bg-white/15 hover:bg-white/25 border border-white/20 text-white text-[11px] px-3 py-1.5 rounded-full font-bold transition cursor-pointer backdrop-blur-sm flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
                  Save
                </button>
                <button onClick={clearChat} title="New chat" className="bg-white/15 hover:bg-white/25 border border-white/20 text-white text-[11px] px-3 py-1.5 rounded-full font-bold transition cursor-pointer backdrop-blur-sm flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                  New
                </button>
                <button onClick={() => setShowHistory(!showHistory)} title="History" className="bg-white/15 hover:bg-white/25 border border-white/20 text-white text-[11px] px-3 py-1.5 rounded-full font-bold transition cursor-pointer backdrop-blur-sm flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  {history.length}
                </button>
                <button onClick={() => setShowModal(true)} title={apiKey ? 'Change API Key' : 'Add API Key'} className="bg-white/10 hover:bg-white/20 border border-white/25 text-white text-[11px] px-3 py-1.5 rounded-full transition cursor-pointer font-bold backdrop-blur-sm flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                  {apiKey ? 'Key' : 'Add Key'}
                </button>
              </div>
            </div>

            {showHistory && (
              <div className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700 px-5 py-4 max-h-48 overflow-y-auto flex-shrink-0">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Saved Conversations</p>
                {history.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-3">No saved chats yet. Click Save to save this conversation.</p>
                ) : (
                  <div className="space-y-2">
                    {history.map(h => (
                      <div key={h.id} onClick={() => loadHistorySession(h)}
                        className="flex items-center justify-between bg-white dark:bg-gray-700 hover:bg-farm-green/5 dark:hover:bg-gray-600 px-4 py-3 rounded-2xl cursor-pointer transition group border border-gray-100 dark:border-gray-600">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">{h.preview}</p>
                          <p className="text-[10px] text-gray-400">{h.date} · {h.msgs.length} messages</p>
                        </div>
                        <button onClick={(e) => deleteHistory(h.id, e)} className="ml-3 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition cursor-pointer">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pt-6 pb-3 space-y-5 bg-gray-50/50 dark:bg-gray-900/50">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : m.role === 'system' ? 'justify-center' : 'justify-start'} items-end gap-3`}>

                  {m.role === 'bot' && (
                    <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-farm-green to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-green-400/20">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/></svg>
                    </div>
                  )}

                  {m.role === 'system' && (
                    <span className="text-[11px] text-gray-400 italic bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-1.5 border border-gray-200 dark:border-gray-700">{m.text}</span>
                  )}

                  {m.role !== 'system' && (
                    <div className={m.role === 'user' ? 'flex flex-col items-end max-w-[75%]' : 'flex flex-col items-start max-w-[75%]'}>
                      <div className={
                        m.role === 'bot'
                          ? 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 px-5 py-3.5 rounded-3xl rounded-bl-lg shadow-sm'
                          : 'bg-gradient-to-br from-farm-green to-emerald-600 text-white px-5 py-3.5 rounded-3xl rounded-br-lg shadow-md shadow-green-400/20'
                      }>
                        {m.role === 'bot' && (
                          <span className="block text-[10px] font-bold text-farm-green dark:text-green-400 mb-1.5 uppercase tracking-widest">FarmAI</span>
                        )}
                        <p className="whitespace-pre-line leading-relaxed text-sm">{m.text}</p>
                      </div>
                      {m.time && (
                        <p className={`text-[10px] text-gray-400 mt-1 ${m.role === 'user' ? 'text-right' : ''}`}>{m.time}</p>
                      )}
                    </div>
                  )}

                  {m.role === 'user' && (
                    <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center flex-shrink-0 shadow-md">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-end gap-3">
                  <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-farm-green to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-green-400/20">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/></svg>
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-5 py-4 rounded-3xl rounded-bl-lg shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-farm-green animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-farm-green animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-farm-green animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-2.5 flex flex-wrap gap-2 flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
              {QUICK_QS.map(q => (
                <button key={q} onClick={() => send(q)} disabled={loading}
                  className="bg-gray-50 dark:bg-gray-800 hover:bg-farm-green/10 dark:hover:bg-green-900/20 text-gray-600 dark:text-gray-300 hover:text-farm-green border border-gray-200 dark:border-gray-700 hover:border-farm-green/30 rounded-full px-3 py-1.5 text-xs font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                  {q}
                </button>
              ))}
            </div>

            <div className="px-5 py-4 bg-white dark:bg-gray-900 flex-shrink-0">
              <div className="flex gap-3 items-center bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 focus-within:border-farm-green dark:focus-within:border-green-500 focus-within:shadow-[0_0_0_4px_rgba(34,197,94,0.1)] transition-all px-4 py-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  placeholder={loading ? 'FarmAI is responding…' : 'Ask about crops, diseases, prices, schemes…'}
                  className="flex-1 bg-transparent text-sm text-gray-800 dark:text-white placeholder-gray-400 outline-none disabled:opacity-60 py-1"
                />
                <button
                  onClick={() => send()}
                  disabled={loading || !input.trim()}
                  className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl bg-gradient-to-br from-farm-green to-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-green-400/30 hover:shadow-green-400/50 hover:scale-105 transition-all disabled:opacity-40 disabled:scale-100 cursor-pointer disabled:cursor-not-allowed ml-1">
                  <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                </button>
              </div>
            </div>
          </div>

          <div className="w-60 flex-shrink-0 hidden lg:flex flex-col gap-4">

            <div className="rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
              <div className="bg-gradient-to-r from-farm-green to-emerald-500 px-5 py-4">
                <p className="text-white font-extrabold text-sm tracking-tight">Sentiment AI</p>
                <p className="text-white/60 text-[11px]">Analyzing your tone</p>
              </div>
              <div className="p-4 space-y-3">
                {Object.entries(SENTIMENTS).map(([k, v]) => (
                  <div key={k} className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${sentiment === k ? 'bg-farm-green/10 dark:bg-green-900/20 border border-farm-green/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                    <span className="text-xl">{v.icon}</span>
                    <span className={`text-sm font-bold flex-1 ${sentiment === k ? 'text-farm-green dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>{v.label}</span>
                    {sentiment === k && <span className="w-2.5 h-2.5 bg-farm-green rounded-full shadow-[0_0_0_3px_rgba(34,197,94,0.2)]" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-5">
              <p className="text-sm font-extrabold text-gray-800 dark:text-white mb-3">🔥 Trending</p>
              <div className="flex flex-wrap gap-2">
                {TAGS.map(tag => (
                  <button key={tag} onClick={() => send(tag.replace('#', '') + ' farming advice')} disabled={loading}
                    className="bg-gray-50 dark:bg-gray-800 hover:bg-farm-green/10 dark:hover:bg-green-900/20 border border-gray-200 dark:border-gray-700 hover:border-farm-green/30 text-gray-600 dark:text-gray-300 hover:text-farm-green dark:hover:text-green-400 text-[11px] px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer disabled:opacity-40">
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-5">
              <p className="text-sm font-extrabold text-gray-800 dark:text-white mb-4">📊 Session</p>
              <div className="space-y-3">
                {[
                  { label: 'Messages', value: msgs.filter(m => m.role !== 'system').length },
                  { label: 'Saved', value: `${history.length}/10` },
                  { label: 'Language', value: LANG_NAMES[language] },
                  { label: 'Model', value: 'Gemini' },
                ].map(s => (
                  <div key={s.label} className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{s.label}</span>
                    <span className="text-xs font-extrabold text-farm-green dark:text-green-400">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-5">
              <p className="text-sm font-extrabold text-amber-700 dark:text-amber-400 mb-2">📞 Kisan Helpline</p>
              <p className="text-xs text-amber-600 dark:text-amber-500 leading-relaxed">
                Toll-free: <strong className="text-amber-700 dark:text-amber-400">1800-180-1551</strong><br />
                Mon–Sat, 6AM–10PM
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

