import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../css/MyEvents.css';

function MyEvents() {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('registered');
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const [hostedEvents, setHostedEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [regRes, hostRes] = await Promise.all([
                axios.get(
                    `http://localhost/eventticketing/backend/api/tickets/user/${user.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                ),
                axios.get(
                    'http://localhost/eventticketing/backend/api/events/my',
                    { headers: { Authorization: `Bearer ${token}` } }
                )
            ]);
            if (regRes.data.success) setRegisteredEvents(regRes.data.tickets);
            if (hostRes.data.success) setHostedEvents(hostRes.data.events);
        } catch (err) {
            console.error('Failed to fetch events', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRegistration = async (event_id) => {
        if (!window.confirm('Are you sure you want to cancel this registration?')) return;
        try {
            const res = await axios.post(
                'http://localhost/eventticketing/backend/api/tickets/cancel',
                { event_id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setRegisteredEvents(prev => prev.filter(e => e.event_id !== event_id));
            }
        } catch (err) {
            console.error('Failed to cancel registration', err);
        }
    };

    const handleDeleteEvent = async (event_id) => {
        if (!window.confirm('Are you sure you want to delete this event? All registrations will be cancelled.')) return;
        try {
            const res = await axios.delete(
                `http://localhost/eventticketing/backend/api/events/${event_id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setHostedEvents(prev => prev.filter(e => e.id !== event_id));
            }
        } catch (err) {
            console.error('Failed to delete event', err);
        }
    };

    if (loading) return <div className="myevents-loading">Loading your events...</div>;

    return (
        <div className="myevents-container">
            <div className="myevents-header">
                <h1 className="myevents-title">My Events 🎟</h1>
                <p className="myevents-subtitle">Manage your registrations and hosted events</p>
            </div>

            {/* Tabs */}
            <div className="myevents-tabs">
                <button
                    className={`myevents-tab ${activeTab === 'registered' ? 'active' : ''}`}
                    onClick={() => setActiveTab('registered')}
                >
                    Registered Events ({registeredEvents.length})
                </button>
                <button
                    className={`myevents-tab ${activeTab === 'hosted' ? 'active' : ''}`}
                    onClick={() => setActiveTab('hosted')}
                >
                    My Hosted Events ({hostedEvents.length})
                </button>
            </div>

            {/* Registered Events Tab */}
            {activeTab === 'registered' && (
                <div>
                    {registeredEvents.length === 0 ? (
                        <div className="myevents-empty">
                            <p>You haven't registered for any events yet!</p>
                            <button className="myevents-browse-btn" onClick={() => navigate('/home')}>
                                Browse Events
                            </button>
                        </div>
                    ) : (
                        <div className="myevents-list">
                            {registeredEvents.map(event => (
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
                                            <span>🕐 {new Date(event.start_datetime).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span>🎫 {event.ticket_code}</span>
                                        </div>
                                    </div>
                                    <div className="myevents-card-right">
                                        <button className="myevents-view-btn" onClick={() => navigate(`/events/${event.event_id}`)}>
                                            View
                                        </button>
                                        <button className="myevents-cancel-btn" onClick={() => handleCancelRegistration(event.event_id)}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Hosted Events Tab */}
            {activeTab === 'hosted' && (
                <div>
                    <div style={{ marginBottom: '16px', textAlign: 'right' }}>
                        <button className="myevents-browse-btn" onClick={() => navigate('/create-event')}>
                            + Create New Event
                        </button>
                    </div>
                    {hostedEvents.length === 0 ? (
                        <div className="myevents-empty">
                            <p>You haven't created any events yet!</p>
                        </div>
                    ) : (
                        <div className="myevents-list">
                            {hostedEvents.map(event => (
                                <div key={event.id} className="myevents-card">
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
                                            <span>🕐 {new Date(event.start_datetime).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span>👥 {event.registered_count} registered</span>
                                            <span className={`hosted-status ${event.status}`}>{event.status}</span>
                                        </div>
                                    </div>
                                    <div className="myevents-card-right">
                                        <button className="myevents-view-btn" onClick={() => navigate(`/events/${event.id}`)}>
                                            View
                                        </button>
                                        <button className="myevents-cancel-btn" onClick={() => handleDeleteEvent(event.id)}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default MyEvents;