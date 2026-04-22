import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/LandingPage.css';
import landingBg from '../assets/landing-bg.png';

function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-container">

            {/* Left content */}
            <div className="landing-left">
                <p className="landing-welcome">Welcome to ----------</p>
                <h1 className="landing-title">
                    A Smarter Way to Create and Attend Events.
                </h1>
                <p className="landing-subtitle">
                    A platform for creating events, sharing invitations,
                    and managing guest reservations easily
                </p>

                <div className="landing-buttons">
                    <button
                        className="landing-btn-login"
                        onClick={() => navigate('/login')}
                    >
                        Log-in
                    </button>
                </div>
            </div>

            {/* Right content */}
            <div className="landing-right">
                <button
                    className="landing-btn-register"
                    onClick={() => navigate('/register')}
                >
                    Register
                </button>

                <img src={landingBg} alt="landing" className="landing-image" />
            </div>

        </div>
    );
}

export default LandingPage;