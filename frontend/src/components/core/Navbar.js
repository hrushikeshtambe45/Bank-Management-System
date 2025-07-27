import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ isAuthenticated, user, logout }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                Gemini Bank
            </Link>
            {isAuthenticated && user?.role !== 'admin' && ( // Only show nav items for customers
                <div className="navbar-nav">
                    <span>Welcome, {user?.username}</span>
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/history">History</Link>
                    <Link to="/transfer">Transfer</Link>
                    {/* 👇 ADD NEW LINK FOR STATEMENTS */}
                    <Link to="/statement">Statement</Link>
                    <button onClick={handleLogout} className="btn btn-danger">
                        Logout
                    </button>
                </div>
            )}
             {isAuthenticated && user?.role === 'admin' && ( // Different nav for admin
                <div className="navbar-nav">
                     <span>Welcome, Admin</span>
                      <button onClick={handleLogout} className="btn btn-danger">
                        Logout
                    </button>
                </div>
             )}
        </nav>
    );
}

export default Navbar;

//With these additions and updates, **your codebase is now complete** and matches the file structure you laid out.