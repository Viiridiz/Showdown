import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.data.token);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '20px' }}>
      <div style={{ 
        width: '100%', maxWidth: '420px', backgroundColor: '#fff', 
        padding: '40px 30px', borderRadius: '12px', 
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)', border: '1px solid #eaeaea',
        textAlign: 'center' 
      }}>
        
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ color: 'var(--poke-red)', margin: '0 0 10px 0', fontSize: '2.2rem' }}>Welcome Back</h1>
          <p style={{ color: '#666', margin: 0 }}>Login to manage your Showdown teams.</p>
        </div>
        
        {error && (
          <div style={{ backgroundColor: '#ffebee', color: 'var(--poke-red)', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', border: '1px solid #ffcdd2' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--poke-gray)', fontSize: '1rem', backgroundColor: '#f8f9fa' }}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--poke-gray)', fontSize: '1rem', backgroundColor: '#f8f9fa' }}
          />
          <button type="submit" style={{ padding: '14px', fontSize: '1.1rem', borderRadius: '8px', marginTop: '10px' }}>
            Login
          </button>
        </form>
        
        <p style={{ marginTop: '25px', color: '#666', fontSize: '0.95rem' }}>
          No account? <Link to="/register" style={{ color: 'var(--poke-red)', fontWeight: 'bold', textDecoration: 'none' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}