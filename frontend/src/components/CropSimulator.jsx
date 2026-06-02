import { useState, useRef, useEffect, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useFarmerProfile } from '../context/FarmerProfileContext';
import { useApiKey } from '../context/ApiKeyContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement);

const CROPS = {
  Wheat: { cost: 25000, yieldPerAcre: 20, icon: '🌾', duration: '120 days', water: 'Moderate', fallbackPrice: 2275 },
  Rice: { cost: 30000, yieldPerAcre: 22, icon: '🍚', duration: '140 days', water: 'High', fallbackPrice: 2183 },
  Cotton: { cost: 30000, yieldPerAcre: 8, icon: '🌿', duration: '160 days', water: 'Low-Mod', fallbackPrice: 7000 },
  Sugarcane: { cost: 40000, yieldPerAcre: 300, icon: '🎋', duration: '300 days', water: 'High', fallbackPrice: 300 },
  Maize: { cost: 22000, yieldPerAcre: 20, icon: '🌽', duration: '100 days', water: 'Low', fallbackPrice: 1900 },
  Mustard: { cost: 18000, yieldPerAcre: 8, icon: '🌼', duration: '110 days', water: 'Low', fallbackPrice: 5200 },
  Gram: { cost: 20000, yieldPerAcre: 7, icon: '🫘', duration: '120 days', water: 'Low', fallbackPrice: 5400 },
  Soybean: { cost: 24000, yieldPerAcre: 10, icon: '🌱', duration: '110 days', water: 'Moderate', fallbackPrice: 4400 },
  Potato: { cost: 45000, yieldPerAcre: 80, icon: '🥔', duration: '100 days', water: 'Moderate', fallbackPrice: 1000 },
  Tomato: { cost: 50000, yieldPerAcre: 80, icon: '🍅', duration: '120 days', water: 'High', fallbackPrice: 1200 },
};

const WEATHER = [
  { value: 'Optimal', label: 'Optimal Conditions', factor: 1.0, risk: 'Low', icon: '🌤️' },
  { value: 'Hot',     label: 'Hot / Dry Summer',   factor: 0.72, risk: 'High', icon: '🌡️' },
  { value: 'Cold',    label: 'Cold / Frost',        factor: 0.80, risk: 'Medium', icon: '❄️' },
];

const MARKETS = [
  { value: 'Stable', label: 'Stable (Historical)', factor: 1.0, icon: '📊' },
  { value: 'Volatile', label: 'Volatile (Market)', factor: 0.85, icon: '📉' },
  { value: 'MSP', label: 'Govt. MSP Secured', factor: 1.15, icon: '🏛️' },
];

const IRRIGATION = [
  { value: 'Flood', label: 'Flood/Surface', costMulti: 1.0, revMulti: 1.0, icon: '🌊' },
  { value: 'Sprinkler', label: 'Sprinkler System', costMulti: 1.1, revMulti: 1.1, icon: '🚿' },
  { value: 'Drip', label: 'Drip Irrigation', costMulti: 1.2, revMulti: 1.25, icon: '💧' },
];

export default function CropSimulator() {
  const { addToast } = useFarmerProfile();
  const { apiKey } = useApiKey();

  const [aiMetrics, setAiMetrics] = useState({});
  const [aiLoading, setAiLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('single');
  const [landArea, setLandArea] = useState(1);
  const [landUnit, setLandUnit] = useState('Acre');
  const [selectedCrops, setSelectedCrops] = useState(['Wheat']);

  const [weather, setWx] = useState('Optimal');
  const [market, setMkt] = useState('Stable');
  const [irrigation, setIrrig] = useState('Drip');

  const [result, setResult] = useState(null);
  const [exporting, setExporting] = useState(false);

  const [livePrices, setLivePrices] = useState(null);

  const reportRef = useRef(null);

  const loadPreset = (c) => {
    setSelectedCrops([c]);
    setActiveTab('single');
  };

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    fetch(`${API_URL}/api/mandi/prices`)
      .then(r => r.json())
      .then(json => {
        if (json && json.data) {

          const stateKeys = Object.keys(json.data);
          if (stateKeys.length > 0) {
            setLivePrices(json.data[stateKeys[0]]);
          }
        }
      })
      .catch(e => console.log('CropSim Live API skipped. Using fallback array.'));
  }, []);

  function calculateCropData(cropName) {
    const base = aiMetrics[cropName] || CROPS[cropName];
    if (!base) return null;

    const wx = WEATHER.find(w => w.value === weather);
    const mk = MARKETS.find(m => m.value === market);
    const ir = IRRIGATION.find(i => i.value === irrigation);

    const multiplier = landUnit === 'Acre' ? landArea : landArea * 2.471;

    const spotPricePerQuintal = livePrices && livePrices[cropName] && livePrices[cropName].price
      ? livePrices[cropName].price
      : base.fallbackPrice;

    const liveRevenuePerAcre = spotPricePerQuintal * base.yieldPerAcre;

    const totalCost = base.cost * multiplier * ir.costMulti;
    const totalRev = liveRevenuePerAcre * multiplier * wx.factor * mk.factor * ir.revMulti;
    const profit = totalRev - totalCost;
    const roi = ((profit) / totalCost) * 100;

    return {
      name: cropName,
      icon: base.icon,
      duration: base.duration,
      water: base.water,
      cost: totalCost,
      revenue: totalRev,
      profit: profit,
      spotPrice: spotPricePerQuintal,
      isLive: !!(livePrices && livePrices[cropName]),
      isAiAdjusted: !!base.isAiAdjusted,
      roi: Math.round(roi)
    };
  }

  function simulate(showToast = false) {
    if (activeTab === 'single') {
      const data = calculateCropData(selectedCrops[0]);
      setResult({ type: 'single', current: data });
      if (showToast) addToast(`Simulation updated with ${data.isLive ? 'LIVE' : 'Historical'} Market Rates`, 'success');
    } else {
      const dataSet = selectedCrops.filter(Boolean).map(calculateCropData);
      setResult({ type: 'compare', list: dataSet });
      if (showToast) addToast(`Comparison generated`, 'success');
    }
  }

  useEffect(() => {
    if (result) simulate(false);

  }, [weather, market, irrigation, landArea, landUnit, selectedCrops, activeTab, livePrices, aiMetrics]);

  const autoCalibrate = async () => {
    if (!apiKey) { addToast('Please set your AI API key first in your profile to use AI Calibration.', 'warning'); return; }
    if (selectedCrops.length === 0) return;
    setAiLoading(true);
    try {
      const prompt = `You are an expert Indian agri-economist. Provide the current estimated realistic 'cost' (in INR per Acre) and 'yieldPerAcre' (in quintals) for the following crops: ${selectedCrops.join(', ')}. Assume standard modern farming practices. Return strictly a JSON object where keys are the crop names exactly as passed, and values are objects with 'cost' (number) and 'yieldPerAcre' (number). Output ONLY JSON.`;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json' } })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      let jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (jsonText) {
        jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '');
        const parsed = JSON.parse(jsonText);
        
        const merged = { ...aiMetrics };
        let updated = false;
        selectedCrops.forEach(c => {
           if (parsed[c]) {
             merged[c] = { ...CROPS[c], cost: parsed[c].cost, yieldPerAcre: parsed[c].yieldPerAcre, isAiAdjusted: true };
             updated = true;
           }
        });
        if(updated) {
           setAiMetrics(merged);
           addToast('AI dynamically calibrated local costs & yields! 📈', 'success');
        } else {
           addToast('AI returned invalid crop properties.', 'warning');
        }
      }
    } catch(err) {
      addToast('AI Calibration failed: ' + err.message, 'error');
    }
    setAiLoading(false);
  };

  async function handleExport() {
    if (!result || !reportRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: '#f8fafc' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();

      pdf.setFillColor(34, 197, 94); // farm-green equivalent
      pdf.rect(0, 0, w, 24, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.text('FarmAI Advanced Simulation Report', w / 2, 14, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text(`Generated: ${new Date().toLocaleString()} | Weather: ${weather} | Market: ${market} | Irrigation: ${irrigation}`, w / 2, 21, { align: 'center' });

      pdf.addImage(imgData, 'PNG', 10, 30, w - 20, (h - 40) > ((w - 20) * canvas.height / canvas.width) ? ((w - 20) * canvas.height / canvas.width) : (h - 40));

      pdf.save(`FarmAI_Report_${Date.now()}.pdf`);
      addToast('Pro PDF report saved!', 'success');
    } catch (e) {
      addToast('Export failed. Please try again.', 'error');
    }
    setExporting(false);
  }

  const toggleCropForCompare = (cropName) => {
    if (selectedCrops.includes(cropName)) {
      if (selectedCrops.length > 1) {
        setSelectedCrops(prev => prev.filter(c => c !== cropName));
      }
    } else {
      if (selectedCrops.length < 4) {
        setSelectedCrops(prev => [...prev, cropName]);
      } else {
        addToast('Maximum 4 crops can be compared at once', 'info');
      }
    }
  };

  const chartData = useMemo(() => {
    if (!result) return null;
    const items = result.type === 'single' ? [result.current] : result.list;
    return {
      labels: items.map(i => `${i.icon} ${i.name}`),
      datasets: [
        {
          label: 'Total Cost (₹)',
          data: items.map(i => Math.round(i.cost)),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderRadius: 8,
          barPercentage: 0.6,
        },
        {
          label: 'Estimated Revenue (₹)',
          data: items.map(i => Math.round(i.revenue)),
          backgroundColor: 'rgba(52, 211, 153, 0.9)',
          borderRadius: 8,
          barPercentage: 0.6,
        },
        {
          label: 'Net Profit (₹)',
          data: items.map(i => Math.round(i.profit)),
          backgroundColor: items.map(i => i.profit >= 0 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(107, 114, 128, 0.8)'),
          borderColor: items.map(i => i.profit >= 0 ? '#2563eb' : '#4b5563'),
          borderWidth: 1,
          borderRadius: 8,
          barPercentage: 0.6,
        }
      ]
    };
  }, [result]);

  return (
    <section id="simulation" className="py-24 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 min-h-screen relative overflow-hidden">
      
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-400/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-lighten pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex items-center gap-2 justify-center mb-4">
            <span className="py-1.5 px-4 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 font-bold rounded-full text-xs uppercase tracking-widest">Pro Tool</span>
            {livePrices && <span className="py-1.5 px-4 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-bold rounded-full text-xs flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> LIVE DATA SYNCED</span>}
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            Advanced Crop Simulator
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Model your farming financials with industry-grade precision. Adjust land, weather, and market parameters to forecast ROI and make data-driven decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/40 dark:border-gray-700 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-farm-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                Simulation Setup
              </h3>

              <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl mb-6">
                <button onClick={() => { setActiveTab('single'); setSelectedCrops([selectedCrops[0] || 'Wheat']); }}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'single' ? 'bg-white dark:bg-gray-700 shadow text-farm-green dark:text-green-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>Single Crop</button>
                <button onClick={() => setActiveTab('compare')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'compare' ? 'bg-white dark:bg-gray-700 shadow text-farm-green dark:text-green-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>Compare (Pro)</button>
              </div>

              <div className="mb-6">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Land Area</label>
                <div className="flex bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 focus-within:ring-2 ring-farm-green transition-all">
                  <input type="number" min="0.1" step="0.1" value={landArea} onChange={(e) => setLandArea(Number(e.target.value) || 0)}
                    className="flex-1 bg-transparent px-4 py-3 text-gray-900 dark:text-white font-bold outline-none" />
                  <select value={landUnit} onChange={e => setLandUnit(e.target.value)}
                    className="bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 outline-none cursor-pointer">
                    <option value="Acre">Acres</option>
                    <option value="Hectare">Hectares</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Target Crop(s)</label>
                  {activeTab === 'compare' && <span className="text-xs font-bold text-farm-green bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded">{selectedCrops.length}/4 selected</span>}
                </div>

                {activeTab === 'single' ? (
                  <div className="grid grid-cols-2 gap-2 h-48 overflow-y-auto custom-scrollbar pr-1">
                    {Object.entries(CROPS).map(([k, v]) => (
                      <button key={k} onClick={() => setSelectedCrops([k])}
                        className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer group ${
                          selectedCrops[0] === k 
                            ? 'bg-gradient-to-br from-farm-green to-emerald-600 text-white border-transparent shadow-lg scale-[1.02]' 
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-farm-green/50 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${selectedCrops[0] === k ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-900 group-hover:bg-white dark:group-hover:bg-gray-800'}`}>
                          {v.icon}
                        </div>
                        <span className="truncate">{k}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 h-48 overflow-y-auto custom-scrollbar">
                    {Object.entries(CROPS).map(([cropName, data]) => {
                      const isSelected = selectedCrops.includes(cropName);
                      return (
                        <button key={cropName} onClick={() => toggleCropForCompare(cropName)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold border transition-all cursor-pointer ${isSelected
                              ? 'bg-farm-green text-white border-farm-green shadow-md scale-105'
                              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-farm-green/50 hover:bg-green-50 dark:hover:bg-green-900/20'
                            }`}>
                          <span>{data.icon}</span> <span>{cropName}</span>
                          {isSelected && <svg className="w-3.5 h-3.5 ml-1 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button onClick={autoCalibrate} disabled={aiLoading || selectedCrops.length === 0}
                className="w-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 font-bold text-[11px] uppercase tracking-widest py-3 rounded-xl shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 mb-4 disabled:opacity-50">
                {aiLoading ? <><span className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/> AI Calculating...</> : <>🧠 AI Auto-Calibrate Metrics</>}
              </button>

              <button onClick={() => { if (!result) simulate(true); else addToast("Live sync is active. Adjust parameters to see updates automatically.", "info") }}
                className="w-full bg-gradient-to-r from-farm-green to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-black text-sm uppercase tracking-widest py-4 rounded-xl shadow-[0_15px_30px_rgba(34,197,94,0.3)] hover:shadow-[0_20px_40px_rgba(34,197,94,0.4)] transition-all transform hover:-translate-y-1 mt-4 cursor-pointer relative overflow-hidden group">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {result ? "Live Sync Active ⚡" : "Generate Report 📊"}
                </span>
                <div className="absolute inset-0 h-full w-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          </div>

          <div className="xl:col-span-3 space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: '🌡️ WEATHER', state: weather, set: setWx, options: WEATHER, color: 'blue' },
                { title: '📊 MARKET',  state: market,  set: setMkt, options: MARKETS, color: 'purple' },
                { title: '🚿 IRRIGATION', state: irrigation, set: setIrrig, options: IRRIGATION, color: 'teal' }
              ].map((mod, idx) => (
                <div key={idx} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-gray-700/50 p-2.5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{mod.title}</span>
                    <span className={`w-2 h-2 rounded-full bg-${mod.color}-500 shadow-[0_0_8px_rgba(0,0,0,0.2)]`}></span>
                  </div>
                  <div className="flex gap-1.5 p-1 bg-gray-50/80 dark:bg-gray-900/50 rounded-xl">
                    {mod.options.map(opt => (
                      <button key={opt.value} onClick={() => mod.set(opt.value)}
                        className={`flex-1 py-2 px-1 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer text-center flex flex-col items-center gap-0.5 ${
                          mod.state === opt.value 
                            ? `bg-white dark:bg-gray-700 shadow-md text-${mod.color}-600 dark:text-${mod.color}-400 border border-gray-200/50 dark:border-gray-600` 
                            : 'text-gray-500 hover:bg-gray-200/50 dark:hover:bg-gray-800 border border-transparent'
                        }`}>
                        <span className="text-base leading-none">{opt.icon}</span>
                        <span>{opt.value}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden min-h-[500px] flex flex-col relative" ref={reportRef}>

              {!result ? (

                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden bg-white dark:bg-gray-800">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-50/50 via-white to-transparent dark:from-green-900/10 dark:via-gray-800 dark:to-transparent z-0 pointer-events-none"></div>
                  
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
                      <div className="absolute inset-0 bg-farm-green/20 rounded-full animate-ping blur-xl"></div>
                      <div className="absolute inset-2 bg-gradient-to-br from-green-300 to-emerald-500 rounded-full shadow-2xl opacity-20 animate-pulse"></div>
                      <div className="relative w-24 h-24 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-2xl border border-white dark:border-gray-700 text-5xl transform hover:scale-110 hover:rotate-12 transition-transform duration-500">
                        🌱
                      </div>
                    </div>
                    
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Simulator Ready <span className="text-farm-green inline-block animate-bounce">↓</span></h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-10 text-base leading-relaxed">
                      Configure your inputs on the left panel to dynamically forecast crop financials, live market risks, and ROI potential.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <button onClick={() => loadPreset('Wheat')} className="px-6 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm rounded-2xl text-sm font-bold text-gray-800 dark:text-gray-200 hover:-translate-y-1 hover:shadow-lg hover:border-farm-green transition-all cursor-pointer flex items-center gap-3 group">
                        <span className="text-2xl group-hover:scale-125 transition-transform bg-gray-50 dark:bg-gray-800 w-10 h-10 rounded-xl flex items-center justify-center">🌾</span> 
                        <span className="text-left">Auto-fill<br/><span className="text-gray-400 text-xs">Wheat Profile</span></span>
                      </button>
                      <button onClick={() => loadPreset('Cotton')} className="px-6 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm rounded-2xl text-sm font-bold text-gray-800 dark:text-gray-200 hover:-translate-y-1 hover:shadow-lg hover:border-farm-green transition-all cursor-pointer flex items-center gap-3 group">
                        <span className="text-2xl group-hover:scale-125 transition-transform bg-gray-50 dark:bg-gray-800 w-10 h-10 rounded-xl flex items-center justify-center">🌿</span> 
                        <span className="text-left">Auto-fill<br/><span className="text-gray-400 text-xs">Cotton Profile</span></span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (

                <>
                  
                  <div className="flex flex-wrap items-center justify-between p-6 sm:p-8 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white">Financial Projection Output</h3>
                      <p className="text-sm text-gray-500 mt-1 font-medium flex items-center gap-3">
                        <span><span className="font-bold text-gray-700 dark:text-gray-300">Area:</span> {landArea} {landUnit}s</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span><span className="font-bold text-gray-700 dark:text-gray-300">Risk Factor:</span> {WEATHER.find(w => w.value === weather).risk}</span>
                      </p>
                    </div>
                    <button onClick={handleExport} disabled={exporting}
                      className="mt-4 sm:mt-0 flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-bold px-6 py-2.5 rounded-xl text-sm transition-all transform hover:-translate-y-0.5 hover:shadow-lg cursor-pointer disabled:opacity-75 disabled:cursor-wait">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      {exporting ? 'Generating PDF...' : 'Download Report'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 p-6 sm:px-8 bg-gray-50/50 dark:bg-gray-900/50">
                    {(result.type === 'single' ? [result.current] : result.list).map((d, i) => (
                      <div key={i} className="relative rounded-[2rem] bg-white dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700/50 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_50px_rgba(0,0,0,0.08)] transition-all group overflow-hidden">

                        <div className={`absolute top-0 left-0 w-full h-1.5 ${d.profit >= 0 ? 'bg-gradient-to-r from-farm-green to-emerald-500' : 'bg-gradient-to-r from-red-500 to-rose-500'}`}></div>

                        <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500 pointer-events-none ${d.profit >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}></div>

                        <div className="flex justify-between items-start mb-6 relative z-10">
                          <div className="flex items-center gap-3 outline-none">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-gray-100 dark:border-gray-700/50">{d.icon}</div>
                            <div>
                              <h4 className="font-black text-gray-900 dark:text-white text-lg leading-tight flex items-center gap-1.5">
                                {d.name} {d.isAiAdjusted && <span title="AI Dynamically Calibrated" className="text-xs">✨</span>}
                              </h4>
                              <div className={`text-[10px] uppercase font-black tracking-widest mt-0.5 ${d.roi >= 50 ? 'text-farm-green' : d.roi >= 0 ? 'text-yellow-600 dark:text-yellow-500' : 'text-red-500'}`}>
                                {Math.abs(d.roi)}% {d.roi >= 0 ? 'ROI' : 'LOSS'}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Est. Margin</p>
                              {d.isLive && <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"/> LIVE</span>}
                            </div>
                            <p className={`text-3xl font-black tracking-tighter ${d.profit >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>
                              {d.profit >= 0 ? '+' : '-'}₹{Math.abs(Math.round(d.profit)).toLocaleString('en-IN')}
                            </p>
                          </div>

                          <div className="flex flex-col gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-700/60">
                            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 px-2.5 py-1.5 rounded-lg">
                              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Cost</span>
                              <span className="text-xs font-black text-gray-900 dark:text-white">₹{Math.round(d.cost).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between items-center bg-green-50/50 dark:bg-green-900/10 px-2.5 py-1.5 rounded-lg">
                              <span className="text-xs font-bold text-farm-green">Gross</span>
                              <span className="text-xs font-black text-farm-green dark:text-green-400">₹{Math.round(d.revenue).toLocaleString('en-IN')}</span>
                            </div>

                            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden flex relative shadow-inner">
                              <div className="bg-gray-300 dark:bg-gray-600 h-full rounded-l-full" style={{ width: `${Math.min(100, (d.cost / (d.cost + Math.max(0, d.profit))) * 100)}%` }}></div>
                              {d.profit > 0 && <div className="bg-gradient-to-r from-farm-green to-emerald-500 h-full rounded-r-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" style={{ width: `${Math.max(0, Math.min(100, (d.profit / (d.cost + Math.max(0, d.profit))) * 100))}%` }}></div>}
                            </div>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                  <div className="flex-1 p-6 sm:px-8 border-t border-gray-100 dark:border-gray-700/60 bg-gray-50/30 dark:bg-gray-800/50">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm h-72">
                      <Bar
                        data={chartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          interaction: { mode: 'index', intersect: false },
                          plugins: {
                            legend: { display: true, position: 'top', align: 'end', labels: { font: { family: 'Inter', weight: 'bold', size: 11 }, usePointStyle: true, boxWidth: 8 } },
                            tooltip: {
                              backgroundColor: 'rgba(15, 23, 42, 0.9)', titleFont: { size: 13 }, bodyFont: { size: 13, weight: 'bold' }, padding: 12, cornerRadius: 8,
                              callbacks: { label: c => ` ₹${Math.abs(c.raw).toLocaleString('en-IN')}` }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              grid: { color: 'rgba(156, 163, 175, 0.1)', drawBorder: false },
                              ticks: { callback: v => `₹${v >= 100000 ? (v / 100000).toFixed(1) + 'L' : (v / 1000).toFixed(0) + 'k'}`, font: { family: 'Inter', weight: '500' } }
                            },
                            x: {
                              grid: { display: false, drawBorder: false },
                              ticks: { font: { family: 'Inter', weight: 'bold', size: 12 } }
                            }
                          }
                        }}
                      />
                    </div>

                    <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-5 flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center flex-shrink-0 text-xl">🧠</div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-1">FarmAI Advisory Panel</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200/80 leading-relaxed">
                          {weather === 'Hot'
                            ? `High heat and drought risk selected. Ensure robust irrigation strategies (like Drip) are utilized. Crops with high water dependency may fail to yield projected revenue.`
                            : weather === 'Cold'
                              ? `Cold/Frost conditions selected. Consider protective measures for temperature-sensitive crops and apply light irrigation overnight.`
                              : `Conditions are optimal. `}
                          {market === 'Volatile'
                            ? `Market volatility is high. Recommended to engage with Govt MSP or forward contracts to secure baseline revenue.`
                            : ``}
                          {result.type === 'compare' && ` ${[...result.list].sort((a, b) => b.profit - a.profit)[0].name} shows the strongest financial indicators in your current simulation parameters.`}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
