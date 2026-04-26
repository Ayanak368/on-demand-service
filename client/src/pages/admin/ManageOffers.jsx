import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const ManageOffers = () => {
    const { token } = useContext(AuthContext);
    const [offers, setOffers] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [editingOfferId, setEditingOfferId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        type: 'Discount',
        description: '',
        serviceCategory: '',
        buttonText: 'Claim Offer',
        buttonLink: '/dashboard',
        colorTheme: 'purple',
        iconType: 'Zap',
        validUntil: '',
        status: 'active'
    });

    const fetchOffers = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5001/api/offers');
            setOffers(res.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch offers');
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/services');
            setServices(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Failed to fetch services', err);
        }
    };

    useEffect(() => {
        if (token) {
            fetchOffers();
            fetchServices();
        }
    }, [token]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openModal = (offer = null) => {
        if (offer) {
            setEditingOfferId(offer._id);
            setFormData({
                title: offer.title,
                type: offer.type,
                description: offer.description,
                serviceCategory: offer.serviceCategory,
                buttonText: offer.buttonText,
                buttonLink: offer.buttonLink,
                colorTheme: offer.colorTheme,
                iconType: offer.iconType,
                validUntil: new Date(offer.validUntil).toISOString().split('T')[0],
                status: offer.status
            });
        } else {
            setEditingOfferId(null);
            setFormData({
                title: '',
                type: 'Discount',
                description: '',
                serviceCategory: '',
                buttonText: 'Claim Offer',
                buttonLink: '/dashboard',
                colorTheme: 'purple',
                iconType: 'Zap',
                validUntil: '',
                status: 'active'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingOfferId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const config = { headers: { 'x-auth-token': token } };

            if (editingOfferId) {
                const res = await axios.put(`http://localhost:5001/api/offers/${editingOfferId}`, formData, config);
                setOffers(offers.map(o => o._id === editingOfferId ? res.data : o));
                setSuccess('Offer updated successfully');
            } else {
                const res = await axios.post('http://localhost:5001/api/offers', formData, config);
                setOffers([res.data, ...offers]);
                setSuccess('Offer created successfully');
            }
            closeModal();
            setTimeout(() => setSuccess(null), 2000);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.msg || 'Error saving offer');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this offer?')) return;
        try {
            await axios.delete(`http://localhost:5001/api/offers/${id}`, {
                headers: { 'x-auth-token': token }
            });
            setOffers(offers.filter(o => o._id !== id));
            setSuccess('Offer deleted successfully');
            setTimeout(() => setSuccess(null), 2000);
        } catch (err) {
            console.error(err);
            setError('Failed to delete offer');
        }
    };

    const toggleStatus = async (offer) => {
        const newStatus = offer.status === 'active' ? 'inactive' : 'active';
        try {
            const res = await axios.put(`http://localhost:5001/api/offers/${offer._id}`,
                { status: newStatus },
                { headers: { 'x-auth-token': token } }
            );
            setOffers(offers.map(o => o._id === offer._id ? res.data : o));
            setSuccess(`Offer marked as ${newStatus}`);
            setTimeout(() => setSuccess(null), 2000);
        } catch (err) {
            console.error(err);
            setError('Failed to update status');
        }
    };

    return (
        <div className="p-6 md:p-8 animate-fade-in max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manage Offers</h1>
                    <p className="text-gray-500 mt-1">Create and manage dynamic promotional offers.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchOffers}
                        className="p-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none"
                        title="Refresh"
                    >
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <Plus size={20} /> Add New Offer
                    </button>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 animate-fade-in">
                    <AlertCircle size={20} />
                    <p>{error}</p>
                </div>
            )}
            {success && (
                <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-3 animate-fade-in">
                    <CheckCircle size={20} />
                    <p>{success}</p>
                </div>
            )}

            {/* Offers Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold w-1/4">Offer Title & Type</th>
                                <th className="p-4 font-semibold">Category</th>
                                <th className="p-4 font-semibold">Valid Until</th>
                                <th className="p-4 font-semibold text-center">Status</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && offers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">
                                        <Loader2 size={24} className="animate-spin mx-auto mb-2 text-blue-500" />
                                        Loading offers...
                                    </td>
                                </tr>
                            ) : offers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">
                                        No offers found. Create one to get started!
                                    </td>
                                </tr>
                            ) : (
                                offers.map(offer => {
                                    const isExpired = new Date(offer.validUntil) < new Date();
                                    return (
                                        <tr key={offer._id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="p-4">
                                                <div className="font-bold text-gray-900">{offer.title}</div>
                                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                    <span className="px-2 py-0.5 bg-gray-100 rounded-md font-medium">{offer.type}</span>
                                                    <span className={`w-3 h-3 rounded-full bg-${offer.colorTheme}-500`} title={`Theme: ${offer.colorTheme}`}></span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-gray-700 font-medium">{offer.serviceCategory}</span>
                                            </td>
                                            <td className="p-4">
                                                {isExpired ? (
                                                    <span className="text-red-500 font-medium bg-red-50 px-2 py-1 rounded-md text-sm flex items-center gap-1 w-max">
                                                        <AlertCircle size={14} /> EXPIRED
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-600">{new Date(offer.validUntil).toLocaleDateString()}</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => toggleStatus(offer)}
                                                    className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${offer.status === 'active'
                                                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {offer.status.toUpperCase()}
                                                </button>
                                            </td>
                                            <td className="p-4 flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openModal(offer)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(offer._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingOfferId ? 'Edit Offer' : 'Create New Offer'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="offerForm" onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Offer Title *</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder="e.g. 20% Off Plumbing Repairs"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Offer Type *</label>
                                        <select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                            required
                                        >
                                            <option value="Discount">Discount</option>
                                            <option value="Free Consultation">Free Consultation</option>
                                            <option value="Tip">Pro Tip</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Service Category *</label>
                                        <select
                                            name="serviceCategory"
                                            value={formData.serviceCategory}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                            required
                                        >
                                            <option value="" disabled>Select a service</option>
                                            {services.map(s => (
                                                <option key={s._id} value={s.name}>{s.name}</option>
                                            ))}
                                            <option value="All Services">All Services</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Describe the offer details..."
                                            rows="3"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Button Text *</label>
                                        <input
                                            type="text"
                                            name="buttonText"
                                            value={formData.buttonText}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Claim Offer"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Button Link *</label>
                                        <input
                                            type="text"
                                            name="buttonLink"
                                            value={formData.buttonLink}
                                            onChange={handleInputChange}
                                            placeholder="e.g. /dashboard or /services"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Color Theme *</label>
                                        <select
                                            name="colorTheme"
                                            value={formData.colorTheme}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                            required
                                        >
                                            <option value="purple">Purple</option>
                                            <option value="green">Green</option>
                                            <option value="orange">Orange</option>
                                            <option value="blue">Blue</option>
                                            <option value="red">Red</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Icon Type *</label>
                                        <select
                                            name="iconType"
                                            value={formData.iconType}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                            required
                                        >
                                            <option value="Zap">Zap (Lightning)</option>
                                            <option value="Droplet">Droplet (Water)</option>
                                            <option value="Wrench">Wrench</option>
                                            <option value="CheckCircle">Check Circle</option>
                                            <option value="Shield">Shield</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Expiration Date *</label>
                                        <input
                                            type="date"
                                            name="validUntil"
                                            value={formData.validUntil}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 mt-auto">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-5 py-2.5 text-gray-700 font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="offerForm"
                                disabled={isSubmitting}
                                className="px-5 py-2.5 text-white font-medium bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 min-w-[120px]"
                            >
                                {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : 'Save Offer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageOffers;
