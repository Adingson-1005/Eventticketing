import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Navbar.css';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/home" className="navbar-brand">🎟 EventTicket</Link>

            <div className="navbar-links">
                <Link to="/home" className="navbar-link">Browse Events</Link>

                {user ? (
    <>
        <Link to="/my-events" className="navbar-link">My Events</Link>
        <Link to="/create-event" className="navbar-link">Create Event</Link>
        <span className="navbar-username">Hi, {user.name}!</span>
        <button onClick={handleLogout} className="navbar-logout">Logout</button>
    </>
) : (
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