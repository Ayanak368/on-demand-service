import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';

const ComplaintForm = () => {
    const [formData, setFormData] = useState({
        worker: '',
        subject: '',
        description: ''
    });
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [touched, setTouched] = useState({});

    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    const { worker, subject, description } = formData;

    // Fetch workers that customer has worked with recently
    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const res = await fetch('http://localhost:5001/api/users/workers/my', {
                    headers: {
                        'x-auth-token': token
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setWorkers(data);
                }
            } catch (err) {
                console.error('Error fetching workers:', err);
            }
        };

        if (token) {
            fetchWorkers();
        }
    }, [token]);

    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'worker':
                if (!value) error = 'Please select a worker';
                break;
            case 'subject':
                if (!value) error = 'Subject is required';
                else if (value.length < 5) error = 'Subject must be at least 5 characters';
                break;
            case 'description':
                if (!value) error = 'Description is required';
                else if (value.length < 10) error = 'Description must be at least 10 characters';
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
        setValidationErrors({ ...validationErrors, [name]: error });
        setTouched({ ...touched, [name]: true });
    };

    const onBlur = e => {
        const { name } = e.target;
        setTouched({ ...touched, [name]: true });
    };

    const isFormValid = () => {
        return worker && subject && description && !Object.values(validationErrors).some(e => e);
    };

    const onSubmit = async e => {
        e.preventDefault();
        if (!isFormValid()) {
            setValidationErrors({
                worker: validateField('worker', worker),
                subject: validateField('subject', subject),
                description: validateField('description', description)
            });
            setTouched({ worker: true, subject: true, description: true });
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:5001/api/complaints', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ worker, subject, description })
            });

            if (res.ok) {
                setSubmitted(true);
                setFormData({ worker: '', subject: '', description: '' });
                setValidationErrors({});
                setTouched({});
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            } else {
                const data = await res.json();
                setError(data.msg || 'Failed to submit complaint');
            }
        } catch (err) {
            console.error(err);
            setError('Error submitting complaint. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {submitted ? (
                    <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
                        <div className="text-center">
                            <div className="flex justify-center mb-4">
                                <CheckCircle size={48} className="text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Complaint Submitted</h2>
                            <p className="text-gray-600">Thank you for submitting your complaint. We'll review it and get back to you soon.</p>
                            <p className="text-sm text-gray-500 mt-4">Redirecting to dashboard...</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">File a Complaint</h1>
                        <p className="text-gray-600 mb-8">Help us improve our service by reporting any issues</p>

                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-red-700">{error}</p>
                            </div>
                        )}

                        <form onSubmit={onSubmit} className="space-y-6">
                            {/* Worker Selection */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Worker *</label>
                                <select
                                    id="worker"
                                    name="worker"
                                    value={worker}
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    className={`w-full h-12 px-4 rounded-lg border outline-none transition-all text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        touched.worker && validationErrors.worker ? 'border-red-500' : touched.worker && !validationErrors.worker ? 'border-green-500' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">Select a worker...</option>
                                    <option value="general">General Complaint (Not about specific worker)</option>
                                    {workers.map((workerOption) => (
                                        <option key={workerOption._id} value={workerOption._id}>
                                            {workerOption.name} - {workerOption.profession} ({workerOption.location})
                                        </option>
                                    ))}
                                </select>
                                {touched.worker && validationErrors.worker && (
                                    <p className="text-red-500 text-sm mt-1">{validationErrors.worker}</p>
                                )}
                            </div>

                            {/* Subject */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                                <input
                                    id="subject"
                                    type="text"
                                    name="subject"
                                    value={subject}
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    placeholder="Brief summary of your complaint"
                                    className={`peer h-12 w-full border rounded-lg px-4 pt-2 pb-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 ${
                                        touched.subject && validationErrors.subject ? 'border-red-500' : touched.subject && !validationErrors.subject ? 'border-green-500' : 'border-gray-300'
                                    }`}
                                />
                                {touched.subject && validationErrors.subject && (
                                    <p className="text-red-500 text-sm mt-1">{validationErrors.subject}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={description}
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    placeholder="Provide detailed information about your complaint"
                                    rows="6"
                                    className={`w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 resize-none ${
                                        touched.description && validationErrors.description ? 'border-red-500' : touched.description && !validationErrors.description ? 'border-green-500' : 'border-gray-300'
                                    }`}
                                />
                                {touched.description && validationErrors.description && (
                                    <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">{description.length}/500 characters</p>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/dashboard')}
                                    className="flex-1 h-12 px-6 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!isFormValid() || loading}
                                    className={`flex-1 h-12 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                                        isFormValid() && !loading
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:scale-105 active:scale-95'
                                            : 'bg-gray-400 text-gray-700 cursor-not-allowed opacity-50'
                                    }`}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Submit Complaint
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComplaintForm;
