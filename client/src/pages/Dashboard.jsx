import { useEffect, useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import CustomerDashboard from './Customer';
import WorkerDashboard from './WorkerDashboard';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, token } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch requests logic can be moved or kept for basic dashboard
    useEffect(() => {
        const fetchRequests = async () => {
            if (user && (user.role === 'customer' || user.role === 'admin' || user.role === 'worker')) {
                setLoading(false); // Dashboards handle their own fetching
                return;
            }
        };

        if (token && user) fetchRequests();
    }, [token, user]);

    if (loading) {
        return (
            <div className="dashboard-loading animate-fade-in" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner-border" style={{ width: 60, height: 60, borderWidth: 6, color: '#007bff' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    // Professional summary card for all roles
    const summaryCard = (
        <div className="dashboard-summary-card animate-slide-up" style={{
            background: 'linear-gradient(120deg, #f8fafd 60%, #e3f2fd 100%)',
            borderRadius: 24,
            boxShadow: '0 4px 24px rgba(0,123,255,0.09)',
            padding: '32px 24px',
            margin: '32px auto 24px auto',
            maxWidth: 700,
            textAlign: 'center',
        }}>
            <h1 style={{ color: '#007bff', fontWeight: 800, fontSize: '2.3rem', marginBottom: 8 }}>
                Welcome, {user.name}!
            </h1>
            <p style={{ color: '#555', fontSize: '1.15rem', marginBottom: 0 }}>
                {user.role === 'admin' && 'Redirecting to your Admin Dashboard...'}
                {user.role === 'customer' && 'Book services, track your requests, and file complaints easily.'}
                {user.role === 'worker' && 'View and manage your assigned jobs and tasks.'}
            </p>
        </div>
    );

    // Quick actions (example, can be expanded)
    const quickActions = (
        <div className="dashboard-quick-actions animate-fade-in" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 24,
            marginBottom: 32,
            flexWrap: 'wrap',
        }}>
            {user.role === 'customer' && (
                <button className="btn btn-primary" style={{ minWidth: 180 }} onClick={() => window.location.href = '/service-request'}>
                    + Book a Service
                </button>
            )}
            {user.role === 'admin' && (
                <button className="btn btn-primary" style={{ minWidth: 180 }} onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}>
                    View Worker Management
                </button>
            )}
            {user.role === 'worker' && (
                <button className="btn btn-primary" style={{ minWidth: 180 }} onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}>
                    View My Jobs
                </button>
            )}
        </div>
    );

    // Worker status alerts
    if (user.role === 'worker') {
        if (user.status === 'pending') {
            return (
                <div className="dashboard container animate-fade-in">
                    {summaryCard}
                    <div className="alert alert-warning" style={{ padding: '20px', background: '#fff3cd', color: '#856404', borderRadius: '5px', maxWidth: 600, margin: '0 auto' }}>
                        <h2 style={{ marginBottom: 8 }}>Account Pending Verification</h2>
                        <p><strong>Your account is currently under review by an administrator.</strong></p>
                        <p>You will be able to accept jobs once your profile has been verified.</p>
                    </div>
                </div>
            );
        }
        if (user.status === 'blocked') {
            return (
                <div className="dashboard container animate-fade-in">
                    {summaryCard}
                    <div className="alert alert-danger" style={{ padding: '20px', background: '#f8d7da', color: '#721c24', borderRadius: '5px', maxWidth: 600, margin: '0 auto' }}>
                        <h2 style={{ marginBottom: 8 }}>Account Blocked</h2>
                        <p><strong>Your account has been blocked by an administrator.</strong></p>
                        <p>Please contact support for more information.</p>
                    </div>
                </div>
            );
        }
    }

    // Main dashboard content for each role
    if (user.role === 'admin') {
        return <Navigate to="/admin" replace />;
    }

    if (user.role === 'customer') {
        // Return full-screen layout without double-rendering the summaryCard
        return <CustomerDashboard user={user} token={token} />;
    }

    if (user.role === 'worker') {
        // Return full-screen layout for worker dashboard
        return <WorkerDashboard />;
    }

    return null;
};

export default Dashboard;
