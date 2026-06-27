import { useState } from 'react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CALENDAR_DATA = {
  Wheat: {
    season: 'Rabi (Winter)',
    icon: '🌾',
    color: 'from-amber-400 to-amber-600',
    bgLight: 'bg-amber-50',
    borderLight: 'border-amber-200',
    activities: {
      Oct: [{ type: 'prep', label: 'Land Prep & Ploughing' }],
      Nov: [{ type: 'sow', label: 'Sowing (1–15 Nov)' }, { type: 'fertilize', label: '1st Dose Fertilizer (DAP+Urea)' }],
      Dec: [{ type: 'water', label: '1st Irrigation (Crown Root)' }],
      Jan: [{ type: 'water', label: '2nd Irrigation' }, { type: 'fertilize', label: 'Top Dress Urea' }],
      Feb: [{ type: 'spray', label: 'Pesticide/Fungicide Spray' }, { type: 'water', label: '3rd Irrigation' }],
      Mar: [{ type: 'water', label: '4th Irrigation (grain fill)' }],
      Apr: [{ type: 'harvest', label: 'Harvesting (10–30 Apr)' }],
      May: [{ type: 'store', label: 'Threshing & Storage' }],
    },
  },
  Rice: {
    season: 'Kharif (Monsoon)',
    icon: '🍚',
    color: 'from-green-400 to-emerald-600',
    bgLight: 'bg-green-50',
    borderLight: 'border-green-200',
    activities: {
      May: [{ type: 'prep', label: 'Nursery Bed Preparation' }],
      Jun: [{ type: 'sow', label: 'Nursery Sowing' }, { type: 'water', label: '1st Irrigation' }],
      Jul: [{ type: 'sow', label: 'Transplanting (20-25 days seedling)' }, { type: 'fertilize', label: 'Basal Fertilizer (DAP)' }],
      Aug: [{ type: 'fertilize', label: '1st Top Dress Urea' }, { type: 'water', label: 'Regular Irrigation' }, { type: 'spray', label: 'Weed Control' }],
      Sep: [{ type: 'fertilize', label: '2nd Urea (panicle initiation)' }, { type: 'spray', label: 'Pest monitoring (BPH, Blast)' }],
      Oct: [{ type: 'harvest', label: 'Harvesting (Maturity ~80%)' }],
      Nov: [{ type: 'store', label: 'Sun-drying & Storage' }],
    },
  },
  Cotton: {
    season: 'Kharif (Summer)',
    icon: '🌿',
    color: 'from-teal-400 to-blue-500',
    bgLight: 'bg-teal-50',
    borderLight: 'border-teal-200',
    activities: {
      Apr: [{ type: 'prep', label: 'Land Preparation & FYM Application' }],
      May: [{ type: 'sow', label: 'Sowing (1-15 May)' }, { type: 'fertilize', label: 'Basal Dose DAP' }],
      Jun: [{ type: 'water', label: '1st Irrigation' }, { type: 'spray', label: 'Pre-emergence herbicide' }],
      Jul: [{ type: 'fertilize', label: 'Top Dress Urea' }, { type: 'water', label: '2nd Irrigation' }],
      Aug: [{ type: 'spray', label: 'Bollworm Monitoring & Spray' }, { type: 'fertilize', label: 'Potash Application' }],
      Sep: [{ type: 'spray', label: 'Anti-pest spray (Whitefly)' }, { type: 'water', label: '3rd Irrigation' }],
      Oct: [{ type: 'harvest', label: '1st Picking (Open Bolls)' }],
      Nov: [{ type: 'harvest', label: '2nd Picking' }],
      Dec: [{ type: 'harvest', label: 'Final Picking & Marketing' }],
    },
  },
  Sugarcane: {
    season: 'Annual Crop',
    icon: '🎋',
    color: 'from-lime-400 to-green-600',
    bgLight: 'bg-lime-50',
    borderLight: 'border-lime-200',
    activities: {
      Feb: [
        { type: 'prep', label: 'Deep Ploughing & FYM' },
        { type: 'store', label: 'Supply to Sugar Mill' }
      ],
      Mar: [{ type: 'sow', label: 'Planting (setts/cuttings)' }, { type: 'fertilize', label: 'Basal Dose N:P:K' }],
      Apr: [{ type: 'water', label: 'Frequent Irrigation' }, { type: 'spray', label: 'Weed Management' }],
      Jun: [{ type: 'fertilize', label: 'Urea Top Dressing' }, { type: 'water', label: 'Rainwater management' }],
      Aug: [{ type: 'fertilize', label: 'Potash Dose' }],
      Oct: [{ type: 'spray', label: 'Pest survey & treatment' }],
      Jan: [{ type: 'harvest', label: 'Harvesting (12-14 months)' }],
    },
  },
  Mustard: {
    season: 'Rabi (Winter)',
    icon: '🌼',
    color: 'from-yellow-400 to-amber-500',
    bgLight: 'bg-yellow-50',
    borderLight: 'border-yellow-200',
    activities: {
      Sep: [{ type: 'prep', label: 'Field Preparation' }],
      Oct: [{ type: 'sow', label: 'Sowing (1-15 Oct)' }, { type: 'fertilize', label: 'Basal Dose DAP+Urea' }],
      Nov: [{ type: 'water', label: '1st Irrigation (CRI stage)' }, { type: 'spray', label: 'Aphid monitoring begins' }],
      Dec: [{ type: 'fertilize', label: 'Top Dress Urea' }, { type: 'water', label: '2nd Irrigation' }],
      Jan: [{ type: 'spray', label: 'Spray for Aphids if >25/plant' }],
      Feb: [{ type: 'harvest', label: 'Harvesting when 75% pods golden' }],
      Mar: [{ type: 'store', label: 'Threshing, drying & storage' }],
    },
  },
  Maize: {
    season: 'Kharif / Spring',
    icon: '🌽',
    color: 'from-yellow-300 to-orange-500',
    bgLight: 'bg-orange-50',
    borderLight: 'border-orange-200',
    activities: {
      Jun: [{ type: 'prep', label: 'Seed treatment & field prep' }, { type: 'sow', label: 'Sowing (onset of monsoon)' }],
      Jul: [{ type: 'fertilize', label: 'Basal Dose N:P:K' }, { type: 'spray', label: 'Pre-emergence weedicide' }],
      Aug: [{ type: 'fertilize', label: 'Side-dress Urea at knee height' }, { type: 'water', label: 'Critical moisture at tasseling' }],
      Sep: [{ type: 'spray', label: 'Fall armyworm scouting' }],
      Oct: [{ type: 'harvest', label: 'Harvest at 30% moisture' }],
      Nov: [{ type: 'store', label: 'Dry to <14% and store safely' }],
    },
  },
};

const COLOR_CLASSES = {
  sow:      { bg: 'bg-gradient-to-r from-emerald-500 to-green-600', shadow: 'shadow-green-500/20', text: 'text-white',  label: 'Sowing' },
  fertilize:{ bg: 'bg-gradient-to-r from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20', text: 'text-white',  label: 'Fertilizer' },
  water:    { bg: 'bg-gradient-to-r from-cyan-400 to-blue-500', shadow: 'shadow-cyan-500/20', text: 'text-white',  label: 'Irrigation' },
  spray:    { bg: 'bg-gradient-to-r from-orange-400 to-red-500', shadow: 'shadow-orange-500/20', text: 'text-white',  label: 'Spray/Pest' },
  harvest:  { bg: 'bg-gradient-to-r from-amber-400 to-yellow-600', shadow: 'shadow-amber-500/20', text: 'text-white',  label: 'Harvest' },
  prep:     { bg: 'bg-gradient-to-r from-gray-500 to-slate-600', shadow: 'shadow-slate-500/20', text: 'text-white',  label: 'Preparation' },
  store:    { bg: 'bg-gradient-to-r from-purple-500 to-fuchsia-600', shadow: 'shadow-purple-500/20', text: 'text-white',  label: 'Storage' },
};

export default function CropCalendar() {
  const [selectedCrop, setSelectedCrop] = useState('Wheat');

  const data = CALENDAR_DATA[selectedCrop];
  const currentMonth = MONTHS[new Date().getMonth()];

  return (
    <section id="calendar" className="py-24 bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
      
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-green-400/10 dark:bg-green-600/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/3" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-16 relative">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold text-sm mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            Seasonal Tracking
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
            Dynamic <span className={`text-transparent bg-clip-text bg-gradient-to-r ${data.color}`}>Crop Calendar</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Stay ahead of your yield with month-by-month actionable intelligence. Plan your plowing, sowing, 
            and harvesting dynamically based on historical lifecycle data.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12">
          {Object.entries(CALENDAR_DATA).map(([crop, d]) => (
            <button key={crop} onClick={() => setSelectedCrop(crop)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 transform cursor-pointer border ${
                selectedCrop === crop
                  ? `bg-gradient-to-b ${d.color} text-white shadow-xl scale-105 border-transparent pointer-events-none`
                  : `bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300 shadow-sm hover:shadow-md hover:-translate-y-0.5`
              }`}>
              <span className="text-lg filter drop-shadow-sm">{d.icon}</span> 
              <span className="tracking-wide">{crop}</span>
            </button>
          ))}
        </div>

        <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/50 dark:border-gray-700 p-6 md:p-10 overflow-hidden relative">

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 pb-8 border-b border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center gap-6">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${data.color} flex items-center justify-center text-4xl shadow-lg ring-4 ring-white/20 dark:ring-gray-900/40`}>
                {data.icon}
              </div>
              <div>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{selectedCrop} Lifecycle</h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700`}>
                  🗓️ Optimal Season: <span className="ml-1 text-gray-900 dark:text-white">{data.season}</span>
                </span>
              </div>
            </div>

            <div className="mt-6 md:mt-0 flex flex-wrap gap-2 md:max-w-md justify-end">
              {Object.entries(COLOR_CLASSES).map(([key, cls]) => (
                <span key={key} className={`text-[10px] font-bold px-2.5 py-1.5 rounded-md ${cls.bg} shadow-sm ${cls.text} flex items-center gap-1.5 opacity-90`}>
                  <div className="w-1.5 h-1.5 rounded bg-white/50"></div>
                  {cls.label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {MONTHS.map((month) => {
              const acts = data.activities[month] || [];
              const isCurrent = month === currentMonth;
              const hasActivity = acts.length > 0;
              
              return (
                <div key={month}
                  className={`relative rounded-[1.5rem] p-5 transition-all duration-300 ${
                    isCurrent
                      ? `bg-white dark:bg-gray-800 ring-2 ring-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.3)] z-10 transform scale-[1.02]`
                      : hasActivity
                        ? `${data.bgLight} dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg hover:-translate-y-1 ${data.borderLight} dark:border-gray-600 border`
                        : `bg-gray-50/50 dark:bg-gray-800/30 border border-gray-200/50 dark:border-gray-700/50 opacity-60 hover:opacity-100`
                  }`}>
                  
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-white text-[10px] uppercase font-black tracking-widest rounded-full shadow-lg flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                      Current Window
                    </div>
                  )}

                  <div className={`text-sm font-black mb-4 flex justify-between items-center ${isCurrent ? 'text-emerald-500 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>
                    <span>{month}</span>
                    <span className="text-[10px] font-bold opacity-50">{acts.length} tasks</span>
                  </div>
                  
                  <div className="space-y-2.5">
                    {hasActivity ? acts.map((act, i) => {
                      const cls = COLOR_CLASSES[act.type];
                      return (
                        <div key={i} className={`relative overflow-hidden ${cls.bg} ${cls.text} text-[11px] font-bold px-3 py-2.5 rounded-xl shadow-md ${cls.shadow} leading-tight hover:brightness-110 transition cursor-default group`}>
                          <div className="absolute right-0 top-0 bottom-0 w-8 bg-white/10 -skew-x-12 translate-x-10 group-hover:-translate-x-32 transition-transform duration-700 ease-in-out"></div>
                          {act.label}
                        </div>
                      );
                    }) : (
                      <div className="flex items-center justify-center h-12 text-[10px] text-gray-400 dark:text-gray-600 font-bold border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                        Dormant
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
