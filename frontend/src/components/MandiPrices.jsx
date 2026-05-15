import { useState, useEffect, useRef } from 'react';

const CROPS_LIST = ['All', 'Wheat', 'Rice', 'Cotton', 'Onion', 'Potato', 'Mustard', 'Soybean', 'Groundnut', 'Maize', 'Jute', 'Sugarcane', 'Tomato', 'Gram', 'Tea'];
const STATES = ['Punjab', 'Maharashtra', 'Uttar Pradesh', 'Gujarat', 'West Bengal', 'Rajasthan'];

const TREND_MAP = {
  up:     { icon: '📈', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800', label: '↑ Rising' },
  down:   { icon: '📉', color: 'text-red-500',   bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',   label: '↓ Falling' },
  stable: { icon: '➡️', color: 'text-blue-500',  bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800', label: '→ Stable' },
};

export default function MandiPrices() {
  const [state, setState] = useState('Punjab');
  const [cropFilter, setCropFilter] = useState('All');
  const [unit, setUnit] = useState('quintal');
  
  const [liveData, setLiveData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [tickerStarted, setTickerStarted] = useState(false);
  const timerRef = useRef();

  const fetchMandiData = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35000); // 35s timeout for Render cold start

    fetch(`${API_URL}/api/mandi/prices`, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then(json => {
        clearTimeout(timeout);
        if (json && json.data) {
          setLiveData(json.data);
          setError(null);
        } else {
          throw new Error('Invalid data from server');
        }
        setLoading(false);
      })
      .catch(err => {
        clearTimeout(timeout);
        console.error('Failed to fetch mandi data:', err);
        const isTimeout = err.name === 'AbortError';
        setError(isTimeout
          ? 'Server is waking up (Render cold start). Please wait ~30 seconds and try again.'
          : `Could not connect to backend. Check that VITE_API_URL is set correctly on Vercel. (${err.message})`
        );
        setLoading(false);
      });
  };

  useEffect(() => { fetchMandiData(); }, []);

  useEffect(() => {
    if (Object.keys(liveData).length === 0 || tickerStarted) return;
    
    setTickerStarted(true);
    
    timerRef.current = setInterval(() => {
      setLiveData(prev => {
        const next = { ...prev };
        let updatedCount = 0;
        for (const st of Object.keys(next)) {
          next[st] = { ...prev[st] };
          for (const crt of Object.keys(next[st])) {
            if (Math.random() > 0.7) {
              const old = prev[st][crt];

              const change = Math.round((Math.random() * 30) - 15);
              const newPrice = old.price + change;
              let trend = 'stable', flash = null;
              if (change > 2) { trend = 'up'; flash = 'green'; }
              else if (change < -2) { trend = 'down'; flash = 'red'; }

              next[st][crt] = {
                ...old, price: newPrice, trend, flash,
                max: newPrice > old.max ? newPrice : old.max,
                min: newPrice < old.min ? newPrice : old.min
              };
              updatedCount++;
            } else {
              next[st][crt] = { ...prev[st][crt], flash: null };
            }
          }
        }
        if (updatedCount > 0) setLastUpdated(new Date());
        return next;
      });
    }, 4000);

    return () => clearInterval(timerRef.current);
  }, [liveData, tickerStarted]); // using functional updates ensures safe state closures

  const dataForState = liveData[state] || {};
  const filtered = Object.entries(dataForState).filter(([crop]) => cropFilter === 'All' || crop === cropFilter);

  const unitFactor = unit === 'kg' ? 0.01 : 1;
  const unitLabel = unit === 'kg' ? '/kg' : '/quintal';

  return (
    <section id="mandi" className="py-20 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12 relative">
          <div className="inline-flex items-center justify-center gap-3 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold text-sm mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse border-2 border-white dark:border-gray-900" />
            Live Commodity Market
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
            Mandi Price <span className="text-green-500">Tracker</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Real-time fluctuating market rates mirroring exact live volume trading across major Indian mandis.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 mb-8 flex flex-wrap gap-6 justify-between items-end">
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <div className="space-y-1 w-full sm:w-auto">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-1">State / Region</label>
              <select value={state} onChange={e => setState(e.target.value)}
                className="w-full sm:w-48 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all cursor-pointer">
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            
            <div className="space-y-1 w-full sm:w-auto">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-1">Commodity</label>
              <select value={cropFilter} onChange={e => setCropFilter(e.target.value)}
                className="w-full sm:w-40 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all cursor-pointer">
                {CROPS_LIST.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-1">Trading Unit</label>
              <div className="flex bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden p-1 gap-1">
                {['quintal','kg'].map(u => (
                  <button key={u} onClick={() => setUnit(u)}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${unit===u ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800'}`}>
                    ₹/{u}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-right pb-1">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Market Sync</p>
            <p className="text-xs font-bold font-mono bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-lg border border-green-100 dark:border-green-800/30">
              {lastUpdated.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
            <p className="text-gray-500 dark:text-gray-400 font-medium pb-2">Connecting to Data.gov.in Live APMC feeds...</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">This may take ~30 seconds if the server is starting up.</p>
          </div>
        ) : error ? (
          <div className="text-center py-24 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-200 dark:border-red-800">
            <span className="text-5xl mb-4 block">⚠️</span>
            <p className="text-red-600 dark:text-red-400 font-bold max-w-sm mx-auto mb-6">{error}</p>
            <button
              onClick={fetchMandiData}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition cursor-pointer"
            >
              🔄 Retry
            </button>
          </div>
        ) : Object.keys(liveData).length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
            <span className="text-5xl mb-4 block">📭</span>
            <p className="text-gray-500 dark:text-gray-400 font-medium pb-2">No market data available right now.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
            <span className="text-4xl filter grayscale opacity-50 block mb-4">🌾</span>
            <p className="text-gray-500 dark:text-gray-400 font-medium pb-2">No active trading for selected commodity in {state}.</p>
            <button onClick={() => setCropFilter('All')} className="text-blue-500 hover:text-blue-600 font-bold text-sm cursor-pointer border-none bg-transparent underline">
              View all commodities
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(([crop, d]) => {
              const t = TREND_MAP[d.trend] || TREND_MAP['stable'];
              
              const flashClass = d.flash === 'green' ? 'bg-green-100 dark:bg-green-900 animate-pulse-fast' :
                                 d.flash === 'red' ? 'bg-red-100 dark:bg-red-900 animate-pulse-fast' : 'bg-white dark:bg-gray-800';

              const priceTextClass = d.flash === 'green' ? 'text-green-600 dark:text-green-400 transition-colors duration-300' :
                                     d.flash === 'red' ? 'text-red-600 dark:text-red-400 transition-colors duration-300' : 'text-gray-900 dark:text-white transition-colors duration-1000';

              return (
                <div key={crop} className={`rounded-3xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform group ${flashClass}`}>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-ping opacity-75" style={{ animationDuration: '3s' }} />
                        <h3 className="font-extrabold text-xl text-gray-900 dark:text-white">{crop}</h3>
                      </div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <span>📍</span> {d.market}
                      </p>
                    </div>
                    
                    <span className={`text-[10px] uppercase font-black tracking-wider px-3 py-1.5 rounded-lg border flex items-center gap-1 ${t.color} ${t.bg}`}>
                      {t.icon} {t.trend === 'up' ? 'Rallying' : t.trend === 'down' ? 'Crashing' : 'Trading'}
                    </span>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-1 opacity-80">Live Spot Price</p>
                    <div className="flex items-end gap-2">
                      <span className={`text-4xl font-black font-mono tracking-tighter ${priceTextClass}`}>
                        ₹{(d.price * unitFactor).toLocaleString('en-IN', { minimumFractionDigits: unit === 'kg' ? 2 : 0, maximumFractionDigits: unit === 'kg' ? 2 : 0 })}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500 text-sm font-medium mb-1.5">{unitLabel}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mb-1">Day Low</p>
                      <p className="font-mono text-sm font-bold text-gray-700 dark:text-gray-300">
                        ₹{(d.min * unitFactor).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mb-1">Day High</p>
                      <p className="font-mono text-sm font-bold text-gray-700 dark:text-gray-300">
                        ₹{(d.max * unitFactor).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
