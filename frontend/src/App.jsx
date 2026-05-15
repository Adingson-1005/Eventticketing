import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EventDetail from './pages/EventDetail';
import CreateEvent from './pages/CreateEvent';
import MyEvents from './pages/MyEvents';
import Navbar from './components/Navbar';
import { PrivateRoute, PublicRoute } from './components/ProtectedRoute';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';

function Layout({ children }) {
    return (
        <>
            <Navbar />
            <div style={{ 
                minHeight: '100vh',
                // background: 'linear-gradient(180deg, #010311 0%, #000000 21%)'
            }}>
                {children}
            </div>
        </>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                {/* Public only — redirect to /home if already logged in */}
                <Route path="/" element={
                    <PublicRoute><LandingPage /></PublicRoute>
                } />
                <Route path="/login" element={
                    <PublicRoute><Login /></PublicRoute>
                } />
                <Route path="/register" element={
                    <PublicRoute><Register /></PublicRoute>
                } />

                {/* Private only — redirect to /login if not logged in */}
                <Route path="/home" element={
                    <PrivateRoute>
                        <Layout><Home /></Layout>
                    </PrivateRoute>
                } />
                <Route path="/events/:id" element={
                    <PrivateRoute>
                        <Layout><EventDetail /></Layout>
                    </PrivateRoute>
                } />
                <Route path="/create-event" element={
                    <PrivateRoute>
                        <Layout><CreateEvent /></Layout>
                    </PrivateRoute>
                } />
                <Route path="/my-events" element={
                    <PrivateRoute>
                        <Layout><MyEvents /></Layout>
                    </PrivateRoute>
                } />

                <Route path="/profile" element={
                    <PrivateRoute>
                        <Layout><Profile /></Layout>
                    </PrivateRoute>
                } />

                <Route path="/dashboard" element={
                    <PrivateRoute>
                        <Layout><Dashboard /></Layout>
                    </PrivateRoute>
                } />
            </Routes>
        </Router>
    );
}

export default App;