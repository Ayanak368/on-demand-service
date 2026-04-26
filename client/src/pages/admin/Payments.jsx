import { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { MdAttachMoney, MdPeopleOutline, MdPayment } from 'react-icons/md';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import './Admin.css';

const Payments = () => {
    const { token } = useContext(AuthContext);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await fetch('http://localhost:5001/api/admin/payments', { headers: { 'x-auth-token': token } });
                if (res.ok) {
                    const data = await res.json();
                    setPayments(data);
                }
            } catch (err) {
                console.error("Error fetching payments:", err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchPayments();
    }, [token]);

    if (loading) return <div className="admin-loading">Loading Payments Data...</div>;

    // Process payments for Bar Chart
    const monthlyRevenue = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    for(let i=5; i>=0; i--) {
        let d = new Date();
        d.setMonth(d.getMonth() - i);
        monthlyRevenue[`${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`] = 0;
    }

    payments.forEach(payment => {
        const d = new Date(payment.payment_date);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
        if (monthlyRevenue[key] !== undefined) {
            monthlyRevenue[key] += payment.amount || 0;
        }
    });

    const revenueData = Object.keys(monthlyRevenue).map(key => ({
        name: key,
        Revenue: monthlyRevenue[key]
    }));

    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalWorkersPaid = new Set(payments.map(p => typeof p.worker_id === 'object' ? p.worker_id?._id : p.worker_id)).size;

    return (
        <div className="admin-dashboard-view">
            <div className="admin-page-header">
                <h2>Worker Payments & Revenue</h2>
            </div>

            <div className="admin-table-container mt-8" style={{ marginTop: '24px', padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    {/* Revenue Summary */}
                    <div className="stat-card" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                        <div className="stat-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}><MdAttachMoney /></div>
                        <div className="stat-details">
                            <h3 style={{ color: '#64748b' }}>Total Platform Revenue</h3>
                            <p className="stat-number" style={{ color: '#0f172a' }}>₹{totalRevenue}</p>
                            <p style={{ fontSize: '12px', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>From {totalWorkersPaid} Workers</p>
                        </div>
                    </div>
                    <div className="stat-card" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                        <div className="stat-icon" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}><MdPayment /></div>
                        <div className="stat-details">
                            <h3 style={{ color: '#64748b' }}>Total Transactions</h3>
                            <p className="stat-number" style={{ color: '#0f172a' }}>{payments.length}</p>
                            <p style={{ fontSize: '12px', color: '#6366f1', marginTop: '4px', fontWeight: '600' }}>Registrations & Renewals</p>
                        </div>
                    </div>
                </div>

                {/* Bar Chart */}
                <h4 style={{ margin: '0 0 16px 0', color: '#334155', fontSize: '16px' }}>Monthly Revenue</h4>
                <div style={{ height: '300px', width: '100%', marginBottom: '40px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} dy={10} />
                            <YAxis tickFormatter={(val) => `₹${val}`} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} dx={-10} />
                            <RechartsTooltip 
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                formatter={(value) => [`₹${value}`, 'Revenue']}
                            />
                            <Bar dataKey="Revenue" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Worker Registrations Table */}
                <h4 style={{ margin: '0 0 16px 0', color: '#334155', fontSize: '16px' }}>All Worker Payments</h4>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Worker Name</th>
                            <th>Fee Type</th>
                            <th>Amount Paid</th>
                            <th>Payment Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.length > 0 ? (
                            payments.map(payment => (
                                <tr key={payment._id}>
                                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{payment.worker_id?.name || 'Unknown'}</td>
                                    <td>
                                        {payment.payment_type === 'registration_fee' ? (
                                            <span style={{ backgroundColor: '#e0e7ff', color: '#4338ca', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Registration</span>
                                        ) : (
                                            <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Renewal</span>
                                        )}
                                    </td>
                                    <td style={{ fontWeight: 800, color: '#10b981' }}>₹{payment.amount}</td>
                                    <td style={{ color: '#64748b' }}>{new Date(payment.payment_date).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`status-badge ${payment.payment_status === 'completed' ? 'active' : 'rejected'}`}>
                                            {payment.payment_status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>No payment records found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Payments;
