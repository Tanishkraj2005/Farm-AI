import { useFarmerProfile } from '../context/FarmerProfileContext';

const ICONS = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
const BG = {
  success: 'bg-green-600',
  error:   'bg-red-600',
  info:    'bg-blue-600',
  warning: 'bg-amber-500',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useFarmerProfile();
  if (!toasts.length) return null;

  return (
    <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`${BG[t.type] || BG.info} text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 pointer-events-auto animate-float-in`}
          style={{ animation: 'floatIn 0.3s ease' }}>
          <span className="text-xl flex-shrink-0">{ICONS[t.type] || ICONS.info}</span>
          <span className="text-sm font-semibold flex-1 leading-snug">{t.message}</span>
          <button onClick={() => removeToast(t.id)}
            className="text-white/70 hover:text-white ml-2 cursor-pointer font-bold text-lg leading-none flex-shrink-0">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
