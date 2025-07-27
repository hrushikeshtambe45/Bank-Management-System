import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function Login({ login, isAuthenticated }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // If user is already logged in, redirect to dashboard
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/auth/login', { username, password });
            const token = response.data.token;
            login(token); // Update auth state in App.js
            navigate('/dashboard'); // Redirect to dashboard on successful login
        } catch (err) {
            setError('Invalid username or password. Please try again.');
            console.error('Login error:', err);
        }
    };

    return (
        <div className="login-container card">
            <h2>Bank Portal Login</h2>
            <form onSubmit={handleSubmit}>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Login
                </button>
            </form>
             <div style={{marginTop: '20px', backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '4px'}}>
                <p><strong>Test Credentials:</strong></p>
                <p><strong>Admin:</strong><br/>Username: `admin`<br/>Password: `adminpassword`</p>
                <p><em>(Customer credentials will be available after you seed the database)</em></p>
            </div>
        </div>
    );
}

export default Login;