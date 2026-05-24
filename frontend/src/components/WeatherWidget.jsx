import { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend, Filler, BarElement } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, ChartTooltip, Legend, Filler);

const WMO_CODES = {
  0: { label: 'Clear Sky', icon: '☀️', color: 'text-yellow-400' },
  1: { label: 'Mainly Clear', icon: '🌤️', color: 'text-yellow-300' },
  2: { label: 'Partly Cloudy', icon: '⛅', color: 'text-gray-300' },
  3: { label: 'Overcast', icon: '☁️', color: 'text-gray-400' },
  45: { label: 'Foggy', icon: '🌫️', color: 'text-gray-300' },
  48: { label: 'Icy Fog', icon: '🌫️', color: 'text-gray-200' },
  51: { label: 'Light Drizzle', icon: '🌦️', color: 'text-blue-300' },
  61: { label: 'Slight Rain', icon: '🌧️', color: 'text-blue-400' },
  63: { label: 'Moderate Rain', icon: '🌧️', color: 'text-blue-500' },
  65: { label: 'Heavy Rain', icon: '⛈️', color: 'text-blue-600' },
  71: { label: 'Slight Snow', icon: '❄️', color: 'text-sky-200' },
  80: { label: 'Rain Shower', icon: '🌦️', color: 'text-blue-400' },
  95: { label: 'Thunderstorm', icon: '⛈️', color: 'text-purple-500' },
};

async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation&hourly=temperature_2m,precipitation_probability,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&forecast_days=7&timezone=auto`;
  const res = await fetch(url);
  return res.json();
}

async function fetchCityName(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const res = await fetch(url);
    const d = await res.json();
    return d.address?.city || d.address?.town || d.address?.village || d.address?.county || 'Your Location';
  } catch { return 'Your Farm'; }
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function generateAdvisory(current) {
  const tips = [];
  const temp = current.temperature_2m;
  const wind = current.wind_speed_10m;
  const rain = current.precipitation;
  const hum = current.relative_humidity_2m;

  if (rain > 5) {
    tips.push({ type: 'danger', icon: '🚫', title: 'Halt Spraying', desc: 'Heavy rain detected. Any pesticide or fertilizer applied will wash away immediately.' });
    tips.push({ type: 'warning', icon: '⛏️', title: 'Drainage Check', desc: 'Ensure field drainage channels are clear to prevent waterlogging roots.' });
  } else if (rain > 0) {
    tips.push({ type: 'info', icon: '💧', title: 'Rainfed Saving', desc: 'Light rain is occurring. You can delay your scheduled irrigation by 1 day.' });
  }

  if (temp > 35) {
    tips.push({ type: 'warning', icon: '🔥', title: 'Heat Stress Risk', desc: 'Extreme temperatures can cause flower drop. Apply light, frequent irrigation during early morning.' });
  } else if (temp < 10) {
    tips.push({ type: 'warning', icon: '❄️', title: 'Frost Alert', desc: 'Low temperatures risk frost damage. Lightly irrigate fields overnight to keep soil warm.' });
  }

  if (wind > 20) {
    tips.push({ type: 'danger', icon: '💨', title: 'High Winds', desc: 'Do NOT spray chemicals; wind drift will cause uneven spread. Secure polyhouse nets.' });
  }

  if (hum > 85 && temp > 20 && rain === 0) {
    tips.push({ type: 'warning', icon: '🍄', title: 'Fungal Risk', desc: 'High humidity + warm temp is ideal for fungal diseases (rust/blight). Prepare a preventative Mancozeb spray.' });
  }

  if (tips.length === 0) {
    tips.push({ type: 'success', icon: '✅', title: 'Ideal Conditions', desc: 'Weather is perfect for standard field operations, sowing, or pesticide application.' });
  }

  return tips;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [city, setCity]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [manualCity, setManualCity] = useState('');

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  async function getByGeolocation() {
    setLoading(true); setError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lon } = pos.coords;
          const [data, name] = await Promise.all([fetchWeather(lat, lon), fetchCityName(lat, lon)]);
          if (isMounted.current) {
            setWeather(data);
            setCity(name);
          }
        } catch { if (isMounted.current) setError('Failed to fetch weather data from API.'); }
        if (isMounted.current) setLoading(false);
      },
      () => { 
        if (isMounted.current) {
          setError('Location access denied. Please enter your city manually.'); 
          setLoading(false); 
        }
      }
    );
  }

  async function searchCity() {
    if (!manualCity.trim()) return;
    setLoading(true); setError('');
    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualCity)}&format=json&limit=1`);
      const geoData = await geoRes.json();
      if (!geoData.length) { setError(`City "${manualCity}" not found. Try a nearby major town.`); setLoading(false); return; }
      const { lat, lon, display_name } = geoData[0];
      const data = await fetchWeather(lat, lon);
      setWeather(data);
      setCity(display_name.split(',')[0]);
    } catch { setError('Network error determining location.'); }
    setLoading(false);
  }

  useEffect(() => { getByGeolocation(); }, []);

  const currentWmo = weather ? (WMO_CODES[weather.current.weather_code] || { label: 'Unknown', icon: '🌡️', color: 'text-white' }) : null;
  const advisories = weather ? generateAdvisory(weather.current) : [];

  let chartData;
  if (weather) {

    const nowISO = new Date().toISOString().slice(0, 14) + '00';
    let startIndex = weather.hourly.time.findIndex(t => t >= nowISO);
    if (startIndex === -1) startIndex = 0;
    
    const sliceEnd = startIndex + 24;
    const hours = weather.hourly.time.slice(startIndex, sliceEnd).map(t => new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }));
    const temps = weather.hourly.temperature_2m.slice(startIndex, sliceEnd);
    const rainProb = weather.hourly.precipitation_probability.slice(startIndex, sliceEnd);

    chartData = {
      labels: hours,
      datasets: [
        {
          type: 'line',
          label: 'Temperature (°C)',
          data: temps,
          borderColor: 'rgba(251, 191, 36, 1)', // Amber
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          yAxisID: 'y',
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 6,
        },
        {
          type: 'bar',
          label: 'Rain Probability (%)',
          data: rainProb,
          backgroundColor: 'rgba(59, 130, 246, 0.6)', // Blue
          borderRadius: 4,
          yAxisID: 'y1',
        }
      ]
    };
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', labels: { color: '#9ca3af', font: { family: 'inherit', size: 12 } } },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        cornerRadius: 8,
      }
    },
    scales: {
      x: { grid: { display: false, drawBorder: false }, ticks: { color: '#9ca3af', maxTicksLimit: 8 } },
      y: { 
        type: 'linear', display: true, position: 'left',
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: { color: '#fbbf24', callback: val => val + '°' }
      },
      y1: {
        type: 'linear', display: true, position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { color: '#3b82f6', callback: val => val + '%' },
        min: 0, max: 100,
      }
    }
  };

  return (
    <section id="weather" className="py-20 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-400/10 dark:bg-amber-600/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4 flex items-center justify-center gap-3">
            <span className="text-blue-500">Live</span> Agri-Weather
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Hyper-local forecasts paired with intelligent farming advisories.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-12">
          <div className="relative flex-1 group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">🔍</span>
            <input
              value={manualCity}
              onChange={e => setManualCity(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchCity()}
              placeholder="Enter your village, district, or city..."
              className="w-full pl-12 pr-5 py-3.5 rounded-2xl border-2 border-white dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
            />
          </div>
          <button 
            onClick={searchCity} 
            disabled={loading || !manualCity.trim()}
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            Search
          </button>
          <button 
            onClick={getByGeolocation} 
            title="Auto-detect location" 
            className="w-14 h-14 bg-white dark:bg-gray-800 border-2 border-white dark:border-gray-700 hover:border-blue-500 text-blue-500 rounded-2xl flex items-center justify-center transition-all shadow-sm cursor-pointer ml-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-blue-500 animate-pulse">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-bold text-lg text-gray-600 dark:text-gray-300">Analyzing atmospheric data...</p>
          </div>
        )}
        {error && (
          <div className="max-w-xl mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-2xl flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="font-medium">{error}</p>
          </div>
        )}

        {weather && !loading && (
          <div className="animate-fade-in-up space-y-6">

            <div className="grid lg:grid-cols-3 gap-6">

              <div className="lg:col-span-1 border border-white/20 dark:border-gray-700 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
                
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-blue-200 font-medium mb-4 bg-white/10 w-fit px-3 py-1 rounded-full text-sm">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Live in {city}
                    </div>
                    
                    <div className="flex items-end gap-4 mb-2">
                      <span className="text-6xl filter drop-shadow-lg">{currentWmo.icon}</span>
                      <h3 className="text-6xl font-black tracking-tighter">
                        {Math.round(weather.current.temperature_2m)}<span className="text-4xl text-blue-300">°</span>
                      </h3>
                    </div>
                    <p className="text-xl font-bold text-blue-100">{currentWmo.label}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-8">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 flex items-center gap-3 border border-white/10">
                      <span className="text-2xl text-blue-300">💧</span>
                      <div>
                        <p className="text-[10px] text-blue-200 uppercase font-bold tracking-wider">Humidity</p>
                        <p className="font-bold text-lg">{weather.current.relative_humidity_2m}%</p>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 flex items-center gap-3 border border-white/10">
                      <span className="text-2xl text-blue-300">💨</span>
                      <div>
                        <p className="text-[10px] text-blue-200 uppercase font-bold tracking-wider">Wind</p>
                        <p className="font-bold text-lg">{Math.round(weather.current.wind_speed_10m)} <span className="text-xs">km/h</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="w-10 h-10 rounded-full bg-farm-green/10 flex items-center justify-center text-xl">
                    🤖
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">FarmAI Situation Advisory</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Contextual actions based on exact parameters</p>
                  </div>
                </div>

                <div className="flex-1 grid sm:grid-cols-2 gap-4">
                  {advisories.map((adv, idx) => (
                    <div 
                      key={idx} 
                      className={`rounded-2xl p-4 border-l-4 transition-all hover:-translate-y-1 hover:shadow-md
                        ${adv.type === 'danger' ? 'bg-red-50 dark:bg-red-900/10 border-red-500 text-red-900 dark:text-red-100' : ''}
                        ${adv.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-500 text-amber-900 dark:text-amber-100' : ''}
                        ${adv.type === 'info' ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-500 text-blue-900 dark:text-blue-100' : ''}
                        ${adv.type === 'success' ? 'bg-green-50 dark:bg-green-900/10 border-green-500 text-green-900 dark:text-green-100' : ''}
                      `}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{adv.icon}</span>
                        <h4 className="font-bold text-sm">{adv.title}</h4>
                      </div>
                      <p className="text-sm opacity-80 leading-relaxed text-balance">
                        {adv.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                📈 24-Hour Operations Window
                <span className="text-xs font-normal text-gray-500 ml-auto hidden sm:block">Plan harvest or chemical application</span>
              </h3>
              <div className="h-72 w-full">
                <Line options={chartOptions} data={chartData} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-100 dark:border-gray-700">
               <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">🗓️ Weekly Outlook</h3>
               
               <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
                {weather.daily.time.map((date, i) => {
                  const dWmo = WMO_CODES[weather.daily.weather_code[i]] || { icon: '🌡️', label: '' };
                  const isToday = i === 0;
                  const d = new Date(date);
                  return (
                    <div 
                      key={date} 
                      className={`group flex flex-col items-center p-3 sm:p-4 rounded-2xl transition-all border
                        ${isToday 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm' 
                          : 'bg-transparent border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-750'
                        }
                      `}
                    >
                      <p className={`text-sm font-bold mb-3 ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {isToday ? 'Today' : DAYS[d.getDay()]}
                      </p>
                      
                      <p className="text-3xl mb-3 group-hover:scale-110 transition-transform select-none">
                        {dWmo.icon}
                      </p>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-black text-gray-900 dark:text-white">{Math.round(weather.daily.temperature_2m_max[i])}°</span>
                        <span className="text-xs font-medium text-gray-400">{Math.round(weather.daily.temperature_2m_min[i])}°</span>
                      </div>
                      
                      <div className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center justify-center w-full gap-1
                         ${weather.daily.precipitation_sum[i] > 0 
                           ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' 
                           : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                         }
                      `}>
                        💧 {weather.daily.precipitation_sum[i]} <span className="hidden sm:inline">mm</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </div>
    </section>
  );
}
