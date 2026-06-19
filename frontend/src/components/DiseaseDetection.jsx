import { useState, useRef } from 'react';
import { useApiKey } from '../context/ApiKeyContext';
import { useFarmerProfile } from '../context/FarmerProfileContext';

export default function DiseaseDetection() {
  const { apiKey } = useApiKey();
  const { addToast } = useFarmerProfile();
  const [image, setImage]     = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [useCamera, setUseCamera] = useState(false);
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const streamRef  = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); setResult(null); }
  }

  async function startCamera() {
    setUseCamera(true);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      addToast('Camera access denied. Please allow camera permissions.', 'error');
      setUseCamera(false);
    }
  }

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      const file = new File([blob], 'camera_capture.jpg', { type: 'image/jpeg' });
      setImage(file);
      setPreview(canvas.toDataURL('image/jpeg'));
      stopCamera();
    }, 'image/jpeg', 0.9);
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setUseCamera(false);
  }

  function reset() { setImage(null); setPreview(''); setResult(null); stopCamera(); }

  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onloadend = async () => {
        if (!apiKey) { addToast('Please add API key for AI analysis', 'warning'); setLoading(false); return; }
        const base64Data = reader.result.split(',')[1];
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [
              { text: 'You are an expert plant pathologist. Analyze this image of a plant/crop leaf. Identify the crop, disease or pest issue, state the severity (Low/Medium/High/Critical), and provide 3 concrete actionable remedies (chemical and organic). Format strictly as JSON with keys: crop, disease, severity, remedies (array of strings).' },
              { inlineData: { mimeType: image.type, data: base64Data } }
            ]}],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) { setResult(JSON.parse(jsonText)); addToast('Disease analysis complete! 🌿', 'success'); }
        else throw new Error('Could not analyze the image.');
        setLoading(false);
      };
    } catch (err) {
      addToast('Error: ' + err.message, 'error');
      setLoading(false);
    }
  };

  const SEV_COLOR = { Low: 'text-green-600 bg-green-50', Medium: 'text-amber-600 bg-amber-50', High: 'text-orange-600 bg-orange-50', Critical: 'text-red-600 bg-red-50' };

  return (
    <section id="disease" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-farm-green dark:text-green-400 mb-3">
          🌿 AI Disease Detection
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-12 max-w-xl mx-auto">
          Upload a photo or use your camera to capture crop leaves. AI instantly diagnoses and prescribes remedies.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 flex flex-col">

            <div className="flex gap-2 mb-5">
              <button onClick={() => { stopCamera(); setUseCamera(false); }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer border-2 ${!useCamera ? 'bg-farm-green text-white border-farm-green' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-farm-green'}`}>
                📁 Upload File
              </button>
              <button onClick={startCamera}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer border-2 ${useCamera ? 'bg-farm-green text-white border-farm-green' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-farm-green'}`}>
                📸 Use Camera
              </button>
            </div>

            {useCamera && !preview && (
              <div className="flex-1 flex flex-col items-center gap-4">
                <video ref={videoRef} autoPlay playsInline className="w-full rounded-2xl object-cover" style={{ maxHeight: 260 }} />
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex gap-3 w-full">
                  <button onClick={capturePhoto}
                    className="flex-1 bg-farm-green text-white font-bold py-3 rounded-xl hover:bg-farm-green-dark transition cursor-pointer">
                    📷 Capture Photo
                  </button>
                  <button onClick={stopCamera}
                    className="px-5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-3 rounded-xl hover:bg-gray-300 transition cursor-pointer">
                    ✕
                  </button>
                </div>
              </div>
            )}

            {preview ? (
              <div className="relative w-full flex-1">
                <img src={preview} alt="Crop Leaf" className="w-full h-64 object-cover rounded-xl shadow-sm mb-4" />
                <button onClick={reset}
                  className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 text-red-500 p-2 rounded-full hover:bg-red-50 transition cursor-pointer text-sm">✕</button>
              </div>
            ) : !useCamera && (
              <div className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-10 flex flex-col items-center flex-1">
                <span className="text-5xl mb-4">📸</span>
                <p className="text-gray-500 dark:text-gray-400 mb-4 font-medium text-sm">Upload leaf photo (JPG, PNG)</p>
                <label className="bg-farm-light dark:bg-gray-700 border border-farm-green text-farm-green dark:text-green-400 font-bold py-2 px-6 rounded-xl cursor-pointer hover:bg-farm-green hover:text-white transition-all">
                  Browse Files
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
            )}

            <button onClick={analyzeImage} disabled={!image || loading}
              className="mt-6 w-full bg-gradient-to-r from-farm-green to-farm-green-light text-white font-bold py-3.5 rounded-xl shadow-green hover:shadow-green-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 cursor-pointer flex items-center justify-center gap-2">
              {loading ? <><span className="loading-dot bg-white" /> Analyzing...</> : '🔍 Auto-Detect Disease'}
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-farm-green/10 dark:border-gray-700 min-h-[400px] flex flex-col justify-center">
            {!result && !loading && (
              <div className="text-center text-gray-400 dark:text-gray-500">
                <p className="text-5xl mb-3">🩺</p>
                <p className="font-medium">Analysis results will appear here</p>
                <p className="text-xs mt-1">Upload or capture an image and hit detect</p>
              </div>
            )}
            {loading && (
              <div className="text-center text-farm-green animate-pulse">
                <p className="text-4xl mb-3">⏱️</p>
                <p className="font-bold dark:text-green-400">AI is examining your crop...</p>
              </div>
            )}
            {result && !loading && (
              <div className="space-y-5 animate-float-in">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-3">
                  <div className="w-12 h-12 bg-farm-light dark:bg-gray-800 rounded-full flex items-center justify-center text-2xl">🌱</div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Detected Crop</p>
                    <p className="text-lg font-black text-gray-800 dark:text-white">{result.crop || 'Unknown Crop'}</p>
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-4">
                  <p className="text-xs text-red-500 font-bold uppercase tracking-wider mb-1">Diagnosis</p>
                  <p className="text-xl font-bold text-red-700 dark:text-red-400">{result.disease}</p>
                  <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mt-2 ${SEV_COLOR[result.severity] || 'text-gray-600 bg-gray-100'}`}>
                    Severity: {result.severity}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                    <span>💊</span> Recommended Treatments
                  </p>
                  <ul className="space-y-2">
                    {result.remedies?.map((rem, i) => (
                      <li key={i} className="bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg text-sm text-gray-700 dark:text-gray-300 font-medium flex items-start gap-3 border border-gray-100 dark:border-gray-700">
                        <span className="text-farm-green mt-0.5">✓</span> {rem}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
