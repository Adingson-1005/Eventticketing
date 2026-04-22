import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../css/MyEvents.css';

function MyEvents() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchMyEvents();
    }, []);

    const fetchMyEvents = async () => {
        try {
            const res = await axios.get(
                `http://localhost/eventticketing/backend/controllers/RegistrationController.php?action=my_events&user_id=${user.id}`
            );
            if (res.data.success) {
                setEvents(res.data.events);
            }
        } catch (err) {
            console.error('Failed to fetch my events', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (event_id) => {
        if (!window.confirm('Are you sure you want to cancel this registration?')) return;

        try {
            const res = await axios.post(
                'http://localhost/eventticketing/backend/controllers/RegistrationController.php?action=cancel',
                { event_id, user_id: user.id }
            );
            if (res.data.success) {
                setEvents(prev => prev.filter(e => e.event_id !== event_id));
            }
        } catch (err) {
            console.error('Failed to cancel', err);
        }
    };

    if (loading) return <div className="myevents-loading">Loading your events...</div>;

    return (
        <div className="myevents-container">
            <div className="myevents-header">
                <h1 className="myevents-title">My Registered Events 🎟</h1>
                <p className="myevents-subtitle">Events you have signed up for</p>
            </div>

            {events.length === 0 ? (
                <div className="myevents-empty">
                    <p>You haven't registered for any events yet!</p>
                    <button
                        className="myevents-browse-btn"
                        onClick={() => navigate('/home')}
                    >
                        Browse Events
                    </button>
                </div>
            ) : (
                <div className="myevents-list">
                    {events.map(event => (
                        <div key={event.event_id} className="myevents-card">
                            <div className="myevents-card-left">
                                <div className="myevents-date">
                                    <span className="date-month">
                                        {new Date(event.start_datetime).toLocaleDateString('en-PH', { month: 'short' })}
                                    </span>
                                    <span className="date-day">
                                        {new Date(event.start_datetime).toLocaleDateString('en-PH', { day: 'numeric' })}
                                    </span>
                                </div>
                            </div>

                            <div className="myevents-card-body">
                                <h3 className="myevents-event-title">{event.title}</h3>
                                <div className="myevents-meta">
                                    <span>📍 {event.location || 'Online'}</span>
                                    <span>🕐 {new Date(event.start_datetime).toLocaleTimeString('en-PH', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</span>
                                    <span>🎫 {event.ticket_code}</span>
                                </div>
                            </div>

                            <div className="myevents-card-right">
                                <button
                                    className="myevents-view-btn"
                                    onClick={() => navigate(`/events/${event.event_id}`)}
                                >
                                    View
                                </button>
                                <button
                                    className="myevents-cancel-btn"
                                    onClick={() => handleCancel(event.event_id)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyEvents;