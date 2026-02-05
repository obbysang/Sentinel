import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import LandingPage from './pages/LandingPage';
import LiveFeedPage from './pages/LiveFeed';
import VideoAnalysis from './pages/VideoAnalysis';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { Link } from 'react-router-dom';

const App = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={
        <LandingPage onEnter={() => navigate(user ? '/dashboard' : '/login')} />
      } />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={
            <div className="relative">
                <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
                    <Link to="/analysis" className="text-sm font-medium text-slate-400 hover:text-white transition">Video Analysis</Link>
                    <Link to="/profile" className="flex items-center space-x-2 bg-zinc-900/80 px-4 py-2 rounded-full border border-zinc-700 text-white hover:bg-zinc-800 transition">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-sm font-medium">{user?.username}</span>
                    </Link>
                </div>
                <LiveFeedPage onBack={() => navigate('/')} />
            </div>
        } />
        <Route path="/analysis" element={
            <div className="relative h-screen bg-sentinel-bg">
                <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
                    <Link to="/dashboard" className="text-sm font-medium text-slate-400 hover:text-white transition">Dashboard</Link>
                    <Link to="/profile" className="flex items-center space-x-2 bg-zinc-900/80 px-4 py-2 rounded-full border border-zinc-700 text-white hover:bg-zinc-800 transition">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-sm font-medium">{user?.username}</span>
                    </Link>
                </div>
                <VideoAnalysis />
            </div>
        } />
        <Route path="/profile" element={<Profile />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
