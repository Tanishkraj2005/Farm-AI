import { useState, useEffect } from 'react';

const WASTE_OPTS = [
  { 
    value: 'Paddy Straw', label: 'Paddy Straw (Parali)', icon: '🌾', rate: 4200, subsidy: 1000, 
    demand: 'High', co2Saved: 1.6, usage: 'Mushroom substrate, Ethanol, Biomass Pellets', 
    color: 'from-amber-400 to-yellow-600', hue: 'amber', buyers: ['Bio-Energy Plants', 'Local Mushroom Farms'],
    desc: 'Extremely high demand across northern states to prevent stubble burning.' 
  },
  { 
    value: 'Sugarcane Bagasse', label: 'Sugarcane Bagasse', icon: '🎋', rate: 3000, subsidy: 0, 
    demand: 'Very High', co2Saved: 0.8, usage: 'Biofuel briquettes, Paper pulp, Eco-tableware', 
    color: 'from-lime-400 to-green-600', hue: 'lime', buyers: ['Paper Mills', 'Eco-Packaging Startups'],
    desc: 'Easily converted to eco-friendly fuel or sold to large paper manufacturing plants.' 
  },
  { 
    value: 'Cotton Stalks', label: 'Cotton Stalks', icon: '🌿', rate: 3500, subsidy: 500, 
    demand: 'Moderate', co2Saved: 1.2, usage: 'Particle board, Bioenergy combustion', 
    color: 'from-sky-400 to-blue-600', hue: 'blue', buyers: ['Furniture Manufacturers', 'Power Grids'],
    desc: 'Lignin-rich material perfect for durable board manufacturing & biomass heating.' 
  },
  { 
    value: 'Cow Dung', label: 'Cow Dung', icon: '🐄', rate: 2500, subsidy: 200, 
    demand: 'High', co2Saved: 2.1, usage: 'Biogas (Methane), Vermicompost, Organic fertilizer', 
    color: 'from-purple-400 to-fuchsia-600', hue: 'purple', buyers: ['Organic Farming Co-ops', 'Biogas Grids'],
    desc: 'Generate combustible biogas for rural networks or process into high-value vermicompost.' 
  },
  { 
    value: 'Banana Stems', label: 'Banana Pseudo-stems', icon: '🍌', rate: 4800, subsidy: 800, 
    demand: 'Rising rapidly', co2Saved: 0.9, usage: 'Textile fibers, Bio-fertilizer, Handicrafts', 
    color: 'from-emerald-400 to-teal-600', hue: 'lime', buyers: ['Textile Boutiques', 'Organic Liquid Fertilizer Plants'],
    desc: 'Extracted fibers are becoming highly lucrative for sustainable fashion.' 
  },
  { 
    value: 'Coconut Shells', label: 'Coconut Shells & Coir', icon: '🥥', rate: 6500, subsidy: 0, 
    demand: 'Very High', co2Saved: 1.4, usage: 'Activated carbon filters, Coco peat, Geo-textiles', 
    color: 'from-orange-400 to-red-500', hue: 'amber', buyers: ['Water Treatment Plants', 'Hydroponic Farms'],
    desc: 'Incredibly valuable for creating industrial-grade activated carbon and potting soil.' 
  },
  { 
    value: 'Maize Cobs', label: 'Maize Cobs', icon: '🌽', rate: 2200, subsidy: 150, 
    demand: 'Stable', co2Saved: 0.6, usage: 'Biochar, Animal feed base, Furfural extraction', 
    color: 'from-yellow-300 to-amber-500', hue: 'amber', buyers: ['Chemical Processors', 'Poultry Feed Syndicates'],
    desc: 'Used commonly to extract industrial chemical furfural or create biochar for soil.' 
  },
  { 
    value: 'Potato Peel', label: 'Potato Starch Waste', icon: '🥔', rate: 1800, subsidy: 300, 
    demand: 'Moderate', co2Saved: 0.5, usage: 'Bio-ethanol, Starch extraction, Animal feed', 
    color: 'from-stone-400 to-gray-600', hue: 'blue', buyers: ['Ethanol Distilleries', 'Livestock Farms'],
    desc: 'Carbohydrate-rich remnants heavily targeted by local industrial distilleries.' 
  },
];

const HUE_MAP = {
  amber:  { bg: 'bg-amber-50 dark:bg-amber-900/10', ring: 'ring-amber-500/30', text: 'text-amber-600',  glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]', lightCard: 'bg-amber-50/50 hover:bg-amber-100/50' },
  lime:   { bg: 'bg-lime-50 dark:bg-lime-900/10', ring: 'ring-lime-500/30', text: 'text-lime-600',  glow: 'shadow-[0_0_20px_rgba(132,204,22,0.2)]', lightCard: 'bg-lime-50/50 hover:bg-lime-100/50' },
  blue:   { bg: 'bg-blue-50 dark:bg-blue-900/10', ring: 'ring-blue-500/30',   text: 'text-blue-600',   glow: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]', lightCard: 'bg-blue-50/50 hover:bg-blue-100/50' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/10', ring: 'ring-purple-500/30', text: 'text-purple-600', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]', lightCard: 'bg-purple-50/50 hover:bg-purple-100/50' },
};

export default function WasteToIncome() {
  const [waste, setWaste] = useState('Paddy Straw');

  const [qtyStr, setQtyStr] = useState('5.0'); 
  
  const [result, setResult] = useState(null);
  const [calculating, setCalculating] = useState(false);

  const sel = WASTE_OPTS.find(w => w.value === waste);
  const c   = HUE_MAP[sel.hue];

  useEffect(() => {
    if (result) setResult(null);

  }, [waste, qtyStr]);

  function handleCalc() {
    setCalculating(true);
    setResult(null);

    const pQty = parseFloat(qtyStr);
    const finalQty = isNaN(pQty) || pQty <= 0 ? 0.1 : Math.max(0.1, pQty);

    setTimeout(() => {
      setResult({ 
        ...sel, 
        qty: finalQty, 
        gross: sel.rate * finalQty,
        subsidyTotal: sel.subsidy * finalQty,
        netIncome: (sel.rate + sel.subsidy) * finalQty,
        carbonTotal: (sel.co2Saved * finalQty).toFixed(1)
      });
      setCalculating(false);
    }, 800);
  }

  return (
    <section id="waste" className="py-24 bg-gray-50 dark:bg-gray-950 relative min-h-screen flex flex-col justify-center overflow-hidden">

      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-400/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-400/10 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-lighten pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">

        <div className="text-center mb-16 relative">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold text-sm mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse border-2 border-white dark:border-gray-900" />
            Bio-Economy Engine
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
            <span className="text-green-500">Waste-to-Wealth</span> Calculator
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Stop burning. Start earning. Model how much revenue and government subsidy you can claim by liquidating agricultural byproducts to industrial buyers.
          </p>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/50 dark:border-gray-700/50 p-6 md:p-10 mb-8 overflow-hidden relative">
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

            <div className="lg:col-span-3 flex flex-col justify-between">
              
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <span className="text-2xl">⚙️</span> Configuration
                </h3>

                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                  1. Identify Biomass Material
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                  {WASTE_OPTS.map(opt => {
                    const cl = HUE_MAP[opt.hue];
                    const active = waste === opt.value;
                    return (
                      <button key={opt.value} onClick={() => setWaste(opt.value)}
                        className={`text-left rounded-2xl p-3.5 transition-all duration-300 transform outline-none cursor-pointer border-2 relative overflow-hidden group flex flex-col justify-between h-full min-h-[140px] ${
                          active 
                          ? `${cl.bg} py-4 ${cl.ring} border-transparent ring-2 shadow-sm scale-[1.03] z-10` 
                          : `${cl.lightCard} border-${opt.hue}-100 dark:border-gray-700/50 dark:bg-gray-800/40 hover:border-${opt.hue}-300 dark:hover:border-gray-600 hover:shadow-md`
                        }`}>
                        
                        {active && <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${opt.color} opacity-20 rounded-bl-full pointer-events-none`}/>}
                        
                        <div>
                          <div className="flex items-start justify-between mb-2">
                             
                             <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xl shadow-sm ${active ? 'bg-white dark:bg-gray-800' : 'bg-white/80 dark:bg-gray-800/80'}`}>
                               {opt.icon}
                             </div>
                             
                             <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-wider ${active ? `bg-${opt.hue}-100 text-${opt.hue}-700 shadow-sm` : `bg-${opt.hue}-50/50 text-${opt.hue}-600/80`} dark:bg-gray-800 dark:text-${opt.hue}-400`}>
                               ₹{(opt.rate/1000).toFixed(1)}k/t
                             </span>
                          </div>
                          <span className={`font-black text-[13px] block leading-tight ${active ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{opt.label}</span>
                        </div>
                        
                        <p className={`text-[10px] line-clamp-2 leading-tight mt-2 ${active ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500 opacity-90'}`}>{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>

                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                  2. Est. Yield Quantity (Tons)
                </label>

                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-2 flex items-center gap-2 border border-gray-100 dark:border-gray-700 w-full mb-8">
                  <button onClick={() => setQtyStr(q => Math.max(0.1, Number((Number(q) - 1).toFixed(1))).toString())}
                    className="w-14 h-14 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 text-2xl font-medium text-gray-600 dark:text-gray-300 hover:text-green-500 hover:border-green-500 transition-all cursor-pointer flex items-center justify-center">
                    −
                  </button>
                  <input type="number" value={qtyStr} min={0.1} step={0.1} onChange={e => setQtyStr(e.target.value)}
                    className="flex-1 text-center bg-transparent text-gray-900 dark:text-white font-black text-3xl outline-none" />
                  <button onClick={() => setQtyStr(q => Number((Number(q) + 1).toFixed(1)).toString())}
                    className="w-14 h-14 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 text-2xl font-medium text-gray-600 dark:text-gray-300 hover:text-green-500 hover:border-green-500 transition-all cursor-pointer flex items-center justify-center">
                    +
                  </button>
                </div>
              </div>

              <button onClick={handleCalc} disabled={calculating}
                className={`w-full relative overflow-hidden group bg-gradient-to-r text-white font-black text-sm uppercase tracking-widest py-5 rounded-2xl shadow-lg transition-all transform hover:-translate-y-1 hover:shadow-xl cursor-pointer ${
                  calculating ? 'from-gray-400 to-gray-500' : `${sel.color} ${c.glow}`
                }`}>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {calculating ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Modeling Logistics...</>
                  ) : (
                    <>💰 Calculate Financial Viability</>
                  )}
                </span>
              </button>
            </div>

            <div className="lg:col-span-2 relative">
              <div className={`h-full w-full rounded-[2rem] p-8 border backdrop-blur-md flex flex-col transition-all duration-700 ${
                result ? `${c.bg} border-${sel.hue}-200/50 dark:border-${sel.hue}-800/50 shadow-xl` : 'bg-gray-50/50 dark:bg-gray-900/30 border-gray-200/50 dark:border-gray-700/50 border-dashed'
              }`}>
                
                {calculating ? (

                   <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                      <div className="text-4xl animate-bounce mb-4">{sel.icon}</div>
                      <div className="h-2 w-32 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${sel.color} w-full animate-[slide_1s_ease-in-out_infinite]`}></div>
                      </div>
                   </div>
                ) : !result ? (

                   <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                     <span className="text-6xl filter grayscale opacity-20 mb-6 block">🏭</span>
                     <h4 className="text-lg font-bold text-gray-600 dark:text-gray-300 mb-2">Awaiting Parameters</h4>
                     <p className="text-sm text-gray-500 max-w-[200px] leading-relaxed">
                       Input your waste logistics on the left to project industrial revenue.
                     </p>
                   </div>
                ) : (

                   <div className="flex-1 flex flex-col animate-float-in h-full">
                     <div className="text-center mb-6">
                       <span className="text-7xl drop-shadow-xl inline-block mb-3 transform hover:scale-110 transition-transform">{result.icon}</span>
                       <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">{result.label} Valuation</h3>
                     </div>

                     <div className="space-y-4 mb-8 flex-grow">
                       
                       <div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl p-4 shadow-sm border border-white/50 dark:border-gray-700">
                         <div className="flex justify-between items-end mb-1">
                           <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">Base Rate <span className="text-[10px] text-gray-400 lowercase border border-gray-200 p-[1px] px-1 rounded bg-gray-50 dark:border-gray-700 dark:bg-gray-800 shadow-sm ml-1">x{result.qty}T</span></span>
                           <span className="text-xl font-black text-gray-800 dark:text-white">₹{result.gross.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
                         </div>
                       </div>
                       
                       <div className="bg-green-500/10 dark:bg-green-500/5 rounded-2xl p-4 border border-green-500/20">
                         <div className="flex justify-between items-end group cursor-help relative">
                           <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest border-b border-dashed border-green-400">Govt Subsidy</span>
                           <span className="text-xl font-black text-green-600 dark:text-green-400">+₹{result.subsidyTotal.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>

                           <div className="absolute right-0 bottom-[120%] mb-1 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                             Based on Central Govt. Bio-Energy initiative: ₹{result.subsidy}/ton claimed.
                           </div>
                         </div>
                       </div>

                       <div className={`rounded-2xl p-5 border-2 shadow-sm relative overflow-hidden bg-white dark:bg-gray-900 border-${sel.hue}-400 dark:border-${sel.hue}-600`}>
                         <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${result.color} opacity-20 rounded-bl-full pointer-events-none`} />
                         <span className={`text-[10px] font-black uppercase tracking-widest ${HUE_MAP[result.hue].text} mb-1 block`}>Total Est. Net Income</span>
                         <span className="text-4xl font-black text-gray-900 dark:text-white mt-1 block tracking-tighter">
                           ₹{result.netIncome.toLocaleString('en-IN', {maximumFractionDigits: 0})}
                         </span>
                       </div>

                     </div>

                     <div className="mt-auto grid grid-cols-2 gap-3 text-left">
                       <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                         <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">CO₂ Offset</p>
                         <p className="font-black text-sm text-emerald-600 dark:text-emerald-400">{result.carbonTotal} Tons</p>
                       </div>
                       <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                         <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Demand Metric</p>
                         <p className="font-black text-sm text-gray-800 dark:text-white capitalize">{result.demand}</p>
                       </div>
                       <div className="col-span-2 bg-white/60 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                         <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Probable Buyers</p>
                         <p className="font-bold text-[11px] text-gray-700 dark:text-gray-300 flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                           {result.buyers.join(' & ')}
                         </p>
                       </div>
                     </div>

                   </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
