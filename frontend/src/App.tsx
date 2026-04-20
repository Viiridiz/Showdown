import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import TeamView from './pages/TeamView';
import Dashboard from './pages/Dashboard'; 

export default function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        
        <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        
       <Route path="/team/:id" element={isAuthenticated ? <TeamView /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}