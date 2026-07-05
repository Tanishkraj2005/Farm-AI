import { useState } from 'react';
import { jsPDF } from 'jspdf';

const CROPS = ['Wheat','Rice','Cotton','Sugarcane','Maize','Mustard','Gram','Groundnut','Soybean','Onion','Potato','Tomato','Jute','Tea','Coffee','Other'];

const LOSS_TYPES = [
  { value: 'Heavy Rains', label: 'Heavy/Unseasonal Rains', icon: '🌧️', color: 'blue' },
  { value: 'Drought',     label: 'Drought/Dry Spell',     icon: '☀️', color: 'amber' },
  { value: 'Pest',        label: 'Widespread Pest Attack', icon: '🐛', color: 'red' },
  { value: 'Hailstorm',   label: 'Severe Hailstorm',      icon: '⛈️', color: 'cyan' },
  { value: 'Flood',       label: 'Flooding/Inundation',   icon: '🌊', color: 'cyan' },
  { value: 'Fire',        label: 'Crop Fire (Lightning)', icon: '🔥', color: 'orange' },
];

export default function Insurance() {
  const [form, setForm] = useState({ name: '', phone: '', policy: '', date: '', crop: 'Wheat', area: '', type: 'Heavy Rains' });
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  function generateOfficialPDF() {
    if (!form.name.trim() || !form.policy.trim() || !form.phone.trim()) {
      alert('Please complete the Farmer Name, Phone Number, and Policy Number fields to generate an official document.');
      return;
    }

    setGenerating(true);
    setTimeout(() => {
      const doc = new jsPDF('p', 'mm', 'a4');

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;

      doc.setFillColor(34, 197, 94); // Farm Green
      doc.rect(0, 0, pageWidth, 45, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('PMFBY CLAIM INTIMATION FORM', pageWidth / 2, 22, { align: 'center' });
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text('Pradhan Mantri Fasal Bima Yojana (Crop Insurance)', pageWidth / 2, 30, { align: 'center' });

      doc.setFontSize(8);
      const timeStamp = new Date().toLocaleString('en-IN');
      doc.text(`Generated: ${timeStamp}`, pageWidth - margin, 40, { align: 'right' });
      doc.text(`Ref ID: FARM-${Date.now().toString().slice(-6)}`, margin, 40, { align: 'left' });

      let startY = 55;

      const drawSection = (title, items, currentY) => {

        doc.setFillColor(240, 240, 240); // Light gray band
        doc.rect(margin, currentY, pageWidth - (margin*2), 7, 'F');
        doc.setTextColor(34, 197, 94); // Green text
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(title.toUpperCase(), margin + 3, currentY + 5);

        doc.setTextColor(50, 50, 50);
        let y = currentY + 13;
        items.forEach((item, index) => {

          doc.setDrawColor(230, 230, 230);
          doc.line(margin, y + 2, pageWidth - margin, y + 2);
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text(`${item.label}:`, margin + 3, y);
          
          doc.setFont('helvetica', 'normal');
          doc.text(item.value || 'N/A', margin + 65, y);
          y += 9; // Reduced spacing between items
        });
        return y + 3; // Reduced spacing between sections
      };

      startY = drawSection('1. Beneficiary Profile', [
        { label: 'Farmer Full Name', value: form.name.toUpperCase() },
        { label: 'Registered Mobile No.', value: form.phone },
        { label: 'PMFBY Policy Number', value: form.policy.toUpperCase() }
      ], startY);

      startY = drawSection('2. Insured Asset Details', [
        { label: 'Insured Crop', value: form.crop },
        { label: 'Sown Area Affected', value: `${form.area || '_______'} Hectares` }
      ], startY);

      startY = drawSection('3. Incident Declaration', [
        { label: 'Primary Cause of Loss', value: form.type },
        { label: 'Estimated Date of Loss', value: form.date || '_______' },
        { label: 'Time of Intimation', value: 'Within 72 Hours of Incident' }
      ], startY);

      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(200, 200, 200);
      doc.roundedRect(margin, startY, pageWidth - (margin*2), 52, 3, 3, 'FD');
      
      doc.setTextColor(220, 38, 38); // Red
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('MANDATORY SUPPORTING DOCUMENTS CHECKLIST:', margin + 5, startY + 7);
      
      doc.setTextColor(50, 50, 50);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const checklist = [
        '[   ]  Completed & Signed Intimation Form (This annexure)',
        '[   ]  Photocopy of Bank Passbook (Showing IFSC and Account Number)',
        '[   ]  Latest Land Records (Khasra & Khatauni certificates)',
        '[   ]  Proof of Premium Deduction / Bank Receipt of PMFBY',
        `[   ]  Geotagged Photographs of Damaged ${form.crop} Crop (Crucial)`
      ];
      checklist.forEach((text, i) => doc.text(text, margin + 5, startY + 16 + (i * 8)));

      const footerY = startY + 68;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('I hereby declare that the information provided above is true to the best of my knowledge.', margin, footerY);
      doc.text('I understand that false claims are liable for legal action under insurance acts.', margin, footerY + 5);

      doc.setFont('helvetica', 'bold');
      doc.text('Signature / Thumb Impression of Farmer', margin, footerY + 25);
      doc.setDrawColor(50, 50, 50);
      doc.line(margin, footerY + 21, margin + 65, footerY + 21);

      doc.text('Receiving Official Signature', pageWidth - margin - 65, footerY + 25);
      doc.line(pageWidth - margin - 65, footerY + 21, pageWidth - margin, footerY + 21);

      doc.setFillColor(254, 240, 138); // Yellow warning
      doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
      doc.setTextColor(161, 98, 7);
      doc.setFontSize(8);
      doc.text('Kisan Call Centre: 1800-180-1551  •  Claim must be intimated to bank/insurer within 72 hrs of crop loss.', pageWidth / 2, pageHeight - 4, { align: 'center' });

      doc.save(`PMFBY_Claim_${form.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
      
      setGenerating(false);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    }, 1000);
  }

  return (
    <section id="insurance" className="py-24 bg-gray-50 dark:bg-gray-950 relative min-h-screen overflow-hidden">

      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-green-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">

        <div className="text-center mb-16 relative">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold text-sm mb-4 border border-blue-200/50 dark:border-blue-800/50">
            <span className="text-[10px]">🏛️</span> 
            Govt. Authorized Format
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
            PMFBY <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500">Claim Assistant</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Lost your harvest due to extreme weather? Generate a professional, pre-formatted PDF claim intimation document ready for your bank or insurance agent in under 30 seconds.
          </p>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/50 dark:border-gray-700/50 p-6 md:p-10 relative">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

            <div className="md:col-span-7 space-y-8">

              <div className="bg-gray-50/50 dark:bg-gray-900/30 p-6 rounded-3xl border border-gray-100 dark:border-gray-700/50">
                <h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">1. Claimant Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">Farmer Full Name *</label>
                      <input value={form.name} onChange={handleChange('name')} placeholder="e.g. Ramesh Kumar"
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-gray-900 dark:text-white font-medium outline-none transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">Mobile Number *</label>
                      <input type="tel" value={form.phone} onChange={handleChange('phone')} placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-gray-900 dark:text-white font-medium outline-none transition" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">PMFBY Policy Number / Acknowledgment Receipt *</label>
                    <input value={form.policy} onChange={handleChange('policy')} placeholder="e.g. 040101-2023-12-654321"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-gray-900 dark:text-white font-medium outline-none transition uppercase" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50/50 dark:bg-gray-900/30 p-6 rounded-3xl border border-gray-100 dark:border-gray-700/50">
                <h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">2. Agricultural Loss Event</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">Insured Crop</label>
                    <div className="relative">
                      <select value={form.crop} onChange={handleChange('crop')}
                        className="w-full px-4 py-3 appearance-none bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-gray-900 dark:text-white font-bold outline-none transition">
                        {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <div className="absolute right-4 top-4 text-gray-400 pointer-events-none">▼</div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">Affected Area (in Hectares)</label>
                    <input type="number" step="0.1" value={form.area} onChange={handleChange('area')} placeholder="e.g. 1.5"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-gray-900 dark:text-white font-medium outline-none transition" />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 mb-3 flex items-center justify-between">
                    Primary Cause of Loss
                    <span className="text-[10px] bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded">Must be localized calamity</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {LOSS_TYPES.map(lt => {
                      const isActive = form.type === lt.value;
                      return (
                        <label key={lt.value}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                            isActive 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-sm' 
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}>
                          <input type="radio" value={lt.value} checked={isActive} onChange={handleChange('type')} className="hidden" />
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-green-500' : 'border-gray-300 dark:border-gray-600'}`}>
                            {isActive && <div className="w-2 h-2 rounded-full bg-green-500" />}
                          </div>
                          <span className="text-xl filter drop-shadow-sm">{lt.icon}</span>
                          <span className={`text-xs font-bold ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{lt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">Estimated Date of Incident</label>
                  <input type="date" value={form.date} onChange={handleChange('date')}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-gray-900 dark:text-white font-medium outline-none transition" />
                  <p className="text-[10px] text-red-500 mt-2 font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    CRITICAL: Claims must be submitted within 72 hours of this date!
                  </p>
                </div>
              </div>

            </div>

            <div className="md:col-span-5 h-full flex flex-col justify-center">
              
              <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden group">
                
                <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 text-white/10 text-9xl pointer-events-none transform group-hover:scale-110 transition-transform duration-700">📄</div>
                
                <h3 className="text-2xl font-black mb-4 relative z-10">Export Official Claim Document</h3>
                <p className="text-sm text-green-50 mb-8 max-w-sm relative z-10 leading-relaxed">
                  Your details will be compiled into an official printable A4 document. Print this PDF and physically attach the required photos and passbooks before visiting your bank.
                </p>

                <button onClick={generateOfficialPDF} disabled={generating || done}
                  className={`w-full relative z-10 shadow-lg font-black uppercase text-sm tracking-widest py-4 rounded-xl transition-all transform hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)] cursor-pointer
                    ${done ? 'bg-white text-green-600' : 'bg-gray-900 text-white hover:bg-black'}
                    ${generating ? 'animate-pulse cursor-wait opacity-80' : ''}
                  `}>
                  {done ? '✅ PDF Downloaded' : generating ? 'Encoding PDF...' : '📄 Generate Print PDF'}
                </button>
                
                <div className="mt-6 pt-5 border-t border-white/20 relative z-10 flex items-center justify-between text-xs font-bold text-green-100">
                  <span>Privacy Secured</span>
                  <span>Direct Browser Processing</span>
                </div>
              </div>

              <div className="mt-8 bg-white/50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 p-5 rounded-2xl">
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Toll-Free Kisan Help Desk
                </h4>
                <p className="text-2xl font-black text-gray-900 dark:text-white mb-1">1800-180-1551</p>
                <p className="text-xs text-gray-400">Call immediately to register initial intimation parameter.</p>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
