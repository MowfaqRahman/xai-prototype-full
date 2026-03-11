import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <div className="fade-in" style={{ maxWidth: '450px', margin: '4rem auto' }}>
            <div className="glass-card">
                <div className="card-title" style={{ justifyContent: 'center', fontSize: '1.5rem', borderBottom: 'none' }}>
                    <i className="ri-shield-keyhole-line"></i> Officer Portal
                </div>
                
                {error && <div style={{ color: '#fca5a5', background: 'rgba(239,68,68,0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--danger)' }}>{error}</div>}

                <form onSubmit={handleEmailLogin}>
                    <div className="input-section">
                        <label className="section-title">Bank Email</label>
                        <input 
                            type="email" 
                            className="glass-input"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-section">
                        <label className="section-title">Password</label>
                        <input 
                            type="password" 
                            className="glass-input"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="primary-btn" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                        {loading ? <><i className="ri-loader-4-line ri-spin"></i> Authenticating...</> : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;