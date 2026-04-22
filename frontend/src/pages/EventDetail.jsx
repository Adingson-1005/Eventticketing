import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../css/EventDetail.css';

function EventDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rsvpLoading, setRsvpLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [ticketCode, setTicketCode] = useState('');
    const [alreadyRegistered, setAlreadyRegistered] = useState(false);

    useEffect(() => {
        fetchEvent();
        if (user) checkRegistration();
    }, [id]);

    const fetchEvent = async () => {
        try {
            const res = await axios.get(
                `http://localhost/eventticketing/backend/controllers/EventController.php?action=single&id=${id}`
            );
            if (res.data.success) {
                setEvent(res.data.event);
            }
        } catch (err) {
            console.error('Failed to fetch event', err);
        } finally {
            setLoading(false);
        }
    };

    const checkRegistration = async () => {
        try {
            const res = await axios.get(
                `http://localhost/eventticketing/backend/controllers/RegistrationController.php?action=my_events&user_id=${user.id}`
            );
            if (res.data.success) {
                const registered = res.data.events.some(
                    e => String(e.event_id) === String(id)
                );
                setAlreadyRegistered(registered);
            }
        } catch (err) {
            console.error('Failed to check registration', err);
        }
    };

    const handleRSVP = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setRsvpLoading(true);
        setMessage('');

        try {
            const res = await axios.post(
                'http://localhost/eventticketing/backend/controllers/RegistrationController.php?action=register',
                { event_id: id, user_id: user.id }
            );

            if (res.data.success) {
                setTicketCode(res.data.ticket_code);
                setMessage('Successfully registered! 🎉');
                setMessageType('success');
                setAlreadyRegistered(true);
            } else {
                setMessage(res.data.message);
                setMessageType('error');
            }
        } catch (err) {
            setMessage('Something went wrong. Please try again.');
            setMessageType('error');
        } finally {
            setRsvpLoading(false);
        }
    };

    if (loading) return <div className="detail-loading">Loading event...</div>;
    if (!event) return <div className="detail-loading">Event not found.</div>;

    return (
        <div className="detail-container">

            <button className="detail-back" onClick={() => navigate('/home')}>
                ← Back to Events
            </button>

            <div className="detail-card">

                <div className="detail-top">
                    <div className="detail-badges">
                        <span className="detail-category">
                            {event.category_name || 'General'}
                        </span>
                        <span className={`detail-type ${event.is_paid == 1 ? 'paid' : 'free'}`}>
                            {event.is_paid == 1 ? `₱${event.ticket_price}` : 'Free'}
                        </span>
                    </div>
                    <h1 className="detail-title">{event.title}</h1>
                    <p className="detail-host">Hosted by {event.host_name}</p>
                </div>

                <div className="detail-body">
                    <div className="detail-info">
                        <h3>About this event</h3>
                        <p className="detail-description">{event.description}</p>

                        <div className="detail-meta">
                            <div className="detail-meta-item">
                                <span className="meta-icon">📍</span>
                                <span>{event.location || 'Online'}</span>
                            </div>
                            <div className="detail-meta-item">
                                <span className="meta-icon">📅</span>
                                <span>
                                    {new Date(event.start_datetime).toLocaleDateString('en-PH', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                            <div className="detail-meta-item">
                                <span className="meta-icon">🕐</span>
                                <span>
                                    {new Date(event.start_datetime).toLocaleTimeString('en-PH', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                    {event.end_datetime && ` - ${new Date(event.end_datetime).toLocaleTimeString('en-PH', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}`}
                                </span>
                            </div>
                            {event.capacity && (
                                <div className="detail-meta-item">
                                    <span className="meta-icon">🎟</span>
                                    <span>{event.capacity} slots available</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="detail-rsvp">
                        <div className="rsvp-card">
                            <h3>Reserve your spot</h3>
                            <p className="rsvp-price">
                                {event.is_paid == 1 ? `₱${event.ticket_price}` : 'Free Event'}
                            </p>

                            {message && (
                                <div className={`rsvp-message ${messageType}`}>
                                    {message}
                                    {ticketCode && (
                                        <div className="ticket-code">
                                            🎫 Ticket: <strong>{ticketCode}</strong>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                className={`rsvp-btn ${alreadyRegistered ? 'registered' : ''}`}
                                onClick={handleRSVP}
                                disabled={rsvpLoading || alreadyRegistered}
                            >
                                {rsvpLoading ? 'Registering...' :
                                 alreadyRegistered ? 'Already Registered ✓' :
                                 user ? 'Register for Event' : 'Login to Register'}
                            </button>

                            {!user && (
                                <p className="rsvp-login-hint">
                                    <span onClick={() => navigate('/login')}>Login</span>
                                    {' '}or{' '}
                                    <span onClick={() => navigate('/register')}>Register</span>
                                    {' '}to RSVP
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EventDetail;