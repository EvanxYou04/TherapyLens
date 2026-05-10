import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import UploadPage from './pages/UploadPage';
import SessionListPage from './pages/SessionListPage';
import SessionDetailPage from './pages/SessionDetailPage';

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RequireAuth><Layout><UploadPage /></Layout></RequireAuth>} />
          <Route path="/sessions" element={<RequireAuth><Layout><SessionListPage /></Layout></RequireAuth>} />
          <Route path="/sessions/:id" element={<RequireAuth><Layout><SessionDetailPage /></Layout></RequireAuth>} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
