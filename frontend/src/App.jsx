import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import AddRecipe from './pages/AddRecipe';
import Orders from './pages/Orders';
import Register from './pages/Register';
import EditRecipe from './pages/EditRecipe';
import Stats from './pages/Stats';

export const UserContext = React.createContext();
export const ToastContext = React.createContext();

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      import('./api').then(({ getMe }) => {
        getMe().then(res => { setUser(res.data); setLoading(false); })
          .catch(() => { localStorage.removeItem('token'); setLoading(false); });
      });
    } else setLoading(false);
  }, []);

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
    showToast('已退出');
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><p style={{ color: '#7f8c8d' }}>加载中...</p></div>;

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      <ToastContext.Provider value={showToast}>
        {toast && <div className={'toast' + (toast.type === 'error' ? ' error' : '')}>{toast.msg}</div>}
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
          <Route path="/" element={<ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>} />
          <Route path="/recipes" element={<ProtectedRoute><Layout><Recipes /></Layout></ProtectedRoute>} />
          <Route path="/recipes/:id" element={<ProtectedRoute><Layout><RecipeDetail /></Layout></ProtectedRoute>} />
          <Route path="/add" element={<ProtectedRoute><Layout><AddRecipe /></Layout></ProtectedRoute>} />
          <Route path="/edit/:id" element={<ProtectedRoute><Layout><EditRecipe /></Layout></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Layout><Orders /></Layout></ProtectedRoute>} />
          <Route path="/stats" element={<ProtectedRoute><Layout><Stats /></Layout></ProtectedRoute>} />
        </Routes>
      </ToastContext.Provider>
    </UserContext.Provider>
  );
}
