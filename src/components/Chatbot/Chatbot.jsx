import { useState, useRef, useEffect, useCallback } from 'react';
import { useApiKey } from '../../context/ApiKeyContext';
import './Chatbot.css';

const LANG_NAMES = {
  en: 'English',
  hi: 'Hindi',
  bn: 'Bengali',
  ta: 'Tamil',
  te: 'Telugu',
  mr: 'Marathi',
};

const SENTIMENTS = {
  positive: { icon: '😊', label: 'Positive' },
  neutral: { icon: '😐', label: 'Neutral' },
  negative: { icon: '😞', label: 'Negative' },
};

const QUICK_QS = [
  'Wheat price in Punjab?',
  'Yellow spots on paddy leaves',
  'PMKISAN scheme eligibility',
  'Best fertilizer for cotton',
];

const TAGS = [
  '#WheatHarvest',
  '#Monsoon2025',
  '#PMKisan',
  '#OrganicFarm',
  '#MandiPrices',
];

const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest',
];

const STORAGE_KEY = 'farmAI_chatHistory';

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

const WELCOME = {
  role: 'bot',
  text: 'Namaste! 🙏 I am FarmAI — your AI-powered agricultural advisor.',
  time: new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }),
};

async function callGemini(apiKey, prompt, lang, profileCtx, signal) {
  if (!apiKey || apiKey.length < 20) {
    return { text: 'Please add Gemini API Key.' };
  }

  const profileInfo = profileCtx?.name
    ? `Farmer profile: Name=${profileCtx.name}, State=${profileCtx.state}`
    : '';

  const langName = LANG_NAMES[lang] || 'English';

  const systemPrompt = `
You are FarmAI, an expert Indian agricultural advisor.
${profileInfo}

Respond ONLY in ${langName}.

Return JSON:
{
  "reply":"response",
  "sentiment":"positive | neutral | negative"
}

User Question: ${prompt}
`;

  for (const model of MODELS) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: systemPrompt }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 512,
              responseMimeType: 'application/json',
            },
          }),
          signal,
        }
      );

      const data = await r.json();

      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        try {
          const parsed = JSON.parse(text);

          return {
            text: parsed.reply,
            sentiment: parsed.sentiment,
          };
        } catch {
          return {
            text,
            sentiment: 'neutral',
          };
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        return { aborted: true };
      }
    }
  }

  return {
    text: 'Unable to connect with Gemini AI.',
    sentiment: 'neutral',
  };
}

export default function Chatbot() {
  const [language, setLanguage] = useState('en');
  const [msgs, setMsgs] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentiment, setSentiment] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState(loadHistory);

  const scrollRef = useRef(null);
  const abortRef = useRef(null);


  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop =
        scrollRef.current.scrollHeight;
    }
  }, [msgs, loading]);

  const send = useCallback(
    async (q) => {
      if (loading) return;

      const query = (q || input).trim();

      if (!query) return;

      const time = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });

      setMsgs((prev) => [
        ...prev,
        {
          role: 'user',
          text: query,
          time,
        },
      ]);

      setInput('');
      setLoading(true);

      abortRef.current?.abort();

      const controller = new AbortController();
      abortRef.current = controller;

      const res = await callGemini(
        apiKey,
        query,
        language,
        profile,
        controller.signal
      );

      if (res.aborted) {
        setLoading(false);
        return;
      }

      setMsgs((prev) => [
        ...prev,
        {
          role: 'bot',
          text: res.text,
          time: new Date().toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);

      setSentiment(res.sentiment || 'neutral');
      setLoading(false);
    },
  );

  function saveChat() {
    const entry = {
      id: Date.now(),
      msgs,
      date: new Date().toLocaleDateString('en-IN'),
    };

    const updated = [entry, ...history].slice(0, 10);

    setHistory(updated);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );

    addToast?.('Chat saved', 'success');
  }

  function clearChat() {
    setMsgs([WELCOME]);
    setInput('');
    setSentiment(null);
  }

  function loadHistorySession(session) {
    setMsgs(session.msgs);
    setShowHistory(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <section className="chatbot-section">

      <div className="chatbot-wrapper">

        <div className="chatbot-main">

          <div className="chatbot-header">

            <div>
              <h2>FarmAI Assistant</h2>
              <p>Gemini Live · {LANG_NAMES[language]}</p>
            </div>

            <div className="header-actions">

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {Object.entries(LANG_NAMES).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>

              <button onClick={saveChat}>Save</button>

              <button onClick={clearChat}>New</button>

              <button
                onClick={() => setShowHistory(!showHistory)}
              >
                History
              </button>

              <button onClick={() => setShowModal(true)}>
                API Key
              </button>

            </div>

          </div>

          {showHistory && (
            <div className="history-panel">

              {history.map((h) => (
                <div
                  key={h.id}
                  className="history-item"
                  onClick={() => loadHistorySession(h)}
                >
                  <p>{h.date}</p>
                  <span>{h.msgs.length} messages</span>
                </div>
              ))}

            </div>
          )}

          <div className="messages-area" ref={scrollRef}>

            {msgs.map((m, i) => (
              <div
                key={i}
                className={`message-row ${m.role}`}
              >
                <div className={`message-bubble ${m.role}`}>
                  <p>{m.text}</p>
                  <span>{m.time}</span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="typing-loader">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}

          </div>

          <div className="quick-questions">

            {QUICK_QS.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
              >
                {q}
              </button>
            ))}

          </div>

          <div className="input-box">

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask farming question..."
            />

            <button onClick={() => send()}>
              Send
            </button>

          </div>

        </div>

        <div className="sidebar">

          <div className="card">

            <h3>Sentiment</h3>

            {Object.entries(SENTIMENTS).map(([k, v]) => (
              <div
                key={k}
                className={`sentiment-item ${
                  sentiment === k ? 'active' : ''
                }`}
              >
                <span>{v.icon}</span>
                <p>{v.label}</p>
              </div>
            ))}

          </div>

          <div className="card">

            <h3>Trending</h3>

            <div className="tags">

              {TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => send(tag)}
                >
                  {tag}
                </button>
              ))}

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}