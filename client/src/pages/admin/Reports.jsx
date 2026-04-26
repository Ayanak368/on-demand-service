import { useState, useEffect, useContext } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import AuthContext from '../../context/AuthContext';
import './Admin.css';

const Reports = () => {
    const { token } = useContext(AuthContext);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalWorkers: 0,
        totalBookings: 0,
        completedJobs: 0,
    });
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('all');
    
    // Revenue Data
    const [rawPayments, setRawPayments] = useState([]);
    const [revenueData, setRevenueData] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const [statsRes, paymentsRes] = await Promise.all([
                fetch(`http://localhost:5001/api/admin/stats?timeframe=${timeframe}`, { headers: { 'x-auth-token': token } }),
                fetch(`http://localhost:5001/api/admin/payments`, { headers: { 'x-auth-token': token } })
            ]);

            if (statsRes.ok) {
                const data = await statsRes.json();
                setStats(data);
            }
            if (paymentsRes.ok) {
                const pData = await paymentsRes.json();
                setRawPayments(pData);
                processRevenue(pData, timeframe);
            }
        } catch (err) {
            console.error("Error fetching admin stats:", err);
        } finally {
            setLoading(false);
        }
    };

    const processRevenue = (payments, filter) => {
        const now = new Date();
        let filtered = payments;

        if (filter === 'monthly') {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(now.getMonth() - 1);
            filtered = payments.filter(p => new Date(p.payment_date) >= oneMonthAgo);
        } else if (filter === 'weekly') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(now.getDate() - 7);
            filtered = payments.filter(p => new Date(p.payment_date) >= oneWeekAgo);
        }

        const total = filtered.reduce((sum, p) => sum + (p.amount || 0), 0);
        setTotalRevenue(total);

        // Group by day for weekly/monthly, or month for 'all'
        const grouped = {};
        filtered.forEach(p => {
            const d = new Date(p.payment_date);
            let key = '';
            if (filter === 'all') {
                key = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear().toString().substring(2)}`;
            } else {
                key = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
            }
            grouped[key] = (grouped[key] || 0) + (p.amount || 0);
        });

        const revData = Object.keys(grouped).map(k => ({ name: k, Revenue: grouped[k] }));
        setRevenueData(revData);
    };

    const exportToCSV = () => {
        if (!rawPayments || rawPayments.length === 0) {
            alert('No payment data available to export.');
            return;
        }

        // CSV Header
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Payment ID,Worker Name,Worker Email,Payment Type,Amount (INR),Status,Date\n";

        // CSV Rows
        rawPayments.forEach(p => {
            const id = p._id;
            const name = p.worker_id?.name || 'Unknown';
            const email = p.worker_id?.email || 'N/A';
            const type = p.payment_type;
            const amount = p.amount;
            const status = p.payment_status;
            const date = new Date(p.payment_date).toLocaleDateString();

            // Escape commas and quotes inside fields if necessary
            const row = `"${id}","${name}","${email}","${type}",${amount},"${status}","${date}"`;
            csvContent += row + "\n";
        });

        // Trigger download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `revenue_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        if (token) fetchReports();
    }, [token, timeframe]);

    if (loading) return <div className="admin-loading">Loading Reports...</div>;

    return (
        <div className="admin-reports-view">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <h2>System Reports</h2>
                    <p className="admin-subtitle">High-level statistics for the On-Demand platform.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={exportToCSV}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#10b981', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <span>📥</span> Export CSV
                    </button>
                    <select 
                        value={timeframe} 
                        onChange={(e) => setTimeframe(e.target.value)}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'white', fontWeight: '500', color: '#374151', cursor: 'pointer', outline: 'none', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                    >
                        <option value="all">All Time</option>
                        <option value="monthly">Past Month</option>
                        <option value="weekly">Past Week</option>
                    </select>
                </div>
            </div>

            <div className="admin-cards-grid report-grid">
                <div className="report-card">
                    <div className="report-icon" style={{ background: '#e0f7fa', color: '#006064' }}>👥</div>
                    <div className="report-details">
                        <span className="report-label">Total Users</span>
                        <h3 className="report-number">{stats.totalUsers}</h3>
                    </div>
                </div>

                <div className="report-card">
                    <div className="report-icon" style={{ background: '#e3f2fd', color: '#0d47a1' }}>👷</div>
                    <div className="report-details">
                        <span className="report-label">Total Workers</span>
                        <h3 className="report-number">{stats.totalWorkers}</h3>
                    </div>
                </div>

                <div className="report-card">
                    <div className="report-icon" style={{ background: '#fff3e0', color: '#e65100' }}>📅</div>
                    <div className="report-details">
                        <span className="report-label">Total Bookings</span>
                        <h3 className="report-number">{stats.totalBookings}</h3>
                    </div>
                </div>

                <div className="report-card">
                    <div className="report-icon" style={{ background: '#e8f5e9', color: '#1b5e20' }}>✅</div>
                    <div className="report-details">
                        <span className="report-label">Completed Jobs</span>
                        <h3 className="report-number">{stats.completedJobs}</h3>
                    </div>
                </div>

            </div>

            <div className="admin-reports-chart-container" style={{ width: '100%', height: 400, marginTop: '2rem', backgroundColor: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', color: '#111827', fontWeight: 'bold', margin: 0 }}>Platform Revenue</h3>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>₹{totalRevenue}</div>
                </div>
                <ResponsiveContainer width="100%" height="80%">
                    <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 13, fontWeight: 500}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 13}} dx={-10} tickFormatter={(val) => `₹${val}`} />
                        <Tooltip cursor={{ stroke: '#f3f4f6', strokeWidth: 2 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', fontWeight: 'bold', color: '#1f2937', padding: '12px' }} formatter={(value) => [`₹${value}`, 'Revenue']} />
                        <Line type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="admin-reports-chart-container" style={{ width: '100%', height: 400, marginTop: '2rem', backgroundColor: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <h3 style={{ marginBottom: '2rem', fontSize: '1.25rem', color: '#111827', fontWeight: 'bold' }}>Platform Overview Activity</h3>
                <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={[
                        { name: 'Total Users', value: stats.totalUsers || 0, color: '#3b82f6' },
                        { name: 'Total Workers', value: stats.totalWorkers || 0, color: '#8b5cf6' },
                        { name: 'Total Bookings', value: stats.totalBookings || 0, color: '#f59e0b' },
                        { name: 'Completed Jobs', value: stats.completedJobs || 0, color: '#10b981' }
                    ]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 13, fontWeight: 500}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 13}} dx={-10} />
                        <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', fontWeight: 'bold', color: '#1f2937', padding: '12px' }} itemStyle={{color: '#1f2937'}} />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
                            {[
                                { name: 'Total Users', value: stats.totalUsers || 0, color: '#3b82f6' },
                                { name: 'Total Workers', value: stats.totalWorkers || 0, color: '#8b5cf6' },
                                { name: 'Total Bookings', value: stats.totalBookings || 0, color: '#f59e0b' },
                                { name: 'Completed Jobs', value: stats.completedJobs || 0, color: '#10b981' }
                            ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Reports;
