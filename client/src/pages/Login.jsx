import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import logo from '../assets/logo.svg';
import { Link } from 'react-router-dom';
import heroImg from '../assets/hero-workers.png';

const Login = ({ isModal = false }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [step, setStep] = useState(1);
    const { login, openAuthModal, closeAuthModal } = useContext(AuthContext);
    const navigate = useNavigate();

    const { email, password } = formData;

    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'email':
                if (!value) error = 'Email is required';
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
                break;
            case 'password':
                if (!value) error = 'Password is required';
                break;
            default:
                break;
        }
        return error;
    };

    const onChange = e => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        const error = validateField(name, value);
        setErrors({ ...errors, [name]: error });
        setTouched({ ...touched, [name]: true });
    };

    const onBlur = e => {
        const { name } = e.target;
        setTouched({ ...touched, [name]: true });
    };

    const handleGoogleLogin = () => {
        console.log('Google login');
    };

    const handleFacebookLogin = () => {
        console.log('Facebook login');
    };

    const isFormValid = () => {
        return email && password && !errors.email && !errors.password;
    };

    const onSubmit = async e => {
        console.log('login form submit');
        e.preventDefault();
        if (!isFormValid()) {
            alert('Please fill in a valid email and password before signing in.');
            return;
        }

        try {
            const res = await fetch('http://localhost:5001/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                login(data.user, data.token);
                if (closeAuthModal) closeAuthModal();

                if (data.user.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            } else {
                alert(data.msg);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className={`${isModal ? '' : 'min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden'} px-4 sm:px-6 py-6`}>
            {/* Background Decorations */}
            {!isModal && (
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(theme(colors.slate.300)_1px,transparent_1px)] bg-[size:40px_40px] opacity-60"></div>
                    <div className="absolute top-[-10%] left-[-5%] md:left-[10%] w-[35rem] h-[35rem] bg-blue-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
                    <div className="absolute bottom-[-10%] right-[-5%] md:right-[15%] w-[40rem] h-[40rem] bg-indigo-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
                </div>
            )}
            
            {/* Main Container */}
            <div className="w-full max-w-5xl mx-auto relative z-10">
                <div className={`grid ${isModal ? 'grid-cols-1' : 'md:grid-cols-2'} gap-0 bg-white ${isModal ? '' : 'rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100/50'} overflow-hidden`}>

                    {/* Login Form */}
                    <div className="p-6 sm:p-8 flex flex-col justify-center">
                        {/* Logo */}
                        <div className="mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                                <img src={logo} alt="On-Demand" className="h-6 w-auto filter brightness-0 invert" />
                            </div>
                        </div>

                        {/* Header */}
                        <div className="mb-4">
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">Sign in</h1>
                            <p className="text-gray-600 text-sm">to access your account</p>
                        </div>

                        {/* Form */}
                        <form className="space-y-4" onSubmit={onSubmit} autoComplete="off">
                            {/* Email Field */}
                            <div>
                                <input
                                    id="email"
                                    className={`w-full px-5 py-4 border-2 rounded-xl text-gray-900 text-base placeholder-gray-400 transition-all duration-200 focus:outline-none ${touched.email && errors.email
                                        ? 'border-red-400 focus:border-red-500 bg-red-50'
                                        : 'border-gray-300 focus:border-blue-500 bg-white'
                                        }`}
                                    type="email"
                                    name="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    autoComplete="off"
                                    required
                                />
                                {touched.email && errors.email && (
                                    <p className="text-red-500 text-sm mt-2 font-medium">{errors.email}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <input
                                    id="password"
                                    className={`w-full px-5 py-4 border-2 rounded-xl text-gray-900 text-base placeholder-gray-400 transition-all duration-200 focus:outline-none ${touched.password && errors.password
                                        ? 'border-red-400 focus:border-red-500 bg-red-50'
                                        : 'border-gray-300 focus:border-blue-500 bg-white'
                                        }`}
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    autoComplete="new-password"
                                    required
                                />
                                {touched.password && errors.password && (
                                    <p className="text-red-500 text-sm mt-2 font-medium">{errors.password}</p>
                                )}
                                <div className="flex justify-end mt-2">
                                    <Link to="/forgot-password" className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors shrink-0">
                                        Forgot Password?
                                    </Link>
                                </div>
                            </div>

                            {/* Sign In Button */}
                            <button
                                className={`w-full py-4 px-4 font-semibold rounded-xl transition-all duration-200 text-white text-lg ${isFormValid()
                                    ? 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-lg'
                                    : 'bg-blue-600/80 hover:bg-blue-700 active:scale-95 shadow-lg'
                                    }`}
                                type="submit"
                            >
                                Sign in
                            </button>
                        </form>

                        {/* Sign Up Link */}
                        <div className="mt-6 text-center">
                            <p className="text-gray-600">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-blue-600 font-semibold hover:underline transition-colors">
                                    Sign up now
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Right Section - Project Features */}
                    {!isModal && (
                        <div className="hidden md:flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                            <div className="w-full relative">
                                {/* Hero Image with Floating Features */}
                                <div className="relative w-full">
                                    <img
                                        src={heroImg}
                                        alt="On-Demand Services"
                                        className="w-full h-auto rounded-lg shadow-md"
                                    />

                                    {/* Floating Feature 1 - Top Left */}
                                    <div className="absolute top-4 left-4 bg-white rounded-full p-3 shadow-lg" style={{ animationDelay: '0s' }}>
                                        <div className="text-3xl">🏠</div>
                                    </div>

                                    {/* Floating Feature 2 - Top Right */}
                                    <div className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-lg" style={{ animationDelay: '0.2s' }}>
                                        <div className="text-3xl">⭐</div>
                                    </div>

                                    {/* Floating Feature 3 - Bottom Left */}
                                    <div className="absolute bottom-4 left-4 bg-white rounded-full p-3 shadow-lg" style={{ animationDelay: '0.4s' }}>
                                        <div className="text-3xl">⚡</div>
                                    </div>

                                    {/* Floating Feature 4 - Bottom Right */}
                                    <div className="absolute bottom-4 right-4 bg-white rounded-full p-3 shadow-lg" style={{ animationDelay: '0.6s' }}>
                                        <div className="text-3xl">💰</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!isModal && (
                    <p className="text-center text-gray-500 text-xs mt-4">
                        © 2026 On-Demand. All Rights Reserved.
                    </p>
                )}
            </div>
        </div>
    );
};

export default Login;
