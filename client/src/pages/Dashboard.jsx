import { useEffect, useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import CustomerDashboard from './CustomerDashboard';
import WorkerDashboard from './WorkerDashboard';

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


    if (loading) return <div>Loading...</div>;

    if (user.role === 'admin') {
        return <AdminDashboard />;
    }

    if (user.role === 'customer') {
        return <CustomerDashboard user={user} token={token} />;
    }

    if (user.role === 'worker') {
        if (user.status === 'pending') {
            return (
                <div className="dashboard container">
                    <h2>Account Pending Verification</h2>
                    <div className="alert alert-warning" style={{ padding: '20px', background: '#fff3cd', color: '#856404', borderRadius: '5px' }}>
                        <p><strong>Your account is currently under review by an administrator.</strong></p>
                        <p>You will be able to accept jobs once your profile has been verified.</p>
                    </div>
                </div>
            );
        }
        if (user.status === 'blocked') {
            return (
                <div className="dashboard container">
                    <h2>Account Blocked</h2>
                    <div className="alert alert-danger" style={{ padding: '20px', background: '#f8d7da', color: '#721c24', borderRadius: '5px' }}>
                        <p><strong>Your account has been blocked by an administrator.</strong></p>
                        <p>Please contact support for more information.</p>
                    </div>
                </div>
            );
        }
        return <WorkerDashboard />;
    }

    return <div>Role not recognized</div>;
};

export default Dashboard;
