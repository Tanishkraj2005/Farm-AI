import { useState, useEffect } from 'react';

export default function AgriNews() {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [expanded, setExpanded] = useState(null);

  const fetchNews = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35000); // 35s for Render cold start

    fetch(`${API_URL}/api/news`, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then(json => {
        clearTimeout(timeout);
        if (json.success) {
          setNewsData(json.data);
        } else {
          throw new Error('Invalid backend response');
        }
        setLoading(false);
      })
      .catch(err => {
        clearTimeout(timeout);
        console.error('Failed to fetch live news:', err);
        const isTimeout = err.name === 'AbortError';
        setError(isTimeout
          ? 'Server is waking up (Render cold start). Please wait ~30 seconds and click Retry.'
          : 'Unable to stream live news. Make sure VITE_API_URL is set on Vercel and backend is running on Render.'
        );
        setLoading(false);
      });
  };

  useEffect(() => { fetchNews(); }, []);

  const formatDateString = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch(e) {
      return dateStr;
    }
  };

  return (
    <section id="news" className="py-24 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 min-h-screen relative overflow-hidden">

      <div className="absolute top-20 right-10 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-teal-500/10 dark:bg-teal-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-16 relative">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold text-sm mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            Live National RSS Feed
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
            Agri <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-500">News & Updates</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Stay up to date with real-time agricultural policies, market dynamics, and technological advancements sourced directly from news networks across India.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-gray-800/30 backdrop-blur border border-white/60 dark:border-gray-700/50 rounded-3xl">
             <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6 mx-auto" />
             <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Connecting to RSS Feeds...</h3>
             <p className="text-gray-500">Pooling live agriculture articles.</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-red-50/50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/30 rounded-3xl">
            <span className="text-5xl mb-4 block">⚠️</span>
            <p className="text-red-600 dark:text-red-400 font-bold max-w-sm mx-auto mb-6">{error}</p>
            <button
              onClick={fetchNews}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition cursor-pointer"
            >
              🔄 Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsData.map((news) => (
              <a key={news.id} href={news.link} target="_blank" rel="noopener noreferrer" className="group block h-full">
                <div className="h-full flex flex-col bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 shadow-sm hover:shadow-[0_20px_40px_rgb(59,130,246,0.1)] transition-all duration-300 transform hover:-translate-y-1">

                  <div className="flex items-center justify-between gap-3 mb-5">
                    <span className={`text-[10px] uppercase font-black px-3 py-1.5 rounded-lg tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-100 dark:border-blue-800 line-clamp-1`}>
                      {news.category}
                    </span>
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {formatDateString(news.date)}
                    </span>
                  </div>

                  <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white leading-snug mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {news.title}
                  </h3>

                  <div className="flex-grow">
                    <p className={`text-sm text-gray-600 dark:text-gray-400 leading-relaxed ${expanded === news.id ? '' : 'line-clamp-3'}`}>
                      {news.summary}
                    </p>
                  </div>

                  <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-teal-400 to-blue-500 flex items-center justify-center shadow-sm">
                         <span className="text-[10px] text-white">📡</span>
                       </div>
                       <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{news.source}</span>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </span>
                  </div>

                </div>
              </a>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
