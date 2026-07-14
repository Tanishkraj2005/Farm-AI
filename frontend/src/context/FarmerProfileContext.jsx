import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const FarmerProfileContext = createContext(null);

export const DEFAULT_PROFILE = {
  name: '', state: '', primaryCrop: 'Wheat', landSize: '', unit: 'acres',
  phone: '', email: '', address: '', pincode: '',
};

export function FarmerProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('farmAI_profile')) || DEFAULT_PROFILE; }
    catch { return DEFAULT_PROFILE; }
  });

  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('farmAI_darkMode') === 'true'; }
    catch { return false; }
  });

  const [toasts, setToasts] = useState([]);

  const authoredUidRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {

        authoredUidRef.current = null;
        setProfile(DEFAULT_PROFILE);
        localStorage.removeItem('farmAI_profile');
        return;
      }

      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (authoredUidRef.current === user.uid) return;

        if (docSnap.exists()) {

          const firestoreData = docSnap.data();
          setProfile({
            ...DEFAULT_PROFILE,
            ...firestoreData,
            name: firestoreData.name || user.displayName || '',
            email: firestoreData.email || user.email || '',
          });
        } else {

          setProfile(prev => {
            if (prev.name && prev.name !== '') {

              return { ...prev, email: prev.email || user.email || '' };
            }

            return {
              ...DEFAULT_PROFILE,
              name: user.displayName || '',
              email: user.email || '',
            };
          });
        }
      } catch (e) {
        console.error('FarmerProfileContext: Firestore sync failed', e);
        setProfile(prev => ({
          ...DEFAULT_PROFILE,
          ...prev,
          name: prev.name || user.displayName || '',
          email: prev.email || user.email || '',
        }));
      }
    });

    return unsubscribe;
  }, []);

  function setProfileAndLock(newProfile) {
    const currentUser = auth.currentUser;
    if (currentUser) authoredUidRef.current = currentUser.uid;
    setProfile(newProfile);
  }

  useEffect(() => {
    localStorage.setItem('farmAI_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('farmAI_darkMode', darkMode);
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  function addToast(message, type = 'info') {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }

  function removeToast(id) {
    setToasts(t => t.filter(x => x.id !== id));
  }

  return (
    <FarmerProfileContext.Provider value={{
      profile,
      setProfile: setProfileAndLock,
      darkMode, setDarkMode,
      toasts, addToast, removeToast
    }}>
      {children}
    </FarmerProfileContext.Provider>
  );
}

export function useFarmerProfile() {
  return useContext(FarmerProfileContext);
}
