import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Navbar.css';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setMenuOpen(false);
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/home" className="navbar-brand">🎟 EventTicket</Link>

            <div className="navbar-links">
                <Link to="/home" className="navbar-link">Browse Events</Link>
                <Link to="/my-events" className="navbar-link">My Events</Link>
                <Link to="/create-event" className="navbar-link">Create Event</Link>
                {user && user.role === 'admin' && (
                    <Link to="/dashboard" className="navbar-link">Dashboard</Link>
                )}

                {/* Burger Menu */}
                {user && (
                    <div className="burger-wrapper">
                        <button
                            className="burger-btn"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            <span className={`burger-icon ${menuOpen ? 'open' : ''}`}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </span>
                        </button>

                        {menuOpen && (
                            <div className="burger-dropdown">
                                <div className="burger-user-info">
                                    <div className="burger-avatar">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="burger-name">
                                            {user.name}
                                            {user.role === 'admin' && <span className="admin-badge">ADMIN</span>}
                                        </p>
                                        <p className="burger-email">{user.email}</p>
                                    </div>
                                </div>

                                <div className="burger-divider" />

                                <button
                                    className="burger-menu-item"
                                    onClick={() => { navigate('/profile'); setMenuOpen(false); }}
                                >
                                    👤 Profile
                                </button>

                                {user.role === 'admin' && (
                                    <button
                                        className="burger-menu-item"
                                        onClick={() => { navigate('/dashboard'); setMenuOpen(false); }}
                                    >
                                        📊 Admin Dashboard
                                    </button>
                                )}

                                <div className="burger-divider" />

                                <button
                                    className="burger-menu-item logout"
                                    onClick={handleLogout}
                                >
                                    🚪 Logout
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {!user && (
                    <>
                        <Link to="/login" className="navbar-link">Login</Link>
                        <Link to="/register" className="navbar-link">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;