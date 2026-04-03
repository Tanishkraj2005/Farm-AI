import { usePage } from '../context/PageContext';

const NAV_LINKS = [
  { page: 'home', label: 'Home' },
  { page: 'chatbot', label: 'AI Assistant' },
  { page: 'simulator', label: 'Crop Simulator' },
  { page: 'soil', label: 'Soil Analysis' },
  { page: 'disease', label: 'Disease Scan' },
  { page: 'weather', label: 'Live Weather' },
];

const MORE_LINKS = [
  { page: 'mandi', label: 'Mandi Prices' },
  { page: 'calendar', label: 'Crop Calendar' },
  { page: 'waste', label: 'Waste to Income' },
  { page: 'insurance', label: 'PMFBY Engine' },
  { page: 'news', label: 'Agri News' },
  { page: 'glossary', label: 'Glossary' },
];

const RESOURCES = [
  { label: 'PMFBY Official Site', href: 'https://pmfby.gov.in/' },
  { label: 'Kisan Suvidha App', href: 'https://farmer.gov.in/' },
  { label: 'eNAM Market Portal', href: 'https://www.enam.gov.in/' },
  { label: 'PM Kisan Portal', href: 'https://pmkisan.gov.in/' },
  { label: 'Agmarknet Prices', href: 'https://agmarknet.gov.in/' },
];

const STATS = [
  { value: '6+', label: 'Languages' },
  { value: '12', label: 'AI Tools' },
  { value: '∞', label: 'Queries' },
  { value: '₹0', label: 'Cost' },
];

export default function Footer() {
  const { setActivePage } = usePage();
  function go(page) { setActivePage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-green-950">

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-farm-green/15 rounded-full blur-[120px]" />
        <div className="absolute -bottom-20 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-600/5 rounded-full blur-[120px]" />
        
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      </div>

      <div className="relative z-10 border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-white mb-1">
              Ready to farm smarter?
            </h3>
            <p className="text-white/40 text-sm font-medium">Join thousands of Indian farmers already using FarmAI.</p>
          </div>
          <button onClick={() => go('chatbot')}
            className="flex-shrink-0 flex items-center gap-3 bg-gradient-to-r from-farm-green to-emerald-500 hover:from-farm-green-dark hover:to-emerald-600 text-white font-black px-8 py-4 rounded-full shadow-[0_8px_20px_rgba(34,197,94,0.35)] hover:shadow-[0_8px_30px_rgba(34,197,94,0.5)] transition-all transform hover:-translate-y-0.5 cursor-pointer text-base">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5z" />
            </svg>
            Start for Free
          </button>
        </div>
      </div>

      <div className="relative z-10 border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-farm-green to-emerald-400 mb-1">{s.value}</p>
              <p className="text-white/35 text-xs uppercase tracking-widest font-bold">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/8">

          <div>
            <button onClick={() => go('home')} className="flex items-center gap-3 mb-5 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-farm-green to-emerald-600 flex items-center justify-center shadow-[0_6px_14px_rgba(34,197,94,0.3)] group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
              </div>
              <span className="text-xl font-black tracking-tight text-white group-hover:text-farm-green transition-colors">FarmAI</span>
            </button>
            <p className="text-white/35 text-sm leading-relaxed mb-6 max-w-xs">
              AI-powered precision agriculture platform designed for the modern Indian farmer.
            </p>
            <div className="flex items-center gap-2 text-white/30 text-xs">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              All systems operational
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-farm-green mb-5">Platform</h4>
            <ul className="space-y-3">
              {NAV_LINKS.map(l => (
                <li key={l.page}>
                  <button onClick={() => go(l.page)}
                    className="text-white/40 hover:text-farm-green text-sm transition-colors duration-200 cursor-pointer text-left flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-farm-green transition-colors" />
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-farm-green mb-5">More Tools</h4>
            <ul className="space-y-3">
              {MORE_LINKS.map(l => (
                <li key={l.page}>
                  <button onClick={() => go(l.page)}
                    className="text-white/40 hover:text-farm-green text-sm transition-colors duration-200 cursor-pointer text-left flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-farm-green transition-colors" />
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-farm-green mb-5">Gov. Resources</h4>
            <ul className="space-y-3">
              {RESOURCES.map(r => (
                <li key={r.href}>
                  <a href={r.href} target="_blank" rel="noopener noreferrer"
                    className="text-white/40 hover:text-farm-green text-sm transition-colors duration-200 inline-flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-farm-green transition-colors" />
                    {r.label}
                    <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/20 text-xs">
            © {new Date().getFullYear()} FarmAI &mdash; Digital Agriculture for India 🇮🇳
          </p>
          <p className="text-white/20 text-xs flex items-center gap-1.5">
            Built with ❤️ for Indian Farmers &bull; Powered by Google Gemini
          </p>
        </div>
      </div>
    </footer>
  );
}
