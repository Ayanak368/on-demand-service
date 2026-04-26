import { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import './Admin.css';
import { MdFeedback } from 'react-icons/md';

const Feedback = () => {
    const { token } = useContext(AuthContext);
    const [platformFeedbacks, setPlatformFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPlatformFeedbacks = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/platform-feedback', {
                headers: { 'x-auth-token': token }
            });

            if (res.ok) {
                const data = await res.json();
                setPlatformFeedbacks(data);
            } else {
                setPlatformFeedbacks([]);
            }
        } catch (err) {
            console.error("Error fetching feedback:", err);
            setPlatformFeedbacks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchPlatformFeedbacks();
    }, [token]);

    const handlePlatformReply = async (id, reply) => {
        try {
            await fetch(`http://localhost:5001/api/platform-feedback/${id}/reply`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ reply })
            });
            fetchPlatformFeedbacks();
        } catch (err) {
            console.error(err);
        }
    };

    const renderStars = (rating) => {
        return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    if (loading) return <div className="admin-loading">Loading Platform Feedback...</div>;

    return (
        <div className="admin-feedback-view">
            <h2>Platform Feedback</h2>

            <div className="admin-cards-grid">
                {platformFeedbacks.length === 0 ? (
                    <div className="empty-state">
                        <MdFeedback size={48} color="#cbd5e1" />
                        <p>No platform feedback available yet.</p>
                    </div>
                ) : (
                    platformFeedbacks.map(fb => (
                        <div key={fb._id} className="admin-feedback-card">
                            <div className="feedback-header">
                                <h4 className="worker-name">{fb.customer?.name || 'Anonymous'}</h4>
                                <span className="feedback-rating">{renderStars(fb.rating)}</span>
                            </div>
                            <div className="feedback-body">
                                <p className="feedback-comment">"{fb.feedback}"</p>
                            </div>
                            <div className="feedback-footer" style={{ borderBottom: fb.reply ? 'none' : '1px solid #f1f5f9', paddingBottom: fb.reply ? '0' : '10px', marginBottom: fb.reply ? '0' : '10px' }}>
                                <small>{fb.customer?.email}</small>
                                <small>{new Date(fb.createdAt).toLocaleDateString()}</small>
                            </div>

                            {fb.reply && (
                                <div className="admin-reply" style={{ marginTop: '10px', padding: '10px', background: '#f8fafc', borderRadius: '6px', fontSize: '14px', borderLeft: '3px solid #4f46e5' }}>
                                    <strong>Admin Reply:</strong> {fb.reply}
                                </div>
                            )}

                            {!fb.reply && (
                                <div className="reply-section" style={{ marginTop: '10px' }}>
                                    <textarea
                                        placeholder="Write a reply..."
                                        rows="2"
                                        style={{ width: '100%', marginBottom: '8px', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                                        id={`pf-reply-${fb._id}`}
                                    ></textarea>
                                    <button
                                        onClick={() => {
                                            const replyText = document.getElementById(`pf-reply-${fb._id}`).value;
                                            if (replyText.trim()) handlePlatformReply(fb._id, replyText);
                                        }}
                                        className="btn btn-primary"
                                        style={{ padding: '6px 12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                    >
                                        Send Reply
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Feedback;
