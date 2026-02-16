import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CustomerDashboard = ({ user, token }) => {
    const [requests, setRequests] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'complaints'
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Requests
                const reqRes = await fetch('http://localhost:5001/api/service-requests', {
                    headers: { 'x-auth-token': token }
                });
                const reqData = await reqRes.json();
                setRequests(reqData);

                // Fetch Complaints
                const compRes = await fetch('http://localhost:5001/api/complaints', {
                    headers: { 'x-auth-token': token }
                });
                const compData = await compRes.json();
                setComplaints(compData);
            } catch (err) {
                console.error(err);
            }
        };

        if (token) fetchData();
    }, [token]);

    const services = [
        { name: 'Electrician', icon: '⚡' },
        { name: 'Plumber', icon: '🔧' },
        { name: 'Cleaner', icon: '🧹' },
        { name: 'Mover', icon: '📦' },
        { name: 'Other', icon: '🛠️' }
    ];

    const handleServiceClick = (serviceType) => {
        // Navigate to service request page with pre-selected service type (implementation detail for ServiceRequest.jsx needed later)
        // For now, just navigate
        navigate('/service-request', { state: { serviceType } });
    };

    return (
        <div className="customer-dashboard container">
            <div className="welcome-section">
                <h1>Welcome back, {user.name}!</h1>
                <p>What do you need help with today?</p>
            </div>

            <div className="services-grid">
                {services.map(service => (
                    <div key={service.name} className="service-card" onClick={() => handleServiceClick(service.name)}>
                        <div className="service-icon">{service.icon}</div>
                        <h3>{service.name}</h3>
                    </div>
                ))}
            </div>

            <div className="dashboard-tabs">
                <button
                    className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
                    onClick={() => setActiveTab('requests')}
                >
                    My Requests
                </button>
                <button
                    className={`tab-btn ${activeTab === 'complaints' ? 'active' : ''}`}
                    onClick={() => setActiveTab('complaints')}
                >
                    My Complaints
                </button>
            </div>

            <div className="dashboard-content">
                {activeTab === 'requests' && (
                    <div className="request-list">
                        {requests.length === 0 ? <p>No service requests yet.</p> : (
                            requests.map(req => (
                                <div key={req._id} className="request-card">
                                    <div className="card-header">
                                        <h4>{req.serviceType}</h4>
                                        <span className={`status-badge ${req.status}`}>{req.status}</span>
                                    </div>
                                    <p>{req.details}</p>
                                    <p className="card-meta">📅 {new Date(req.createdAt).toLocaleDateString()} | 📍 {req.location}</p>
                                    {req.worker && <p className="card-meta">👷 {req.worker.name}</p>}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'complaints' && (
                    <div className="complaint-list">
                        {complaints.length === 0 ? <p>No complaints filed.</p> : (
                            complaints.map(comp => (
                                <div key={comp._id} className="request-card">
                                    <div className="card-header">
                                        <h4>{comp.subject}</h4>
                                        <span className={`status-badge ${comp.status}`}>{comp.status}</span>
                                    </div>
                                    <p>{comp.description}</p>
                                    {comp.reply && (
                                        <div className="admin-reply">
                                            <strong>Admin Reply:</strong> {comp.reply}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                        <button className="btn btn-secondary mt-3" onClick={() => navigate('/complaint')}>File a Complaint</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerDashboard;
