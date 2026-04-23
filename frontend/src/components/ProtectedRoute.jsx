import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Blocks logged-out users from accessing protected pages
export function PrivateRoute({ children }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" replace />;
}

// Blocks logged-in users from accessing login/register
export function PublicRoute({ children }) {
    const { user } = useAuth();
    return user ? <Navigate to="/home" replace /> : children;
}