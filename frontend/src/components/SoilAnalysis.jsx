import { useState } from 'react';
import { useApiKey } from '../context/ApiKeyContext';
import { useFarmerProfile } from '../context/FarmerProfileContext';

export default function SoilAnalysis() {
  const { apiKey } = useApiKey();
  const { addToast } = useFarmerProfile();
  const [form, setForm] = useState({ n: '', p: '', k: '', ph: '', temp: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState('crops'); // 'crops' | 'fertilizer'

  const set = f => e => setForm(prev => ({ ...prev, [f]: e.target.value }));

  function getSoilHealth() {
    const ph = parseFloat(form.ph);
    const n  = parseFloat(form.n);
    const p  = parseFloat(form.p);
    const k  = parseFloat(form.k);
    const issues = [];
    const tips   = [];

    if (ph < 6.0) { issues.push('Acidic soil (pH < 6)'); tips.push('Apply agricultural lime (CaCO₃) at 2–3 tons/ha to raise pH.'); }
    else if (ph > 7.8) { issues.push('Alkaline soil (pH > 7.8)'); tips.push('Apply gypsum (CaSO₄) or elemental sulphur to lower pH.'); }
    else tips.push('✅ pH is in ideal range (6–7.8) for most crops.');

    if (n < 50) { issues.push('Low Nitrogen'); tips.push('Apply urea (46% N) at 100–150 kg/ha as top dressing.'); }
    else if (n > 150) { issues.push('Excess Nitrogen'); tips.push('Avoid additional N fertilizer; risk of lodging and pest buildup.'); }
    else tips.push('✅ Nitrogen level is adequate.');

    if (p < 20) { issues.push('Phosphorus Deficient'); tips.push('Apply DAP or SSP at sowing. Consider mycorrhizal inoculants for P uptake.'); }
    else tips.push('✅ Phosphorus level is good.');

    if (k < 20) { issues.push('Potassium Deficient'); tips.push('Apply MOP (Muriate of Potash) at 60 kg K₂O/ha before sowing.'); }
    else tips.push('✅ Potassium level is sufficient.');

    return { issues, tips, score: Math.max(0, 100 - issues.length * 20) };
  }

  const analyzeSoil = async () => {
    if (!form.n || !form.p || !form.k || !form.ph || !form.temp) {
      addToast('Please fill in all soil parameters.', 'warning'); return;
    }
    if (!apiKey) { addToast('Please set your Gemini API key first.', 'warning'); return; }
    setLoading(true); setResult(null);
    try {
      const prompt = `You are an expert agronomist. Analyze this soil data: Nitrogen(N)=${form.n}, Phosphorus(P)=${form.p}, Potassium(K)=${form.k}, pH=${form.ph}, Temperature=${form.temp}°C. Based precisely on this data, recommend the top 3 best crops to grow. Return response strictly as a JSON object with a single key 'recommendations' containing an array of objects. Each object should have 'crop' (string), 'yieldPotential' (string like 'High' or 'Medium'), and 'reason' (short string explanation). DO NOT return markdown, just the JSON.`;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json' } })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (jsonText) {
        const soilHealth = getSoilHealth();
        setResult({ recommendations: JSON.parse(jsonText).recommendations, soilHealth });
        addToast('Soil analysis complete! 🧪', 'success');
      } else throw new Error('Analysis failed.');
    } catch (err) {
      addToast('Error: ' + err.message, 'error');
    } finally { setLoading(false); }
  };

  const inputCls = "w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-farm-green outline-none transition text-sm";
  const labelCls = "block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider";

  return (
    <section id="soil" className="py-20 bg-farm-light dark:bg-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-farm-green dark:text-green-400 mb-3">
          🧪 Smart Soil Analysis
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-12 max-w-xl mx-auto">
          Input your soil's NPK values and get AI-driven crop recommendations + fertilizer roadmap.
        </p>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-farm-green/10 dark:border-gray-700 p-5 sm:p-8 flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">

            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">Soil Parameters</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[['n','Nitrogen (N)','90'],['p','Phosphorus (P)','42'],['k','Potassium (K)','43']].map(([field, lbl, ph]) => (
                  <div key={field}>
                    <label className={labelCls}>{lbl}</label>
                    <input type="number" value={form[field]} onChange={set(field)} placeholder={`e.g. ${ph}`} className={inputCls} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>pH Level</label>
                  <input type="number" value={form.ph} onChange={set('ph')} step="0.1" placeholder="e.g. 6.5" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Temp (°C)</label>
                  <input type="number" value={form.temp} onChange={set('temp')} placeholder="e.g. 28" className={inputCls} />
                </div>
              </div>

              {form.ph && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                    <span>Acidic</span><span>Neutral</span><span>Alkaline</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-gradient-to-r from-red-400 via-green-400 to-blue-400 relative">
                    <div className="absolute w-4 h-4 bg-white border-2 border-farm-green rounded-full -top-0.5 transition-all duration-500 shadow-md"
                      style={{ left: `${Math.min(100, Math.max(0, ((parseFloat(form.ph) - 4) / 10) * 100))}%`, transform: 'translateX(-50%)' }} />
                  </div>
                  <p className="text-xs text-center mt-2 font-bold text-gray-600 dark:text-gray-400">
                    pH {form.ph} — {parseFloat(form.ph) < 6 ? '⚠️ Acidic' : parseFloat(form.ph) > 7.8 ? '⚠️ Alkaline' : '✅ Good Range'}
                  </p>
                </div>
              )}

              <button onClick={analyzeSoil} disabled={loading}
                className="w-full bg-gradient-to-r from-farm-green to-farm-green-dark text-white font-bold py-3.5 rounded-xl shadow-green hover:shadow-green-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                {loading ? <><span className="loading-dot bg-white" /> Generating Report...</> : '📊 Get Crop Recommendations'}
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 flex flex-col justify-start min-h-[300px]">
              {!result && !loading && (
                <div className="text-center text-gray-400 dark:text-gray-500 my-auto">
                  <p className="text-5xl mb-3">🌾</p>
                  <p className="font-medium text-sm">Waiting for soil data...</p>
                </div>
              )}
              {loading && (
                <div className="text-center text-farm-green animate-pulse my-auto">
                  <p className="text-4xl mb-3">☁️</p>
                  <p className="font-bold dark:text-green-400">Contacting Agronomy AI...</p>
                </div>
              )}
              {result && !loading && (
                <div className="animate-float-in">
                  
                  <div className="flex gap-2 mb-5">
                    {[['crops','🏆 Crop Picks'],['fertilizer','💊 Soil Tips']].map(([t, l]) => (
                      <button key={t} onClick={() => setTab(t)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${tab===t ? 'bg-farm-green text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-farm-green'}`}>
                        {l}
                      </button>
                    ))}
                  </div>

                  {tab === 'crops' && (
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">🏆 Top Recommended Crops</h3>
                      {result.recommendations.map((item, i) => (
                        <div key={i} className="bg-white dark:bg-gray-900 border-l-4 border-farm-green p-4 rounded-r-xl shadow-sm hover:shadow-md transition">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-black text-lg text-gray-800 dark:text-white">{item.crop}</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.yieldPotential === 'High' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {item.yieldPotential} Yield
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.reason}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {tab === 'fertilizer' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-bold text-gray-800 dark:text-white">🌡️ Soil Health Score</h3>
                        <span className={`text-2xl font-black ${result.soilHealth.score >= 80 ? 'text-green-600' : result.soilHealth.score >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                          {result.soilHealth.score}/100
                        </span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
                        <div className={`h-3 rounded-full transition-all duration-700 ${result.soilHealth.score >= 80 ? 'bg-green-500' : result.soilHealth.score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${result.soilHealth.score}%` }} />
                      </div>
                      {result.soilHealth.issues.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-3 mb-3">
                          <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-1">⚠️ Issues Found:</p>
                          <ul className="space-y-1">{result.soilHealth.issues.map((iss, i) => <li key={i} className="text-xs text-red-700 dark:text-red-300">• {iss}</li>)}</ul>
                        </div>
                      )}
                      <div className="space-y-2">
                        {result.soilHealth.tips.map((tip, i) => (
                          <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 px-4 py-3 rounded-xl text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                            <span className="text-farm-green mt-0.5 flex-shrink-0">→</span> {tip}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
