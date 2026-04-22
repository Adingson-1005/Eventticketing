import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../css/Home.css';

function Home() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await axios.get(
                'http://localhost/eventticketing/backend/controllers/EventController.php?action=all'
            );
            if (res.data.success) {
                setEvents(res.data.events);
            }
        } catch (err) {
            console.error('Failed to fetch events', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="home-loading">Loading events...</div>;

    return (
        <div className="home-container">
            <div className="home-header">
                <h1 className="home-title">Upcoming Events 🎉</h1>
                <p className="home-subtitle">
                    {user ? `Welcome back, ${user.name}!` : 'Browse and register for events'}
                </p>
            </div>

            {events.length === 0 ? (
                <div className="home-empty">
                    <p>No events found. Be the first to create one!</p>
                    {user && (
                        <button
                            className="home-create-btn"
                            onClick={() => navigate('/create-event')}
                        >
                            Create Event
                        </button>
                    )}
                </div>
            ) : (
                <div className="home-grid">
                    {events.map(event => (
                        <div
                            key={event.id}
                            className="event-card"
                            onClick={() => navigate(`/events/${event.id}`)}
                        >
                            <div className="event-card-header">
                                <span className="event-category">
                                    {event.category_name || 'General'}
                                </span>
                                <span className={`event-type ${event.is_paid == 1 ? 'paid' : 'free'}`}>
                                    {event.is_paid == 1 ? `₱${event.ticket_price}` : 'Free'}
                                </span>
                            </div>

                            <h2 className="event-title">{event.title}</h2>

                            <p className="event-description">
                                {event.description?.length > 100
                                    ? event.description.substring(0, 100) + '...'
                                    : event.description}
                            </p>

                            <div className="event-details">
                                <p className="event-detail">
                                    📍 {event.location || 'Online'}
                                </p>
                                <p className="event-detail">
                                    📅 {new Date(event.start_datetime).toLocaleDateString('en-PH', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                                <p className="event-detail">
                                    🕐 {new Date(event.start_datetime).toLocaleTimeString('en-PH', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                                <p className="event-detail">
                                    👤 Hosted by {event.host_name}
                                </p>
                                {event.capacity && (
                                    <p className="event-detail">
                                        🎟 {event.capacity} slots available
                                    </p>
                                )}
                            </div>

                            <button className="event-card-btn">View Event →</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Home;