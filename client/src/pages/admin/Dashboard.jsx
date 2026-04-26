import { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { MdPeopleOutline, MdPendingActions, MdReportProblem, MdCheckCircleOutline, MdAttachMoney } from 'react-icons/md';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import './Admin.css';

const Dashboard = () => {
    const { token } = useContext(AuthContext);
    const [stats, setStats] = useState({
        totalWorkers: 0,
        pendingApprovals: 0,
        totalComplaints: 0,
        completedJobs: 0,
        workerEarnings: [],
        payments: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const [workersRes, complaintsRes, requestsRes, paymentsRes] = await Promise.all([
                    fetch('http://localhost:5001/api/admin/workers', { headers: { 'x-auth-token': token } }),
                    fetch('http://localhost:5001/api/complaints', { headers: { 'x-auth-token': token } }),
                    fetch('http://localhost:5001/api/service-requests', { headers: { 'x-auth-token': token } }),
                    fetch('http://localhost:5001/api/admin/payments', { headers: { 'x-auth-token': token } })
                ]);

                if (workersRes.ok && complaintsRes.ok && requestsRes.ok && paymentsRes.ok) {
                    const workers = await workersRes.json();
                    const complaints = await complaintsRes.json();
                    const requests = await requestsRes.json();
                    const payments = await paymentsRes.json();

                    const completedRequests = requests.filter(r => r.status === 'completed' || r.status === 'Completed');
                    const workerEarningsMap = {};
                    const workerJobsMap = {};

                    completedRequests.forEach(req => {
                        if (req.worker) {
                            const workerId = typeof req.worker === 'object' ? req.worker._id : req.worker;
                            const earning = Number(req.finalPrice) || Number(req.price) || 0;
                            workerEarningsMap[workerId] = (workerEarningsMap[workerId] || 0) + earning;
                            workerJobsMap[workerId] = (workerJobsMap[workerId] || 0) + 1;
                        }
                    });

                    const earningsData = workers
                        .filter(w => w.status !== 'pending' && w.status !== 'rejected')
                        .map(w => ({
                            id: w._id,
                            name: w.name,
                            profession: w.profession,
                            totalEarnings: workerEarningsMap[w._id] || 0,
                            completedJobs: workerJobsMap[w._id] || 0,
                            rating: w.averageRating || 0,
                            subscriptionExpiry: w.subscriptionExpiry
                        }))
                        .sort((a, b) => b.totalEarnings - a.totalEarnings);

                    setStats({
                        totalWorkers: workers.length,
                        pendingApprovals: workers.filter(w => w.status === 'pending').length,
                        totalComplaints: complaints.length,
                        completedJobs: completedRequests.length,
                        workerEarnings: earningsData,
                        payments: payments || []
                    });
                }
            } catch (err) {
                console.error("Error fetching dashboard stats:", err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchDashboardStats();
    }, [token]);

    if (loading) return <div className="admin-loading">Loading Dashboard Data...</div>;

    const totalPlatformEarnings = stats.payments ? stats.payments.reduce((sum, p) => sum + (p.amount || 0), 0) : 0;
    
    const now = new Date();
    const monthlySubscriptions = stats.payments ? stats.payments.filter(p => {
        const d = new Date(p.payment_date);
        return p.payment_type === 'renewal_fee' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length : 0;

    const activePremiumWorkers = stats.workerEarnings ? stats.workerEarnings.filter(w => {
        return w.subscriptionExpiry && new Date(w.subscriptionExpiry) > now;
    }).length : 0;

    return (
        <div className="admin-dashboard-view">
            <h2>Dashboard Overview</h2>
            <div className="dashboard-cards-grid">
                <div className="stat-card blue">
                    <div className="stat-icon blue"><MdPeopleOutline /></div>
                    <div className="stat-details">
                        <h3>Total Workers</h3>
                        <p className="stat-number">{stats.totalWorkers}</p>
                    </div>
                </div>
                <div className="stat-card orange">
                    <div className="stat-icon orange"><MdPendingActions /></div>
                    <div className="stat-details">
                        <h3>Pending Approvals</h3>
                        <p className="stat-number">{stats.pendingApprovals}</p>
                    </div>
                </div>
                <div className="stat-card red">
                    <div className="stat-icon red"><MdReportProblem /></div>
                    <div className="stat-details">
                        <h3>Total Complaints</h3>
                        <p className="stat-number">{stats.totalComplaints}</p>
                    </div>
                </div>
                <div className="stat-card green">
                    <div className="stat-icon green"><MdCheckCircleOutline /></div>
                    <div className="stat-details">
                        <h3>Completed Jobs</h3>
                        <p className="stat-number">{stats.completedJobs}</p>
                    </div>
                </div>
                
                {/* New Premium Stats */}
                <div className="stat-card" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <div className="stat-icon" style={{ backgroundColor: '#16a34a', color: 'white' }}><MdAttachMoney /></div>
                    <div className="stat-details" style={{ width: '100%' }}>
                        <h3 style={{ color: '#166534', fontSize: '0.875rem' }}>Total Platform Earnings</h3>
                        <p className="stat-number" style={{ color: '#14532d', fontSize: '1.5rem', marginBottom: '8px' }}>₹{totalPlatformEarnings}</p>
                        <a href="/admin/payments" style={{ display: 'inline-block', fontSize: '0.8rem', color: '#16a34a', fontWeight: 'bold', textDecoration: 'none' }}>View Payments →</a>
                    </div>
                </div>
                
                <div className="stat-card" style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}>
                    <div className="stat-icon" style={{ backgroundColor: '#d97706', color: 'white' }}><MdPeopleOutline /></div>
                    <div className="stat-details" style={{ width: '100%' }}>
                        <h3 style={{ color: '#92400e', fontSize: '0.875rem' }}>Active Premium Workers</h3>
                        <p className="stat-number" style={{ color: '#78350f', fontSize: '1.5rem', marginBottom: '8px' }}>{activePremiumWorkers}</p>
                        <a href="/admin/workers" style={{ display: 'inline-block', fontSize: '0.8rem', color: '#d97706', fontWeight: 'bold', textDecoration: 'none' }}>Manage Workers →</a>
                    </div>
                </div>
            </div>

            <div className="admin-table-container mt-8" style={{ marginTop: '32px' }}>
                <div className="admin-page-header" style={{ padding: '24px 24px 0 24px', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, color: '#1e293b', fontWeight: '700' }}>Worker Performance Section</h3>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Worker Name</th>
                            <th>Completed Jobs</th>
                            <th>Ratings</th>
                            <th>Total Earnings</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.workerEarnings && stats.workerEarnings.length > 0 ? (
                            stats.workerEarnings.map(worker => (
                                <tr key={worker.id}>
                                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{worker.name}</td>
                                    <td><span style={{ fontWeight: 600, color: '#4b5563' }}>{worker.completedJobs ?? 0} Jobs</span></td>
                                    <td><span style={{ fontWeight: 'bold', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>⭐ {worker.rating ?? 0}</span></td>
                                    <td style={{ fontWeight: 800, color: '#10b981' }}>₹{worker.totalEarnings}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', color: '#64748b' }}>No worker performance data available</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
