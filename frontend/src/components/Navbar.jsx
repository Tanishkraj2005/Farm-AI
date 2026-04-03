import { useState, useRef, useEffect } from 'react';
import { useApiKey } from '../context/ApiKeyContext';
import { useFarmerProfile } from '../context/FarmerProfileContext';
import { usePage } from '../context/PageContext';
import { useAuth } from '../context/AuthContext';

const PRIMARY = [
  { id: 'home',      label: 'Home',      icon: '🏠' },
  { id: 'chatbot',   label: 'Chatbot',   icon: '💬' },
  { id: 'simulator', label: 'Simulator', icon: '📈' },
  { id: 'disease',   label: 'Diagnose',  icon: '🌿' },
  { id: 'weather',   label: 'Weather',   icon: '🌦️' },
];

const SECONDARY = [
  { id: 'soil',      label: 'Soil Analysis',     icon: '🧪' },
  { id: 'mandi',     label: 'Mandi Prices',      icon: '🏪' },
  { id: 'news',      label: 'Agri News',         icon: '📰' },
  { id: 'calendar',  label: 'Crop Calendar',     icon: '📅' },
  { id: 'waste',     label: 'Waste to Income',   icon: '♻️' },
  { id: 'insurance', label: 'PMFBY',             icon: '🛡️' },
  { id: 'glossary',  label: 'Agri Glossary',     icon: '📖' },
];

export default function Navbar() {
  const [moreOpen, setMoreOpen]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const { setShowModal }              = useApiKey();
  const { darkMode, setDarkMode, profile } = useFarmerProfile();
  const { activePage, setActivePage } = usePage();
  const { user, logout }              = useAuth();
  const dropdownRef = useRef(null);

  const displayFarmerName = profile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Profile';

  useEffect(() => {
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setMoreOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function nav(id) {
    setActivePage(id);
    setMoreOpen(false);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const isSecondaryActive = SECONDARY.some(p => p.id === activePage);

  return (
    <div className="sticky top-0 z-50 pt-2 pb-1 px-2 sm:px-4 pointer-events-none">
      <nav className="pointer-events-auto max-w-7xl mx-auto bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/40 dark:border-gray-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-full px-4 sm:px-6 transition-all duration-300">
        <div className="flex items-center h-16 gap-2 sm:gap-4">

          <button onClick={() => nav('home')}
            className="flex items-center gap-2 font-black text-2xl tracking-tight flex-shrink-0 cursor-pointer border-none bg-transparent mr-2 sm:mr-4 hover:scale-105 transition-transform duration-300 group">
            <span className="text-3xl filter drop-shadow-md group-hover:rotate-12 transition-transform duration-300">🌾</span>
            <span className="hidden sm:block bg-clip-text text-transparent bg-gradient-to-br from-green-600 to-emerald-400 dark:from-green-400 dark:to-emerald-300 drop-shadow-sm">FarmAI</span>
          </button>

          <div className="hidden lg:flex items-center gap-1 flex-1">
            {PRIMARY.map(p => (
              <button key={p.id} onClick={() => nav(p.id)}
                className={`relative px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer overflow-hidden group ${
                  activePage === p.id
                    ? 'text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:text-farm-green dark:hover:text-green-400'
                }`}>
                
                {activePage === p.id && (
                  <span className="absolute inset-0 bg-gradient-to-r from-farm-green to-emerald-500 rounded-full -z-10 animate-fade-in" />
                )}
                <span className="relative z-10 flex items-center gap-1.5 group-hover:scale-105 transition-transform">
                  <span className="opacity-80 drop-shadow-sm">{p.icon}</span> {p.label}
                </span>
              </button>
            ))}

            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setMoreOpen(!moreOpen)}
                className={`relative px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer overflow-hidden group ${
                  isSecondaryActive
                    ? 'text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:text-farm-green dark:hover:text-green-400'
                }`}>
                {isSecondaryActive && (
                  <span className="absolute inset-0 bg-gradient-to-r from-farm-green to-emerald-500 rounded-full -z-10 animate-fade-in" />
                )}
                <span className="relative z-10 flex items-center gap-1.5 group-hover:scale-105 transition-transform">
                  More
                  <svg className={`w-4 h-4 transition-transform duration-300 ${moreOpen ? '-rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>

              <div className={`absolute top-full left-0 mt-3 w-56 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/50 dark:border-gray-600/50 rounded-3xl shadow-2xl py-3 z-[100] transition-all duration-300 origin-top-left ${
                moreOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
              }`}>
                {SECONDARY.map(p => (
                  <button key={p.id} onClick={() => nav(p.id)}
                    className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm font-bold transition-all cursor-pointer text-left group hover:pl-6 ${
                      activePage === p.id
                        ? 'text-farm-green dark:text-green-400 bg-green-50/50 dark:bg-green-900/20'
                        : 'text-gray-600 dark:text-gray-300 hover:text-farm-green dark:hover:text-green-400'
                    }`}>
                    <span className="text-lg w-7 flex-shrink-0 filter drop-shadow-sm group-hover:scale-110 transition-transform">{p.icon}</span>
                    {p.label}
                    {activePage === p.id && <span className="ml-auto w-1.5 h-1.5 bg-farm-green rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 flex-shrink-0 ml-auto">

            <button onClick={() => setDarkMode(!darkMode)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700 shadow-sm transition-all hover:scale-110 active:scale-95 cursor-pointer border border-gray-200/50 dark:border-gray-600/50">
              {darkMode ? '☀️' : '🌙'}
            </button>

            <button onClick={() => nav('profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer border border-gray-200/50 dark:border-gray-600/50 ${
                activePage === 'profile' 
                  ? 'bg-gradient-to-r from-farm-green to-emerald-500 text-white border-transparent' 
                  : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700'
              }`}>
              <span className="text-base drop-shadow-sm">🧑‍🌾</span>
              <span className="font-bold">{displayFarmerName}</span>
            </button>

            <button onClick={() => setShowModal(true)} title="API Settings"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-farm-green hover:text-white dark:hover:bg-green-500 text-gray-500 dark:text-gray-300 shadow-sm transition-all hover:scale-110 active:scale-95 cursor-pointer border border-gray-200/50 dark:border-gray-600/50">
              <span className="text-base">🔑</span>
            </button>
            
            <button onClick={logout} title="Logout"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50/80 dark:bg-red-900/30 hover:bg-red-500 hover:text-white text-red-500 dark:text-red-400 shadow-sm transition-all hover:scale-110 active:scale-95 cursor-pointer border border-red-200/50 dark:border-red-800/50 mt-0.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>

          <div className="lg:hidden flex items-center gap-2 ml-auto">
            <button onClick={() => nav('profile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all shadow-sm active:scale-95 cursor-pointer border border-gray-200/50 dark:border-gray-600/50 ${
                activePage === 'profile' 
                  ? 'bg-gradient-to-r from-farm-green to-emerald-500 text-white border-transparent' 
                  : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700'
              }`}>
              <span className="text-sm drop-shadow-sm">🧑‍🌾</span>
              <span className="max-w-[60px] truncate">{displayFarmerName}</span>
            </button>
            <button onClick={() => setDarkMode(!darkMode)}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-white/50 dark:bg-gray-800/50 shadow-sm transition-transform hover:scale-110 text-base cursor-pointer">
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-farm-green to-emerald-500 text-white shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer">
              <svg className="w-5 h-5 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <div className={`lg:hidden absolute top-full left-2 right-2 mt-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-700/50 rounded-[2rem] shadow-2xl p-5 transition-all duration-400 origin-top overflow-y-auto max-h-[85vh] custom-scrollbar ${
        mobileOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
      }`}>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4 pl-2">Menu</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
          {[...PRIMARY, ...SECONDARY].map(p => (
            <button key={p.id} onClick={() => nav(p.id)}
              className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-2xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                activePage === p.id
                  ? 'bg-gradient-to-br from-farm-green to-emerald-500 text-white shadow-md'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-farm-green'
              }`}>
              <span className="text-2xl drop-shadow-sm">{p.icon}</span>
              <span className="text-center">{p.label}</span>
            </button>
          ))}
        </div>
        
        <div className="mb-4">
          <button onClick={() => nav('profile')}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 cursor-pointer border border-gray-200/50 dark:border-gray-700/50 ${
                activePage === 'profile' 
                  ? 'bg-gradient-to-r from-farm-green to-emerald-500 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}>
            <span className="text-xl drop-shadow-sm">🧑‍🌾</span>
            <span>My Profile ({displayFarmerName})</span>
          </button>
        </div>

        <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-800 justify-center">
          <button onClick={() => { setShowModal(true); setMobileOpen(false); }}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-xl text-sm font-bold py-3 hover:bg-gray-100 transition cursor-pointer">
            🔑 API Key
          </button>
          <button onClick={logout}
            className="flex-1 flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-100 dark:border-red-800/50 rounded-xl text-sm font-bold py-3 hover:bg-red-100 transition cursor-pointer">
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}
