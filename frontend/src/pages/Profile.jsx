import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../css/Profile.css';

function Profile() {
    const { user, token, login } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        phone: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(
                'http://localhost/eventticketing/backend/api/users/profile',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setProfile(res.data.user);
                setFormData({
                    name: res.data.user.name || '',
                    bio: res.data.user.bio || '',
                    phone: res.data.user.phone || ''
                });
            }
        } catch (err) {
            console.error('Failed to fetch profile', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        try {
            const res = await axios.put(
                'http://localhost/eventticketing/backend/api/users/profile',
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setMessage('Profile updated successfully! ✅');
                setMessageType('success');
                setEditing(false);
                // Update user in context
                login({ ...user, name: formData.name }, token);
                fetchProfile();
            } else {
                setMessage(res.data.message);
                setMessageType('error');
            }
        } catch (err) {
            setMessage('Something went wrong. Please try again.');
            setMessageType('error');
        }
    };

    if (loading) return <div className="profile-loading">Loading profile...</div>;

    return (
        <div className="profile-container">
            <div className="profile-card">

                {/* Avatar & Name Header */}
                <div className="profile-header">
                    <div className="profile-avatar">
                        {profile?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-header-info">
                        <h1 className="profile-name">{profile?.name}</h1>
                        <p className="profile-email">{profile?.email}</p>
                        <span className={`profile-role ${profile?.role}`}>
                            {profile?.role === 'admin' ? '👑 Admin' : '👤 User'}
                        </span>
                    </div>
                    <button
                        className="profile-edit-btn"
                        onClick={() => { setEditing(!editing); setMessage(''); }}
                    >
                        {editing ? 'Cancel' : '✏️ Edit Profile'}
                    </button>
                </div>

                {/* Stats */}
                <div className="profile-stats">
                    <div className="profile-stat">
                        <span className="stat-number">{profile?.hosted_events}</span>
                        <span className="stat-label">Events Hosted</span>
                    </div>
                    <div className="profile-stat">
                        <span className="stat-number">{profile?.registered_events}</span>
                        <span className="stat-label">Events Attended</span>
                    </div>
                    <div className="profile-stat">
                        <span className="stat-number">
                            {new Date(profile?.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short' })}
                        </span>
                        <span className="stat-label">Member Since</span>
                    </div>
                </div>

                <div className="profile-divider" />

                {/* Message */}
                {message && (
                    <div className={`profile-message ${messageType}`}>
                        {message}
                    </div>
                )}

                {/* Info / Edit Form */}
                {editing ? (
                    <div className="profile-form">
                        <div className="profile-form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your full name"
                            />
                        </div>
                        <div className="profile-form-group">
                            <label>Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Tell us about yourself..."
                                rows={3}
                            />
                        </div>
                        <div className="profile-form-group">
                            <label>Phone Number</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="09XXXXXXXXX"
                            />
                        </div>
                        <button className="profile-save-btn" onClick={handleSave}>
                            Save Changes
                        </button>
                    </div>
                ) : (
                    <div className="profile-info">
                        <div className="profile-info-item">
                            <span className="info-label">📝 Bio</span>
                            <span className="info-value">{profile?.bio || 'No bio yet.'}</span>
                        </div>
                        <div className="profile-info-item">
                            <span className="info-label">📱 Phone</span>
                            <span className="info-value">{profile?.phone || 'Not provided.'}</span>
                        </div>
                        <div className="profile-info-item">
                            <span className="info-label">📧 Email</span>
                            <span className="info-value">{profile?.email}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;