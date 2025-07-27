import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const useAuth = () => {
    const [auth, setAuth] = useState({ token: null, user: null });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedUser = jwtDecode(token);
                setAuth({ token, user: decodedUser.user });
            } catch (error) {
                console.error("Invalid token:", error);
                localStorage.removeItem('token');
            }
        }
    }, []);

    const login = (token) => {
        localStorage.setItem('token', token);
        const decodedUser = jwtDecode(token);
        setAuth({ token, user: decodedUser.user });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setAuth({ token: null, user: null });
    };

    return { auth, login, logout };
};