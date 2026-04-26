// client/src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.svg';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:5001/api/users/forgotpassword', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage(data.msg);
            } else {
                setError(data.msg || 'Something went wrong');
            }
        } catch (err) {
            setError('Could not connect to the server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden px-4 sm:px-6 py-6">
            {/* Background Decorations */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(theme(colors.slate.300)_1px,transparent_1px)] bg-[size:40px_40px] opacity-60"></div>
                <div className="absolute top-[-10%] left-[-5%] md:left-[10%] w-[35rem] h-[35rem] bg-blue-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
                <div className="absolute bottom-[-10%] right-[-5%] md:right-[15%] w-[40rem] h-[40rem] bg-indigo-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
            </div>

            <div className="w-full max-w-md mx-auto relative z-10">
                <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100/50 p-8 sm:p-10">
                    <div className="mb-8 text-center flex flex-col items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg mb-6">
                            <img src={logo} alt="On-Demand" className="h-7 w-auto filter brightness-0 invert" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2">Forgot Password</h1>
                        <p className="text-gray-500 font-medium">Enter your email and we'll send a link to reset your password.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-100 text-center">
                            {error}
                        </div>
                    )}

                    {message ? (
                        <div className="text-center">
                            <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-xl text-sm font-semibold border border-green-100">
                                {message}
                            </div>
                            <Link to="/login" className="block w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-[0.98]">
                                Return to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={onSubmit} className="space-y-6">
                            <div>
                                <label className="text-sm font-bold text-gray-700 mb-2 block">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200"
                                    placeholder="Enter your registered email"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    )}

                    {!message && (
                        <div className="mt-8 text-center">
                            <Link to="/login" className="text-gray-500 hover:text-blue-600 font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                                Back to login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
