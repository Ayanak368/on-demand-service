import { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { MdCheck, MdClose, MdBlock, MdLockOpen, MdPersonOff, MdVisibility, MdDelete } from 'react-icons/md';
import './Admin.css';

const Customers = () => {
    const { token } = useContext(AuthContext);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const fetchCustomers = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/admin/customers', {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setCustomers(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching customers:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchCustomers();
        }
    }, [token]);

    const updateStatus = async (id, status) => {
        try {
            await fetch(`http://localhost:5001/api/admin/customers/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ status })
            });
            fetchCustomers();
        } catch (err) {
            console.error("Error updating status:", err);
        }
    };

    const deleteCustomer = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this customer?")) return;
        try {
            await fetch(`http://localhost:5001/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            if (selectedCustomer && selectedCustomer._id === id) {
                setSelectedCustomer(null);
            }
            fetchCustomers();
        } catch (err) {
            console.error("Error deleting customer:", err);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'active': return 'status-active';
            case 'blocked': return 'status-blocked';
            default: return 'status-pending';
        }
    };

    if (loading) return <div className="admin-loading">Loading Customers...</div>;

    const filteredCustomers = customers.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-workers-view">
            <div className="admin-page-header">
                <h2>Customer Management</h2>
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
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Joined Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: 0 }}>
                                    <div className="empty-state" style={{ margin: '20px' }}>
                                        <MdPersonOff size={48} color="#cbd5e1" />
                                        <p>No customers found.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredCustomers.map(customer => (
                                <tr key={customer._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
                                            <div className="table-avatar-placeholder" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
                                                {customer.name?.charAt(0).toUpperCase()}
                                            </div>
                                            {customer.name}
                                        </div>
                                    </td>
                                    <td>{customer.email}</td>
                                    <td>{customer.phone || 'N/A'}</td>
                                    <td>
                                        <span className={`admin-status-badge ${getStatusClass(customer.status)}`}>
                                            {(customer.status || 'active').charAt(0).toUpperCase() + (customer.status || 'active').slice(1)}
                                        </span>
                                    </td>
                                    <td>
                                        {new Date(customer.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="action-cell">
                                        {(customer.status === 'active' || !customer.status) && (
                                            <button onClick={() => updateStatus(customer._id, 'blocked')} className="admin-btn btn-block"><MdBlock /> Block</button>
                                        )}
                                        {customer.status === 'blocked' && (
                                            <button onClick={() => updateStatus(customer._id, 'active')} className="admin-btn btn-approve"><MdLockOpen /> Unblock</button>
                                        )}
                                        <button onClick={() => setSelectedCustomer(customer)} className="admin-btn btn-view"><MdVisibility /> View</button>
                                        <button onClick={() => deleteCustomer(customer._id)} className="admin-btn btn-reject"><MdDelete /> Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Customer Details Modal */}
            {selectedCustomer && (
                <div className="admin-modal-overlay" onClick={() => setSelectedCustomer(null)}>
                    <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>Customer Details</h3>
                            <button className="admin-modal-close" onClick={() => setSelectedCustomer(null)}><MdClose size={24} /></button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="worker-profile-header">
                                <div className="modal-avatar-placeholder" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
                                    {selectedCustomer.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="modal-worker-name">{selectedCustomer.name}</h4>
                                    <span className={`admin-status-badge ${getStatusClass(selectedCustomer.status)}`}>
                                        {(selectedCustomer.status || 'active').charAt(0).toUpperCase() + (selectedCustomer.status || 'active').slice(1)}
                                    </span>
                                </div>
                            </div>
                            <div className="worker-detail-grid">
                                <div className="detail-item">
                                    <label>Email Address</label>
                                    <p>{selectedCustomer.email}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Phone Number</label>
                                    <p>{selectedCustomer.phone || 'N/A'}</p>
                                </div>
                                <div className="detail-item full-width">
                                    <label>Address / Location</label>
                                    <p>{selectedCustomer.address || selectedCustomer.location || 'N/A'}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Joined Date</label>
                                    <p>{new Date(selectedCustomer.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="modal-quick-actions" style={{ marginTop: '20px' }}>
                                {(selectedCustomer.status === 'active' || !selectedCustomer.status) ? (
                                    <button onClick={() => { updateStatus(selectedCustomer._id, 'blocked'); setSelectedCustomer(null); }} className="admin-btn btn-block w-full"><MdBlock /> Block Customer</button>
                                ) : (
                                    <button onClick={() => { updateStatus(selectedCustomer._id, 'active'); setSelectedCustomer(null); }} className="admin-btn btn-approve w-full"><MdLockOpen /> Unblock Customer</button>
                                )}
                                <button onClick={() => deleteCustomer(selectedCustomer._id)} className="admin-btn btn-reject w-full"><MdDelete /> Delete Customer</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
