import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import logo from '../assets/logo.svg';

const Navbar = () => {
    const { user, logout, openAuthModal } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const onLogout = () => {
        logout();
        navigate('/login');
    };

    const handleScroll = (e, id) => {
        if (location.pathname === '/') {
            e.preventDefault();
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                window.history.pushState(null, '', `/#${id}`);
            }
        }
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-8 xl:px-12">
                <div className="flex justify-between items-center h-20">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5">
                        <img src={logo} alt="Logo" className="h-10 w-10" />
                        <span className="text-2xl font-bold text-gray-900 tracking-tight">On-Demand</span>
                    </Link>

                    {/* Links */}
                    <div className="hidden md:flex items-center gap-10">
                        <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium text-lg tracking-wide transition-colors">Home</Link>
                        <Link to="/#services" onClick={(e) => handleScroll(e, 'services')} className="text-gray-600 hover:text-blue-600 font-medium text-lg tracking-wide transition-colors">Services</Link>
                        <Link to="/#about" onClick={(e) => handleScroll(e, 'about')} className="text-gray-600 hover:text-blue-600 font-medium text-lg tracking-wide transition-colors">About</Link>
                    </div>

                    {/* Auth */}
                    <div className="flex items-center gap-6">
                        {!user ? (
                            <>
                                <button onClick={() => navigate('/login')} className="text-gray-600 hover:text-gray-900 font-medium text-lg hidden sm:block focus:outline-none transition-colors">
                                    Log In
                                </button>
                                <button onClick={() => navigate('/register')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-lg shadow-sm hover:-translate-y-0.5 transition-all focus:outline-none">
                                    Sign Up
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-6">
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="text-blue-600 font-bold text-base hover:opacity-80 transition-opacity">Admin Panel</Link>
                                )}

                                <button onClick={() => navigate('/profile')} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity focus:outline-none">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border border-gray-300">
                                        {user.photo ? (
                                            <img src={`http://localhost:5001/${user.photo.replace(/\\/g, '/')}`} alt="avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-gray-600 font-bold text-sm">
                                                {user.name ? user.name[0].toUpperCase() : 'U'}
                                            </span>
                                        )}
                                    </div>
                                    <span className="hidden sm:block text-base font-bold text-gray-700">{user.name?.split(' ')[0] || 'Profile'}</span>
                                </button>

                                <button onClick={onLogout} className="text-gray-500 hover:text-red-600 font-bold text-base transition-colors focus:outline-none">
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
};

export default Navbar;
