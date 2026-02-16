import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import logo from '../assets/logo.svg';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const onLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <img src={logo} alt="Logo" style={{ marginRight: '10px', height: '40px' }} />
                <h1><Link to="/">Local Workforce</Link></h1>
            </div>
            <ul>
                {!user ? (
                    <>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/register">Register</Link></li>
                    </>
                ) : (
                    <>
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        {user.role === 'customer' && <li><Link to="/service-request">Request Service</Link></li>}
                        {user.role === 'admin' && <li><Link to="/admin">Admin Panel</Link></li>}
                        {user.role === 'customer' && <li><Link to="/complaint">File Complaint</Link></li>}
                        {user.role === 'worker' && <li><Link to="/profile">Profile</Link></li>}
                        <li><button onClick={onLogout}>Logout</button></li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
