import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        if (password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setLoading(true);

        try {
            const res = await fetch(`http://localhost:5001/api/users/resetpassword/${token}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            const data = await res.json();
            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.msg || 'Invalid or expired token');
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
                <div className="absolute top-[-10%] left-[-5%] md:left-[10%] w-[35rem] h-[35rem] bg-indigo-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
                <div className="absolute bottom-[-10%] right-[-5%] md:right-[15%] w-[40rem] h-[40rem] bg-blue-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
            </div>

            <div className="w-full max-w-md mx-auto relative z-10">
                <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100/50 p-8 sm:p-10">
                    <div className="mb-8 text-center flex flex-col items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg mb-6">
                            <img src={logo} alt="On-Demand" className="h-7 w-auto filter brightness-0 invert" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2">Reset Password</h1>
                        <p className="text-gray-500 font-medium">Enter your new secure password below.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-100 text-center">
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div className="text-center">
                            <div className="mb-8 p-4 bg-green-50 text-green-600 rounded-xl text-sm font-semibold border border-green-100">
                                Password successfully reset! You can now login with your new credentials.
                            </div>
                            <Link to="/login" className="block w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-[0.98]">
                                Proceed to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={onSubmit} className="space-y-5">
                            <div>
                                <label className="text-sm font-bold text-gray-700 mb-2 block">New Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-200"
                                    placeholder="Enter new password"
                                    required
                                    minLength="6"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700 mb-2 block">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full px-5 py-4 border-2 rounded-xl text-sm font-semibold focus:outline-none transition-all duration-200 ${
                                        confirmPassword && password !== confirmPassword 
                                        ? 'border-red-400 bg-red-50 focus:border-red-500' 
                                        : 'bg-slate-50 border-slate-200 focus:border-indigo-500 focus:bg-white'
                                    }`}
                                    placeholder="Confirm new password"
                                    required
                                    minLength="6"
                                />
                                {confirmPassword && password !== confirmPassword && (
                                    <p className="text-red-500 text-xs font-bold mt-2">Passwords do not match</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={loading || (password !== confirmPassword && confirmPassword.length > 0)}
                                className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                            >
                                {loading ? 'Saving...' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
