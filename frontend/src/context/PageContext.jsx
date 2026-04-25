import { createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PageContext = createContext(null);

export function PageProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname.replace('/dashboard', '').replace(/^\/+|\/+$/g, '');
  const activePage = path || 'home';

  const setActivePage = (page) => {
    if (page === 'home') {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard/${page}`);
    }
  };

  return (
    <PageContext.Provider value={{ activePage, setActivePage }}>
      {children}
    </PageContext.Provider>
  );
}

export function usePage() {
  return useContext(PageContext);
}
