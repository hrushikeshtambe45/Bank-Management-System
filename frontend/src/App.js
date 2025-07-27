import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import TransactionHistory from './components/transactions/TransactionHistory';
import TransferMoney from './components/transactions/TransferMoney';
import TransactionStatement from './components/transactions/TransactionStatement'; // <-- IMPORT NEW COMPONENT
import Navbar from './components/core/Navbar';
import PrivateRoute from './components/core/PrivateRoute';
import { useAuth } from './hooks/useAuth';

function App() {
    const { auth, login, logout } = useAuth();
    const isAuthenticated = !!auth.token;

    return (
        <Router>
            <Navbar isAuthenticated={isAuthenticated} user={auth.user} logout={logout} />
            <main className="container">
                <Routes>
                    {/* Public route */}
                    <Route path="/login" element={<Login login={login} isAuthenticated={isAuthenticated} />} />

                    {/* Protected Routes */}
                    <Route path="/dashboard" element={<PrivateRoute isAuthenticated={isAuthenticated}><Dashboard user={auth.user} /></PrivateRoute>} />
                    <Route path="/history" element={<PrivateRoute isAuthenticated={isAuthenticated}><TransactionHistory user={auth.user} /></PrivateRoute>} />
                    <Route path="/transfer" element={<PrivateRoute isAuthenticated={isAuthenticated}><TransferMoney user={auth.user} /></PrivateRoute>} />
                    {/* 👇 ADD NEW ROUTE FOR STATEMENTS */}
                    <Route path="/statement" element={<PrivateRoute isAuthenticated={isAuthenticated}><TransactionStatement user={auth.user} /></PrivateRoute>} />

                    {/* Default route */}
                    <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
                </Routes>
            </main>
        </Router>
    );
}

export default App;