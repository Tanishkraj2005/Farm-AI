import { useEffect, useRef } from 'react';
import { usePage } from '../context/PageContext';

const FEATURES = [
  {
    icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5z" /></svg>,
    title: 'AI Assistant', desc: 'Multilingual real-time crop advisory powered by Gemini', page: 'chatbot', from: 'from-blue-400', to: 'to-indigo-600', text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40'
  },
  {
    icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    title: 'Yield Simulator', desc: 'Calculate multi-crop profits with AI precision', page: 'simulator', from: 'from-emerald-400', to: 'to-green-700', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40'
  },
  {
    icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
    title: 'Soil Analysis', desc: 'Smart NPK & pH mapping for perfect crop health', page: 'soil', from: 'from-amber-400', to: 'to-orange-600', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40'
  },
  {
    icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    title: 'Disease Scan', desc: 'Camera-powered AI detection in seconds', page: 'disease', from: 'from-teal-400', to: 'to-teal-700', text: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/40'
  },
  {
    icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>,
    title: 'Live Weather', desc: 'Hyper-local farm alerts and forecast data', page: 'weather', from: 'from-cyan-400', to: 'to-sky-600', text: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/40'
  },
  {
    icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    title: 'Mandi Prices', desc: 'Track live market rates across every district', page: 'mandi', from: 'from-purple-400', to: 'to-fuchsia-600', text: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40'
  },
  {
    icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    title: 'Crop Calendar', desc: 'Smart month-by-month planting planner', page: 'calendar', from: 'from-pink-400', to: 'to-rose-600', text: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-950/40'
  },
  {
    icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    title: 'Waste to Income', desc: 'Transform farm residue into real revenue streams', page: 'waste', from: 'from-lime-400', to: 'to-green-600', text: 'text-lime-600 dark:text-lime-400', bg: 'bg-lime-50 dark:bg-lime-950/40'
  },
  {
    icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    title: 'PMFBY Engine', desc: 'Instant insurance claim PDF generation', page: 'insurance', from: 'from-indigo-400', to: 'to-violet-700', text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/40'
  },
  {
    icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>,
    title: 'Agri News', desc: 'Real-time agriculture news and government schemes', page: 'news', from: 'from-rose-400', to: 'to-red-600', text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40'
  },
  {
    icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    title: 'Glossary', desc: 'A simple searchable farming dictionary', page: 'glossary', from: 'from-yellow-400', to: 'to-amber-600', text: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/40'
  },
  {
    icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    title: 'My Profile', desc: 'Personalize your farm data and settings', page: 'profile', from: 'from-green-400', to: 'to-emerald-700', text: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/40'
  },
];

export default function Hero() {
  const { setActivePage } = usePage();
  const titleRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      titleRef.current?.classList.add('animate-fade-up');
      textRef.current?.classList.add('animate-fade-up-d1');
    }, 100);
  }, []);

  function go(page) { setActivePage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  return (
    <div className="bg-white dark:bg-gray-900 transition-colors duration-500">

      <section className="relative pt-0 pb-16 flex items-center justify-center overflow-hidden">

        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2000&auto=format&fit=crop"
            alt="Beautiful Agricultural Field"
            className="w-full h-full object-cover object-bottom"
          />
          
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-gray-900 dark:via-gray-900/90" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-gray-900" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 pt-8 lg:pt-0">

          <div className="flex-1 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-farm-green/10 dark:bg-green-900/30 text-farm-green dark:text-green-400 font-bold text-xs uppercase tracking-widest mb-6 border border-farm-green/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-farm-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-farm-green"></span>
              </span>
              Next-Gen Agritech
            </div>

            <h1 ref={titleRef} className="text-5xl md:text-7xl lg:text-[5rem] font-extrabold text-gray-900 dark:text-white leading-[1.05] tracking-tight mb-6 opacity-0">
              Farm Smarter,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-farm-green to-emerald-500">
                Harvest Better.
              </span>
            </h1>

            <p ref={textRef} className="text-lg md:text-xl text-gray-600 dark:text-gray-300 font-medium mb-10 max-w-xl opacity-0 leading-relaxed">
              Your intelligent farming companion. Diagnose crop diseases instantly with your camera, get real-time market prices, and chat securely with our advanced agricultural AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-up-d2">
              <button onClick={() => go('chatbot')}
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-farm-green hover:bg-farm-green-dark text-white font-bold px-8 py-4 rounded-full text-base shadow-[0_8px_20px_rgba(34,197,94,0.3)] transition-all transform hover:-translate-y-1 cursor-pointer">
                <span className="text-xl">💬</span> Ask AI Advisor
              </button>
              <button onClick={() => go('disease')}
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold px-8 py-4 rounded-full text-base shadow-lg border border-gray-100 dark:border-gray-700 transition-all transform hover:-translate-y-1 cursor-pointer">
                <span className="text-xl">🌿</span> Scan Crop Disease
              </button>
            </div>
          </div>

          <div className="flex-1 w-full relative h-[400px] lg:h-[600px] hidden md:block">
            
            <div className="absolute top-20 right-10 w-72 bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl p-6 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-white/50 dark:border-white/10 animate-float z-20">
              <div className="flex items-center gap-4 mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-2xl">🌱</div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Crop Health</p>
                  <p className="text-lg font-black text-gray-900 dark:text-white">Optimal</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Nitrogen levels look perfect for your current wheat cycle.</p>
            </div>

            <div className="absolute top-64 right-48 lg:right-56 w-64 bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl p-5 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-white/50 dark:border-white/10 animate-float-delayed z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase">Live Mandi</span>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-2xl">🌾</span>
                  <p className="text-sm font-black text-gray-900 dark:text-white mt-1">Wheat (Avg)</p>
                </div>
                <p className="text-xl font-bold text-farm-green">₹2,275</p>
              </div>
            </div>

            <div className="absolute top-10 right-72 w-20 h-20 bg-yellow-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-20 right-20 w-32 h-32 bg-green-500/20 rounded-full blur-3xl pointer-events-none" />
          </div>

        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900 relative border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 mb-4">Platform Modules</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
              Everything in <span className="text-transparent bg-clip-text bg-gradient-to-r from-farm-green to-emerald-500">one ecosystem.</span>
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              A complete AI-driven farm management suite at your fingertips.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {FEATURES.map((feature) => (
              <button key={feature.page} onClick={() => go(feature.page)}
                className={`group relative flex flex-col p-6 rounded-3xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300 text-left cursor-pointer overflow-hidden transform hover:-translate-y-1.5 hover:shadow-xl ${feature.bg}`}>

                <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.from} ${feature.to} flex items-center justify-center shadow-lg mb-5 transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}>
                  {feature.icon}
                </div>

                <h3 className={`text-base font-extrabold mb-1.5 transition-colors ${feature.text}`}>
                  {feature.title}
                </h3>

                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed flex-1">
                  {feature.desc}
                </p>

                <div className={`mt-5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider ${feature.text} opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300`}>
                  Open <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                </div>
              </button>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
