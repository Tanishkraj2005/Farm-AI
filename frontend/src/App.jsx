import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ApiKeyProvider } from './context/ApiKeyContext';
import { FarmerProfileProvider } from './context/FarmerProfileContext';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';

export default function App() {
  return (
    <AuthProvider>
      <FarmerProfileProvider>
        <ApiKeyProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/dashboard/*" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
            </Routes>
          </BrowserRouter>
        </ApiKeyProvider>
      </FarmerProfileProvider>
    </AuthProvider>
  );
}
