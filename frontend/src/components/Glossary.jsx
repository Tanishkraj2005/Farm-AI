import { useState, useMemo } from 'react';

const TERMS = [
  { term: 'MSP', full: 'Minimum Support Price', emoji: '💰', category: 'Policy', def: 'The price at which the government purchases crops from farmers, guaranteeing a minimum income regardless of market prices.' },
  { term: 'Kharif', full: 'Kharif Crops', emoji: '🌧️', category: 'Seasons', def: 'Crops sown at the beginning of monsoon (June-July) and harvested in autumn (Sept-Oct). Examples: Rice, Cotton, Maize, Soybean.' },
  { term: 'Rabi', full: 'Rabi Crops', emoji: '❄️', category: 'Seasons', def: 'Crops sown in winter (Oct-Nov) and harvested in spring (Mar-Apr). Examples: Wheat, Mustard, Gram, Barley.' },
  { term: 'PMFBY', full: 'Pradhan Mantri Fasal Bima Yojana', emoji: '🛡️', category: 'Policy', def: 'Government crop insurance scheme providing financial support to farmers suffering crop loss/damage due to unforeseen calamities.' },
  { term: 'NPK', full: 'Nitrogen, Phosphorus, Potassium', emoji: '🧪', category: 'Inputs', def: 'The three primary macronutrients essential for plant growth. N promotes leafy growth, P supports roots and flowering, K improves overall hardiness.' },
  { term: 'FYM', full: 'Farm Yard Manure', emoji: '🐄', category: 'Inputs', def: 'A mix of cattle dung, urine, litter and leftover feed. A cheap organic source of NPK that also improves soil structure.' },
  { term: 'DAP', full: 'Di-Ammonium Phosphate', emoji: '🏭', category: 'Inputs', def: 'A widely used fertilizer containing 18% Nitrogen and 46% Phosphorus (P₂O₅). Applied as basal dose at the time of sowing.' },
  { term: 'PM-KISAN', full: 'PM Kisan Samman Nidhi', emoji: '🏛️', category: 'Policy', def: 'A central government scheme providing ₹6,000/year in three equal instalments directly to eligible farmer bank accounts.' },
  { term: 'Mandi', full: 'Agricultural Market Yard', emoji: '🏪', category: 'Market', def: 'A regulated market where farmers can sell their produce. Mandi prices are official daily published rates for each crop.' },
  { term: 'eNAM', full: 'National Agriculture Market', emoji: '🌐', category: 'Market', def: 'An online trading platform that links agricultural mandis across India, allowing farmers to access a broader market and better prices.' },
  { term: 'Quintal', full: 'Unit of Weight (100 kg)', emoji: '⚖️', category: 'Units', def: 'Standard unit used for pricing crops in mandis. 1 Quintal = 100 kilograms. MSP and mandi prices are usually quoted per quintal.' },
  { term: 'Khasra', full: 'Land Record Number', emoji: '📋', category: 'Policy', def: 'A unique identification number assigned to each plot of land in village land records. Required for PMFBY claims and government schemes.' },
  { term: 'Soil pH', full: 'Potential of Hydrogen in Soil', emoji: '🌱', category: 'Inputs', def: 'Measures acidity/alkalinity of soil on a scale of 0-14. Most crops grow best at pH 6.0-7.5. Below 6 = acidic, Above 7.5 = alkaline.' },
  { term: 'BPH', full: 'Brown Plant Hopper', emoji: '🐛', category: 'Disease', def: 'A major pest of rice crops that sucks plant sap causing yellowing and "hopper burn". Monitoring and systemic insecticides used for control.' },
  { term: 'Drip Irrigation', full: 'Micro-Drip Irrigation', emoji: '💧', category: 'Agronomy', def: 'A water-efficient method where water is delivered directly to the root zone of plants. Reduces water use by 40-60% vs. flood irrigation.' },
  { term: 'Crop Rotation', full: 'Crop Diversification Practice', emoji: '🔄', category: 'Agronomy', def: 'Growing different types of crops in the same field each season. Breaks pest/disease cycles, improves soil fertility, and reduces input costs.' },
  { term: 'Vermicompost', full: 'Earthworm Processed Compost', emoji: '🪱', category: 'Inputs', def: 'Organic matter digested by earthworms, producing nutrient-rich compost. Improves soil biology, water retention and crop health.' },
  { term: 'Hybrid Seeds', full: 'First-Generation Hybrid Seeds (F1)', emoji: '🌱', category: 'Agronomy', def: 'Seeds produced by crossing two parent lines. Hybrids give 20-30% higher yields than open-pollinated varieties but cannot be saved for replanting.' },
  { term: 'Biogas', full: 'Biomass-derived Gas (Methane)', emoji: '⚡', category: 'Energy', def: 'Gas produced from decomposition of organic waste (cow dung, crop residue) in anaerobic conditions. Used for cooking, lighting and electricity.' },
  { term: 'IPM', full: 'Integrated Pest Management', emoji: '🔬', category: 'Disease', def: 'A sustainable pest control approach combining biological, cultural and chemical methods to minimize pesticide use while protecting crops.' },
];

const CATEGORIES = ['All Terminology', ...new Set(TERMS.map(t => t.category))];

const CAT_COLORS = {
  'Policy': 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
  'Seasons': 'text-sky-600 bg-sky-100 dark:text-sky-400 dark:bg-sky-900/30',
  'Inputs': 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30',
  'Market': 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30',
  'Units': 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800',
  'Disease': 'text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30',
  'Agronomy': 'text-lime-600 bg-lime-100 dark:text-lime-400 dark:bg-lime-900/30',
  'Energy': 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
};

export default function Glossary() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All Terminology');

  const filtered = useMemo(() => {
    return TERMS.filter(t => {
      const q = search.toLowerCase();
      const matchSearch = !q || t.term.toLowerCase().includes(q) || t.full.toLowerCase().includes(q) || t.def.toLowerCase().includes(q);
      const matchCat = cat === 'All Terminology' || t.category === cat;
      return matchSearch && matchCat;
    });
  }, [search, cat]);

  return (
    <section id="glossary" className="py-24 bg-gray-50 dark:bg-gray-950 relative min-h-screen">

      <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-emerald-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-sky-400/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-sm mb-4">
            📖 Verified Agricultural Terms
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
            The Farmer's <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-sky-500">Glossary</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Quickly understand complex government policies, market acronyms, and modern agronomic terms effortlessly.
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-white/70 dark:bg-gray-800/60 backdrop-blur-3xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/50 dark:border-gray-700/50 p-3 flex flex-col sm:flex-row gap-3 mb-10">
          
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search 'MSP', 'Kharif', 'Drip'..."
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-base text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition font-medium"
            />
          </div>
          
          <div className="relative min-w-[200px]">
            <select value={cat} onChange={e => setCat(e.target.value)}
              className="w-full px-4 py-4 pr-10 appearance-none bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/50 outline-none transition cursor-pointer">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none text-xs">▼</span>
          </div>

        </div>

        <div className="mb-6 flex justify-between items-end px-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
            {cat === 'All Terminology' ? 'All Definitions' : `${cat} Terms`}
          </h3>
          <span className="text-xs font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1 text-gray-500 shadow-sm">
            {filtered.length} terms found
          </span>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(item => (
              <div key={item.term} className="group bg-white/60 dark:bg-gray-800/40 backdrop-blur-lg border border-gray-100 dark:border-gray-700/50 rounded-[2rem] p-6 hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden flex flex-col h-full">

                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-bl-full translate-x-8 -translate-y-8 group-hover:translate-x-0 group-hover:-translate-y-0 transition-transform duration-500" />
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <span className="text-4xl filter drop-shadow-sm transform group-hover:scale-110 transition-transform">{item.emoji}</span>
                  <span className={`text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-md ${CAT_COLORS[item.category] || 'bg-gray-100 text-gray-600'}`}>
                    {item.category}
                  </span>
                </div>
                
                <div className="relative z-10 flex-grow">
                  <h4 className="text-xl font-black text-gray-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {item.term}
                  </h4>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700/50 line-clamp-1 group-hover:line-clamp-none transition-all">
                    {item.full}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                    {item.def}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/50 dark:bg-gray-800/30 rounded-[2rem] border border-dashed border-gray-300 dark:border-gray-700 backdrop-blur-md">
            <span className="text-6xl filter grayscale opacity-30 mb-4 block">🌾</span>
            <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No terminology found</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
              We couldn't find any terms matching "{search}" in the {cat} category.
            </p>
            <button onClick={() => { setSearch(''); setCat('All Terminology'); }} 
              className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold px-5 py-2.5 rounded-full text-sm hover:shadow-md transition cursor-pointer">
              Clear All Filters
            </button>
          </div>
        )}
        
      </div>
    </section>
  );
}
