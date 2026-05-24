import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Calendar, Users, TicketCheck, DollarSign, Clock, Rocket, MapPin, FolderOpen, ClipboardList, AlertTriangle } from 'lucide-react';
import '../css/Dashboard.css';

function Dashboard() {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/home');
            return;
        }
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get(
                'http://localhost/eventticketing/backend/api/dashboard/stats',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setData(res.data);
            } else {
                setError(res.data.message || 'Failed to load dashboard');
            }
        } catch (err) {
            if (err.response?.status === 403) {
                setError('Access denied — Admin only');
            } else {
                console.error(err);
                setError('Failed to load dashboard data');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEvent = async (e, eventId) => {
        e.stopPropagation(); // Prevent navigating to detail page
        if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;

        try {
            const res = await axios.delete(
                `http://localhost/eventticketing/backend/api/events/${eventId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                // Remove from local state
                setData(prev => ({
                    ...prev,
                    events: prev.events.filter(event => event.id !== eventId),
                    total_events: prev.total_events - 1
                }));
            }
        } catch (err) {
            alert('Failed to delete event');
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-PH', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const formatTime = (dateStr) => {
        return new Date(dateStr).toLocaleTimeString('en-PH', {
            hour: '2-digit', minute: '2-digit'
        });
    };

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="dashboard-loading-shimmer">
                    <div className="shimmer-spinner"></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <p><AlertTriangle size={16} /> {error}</p>
                <button className="dashboard-error-btn" onClick={fetchDashboard}>
                    Try Again
                </button>
            </div>
        );
    }

    if (!data) return null;

    const maxCategoryCount = Math.max(...data.category_counts.map(c => Number(c.count)), 1);

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <h1 className="dashboard-title"><BarChart3 size={28} /> Admin Dashboard</h1>
                <p className="dashboard-subtitle">
                    Overview of your event ticketing platform
                </p>
            </div>

            {/* Stat Cards */}
            <div className="stats-grid">
                <div className="stat-card events">
                    <span className="stat-icon"><Calendar size={24} /></span>
                    <div className="stat-value">{data.total_events}</div>
                    <div className="stat-label">Total Events</div>
                </div>
                <div className="stat-card users">
                    <span className="stat-icon"><Users size={24} /></span>
                    <div className="stat-value">{data.total_users}</div>
                    <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card tickets">
                    <span className="stat-icon"><TicketCheck size={24} /></span>
                    <div className="stat-value">{data.total_registrations}</div>
                    <div className="stat-label">Tickets Sold</div>
                </div>
                <div className="stat-card revenue">
                    <span className="stat-icon"><DollarSign size={24} /></span>
                    <div className="stat-value">
                        ₱{Number(data.total_revenue).toLocaleString('en-PH', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}
                    </div>
                    <div className="stat-label">Total Revenue</div>
                </div>
            </div>

            {/* Two-column grid */}
            <div className="dashboard-grid">
                {/* Recent Registrations */}
                <div className="dashboard-panel">
                    <div className="panel-header">
                        <h2 className="panel-title"><Clock size={18} /> Recent Registrations</h2>
                        <span className="panel-badge">{data.recent_registrations.length}</span>
                    </div>
                    {data.recent_registrations.length === 0 ? (
                        <div className="panel-empty">No registrations yet</div>
                    ) : (
                        <ul className="registration-list">
                            {data.recent_registrations.map(reg => (
                                <li key={reg.id} className="registration-item">
                                    <div className="reg-avatar">
                                        {reg.user_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="reg-info">
                                        <p className="reg-name">{reg.user_name}</p>
                                        <p className="reg-detail">
                                            registered for <strong>{reg.event_title}</strong>
                                        </p>
                                    </div>
                                    <span className="reg-ticket-code">{reg.ticket_code}</span>
                                    <span className="reg-time">{timeAgo(reg.registered_at)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Upcoming Events */}
                <div className="dashboard-panel">
                    <div className="panel-header">
                        <h2 className="panel-title"><Rocket size={18} /> Upcoming Events</h2>
                        <span className="panel-badge">{data.upcoming_events.length}</span>
                    </div>
                    {data.upcoming_events.length === 0 ? (
                        <div className="panel-empty">No upcoming events</div>
                    ) : (
                        <ul className="upcoming-list">
                            {data.upcoming_events.map(event => (
                                <li key={event.id} className="upcoming-item"
                                    onClick={() => navigate(`/events/${event.id}`)}
                                    style={{ cursor: 'pointer' }}>
                                    <div className="upcoming-date">
                                        <span className="upcoming-month">
                                            {new Date(event.start_datetime).toLocaleDateString('en-PH', { month: 'short' })}
                                        </span>
                                        <span className="upcoming-day">
                                            {new Date(event.start_datetime).getDate()}
                                        </span>
                                    </div>
                                    <div className="upcoming-info">
                                        <p className="upcoming-title">{event.title}</p>
                                        <p className="upcoming-meta">
                                            <MapPin size={12} /> {event.location || 'Online'} · {formatTime(event.start_datetime)}
                                        </p>
                                    </div>
                                    <span className="upcoming-attendees">
                                        <Users size={14} /> {event.registered_count}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Category Breakdown */}
                <div className="dashboard-panel">
                    <div className="panel-header">
                        <h2 className="panel-title"><FolderOpen size={18} /> Events by Category</h2>
                    </div>
                    <div className="category-list">
                        {data.category_counts.map((cat, i) => (
                            <div key={i} className="category-row">
                                <span className="category-name">{cat.category}</span>
                                <div className="category-bar-wrapper">
                                    <div
                                        className="category-bar"
                                        style={{ width: `${(Number(cat.count) / maxCategoryCount) * 100}%` }}
                                    />
                                </div>
                                <span className="category-count">{cat.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Events Table (full width) */}
            <div className="dashboard-panel full-width">
                <div className="panel-header">
                    <h2 className="panel-title"><ClipboardList size={18} /> All Events</h2>
                    <span className="panel-badge">{data.events.length} events</span>
                </div>
                <div className="events-table-wrapper">
                    <table className="events-table">
                        <thead>
                            <tr>
                                <th>Event</th>
                                <th>Host</th>
                                <th>Category</th>
                                <th>Date</th>
                                <th>Location</th>
                                <th>Type</th>
                                <th>Registrations</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.events.map(event => (
                                <tr key={event.id}
                                    onClick={() => navigate(`/events/${event.id}`)}
                                    style={{ cursor: 'pointer' }}>
                                    <td className="event-title-cell">{event.title}</td>
                                    <td>{event.host_name}</td>
                                    <td>{event.category_name || '—'}</td>
                                    <td>{formatDate(event.start_datetime)}</td>
                                    <td>{event.location || 'Online'}</td>
                                    <td>
                                        <span className={`type-badge ${event.is_paid == 1 ? 'paid' : 'free'}`}>
                                            {event.is_paid == 1 ? `₱${event.ticket_price}` : 'Free'}
                                        </span>
                                    </td>
                                    <td>
                                        {event.registered_count}
                                        {event.capacity ? ` / ${event.capacity}` : ''}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${event.status}`}>
                                            {event.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="dashboard-delete-btn"
                                            onClick={(e) => handleDeleteEvent(e, event.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
