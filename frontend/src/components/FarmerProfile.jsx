import { useState, useEffect } from 'react';
import { useFarmerProfile } from '../context/FarmerProfileContext';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const STATES_LIST = ['Andhra Pradesh','Assam','Bihar','Chhattisgarh','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal'];
const CROPS_LIST = ['Wheat','Rice','Cotton','Sugarcane','Maize','Mustard','Gram','Groundnut','Soybean','Onion','Potato','Tomato'];

export default function FarmerProfile() {
  const { profile, setProfile } = useFarmerProfile();
  const { user } = useAuth();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...profile });
  const [saved, setSaved] = useState(false);

  useEffect(() => {

    setForm({
      ...profile,

      email: profile.email || user?.email || '',
      name: profile.name || user?.displayName || '',
    });

    if (user && Object.keys(profile).length > 0 && !profile.name) {
      setEditing(true);
    }
  }, [profile, user]);

  const set = field => e => setForm(p => ({ ...p, [field]: e.target.value }));
  
  const inputTheme = "w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 rounded-2xl focus:border-green-500 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all font-bold text-gray-800 dark:text-gray-100 placeholder-gray-400";
  const labelTheme = "block text-xs font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest ml-1";

  async function save() {
    setProfile(form);

    if (user?.uid) {
      try {
        await setDoc(doc(db, 'users', user.uid), form, { merge: true });
      } catch (e) {
        console.error("Failed writing to Firestore", e);
      }
    }
    
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <section id="profile" className="py-20 min-h-[80vh] flex flex-col justify-center relative">

      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 dark:bg-green-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full">
        
        <div className="text-center mb-10">
           <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
             Agronomic <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-400">Profile</span>
           </h2>
           <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-medium text-lg">
             Calibrate your regional coordinates and crop type. The AI engine uses this data to parameterize weather alerts and market logic.
           </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-800 overflow-hidden backdrop-blur-xl">

          <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-8 lg:px-12 py-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
            
            <div className="w-24 h-24 rounded-[2rem] bg-white/20 backdrop-blur-md flex items-center justify-center text-5xl border-2 border-white/40 flex-shrink-0 shadow-lg relative z-10 transform -rotate-3 hover:rotate-0 transition-transform">
              🧑‍🌾
            </div>
            
            <div className="text-center sm:text-left relative z-10 flex-1">
              <h3 className="text-white font-black text-3xl sm:text-4xl tracking-tight mb-1">
                {form.name || user?.displayName || 'Farmer Identity'}
              </h3>
              <p className="text-white/80 font-bold text-sm uppercase tracking-widest flex items-center justify-center sm:justify-start gap-2">
                <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
                {profile.state || 'Region Unauthorized'} • {profile.primaryCrop || 'Crop Unspecified'}
              </p>
            </div>
            
            <button onClick={() => { setForm({ ...profile, email: profile.email || user?.email || '', name: profile.name || user?.displayName || '' }); setEditing(!editing); }}
              className="relative z-10 w-full sm:w-auto bg-white/20 hover:bg-white/30 text-white font-bold px-6 py-3 rounded-2xl transition cursor-pointer text-sm shadow-sm backdrop-blur-md border border-white/10 uppercase tracking-widest">
              {editing ? '✕ Cancel Edit' : '⚙️ Configure Parameters'}
            </button>
          </div>

          {editing ? (
            <div className="p-8 lg:p-12 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className={labelTheme}>Legal Identity</label>
                  <input value={form.name || ''} onChange={set('name')} placeholder="e.g. Ramesh Kumar" className={inputTheme} />
                </div>
                <div>
                  <label className={labelTheme}>Phone Contact</label>
                  <input type="tel" value={form.phone || ''} onChange={set('phone')} placeholder="+91..." className={inputTheme} />
                </div>
                <div>
                  <label className={labelTheme}>Email ID</label>
                  <input type="email" value={form.email || user?.email || ''} onChange={set('email')} placeholder="Secure Email" className={inputTheme} disabled={!!user?.email} />
                </div>
                <div>
                  <label className={labelTheme}>Pincode</label>
                  <input value={form.pincode || ''} onChange={set('pincode')} placeholder="000111" className={inputTheme} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelTheme}>Full Local Address</label>
                  <input value={form.address || ''} onChange={set('address')} placeholder="Village/Street Data" className={inputTheme} />
                </div>

                <div>
                  <label className={labelTheme}>Geographic State Node (India)</label>
                  <select value={form.state} onChange={set('state')} className={inputTheme + ' cursor-pointer border-r-[1rem] border-r-transparent'}>
                    <option value="">-- Initialize Locality --</option>
                    {STATES_LIST.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelTheme}>Primary Base Crop</label>
                  <select value={form.primaryCrop} onChange={set('primaryCrop')} className={inputTheme + ' cursor-pointer border-r-[1rem] border-r-transparent'}>
                    <option value="">-- Designate Asset --</option>
                    {CROPS_LIST.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelTheme}>Logistical Land Scale</label>
                  <div className="flex gap-3">
                    <input type="number" min="0" step="0.1" value={form.landSize || ''} onChange={set('landSize')} placeholder="e.g. 4.5" className={`${inputTheme} w-2/3`} />
                    <select value={form.unit || 'acres'} onChange={set('unit')} className={`${inputTheme} w-1/3 px-3 cursor-pointer border-r-8 border-r-transparent text-sm`}>
                      <option value="acres">Acres</option><option value="hectares">Hectares</option><option value="bigha">Bigha</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800">
                <button onClick={save}
                  className={`w-full font-black py-5 rounded-2xl transition-all text-lg cursor-pointer flex items-center justify-center gap-3 shadow-xl transform hover:-translate-y-1 outline-none
                  ${saved ? 'bg-green-600 text-white shadow-green-500/40' : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-gray-900/20'}`}>
                  {saved ? '✅ Configuration Synced Successfully!' : 'Synchronize Profile Parameters'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 lg:p-12 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: '🆔', label: 'Identity Node', val: profile.name || user?.displayName || 'Unset' },
                  { icon: '📞', label: 'Comm Link', val: profile.phone || 'Unset' },
                  { icon: '📧', label: 'Secure Mail', val: profile.email || user?.email || 'Unset' },
                  { icon: '🏠', label: 'Local Base', val: profile.address || 'Unset' },
                  { icon: '📍', label: 'Geo-Region', val: profile.state || 'Unset' },
                  { icon: '🌱', label: 'Asset Tracker', val: profile.primaryCrop || 'Unset' },
                  { icon: '📐', label: 'Logistics Range', val: profile.landSize ? `${profile.landSize} ${profile.unit}` : 'Unset' },
                  { icon: '📮', label: 'Area Code', val: profile.pincode || 'Unset' },
                ].map((s, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-6 text-center border border-gray-100 dark:border-gray-800 shadow-sm hover:-translate-y-1 transition-transform">
                    <div className="text-4xl mb-4 opacity-80">{s.icon}</div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-1.5">{s.label}</div>
                    <div className="font-black text-gray-900 dark:text-white text-base lg:text-lg overflow-hidden text-ellipsis whitespace-nowrap">{s.val}</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 p-6 bg-green-50 dark:bg-green-900/10 rounded-3xl border border-green-100 dark:border-green-900/30 flex items-start gap-4">
                <span className="text-3xl text-green-500 animate-pulse">💡</span>
                <div>
                   <p className="text-base text-green-800 dark:text-green-400 font-bold mb-1">Architecture Note</p>
                   <p className="text-sm text-green-700/70 dark:text-green-400/70 font-medium leading-relaxed">
                     Your profile acts as the core memory state for the AI Chatbot and Crop Simulator. If you experience anomalous market readings, assure your Geographic State is configured correctly above.
                   </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
