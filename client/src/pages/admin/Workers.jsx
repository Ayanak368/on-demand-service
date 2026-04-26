import { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { MdCheck, MdClose, MdBlock, MdLockOpen, MdPersonOff, MdVisibility, MdStar } from 'react-icons/md';
import './Admin.css';

const Workers = () => {
    const { token } = useContext(AuthContext);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [payments, setPayments] = useState([]);

    const fetchWorkers = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/admin/workers', {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setWorkers(data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching workers:", err);
            setLoading(false);
        }
    };

    const fetchPayments = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/admin/payments', {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setPayments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching payments:", err);
        }
    };

    useEffect(() => {
        if (token) {
            fetchWorkers();
            fetchPayments();
        }
    }, [token]);

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
            console.error("Error updating status:", err);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'pending': return 'status-pending';
            case 'active': return 'status-active';
            case 'blocked': return 'status-blocked';
            case 'rejected': return 'status-rejected';
            default: return '';
        }
    };

    if (loading) return <div className="admin-loading">Loading Workers...</div>;

    const filteredWorkers = workers.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-workers-view">
            <div className="admin-page-header">
                <h2>Worker Management</h2>
                <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Service Type</th>
                            <th>Rating</th>
                            <th>Status</th>
                            <th>Subscription Expiry</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredWorkers.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: 0 }}>
                                    <div className="empty-state" style={{ margin: '20px' }}>
                                        <MdPersonOff size={48} color="#cbd5e1" />
                                        <p>No workers found.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredWorkers.map(worker => (
                                <tr key={worker._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {worker.photo ? (
                                                <img src={`http://localhost:5001/${worker.photo.replace(/\\/g, '/')}`} alt={worker.name} className="table-avatar" />
                                            ) : (
                                                <div className="table-avatar-placeholder">{worker.name.charAt(0).toUpperCase()}</div>
                                            )}
                                            {worker.name}
                                        </div>
                                    </td>
                                    <td>{worker.email}</td>
                                    <td><span className="profession-badge">{worker.profession}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <MdStar
                                                        key={i}
                                                        size={16}
                                                        color={i < Math.floor(worker.averageRating || 0) ? '#FFB84D' : '#E0E0E0'}
                                                        style={{ marginRight: '2px' }}
                                                    />
                                                ))}
                                            </div>
                                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
                                                {worker.averageRating || 'N/A'} ({worker.totalReviews || 0})
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                            <span className={`admin-status-badge ${getStatusClass(worker.status)}`}>
                                                {worker.status.charAt(0).toUpperCase() + worker.status.slice(1)}
                                            </span>
                                            {worker.status === 'active' && worker.subscriptionExpiry && new Date() > new Date(worker.subscriptionExpiry) && (
                                                <span className="admin-status-badge status-rejected" style={{ marginLeft: '5px' }}>
                                                    Expired
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: '500', color: worker.subscriptionExpiry && new Date() > new Date(worker.subscriptionExpiry) ? '#dc3545' : '#28a745' }}>
                                            {worker.subscriptionExpiry ? new Date(worker.subscriptionExpiry).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </td>
                                    <td className="action-cell">
                                        {worker.status === 'pending' && (
                                            <>
                                                <button onClick={() => updateStatus(worker._id, 'active')} className="admin-btn btn-approve"><MdCheck /> Approve</button>
                                                <button onClick={() => updateStatus(worker._id, 'rejected')} className="admin-btn btn-reject"><MdClose /> Reject</button>
                                            </>
                                        )}
                                        {worker.status === 'active' && (
                                            <button onClick={() => updateStatus(worker._id, 'blocked')} className="admin-btn btn-block"><MdBlock /> Block</button>
                                        )}
                                        {worker.status === 'blocked' && (
                                            <button onClick={() => updateStatus(worker._id, 'active')} className="admin-btn btn-approve"><MdLockOpen /> Unblock</button>
                                        )}
                                        <button onClick={() => setSelectedWorker(worker)} className="admin-btn btn-view"><MdVisibility /> View</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Worker Details Modal */}
            {selectedWorker && (
                <div className="admin-modal-overlay" onClick={() => setSelectedWorker(null)}>
                    <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>Worker Details</h3>
                            <button className="admin-modal-close" onClick={() => setSelectedWorker(null)}><MdClose size={24} /></button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="worker-profile-header">
                                {selectedWorker.photo ? (
                                    <img src={`http://localhost:5001/${selectedWorker.photo.replace(/\\/g, '/')}`} alt={selectedWorker.name} className="modal-avatar" />
                                ) : (
                                    <div className="modal-avatar-placeholder">{selectedWorker.name.charAt(0).toUpperCase()}</div>
                                )}
                                <div>
                                    <h4 className="modal-worker-name">{selectedWorker.name}</h4>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <span className={`admin-status-badge ${getStatusClass(selectedWorker.status)}`}>
                                            {selectedWorker.status.charAt(0).toUpperCase() + selectedWorker.status.slice(1)}
                                        </span>
                                        {selectedWorker.status === 'active' && selectedWorker.subscriptionExpiry && new Date() > new Date(selectedWorker.subscriptionExpiry) && (
                                            <span className="admin-status-badge status-rejected">
                                                Expired
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="worker-detail-grid">
                                <div className="detail-item">
                                    <label>Email Address</label>
                                    <p>{selectedWorker.email}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Phone Number</label>
                                    <p>{selectedWorker.phone || 'N/A'}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Profession / Service</label>
                                    <p>{selectedWorker.profession || 'N/A'}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Experience</label>
                                    <p>{selectedWorker.experience || 'N/A'}</p>
                                </div>
                                <div className="detail-item full-width">
                                    <label>Address / Location</label>
                                    <p>{selectedWorker.address || selectedWorker.location || 'N/A'}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Rating</label>
                                    <p style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <MdStar
                                                    key={i}
                                                    size={18}
                                                    color={i < Math.floor(selectedWorker.averageRating || 0) ? '#FFB84D' : '#E0E0E0'}
                                                />
                                            ))}
                                        </span>
                                        <span style={{ fontWeight: '600', fontSize: '16px' }}>
                                            {selectedWorker.averageRating || 'N/A'} ({selectedWorker.totalReviews || 0} reviews)
                                        </span>
                                    </p>
                                </div>
                                <div className="detail-item">
                                    <label>Joined Date</label>
                                    <p>{new Date(selectedWorker.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Subscription Expiry</label>
                                    <p style={{ fontWeight: 'bold', color: selectedWorker.subscriptionExpiry && new Date() > new Date(selectedWorker.subscriptionExpiry) ? '#dc3545' : '#28a745' }}>
                                        {selectedWorker.subscriptionExpiry ? new Date(selectedWorker.subscriptionExpiry).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Payment Details Section */}
                            <div style={{ marginTop: '25px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                                <h4 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#1e293b', fontWeight: 'bold' }}>Payment History</h4>
                                {payments.filter(p => p.worker_id?._id === selectedWorker._id || p.worker_id === selectedWorker._id).length > 0 ? (
                                    <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                                            <thead style={{ backgroundColor: '#f8fafc' }}>
                                                <tr>
                                                    <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: '600' }}>Date</th>
                                                    <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: '600' }}>Type</th>
                                                    <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: '600' }}>Amount</th>
                                                    <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: '600' }}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {payments.filter(p => p.worker_id?._id === selectedWorker._id || p.worker_id === selectedWorker._id).map(payment => (
                                                    <tr key={payment._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                        <td style={{ padding: '12px', color: '#334155' }}>{new Date(payment.payment_date).toLocaleDateString()}</td>
                                                        <td style={{ padding: '12px', color: '#334155' }}>
                                                            {payment.payment_type === 'registration_fee' ? (
                                                                <span style={{ backgroundColor: '#e0e7ff', color: '#4338ca', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Registration</span>
                                                            ) : (
                                                                <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Renewal</span>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '12px', color: '#334155', fontWeight: '600' }}>₹{payment.amount}</td>
                                                        <td style={{ padding: '12px', fontWeight: 'bold', color: payment.payment_status === 'completed' ? '#10b981' : '#ef4444' }}>
                                                            {payment.payment_status.toUpperCase()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#64748b' }}>
                                        No payment records found for this worker.
                                    </div>
                                )}
                            </div>

                            {selectedWorker.status === 'pending' && (
                                <div className="modal-quick-actions">
                                    <button onClick={() => { updateStatus(selectedWorker._id, 'active'); setSelectedWorker(null); }} className="admin-btn btn-approve w-full"><MdCheck /> Approve Worker</button>
                                    <button onClick={() => { updateStatus(selectedWorker._id, 'rejected'); setSelectedWorker(null); }} className="admin-btn btn-reject w-full"><MdClose /> Reject Worker</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Workers;
