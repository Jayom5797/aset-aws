import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import ForgotPassword from './ForgotPassword';
import PasswordInput from './PasswordInput';

const Login = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const { login } = useAuth();

  if (showForgot) return <ForgotPassword onBack={() => setShowForgot(false)} />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.login(email, password);
      if (response.success) {
        login(response.token, response.user);
      } else {
        setError(response.error || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login to ASET</h2>
        <p className="auth-subtitle">Access your research history</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com" />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 12 }}>
          <button onClick={() => setShowForgot(true)} className="link-button" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Forgot password?
          </button>
        </p>
        
        <p className="auth-switch">
          Don't have an account?{' '}
          <button onClick={onSwitchToRegister} className="link-button">Register</button>
        </p>
      </div>
    </div>
  );
};

export default Login;
