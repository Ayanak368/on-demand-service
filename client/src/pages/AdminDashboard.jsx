import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const AdminDashboard = () => {
    const { token, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [workers, setWorkers] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [platformFeedbacks, setPlatformFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('workers'); // 'workers', 'complaints', 'platform-feedback', 'services'
    const [workerSearch, setWorkerSearch] = useState('');
    const [selectedWorker, setSelectedWorker] = useState(null); // for detail modal
    const [payments, setPayments] = useState([]);

    // Services State
    const [services, setServices] = useState([]);
    const [serviceForm, setServiceForm] = useState({ name: '', description: '', price: '', iconName: 'Wrench', color: 'text-blue-500' });
    const [editingServiceId, setEditingServiceId] = useState(null);

    useEffect(() => {
        if (user && user.role !== 'admin') {
            // redirect non-admins back to dashboard/home
            navigate('/dashboard');
            return;
        }
        if (token) {
            fetchWorkers();
            fetchComplaints();
            fetchPlatformFeedbacks();
            fetchServices();
            fetchPayments();
        }
    }, [token, user, navigate]);

    const fetchPayments = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/admin/payments', {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setPayments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPlatformFeedbacks = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/platform-feedback', {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setPlatformFeedbacks(data);
        } catch (err) {
            console.error(err);
        }
    };

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

    const fetchServices = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/services/admin', {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setServices(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleServiceSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingServiceId
                ? `http://localhost:5001/api/services/${editingServiceId}`
                : 'http://localhost:5001/api/services';
            const method = editingServiceId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(serviceForm)
            });

            if (res.ok) {
                fetchServices();
                setServiceForm({ name: '', description: '', price: '', iconName: 'Wrench', color: 'text-blue-500' });
                setEditingServiceId(null);
            } else {
                const data = await res.json();
                alert(data.msg || 'Error saving service');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deleteService = async (id) => {
        if (!window.confirm('Are you sure you want to delete this service?')) return;
        try {
            await fetch(`http://localhost:5001/api/services/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            fetchServices();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditService = (service) => {
        setServiceForm({
            name: service.name,
            description: service.description,
            price: service.price,
            iconName: service.iconName,
            color: service.color
        });
        setEditingServiceId(service._id);
        setActiveTab('services');
        window.scrollTo(0, 0);
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



    if (loading) return <div>Loading...</div>;

    // filter workers by search text
    const filteredWorkers = workers.filter(w => w.name.toLowerCase().includes(workerSearch.toLowerCase()) || w.email.toLowerCase().includes(workerSearch.toLowerCase()));

    return (
        <div className="customer-dashboard">
            <h1 className="animate-fade-in" style={{ textAlign: 'center' }}>Admin Dashboard</h1>
            <div className="dashboard-tabs" style={{ marginBottom: '30px' }}>
                <button
                    className={`tab-btn ${activeTab === 'workers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('workers')}
                >
                    Worker Management ({workers.length})
                </button>
                <button
                    className={`tab-btn ${activeTab === 'complaints' ? 'active' : ''}`}
                    onClick={() => setActiveTab('complaints')}
                >
                    Complaint Management ({complaints.length})
                </button>
                <button
                    className={`tab-btn ${activeTab === 'platform-feedback' ? 'active' : ''}`}
                    onClick={() => setActiveTab('platform-feedback')}
                >
                    Platform Feedback ({platformFeedbacks.length})
                </button>
                <button
                    className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
                    onClick={() => setActiveTab('services')}
                >
                    Services Management
                </button>
            </div>

            {activeTab === 'workers' && (
                <>
                    <div style={{ marginBottom: '20px', textAlign: 'right' }}>
                        <input
                            type="text"
                            placeholder="Search workers..."
                            value={workerSearch}
                            onChange={e => setWorkerSearch(e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e3f2fd', maxWidth: '300px' }}
                        />
                    </div>
                    <div className="request-list">
                        {filteredWorkers.length === 0 ? <p>No workers found.</p> : filteredWorkers.map(worker => (
                            <div key={worker._id} className="request-card">
                                <>
                                    <div className="card-header">
                                        <h3>{worker.name}</h3>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <span className={`status-badge ${worker.status}`}>{worker.status}</span>
                                            {worker.status === 'active' && worker.subscriptionExpiry && new Date() > new Date(worker.subscriptionExpiry) && (
                                                <span className="status-badge" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>Expired</span>
                                            )}
                                        </div>
                                    </div>
                                    <p><strong>Profession:</strong> {worker.profession}</p>
                                    <p>
                                        <strong>Subscription Expiry:</strong>{' '}
                                        {worker.subscriptionExpiry ? new Date(worker.subscriptionExpiry).toLocaleDateString() : 'N/A'}
                                    </p>
                                    <div className="worker-actions" style={{ marginBottom: '10px', marginTop: '15px' }}>
                                        {worker.status === 'pending' && (
                                            <button onClick={() => updateStatus(worker._id, 'active')} className="btn btn-primary" style={{ marginRight: '5px' }}>✓ Approve</button>
                                        )}
                                        {worker.status !== 'blocked' && (
                                            <button onClick={() => updateStatus(worker._id, 'blocked')} className="btn btn-secondary" style={{ marginRight: '5px' }}>🚫 Block</button>
                                        )}
                                        {worker.status === 'blocked' && (
                                            <button onClick={() => updateStatus(worker._id, 'active')} className="btn btn-primary" style={{ marginRight: '5px' }}>↩ Unblock</button>
                                        )}
                                    </div>
                                    <div className="admin-actions">
                                        <button onClick={() => setSelectedWorker(worker)} className="btn btn-primary" style={{ marginRight: '5px', backgroundColor: '#007bff', color: 'white' }}>View Details</button>
                                        <button onClick={() => deleteUser(worker._id)} className="btn btn-danger" style={{ backgroundColor: '#dc3545', color: 'white' }}>Delete</button>
                                    </div>
                                </>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'complaints' && (
                <div className="request-list">
                    {complaints.length === 0 ? <p>No complaints found.</p> : complaints.map(complaint => (
                        <div key={complaint._id} className="request-card">
                            <div className="card-header">
                                <h3>{complaint.subject}</h3>
                                <span className={`status-badge ${complaint.status}`}>{complaint.status}</span>
                            </div>
                            <p><strong>From:</strong> {complaint.customer?.name} ({complaint.customer?.email})</p>
                            <p><strong>Against:</strong> {complaint.worker?.name}</p>
                            <p><strong>Description:</strong> {complaint.description}</p>
                            {complaint.reply && <div className="admin-reply"><strong>Admin Reply:</strong> {complaint.reply}</div>}

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
            )}

            {activeTab === 'platform-feedback' && (
                <div className="request-list">
                    {platformFeedbacks.length === 0 ? <p>No platform feedback found.</p> : platformFeedbacks.map(fb => (
                        <div key={fb._id} className="request-card">
                            <div className="card-header">
                                <h3>Rating: {fb.rating} / 5</h3>
                                <span className={`status-badge completed`}>{new Date(fb.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p><strong>Customer:</strong> {fb.customer?.name} ({fb.customer?.email})</p>
                            <p><strong>Feedback:</strong> {fb.feedback}</p>
                            {fb.reply && <div className="admin-reply"><strong>Admin Reply:</strong> {fb.reply}</div>}

                            <div style={{ marginTop: '10px' }}>
                                {!fb.reply && (
                                    <div className="reply-section" style={{ marginBottom: '10px' }}>
                                        <textarea
                                            placeholder="Write a reply..."
                                            rows="2"
                                            style={{ width: '100%', marginBottom: '5px' }}
                                            id={`pf-reply-${fb._id}`}
                                        ></textarea>
                                        <button
                                            onClick={() => {
                                                const replyText = document.getElementById(`pf-reply-${fb._id}`).value;
                                                handlePlatformReply(fb._id, replyText);
                                            }}
                                            className="btn btn-primary"
                                        >
                                            Send Reply
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'services' && (
                <div className="admin-services-section">
                    <div className="service-form-container" style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
                        <h3>{editingServiceId ? 'Edit Service' : 'Add New Service'}</h3>
                        <form onSubmit={handleServiceSubmit} style={{ display: 'grid', gap: '15px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>Service Name</label>
                                    <input type="text" value={serviceForm.name} onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} placeholder="e.g. Electrician" required style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>Price Indicator</label>
                                    <input type="text" value={serviceForm.price} onChange={e => setServiceForm({ ...serviceForm, price: e.target.value })} placeholder="e.g. ₹500" required style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Description</label>
                                <textarea value={serviceForm.description} onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} placeholder="Service description..." required style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc', minHeight: '80px' }}></textarea>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>Icon Component Name (Lucide-react)</label>
                                    <input type="text" value={serviceForm.iconName} onChange={e => setServiceForm({ ...serviceForm, iconName: e.target.value })} placeholder="e.g. Wrench, Zap, Droplets" required style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>Color Class (Tailwind)</label>
                                    <input type="text" value={serviceForm.color} onChange={e => setServiceForm({ ...serviceForm, color: e.target.value })} placeholder="e.g. text-blue-500" required style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>
                                    {editingServiceId ? 'Update Service' : 'Add Service'}
                                </button>
                                {editingServiceId && (
                                    <button type="button" className="btn btn-secondary" onClick={() => { setEditingServiceId(null); setServiceForm({ name: '', description: '', price: '', iconName: 'Wrench', color: 'text-blue-500' }); }} style={{ padding: '10px 20px' }}>
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="request-list">
                        {services.length === 0 ? <p>No services found.</p> : services.map(service => (
                            <div key={service._id} className="request-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 5px 0' }}>{service.name}</h3>
                                    <p style={{ margin: '0 0 5px 0', color: '#666' }}>{service.description}</p>
                                    <div style={{ display: 'flex', gap: '15px', fontSize: '0.9em' }}>
                                        <span style={{ fontWeight: 'bold' }}>Price: {service.price}</span>
                                        <span>Icon: {service.iconName}</span>
                                        <span className={service.color}>Color: {service.color}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => handleEditService(service)} className="btn btn-primary" style={{ backgroundColor: '#007bff' }}>Edit</button>
                                    <button onClick={() => deleteService(service._id)} className="btn btn-danger" style={{ backgroundColor: '#dc3545' }}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}


            {/* Worker Details Modal */}
            {selectedWorker && (
                <div className="worker-verification-modal">
                    <div className="verification-card">
                        <div className="verification-header">
                            <h2>Worker Verification</h2>
                            <button onClick={() => setSelectedWorker(null)}>✕</button>
                        </div>

                        {/* Photo Section */}
                        {selectedWorker.photo && (
                            <div className="verification-photo">
                                <img src={selectedWorker.photo} alt={selectedWorker.name} />
                            </div>
                        )}

                        {/* Details Grid */}
                        <div className="verification-grid">
                            <div className="verification-item">
                                <p>Name</p>
                                <p>{selectedWorker.name}</p>
                            </div>
                            <div className="verification-item">
                                <p>Status</p>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <span className={`status-badge ${selectedWorker.status}`}>{selectedWorker.status}</span>
                                    {selectedWorker.status === 'active' && selectedWorker.subscriptionExpiry && new Date() > new Date(selectedWorker.subscriptionExpiry) && (
                                        <span className="status-badge" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>Expired</span>
                                    )}
                                </div>
                            </div>
                            <div className="verification-item">
                                <p>Email</p>
                                <p>{selectedWorker.email}</p>
                            </div>
                            <div className="verification-item">
                                <p>Phone</p>
                                <p>{selectedWorker.phone}</p>
                            </div>
                            <div className="verification-item">
                                <p>Address</p>
                                <p>{selectedWorker.address}</p>
                            </div>
                            <div className="verification-item">
                                <p>Profession</p>
                                <p style={{ color: '#007bff', fontWeight: '700' }}>{selectedWorker.profession}</p>
                            </div>
                            <div className="verification-item">
                                <p>Experience</p>
                                <p>{selectedWorker.experience}</p>
                            </div>
                            <div className="verification-item">
                                <p>Location</p>
                                <p>{selectedWorker.location}</p>
                            </div>
                            <div className="verification-item">
                                <p>Subscription Expiry</p>
                                <p style={{ fontWeight: 'bold', color: selectedWorker.subscriptionExpiry && new Date() > new Date(selectedWorker.subscriptionExpiry) ? '#dc3545' : '#28a745' }}>
                                    {selectedWorker.subscriptionExpiry ? new Date(selectedWorker.subscriptionExpiry).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Payment Details Section */}
                        <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '10px', color: '#333' }}>Payment Details</h3>
                            {payments.filter(p => p.worker_id?._id === selectedWorker._id || p.worker_id === selectedWorker._id).length > 0 ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}>
                                            <th style={{ padding: '8px', borderBottom: '2px solid #dee2e6' }}>Date</th>
                                            <th style={{ padding: '8px', borderBottom: '2px solid #dee2e6' }}>Type</th>
                                            <th style={{ padding: '8px', borderBottom: '2px solid #dee2e6' }}>Amount</th>
                                            <th style={{ padding: '8px', borderBottom: '2px solid #dee2e6' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.filter(p => p.worker_id?._id === selectedWorker._id || p.worker_id === selectedWorker._id).map(payment => (
                                            <tr key={payment._id}>
                                                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{new Date(payment.payment_date).toLocaleDateString()}</td>
                                                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{payment.payment_type === 'registration_fee' ? 'Registration' : 'Renewal'}</td>
                                                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>₹{payment.amount}</td>
                                                <td style={{ padding: '8px', borderBottom: '1px solid #eee', color: payment.payment_status === 'completed' ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                                                    {payment.payment_status.toUpperCase()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p style={{ fontSize: '0.9rem', color: '#666' }}>No payment records found.</p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="verification-actions">
                            {selectedWorker.status === 'pending' && (
                                <button
                                    onClick={() => {
                                        updateStatus(selectedWorker._id, 'active');
                                        setSelectedWorker(null);
                                    }}
                                    className="btn-approve"
                                >
                                    ✓ Approve
                                </button>
                            )}
                            {selectedWorker.status !== 'blocked' && (
                                <button
                                    onClick={() => {
                                        updateStatus(selectedWorker._id, 'blocked');
                                        setSelectedWorker(null);
                                    }}
                                    className="btn-reject"
                                >
                                    🚫 Reject/Block
                                </button>
                            )}
                            {selectedWorker.status === 'blocked' && (
                                <button
                                    onClick={() => {
                                        updateStatus(selectedWorker._id, 'active');
                                        setSelectedWorker(null);
                                    }}
                                    className="btn-unblock"
                                >
                                    ↩ Unblock
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedWorker(null)}
                                className="btn-close-modal"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
