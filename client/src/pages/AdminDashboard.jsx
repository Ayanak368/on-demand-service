import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const AdminDashboard = () => {
    const { token } = useContext(AuthContext);
    const [workers, setWorkers] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWorkers();
        fetchComplaints();
    }, []);

    const fetchWorkers = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/admin/workers', {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setWorkers(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchComplaints = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/complaints', {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setComplaints(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleReply = async (id, reply) => {
        try {
            await fetch(`http://localhost:5001/api/complaints/${id}/reply`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ reply })
            });
            fetchComplaints();
        } catch (err) {
            console.error(err);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await fetch(`http://localhost:5001/api/admin/workers/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ status })
            });
            fetchWorkers();
        } catch (err) {
            console.error(err);
        }
    };

    // State for editing
    const [editingWorker, setEditingWorker] = useState(null);
    const [editFormData, setEditFormData] = useState({ name: '', email: '', profession: '', location: '' });

    const deleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await fetch(`http://localhost:5001/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            fetchWorkers();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteComplaint = async (id) => {
        if (!window.confirm('Are you sure you want to delete this complaint?')) return;
        try {
            await fetch(`http://localhost:5001/api/complaints/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            fetchComplaints();
        } catch (err) {
            console.error(err);
        }
    };

    const startEdit = (worker) => {
        setEditingWorker(worker._id);
        setEditFormData({
            name: worker.name,
            email: worker.email,
            profession: worker.profession || '',
            location: worker.location || ''
        });
    };

    const cancelEdit = () => {
        setEditingWorker(null);
        setEditFormData({ name: '', email: '', profession: '', location: '' });
    };

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const saveEdit = async (id) => {
        try {
            await fetch(`http://localhost:5001/api/admin/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(editFormData)
            });
            setEditingWorker(null);
            fetchWorkers();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container">
            <h1>Admin Dashboard</h1>
            <h2>Worker Management</h2>
            <div className="request-list">
                {workers.map(worker => (
                    <div key={worker._id} className="request-card">
                        {editingWorker === worker._id ? (
                            <div className="edit-form">
                                <input type="text" name="name" value={editFormData.name} onChange={handleEditChange} placeholder="Name" />
                                <input type="email" name="email" value={editFormData.email} onChange={handleEditChange} placeholder="Email" />
                                <input type="text" name="profession" value={editFormData.profession} onChange={handleEditChange} placeholder="Profession" />
                                <input type="text" name="location" value={editFormData.location} onChange={handleEditChange} placeholder="Location" />
                                <div style={{ marginTop: '10px' }}>
                                    <button onClick={() => saveEdit(worker._id)} className="btn btn-primary" style={{ marginRight: '5px' }}>Save</button>
                                    <button onClick={cancelEdit} className="btn btn-secondary">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h3>{worker.name}</h3>
                                <p>Email: {worker.email}</p>
                                <p>Profession: {worker.profession}</p>
                                <p>Location: {worker.location}</p>
                                <p>Status: <strong>{worker.status}</strong></p>
                                <div className="worker-actions" style={{ marginBottom: '10px' }}>
                                    {worker.status === 'pending' && (
                                        <button onClick={() => updateStatus(worker._id, 'active')} className="btn btn-primary" style={{ marginRight: '5px' }}>Approve</button>
                                    )}
                                    {worker.status !== 'blocked' && (
                                        <button onClick={() => updateStatus(worker._id, 'blocked')} className="btn btn-secondary" style={{ marginRight: '5px' }}>Block</button>
                                    )}
                                    {worker.status === 'blocked' && (
                                        <button onClick={() => updateStatus(worker._id, 'active')} className="btn btn-primary" style={{ marginRight: '5px' }}>Unblock</button>
                                    )}
                                </div>
                                <div className="admin-actions">
                                    <button onClick={() => startEdit(worker)} className="btn btn-outline" style={{ marginRight: '5px' }}>Edit</button>
                                    <button onClick={() => deleteUser(worker._id)} className="btn btn-danger" style={{ backgroundColor: '#dc3545', color: 'white' }}>Delete</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            <h2 style={{ marginTop: '40px' }}>Complaint Management</h2>
            <div className="request-list">
                {complaints.length === 0 ? <p>No complaints found.</p> : complaints.map(complaint => (
                    <div key={complaint._id} className="request-card">
                        <h3>{complaint.subject}</h3>
                        <p><strong>From:</strong> {complaint.customer?.name} ({complaint.customer?.email})</p>
                        <p><strong>Against:</strong> {complaint.worker?.name}</p>
                        <p><strong>Description:</strong> {complaint.description}</p>
                        <p><strong>Status:</strong> {complaint.status}</p>
                        {complaint.reply && <p><strong>Admin Reply:</strong> {complaint.reply}</p>}

                        <div style={{ marginTop: '10px' }}>
                            {!complaint.reply && (
                                <div className="reply-section" style={{ marginBottom: '10px' }}>
                                    <textarea
                                        placeholder="Write a reply..."
                                        rows="2"
                                        style={{ width: '100%', marginBottom: '5px' }}
                                        id={`reply-${complaint._id}`}
                                    ></textarea>
                                    <button
                                        onClick={() => {
                                            const replyText = document.getElementById(`reply-${complaint._id}`).value;
                                            handleReply(complaint._id, replyText);
                                        }}
                                        className="btn btn-primary"
                                    >
                                        Send Reply
                                    </button>
                                </div>
                            )}
                            <button onClick={() => deleteComplaint(complaint._id)} className="btn btn-danger" style={{ backgroundColor: '#dc3545', color: 'white' }}>Delete Complaint</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
