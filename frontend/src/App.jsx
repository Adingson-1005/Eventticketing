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

function Layout({ children }) {
    return (
        <>
            <Navbar />
            <div style={{ padding: '20px' }}>
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
            </Routes>
        </Router>
    );
}

export default App;