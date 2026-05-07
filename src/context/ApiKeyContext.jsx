import { createContext, useContext, useState, useEffect } from 'react';

const DEFAULT_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyB7GB4DYmgbnaut6kVMecJ3DsnUuQ1pKsM';

const ApiKeyContext = createContext(null);

export function ApiKeyProvider({ children }) {

  const [apiKey, setApiKey]       = useState(DEFAULT_API_KEY);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {

    const userKey = localStorage.getItem('farmAI_geminiKey');
    if (userKey && userKey.trim().length > 20) {
      setApiKey(userKey.trim());
    }

    setShowModal(false);
  }, []);

  const saveKey = (key) => {
    const trimmed = key.trim();
    localStorage.setItem('farmAI_geminiKey', trimmed);
    setApiKey(trimmed);
    setShowModal(false);
  };

  const clearKey = () => {
    localStorage.removeItem('farmAI_geminiKey');

    setApiKey(DEFAULT_API_KEY);
    setShowModal(false);
  };

  return (
    <ApiKeyContext.Provider value={{ apiKey, showModal, setShowModal, saveKey, clearKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey() {
  return useContext(ApiKeyContext);
}
