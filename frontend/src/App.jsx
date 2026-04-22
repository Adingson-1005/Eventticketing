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
                {/* No navbar */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* With navbar */}
                <Route path="/home" element={<Layout><Home /></Layout>} />
                <Route path="/events/:id" element={<Layout><EventDetail /></Layout>} />
                <Route path="/create-event" element={<Layout><CreateEvent /></Layout>} />
                <Route path="/my-events" element={<Layout><MyEvents /></Layout>} />
            </Routes>
        </Router>
    );
}

export default App;