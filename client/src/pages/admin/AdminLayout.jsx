import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { MdDashboard, MdPeople, MdPeopleOutline, MdReportProblem, MdBarChart, MdNotifications, MdLogout, MdFeedback, MdLocalOffer, MdDesignServices, MdPayment } from 'react-icons/md';
import AuthContext from '../../context/AuthContext';
import './Admin.css';

const AdminLayout = () => {
    const { user, token, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (token) {
                try {
                    const res = await fetch('http://localhost:5001/api/notifications', {
                        headers: { 'x-auth-token': token }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setNotifications(data);
                    }
                } catch (err) {
                    console.error('Failed to fetch notifications');
                }
            }
        };
        fetchNotifications();
    }, [token]);

    const markAsRead = async (id) => {
        try {
            await fetch(`http://localhost:5001/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Failed to mark read');
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const onLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: <MdDashboard /> },
        { path: '/admin/workers', label: 'Workers', icon: <MdPeople /> },
        { path: '/admin/customers', label: 'Customers', icon: <MdPeopleOutline /> },
        { path: '/admin/complaints', label: 'Complaints', icon: <MdReportProblem /> },
        { path: '/admin/reports', label: 'Reports', icon: <MdBarChart /> },
        { path: '/admin/feedback', label: 'Feedback', icon: <MdFeedback /> },
        { path: '/admin/offers', label: 'Offers', icon: <MdLocalOffer /> },
        { path: '/admin/services', label: 'Services', icon: <MdDesignServices /> },
        { path: '/admin/payments', label: 'Payments', icon: <MdPayment /> },
    ];

    if (!user || user.role !== 'admin') {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Access Denied. Admins Only.</div>;
    }

    return (
        <div className="admin-container">
            {/* Sidebar Navigation */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h2>Admin Panel</h2>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="admin-main">
                {/* Top Header */}
                <header className="admin-header">
                    <div className="header-left">
                    </div>

                    <div className="header-right">
                        <div className="header-icon" onClick={() => setShowNotifications(!showNotifications)} style={{ position: 'relative', cursor: 'pointer' }}>
                            <MdNotifications />
                            {unreadCount > 0 && <span className="header-icon-badge">{unreadCount}</span>}

                            {showNotifications && (
                                <div className="notifications-dropdown" style={{
                                    position: 'absolute', top: '40px', right: '-10px', width: '300px',
                                    background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 50, maxHeight: '400px', overflowY: 'auto'
                                }}>
                                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e293b' }}>
                                        Notifications
                                    </div>
                                    {notifications.length === 0 ? (
                                        <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>No notifications</div>
                                    ) : (
                                        notifications.map(n => (
                                            <div key={n._id} onClick={() => !n.isRead && markAsRead(n._id)} style={{
                                                padding: '12px 16px', borderBottom: '1px solid #f1f5f9', cursor: n.isRead ? 'default' : 'pointer',
                                                background: n.isRead ? 'white' : '#f8fafc',
                                                display: 'flex', alignItems: 'center', gap: '10px'
                                            }}>
                                                <div style={{
                                                    width: '8px', height: '8px', borderRadius: '50%',
                                                    background: n.isRead ? 'transparent' : '#4f46e5', flexShrink: 0
                                                }}></div>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ margin: 0, fontSize: '14px', color: '#334155', fontWeight: n.isRead ? 'normal' : '500' }}>{n.message}</p>
                                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="header-profile-menu">
                            <div className="header-avatar">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div className="header-greeting">
                                <h3>{user.name}</h3>
                                <p>Admin</p>
                            </div>
                            <button className="admin-logout-btn" onClick={onLogout} title="Logout" style={{ marginLeft: '10px', padding: '6px 10px' }}>
                                <MdLogout size={16} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Dashboard Views */}
                <div className="admin-content-area animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
