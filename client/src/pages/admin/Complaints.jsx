import { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { MdSend, MdOutlineWarning } from 'react-icons/md';
import './Admin.css';

const Complaints = () => {
    const { token } = useContext(AuthContext);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState({});

    const fetchComplaints = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/complaints', {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setComplaints(data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching complaints:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchComplaints();
    }, [token]);

    const handleReplyChange = (id, text) => {
        setReplyText(prev => ({ ...prev, [id]: text }));
    };

    const handleReplySubmit = async (id) => {
        const reply = replyText[id];
        if (!reply || reply.trim() === '') return;

        try {
            await fetch(`http://localhost:5001/api/complaints/${id}/reply`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ reply })
            });

            // Make sure the reply box is cleared and list updated
            setReplyText(prev => {
                const newReplies = { ...prev };
                delete newReplies[id];
                return newReplies;
            });
            fetchComplaints();
        } catch (err) {
            console.error("Error submitting reply:", err);
        }
    };

    if (loading) return <div className="admin-loading">Loading Complaints...</div>;

    return (
        <div className="admin-complaints-view">
            <h2>Complaint Management</h2>

            <div className="admin-cards-grid">
                {complaints.length === 0 ? (
                    <div className="empty-state">
                        <MdOutlineWarning size={48} color="#cbd5e1" />
                        <p>No complaints found.</p>
                    </div>
                ) : (
                    complaints.map(complaint => (
                        <div key={complaint._id} className="admin-ticket-card">
                            <div className="ticket-header">
                                <h4>{complaint.subject}</h4>
                                <span className={`admin-status-badge ${complaint.status === 'open' ? 'status-pending' : 'status-active'}`}>
                                    {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                                </span>
                            </div>
                            <div className="ticket-body">
                                <p className="ticket-user"><strong>User:</strong> {complaint.customer?.name} ({complaint.customer?.email})</p>
                                <p className="ticket-worker">
                                    <strong>Related To:</strong>{' '}
                                    {complaint.worker && complaint.worker !== 'general'
                                        ? `${complaint.worker.name} (${complaint.worker.email})`
                                        : 'General Complaint'}
                                </p>
                                <p className="ticket-message"><strong>Message:</strong> {complaint.description}</p>
                            </div>

                            <div className="ticket-footer">
                                {complaint.reply ? (
                                    <div className="ticket-admin-reply">
                                        <strong>Admin Reply:</strong>
                                        <p>{complaint.reply}</p>
                                    </div>
                                ) : (
                                    <div className="ticket-reply-form">
                                        <textarea
                                            placeholder="Type your reply here to resolve..."
                                            value={replyText[complaint._id] || ''}
                                            onChange={(e) => handleReplyChange(complaint._id, e.target.value)}
                                            rows="2"
                                        />
                                        <button
                                            className="admin-btn btn-reply"
                                            onClick={() => handleReplySubmit(complaint._id)}
                                            disabled={!replyText[complaint._id] || replyText[complaint._id].trim() === ''}
                                        >
                                            <MdSend size={16} />
                                            Reply & Resolve
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Complaints;
