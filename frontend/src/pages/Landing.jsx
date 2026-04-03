import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: "🏪", title: "Live Mandi Prices", desc: "Get real-time market rates directly from Government APMC servers so you always get the best price for your crop." },
  { icon: "🤖", title: "AI Expert Voice Chatbot", desc: "Speak directly to our farming AI. It works offline and speaks your local language perfectly." },
  { icon: "🛡️", title: "Instant PMFBY Claims", desc: "Lost your crop due to rain? Instantly track and generate official insurance claim PDFs." },
  { icon: "♻️", title: "Waste to Income", desc: "Don't burn biomass! Calculate exactly how much extra income you can make by selling farm waste." },
  { icon: "🌿", title: "Crop & Soil Analysis", desc: "Snap a photo of a sick leaf and let the system diagnose the disease and prescribe a cure." },
  { icon: "📅", title: "Smart Crop Calendar", desc: "A personalized calendar that tells you exactly when to sow, irrigate, and harvest based on local weather." }
];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (user) navigate('/dashboard');
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-green-500 selection:text-white">

      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl filter drop-shadow-sm">🌾</span>
            <span className="text-2xl font-black tracking-tight text-gray-900">Farm<span className="text-green-500">AI</span></span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-bold text-gray-600">
             <a href="#features" className="hover:text-green-500 transition-colors">Features</a>
             <a href="#how" className="hover:text-green-500 transition-colors">How it Works</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="hidden sm:block px-5 py-2 text-sm font-bold text-gray-700 hover:text-green-600 transition-colors cursor-pointer">Log In</button>
            <button onClick={() => navigate('/login')} className="px-6 py-3 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 hover:shadow-lg shadow-green-500/30 transform hover:-translate-y-0.5 transition-all cursor-pointer">
              Sign Up Free
            </button>
          </div>
        </div>
      </nav>

      <section className="relative pt-24 pb-16 lg:pt-28 lg:pb-20 overflow-hidden z-10 text-left">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-green-50 rounded-bl-[100px] -z-10 hidden lg:block"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-200/40 rounded-full blur-3xl -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
            
            <div className="lg:w-1/2 text-center lg:text-left pt-6">
              <div className="inline-block px-4 py-2 bg-green-100 text-green-700 font-bold text-sm rounded-full mb-6 border border-green-200">
                ✨ Trusted by 10,000+ Farmers
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.1] mb-6">
                Farm Smarter, <br />
                Not Harder.
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
                Your entire farm in your pocket. Get live mandi prices, spot crop diseases instantly, and chat with an AI expert that speaks your language.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <button onClick={() => navigate('/login')} className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white text-lg font-black rounded-2xl hover:scale-105 transition-transform shadow-xl cursor-pointer">
                  Start Farming Dashboard
                </button>
                <div className="text-sm font-bold text-gray-500 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-lg shadow-sm font-black">✓</span>
                  100% Free Setup
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 relative w-full max-w-lg mx-auto mt-6 lg:mt-0">
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] bg-gray-200">
                
                <img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1000&auto=format&fit=crop" alt="Vibrant Green Agriculture Farm" className="object-cover w-full h-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent"></div>
              </div>

              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-3xl shadow-xl flex items-center gap-4 border border-gray-100 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-2xl">🌱</div>
                <div>
                  <p className="text-xs font-bold text-gray-400">Crop Health</p>
                  <p className="text-lg font-black text-green-500">100% Secure</p>
                </div>
              </div>
              
              <div className="absolute top-10 -right-6 bg-white p-4 rounded-3xl shadow-xl flex items-center gap-4 border border-gray-100 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center text-2xl">📈</div>
                <div>
                  <p className="text-xs font-bold text-gray-400">Market Rate</p>
                  <p className="text-lg font-black text-gray-900">₹2,450/q</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-6">Everything you need to grow perfectly.</h2>
            <p className="text-xl text-gray-500 font-medium">All the tools previously only available to large industrial farms, now in the palm of your hand.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-gray-50 border-2 border-transparent hover:border-green-500 hover:bg-white rounded-[2rem] p-8 transition-all hover:-translate-y-2 hover:shadow-xl group cursor-default">
                <div className="w-16 h-16 bg-white rounded-[1.5rem] shadow-sm flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="py-24 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
             <h2 className="text-4xl font-black text-gray-900 mb-4">How it works</h2>
             <p className="text-lg text-gray-600 font-medium">Get fully set up in under 2 minutes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
               <div className="w-16 h-16 bg-gray-900 text-white font-black text-2xl flex items-center justify-center rounded-3xl mx-auto mb-6">1</div>
               <h3 className="text-xl font-bold mb-3">Create Account</h3>
               <p className="text-gray-500 font-medium">Sign up instantly using Google or your email. No credit card required.</p>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
               <div className="w-16 h-16 bg-gray-900 text-white font-black text-2xl flex items-center justify-center rounded-3xl mx-auto mb-6">2</div>
               <h3 className="text-xl font-bold mb-3">Setup Profile</h3>
               <p className="text-gray-500 font-medium">Select your primary crops and enter your state to calibrate the system.</p>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] border-2 border-green-500 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-bl-full"></div>
               <div className="w-16 h-16 bg-green-500 text-white font-black text-2xl flex items-center justify-center rounded-3xl mx-auto mb-6 shadow-lg shadow-green-500/40 relative z-10">3</div>
               <h3 className="text-xl font-bold mb-3 relative z-10">Start Growing</h3>
               <p className="text-gray-500 font-medium relative z-10">Use the chatbot, check mandi rates, and predict yields immediately.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white text-center">
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-8">Ready to upgrade your farm?</h2>
            <button onClick={() => navigate('/login')} className="px-10 py-5 bg-green-500 text-white text-xl font-black rounded-full hover:bg-green-600 shadow-xl shadow-green-500/30 transform hover:-translate-y-1 transition-all cursor-pointer">
              Get Started for Free Today
            </button>
         </div>
      </section>

      <footer className="py-10 border-t border-gray-100 bg-gray-50 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="font-black text-xl text-gray-900">Farm<span className="text-green-500">AI</span></div>
           <div className="text-gray-500 font-medium text-sm">&copy; {new Date().getFullYear()} FarmAI Platforms. Empowering Agriculture.</div>
        </div>
      </footer>
      
    </div>
  );
}
