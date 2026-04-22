import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../css/CreateEvent.css';

function CreateEvent() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        start_datetime: '',
        end_datetime: '',
        capacity: '',
        is_paid: false,
        ticket_price: 0,
        category_id: 1
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const categories = [
        { id: 1, name: 'Technology' },
        { id: 2, name: 'Business' },
        { id: 3, name: 'Arts & Culture' },
        { id: 4, name: 'Sports & Fitness' },
        { id: 5, name: 'Social & Networking' },
        { id: 6, name: 'Music' },
        { id: 7, name: 'Education' },
        { id: 8, name: 'Food & Drink' },
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post(
                'http://localhost/eventticketing/backend/controllers/EventController.php?action=create',
                { ...formData, host_id: user.id }
            );

            if (res.data.success) {
                navigate(`/events/${res.data.event_id}`);
            } else {
                setError(res.data.message);
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="create-container">
            <div className="create-card">
                <h2 className="create-title">Create a New Event 🎉</h2>
                <p className="create-subtitle">Fill in the details below to publish your event</p>

                {error && <div className="create-error">{error}</div>}

                <form onSubmit={handleSubmit} className="create-form">

                    <div className="form-group">
                        <label>Event Title *</label>
                        <input
                            type="text"
                            name="title"
                            placeholder="e.g. Tech Meetup 2026"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            placeholder="Tell people what your event is about..."
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                        />
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                        >
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Location</label>
                        <input
                            type="text"
                            name="location"
                            placeholder="e.g. Olongapo City Library or Online"
                            value={formData.location}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Start Date & Time *</label>
                            <input
                                type="datetime-local"
                                name="start_datetime"
                                value={formData.start_datetime}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>End Date & Time</label>
                            <input
                                type="datetime-local"
                                name="end_datetime"
                                value={formData.end_datetime}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Capacity (leave blank for unlimited)</label>
                        <input
                            type="number"
                            name="capacity"
                            placeholder="e.g. 50"
                            value={formData.capacity}
                            onChange={handleChange}
                            min="1"
                        />
                    </div>

                    <div className="form-group form-checkbox">
                        <input
                            type="checkbox"
                            name="is_paid"
                            id="is_paid"
                            checked={formData.is_paid}
                            onChange={handleChange}
                        />
                        <label htmlFor="is_paid">This is a paid event</label>
                    </div>

                    {formData.is_paid && (
                        <div className="form-group">
                            <label>Ticket Price (₱)</label>
                            <input
                                type="number"
                                name="ticket_price"
                                placeholder="e.g. 500"
                                value={formData.ticket_price}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                            />
                        </div>
                    )}

                    <div className="create-buttons">
                        <button
                            type="button"
                            className="create-btn-cancel"
                            onClick={() => navigate('/home')}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="create-btn-submit"
                            disabled={loading}
                        >
                            {loading ? 'Publishing...' : 'Publish Event 🚀'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default CreateEvent;