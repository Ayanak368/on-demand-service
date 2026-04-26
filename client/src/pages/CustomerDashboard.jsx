import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, Phone, CheckCircle, Clock4, XCircle, Truck, Wrench, FileText, IndianRupee, Star, ThumbsUp, MessageSquare, AlertCircle, Bell, Banknote, Loader2, Filter, ChevronDown, Check, ArrowDownAZ, ArrowUpZA, ArrowUp, ArrowDown } from 'lucide-react';

// Helper function to format location for display
const formatLocation = (location) => {
    if (!location) return 'Location provided during checkout';
    if (typeof location === 'string') return location;
    if (location.type === 'Point' && Array.isArray(location.coordinates)) {
        return `${location.coordinates[1]}, ${location.coordinates[0]}`;
    }
    return 'Location provided during checkout';
};

const CustomerDashboard = ({ user, token }) => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [activeTab, setActiveTab] = useState('requests'); // 'requests', 'bookings', or 'complaints'
    const [bookingFilter, setBookingFilter] = useState('All');
    const [bookingSort, setBookingSort] = useState('newest');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [search, setSearch] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [isLoadingPrice, setIsLoadingPrice] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Requests
                const reqRes = await fetch('http://localhost:5001/api/service-requests', {
                    headers: { 'x-auth-token': token }
                });
                const reqData = await reqRes.json();
                setRequests(reqData);

                // Fetch Complaints
                const compRes = await fetch('http://localhost:5001/api/complaints', {
                    headers: { 'x-auth-token': token }
                });
                const compData = await compRes.json();
                setComplaints(compData);

                // Fetch Notifications
                const notifRes = await fetch('http://localhost:5001/api/notifications', {
                    headers: { 'x-auth-token': token }
                });
                const notifData = await notifRes.json();
                setNotifications(notifData);
            } catch (err) {
                console.error(err);
            }
        };

        if (token) fetchData();
    }, [token]);

    const services = [
        { name: 'Electrician', icon: '⚡' },
        { name: 'Plumber', icon: '🔧' },
        { name: 'Cleaner', icon: '🧹' },
        { name: 'Mover', icon: '📦' },
        { name: 'Painter', icon: '🎨' },
        { name: 'Carpenter', icon: '🪚' },
        { name: 'Gardener', icon: '🌱' },
        { name: 'AC Repair', icon: '❄️' },
        { name: 'Other', icon: '🛠️' }
    ];

    const handleServiceClick = (serviceType) => {
        navigate('/service-request', { state: { serviceType } });
    };

    const handleApprovePrice = async (bookingId) => {
        setIsLoadingPrice(true);
        try {
            const res = await fetch(`http://localhost:5001/api/service-requests/customer/approve-price/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            });

            if (res.ok) {
                const updatedBooking = await res.json();
                setRequests(requests.map(req => req._id === bookingId ? updatedBooking : req));
                setSelectedBooking(updatedBooking);
                alert('Price confirmed successfully!');
            } else {
                alert('Failed to confirm price');
            }
        } catch (err) {
            console.error('Error approving price:', err);
            alert('Error confirming price');
        } finally {
            setIsLoadingPrice(false);
        }
    };

    const handlePayInspection = async (bookingId) => {
        setIsLoadingPrice(true);
        try {
            const res = await fetch(`http://localhost:5001/api/service-requests/${bookingId}/confirm`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            });

            if (res.ok) {
                const updatedBooking = await res.json();
                setRequests(requests.map(req => req._id === bookingId ? updatedBooking : req));
                setSelectedBooking(updatedBooking);
                alert('Inspection charge paid successfully!');
            } else {
                alert('Failed to process payment');
            }
        } catch (err) {
            console.error('Error paying inspection charge:', err);
            alert('Error processing payment');
        } finally {
            setIsLoadingPrice(false);
        }
    };

    const filteredServices = services.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

    // Derived state for bookings
    const bookings = requests.filter(r => ['accepted', 'on the way', 'in progress', 'completed', 'cancelled'].includes((r.status || '').toLowerCase()));

    // poll for updates to requests and bookings
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch('http://localhost:5001/api/service-requests', {
                    headers: { 'x-auth-token': token }
                });
                if (res.ok) {
                    const data = await res.json();
                    setRequests(data);
                    // Update selectedBooking if one is currently selected
                    if (selectedBooking) {
                        const updated = data.find(req => req._id === selectedBooking._id);
                        if (updated) {
                            setSelectedBooking(updated);
                        }
                    }
                }
            } catch (err) {
                console.error('poll requests error', err);
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [token]);

    // poll for new notifications
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch('http://localhost:5001/api/notifications', {
                    headers: { 'x-auth-token': token }
                });
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data);
                }
            } catch (err) {
                console.error('poll notifications error', err);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [token]);

    return (
        <div className="customer-dashboard min-h-screen bg-gray-50 flex flex-col">
            <div className="bg-white border-b border-gray-200 px-6 py-8 md:px-12 md:py-10">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Welcome back, {user.name}!</h1>
                        <p className="text-gray-500 mt-2 text-lg">What do you need help with today?</p>
                    </div>
                    <div className="relative">
                        <button 
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="w-12 h-12 bg-blue-50 hover:bg-blue-100 rounded-full flex items-center justify-center text-blue-600 transition-colors relative"
                        >
                            <Bell className="w-5 h-5" />
                            {notifications.filter(n => !n.isRead).length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {notifications.filter(n => !n.isRead).length}
                                </span>
                            )}
                        </button>
                        {/* Notification Dropdown */}
                        {showNotifications && notifications.length > 0 && (
                            <div className="absolute right-0 top-14 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 max-h-96 overflow-y-auto">
                                <div className="p-4 border-b border-gray-100">
                                    <h3 className="font-bold text-gray-900">Notifications</h3>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {notifications.slice(0, 10).map(notif => (
                                        <div key={notif._id} className={`p-4 ${!notif.isRead ? 'bg-blue-50/50' : ''}`}>
                                            <p className="text-sm text-gray-700">{notif.message}</p>
                                            <p className="text-xs text-gray-500 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-12 py-8 flex-1 flex flex-col">

                {/* Search and Available Services Scroll View */}
                {activeTab !== 'bookings' && activeTab !== 'complaints' && (
                    <div className="mb-10 animate-fade-in">
                        <div className="relative mb-6">
                            <input
                                className="w-full bg-white border border-gray-200 text-gray-900 text-[15px] rounded-2xl px-5 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-sm"
                                type="text"
                                placeholder="Search services..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                            {filteredServices.map(service => (
                                <div
                                    key={service.name}
                                    className="min-w-[140px] bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-200 hover:shadow-md hover:-translate-y-1 transition-all snap-start group"
                                    onClick={() => handleServiceClick(service.name)}
                                >
                                    <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-2xl group-hover:bg-blue-100 transition-colors">{service.icon}</div>
                                    <h3 className="font-bold text-gray-800 text-sm text-center">{service.name}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Modern Navigation Tabs */}
                <div className="flex z-10 space-x-2 bg-gray-200/50 p-1.5 rounded-2xl w-full max-w-md mx-auto xl:mx-0 mb-8 overflow-hidden">
                    <button
                        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'requests' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        My Requests
                    </button>
                    <button
                        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'bookings' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                        onClick={() => setActiveTab('bookings')}
                    >
                        My Bookings
                    </button>
                    <button
                        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'complaints' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                        onClick={() => setActiveTab('complaints')}
                    >
                        Complaints
                    </button>
                </div>

                <div className="flex-1 w-full relative">
                    {/* My Requests (Classic view) */}
                    {activeTab === 'requests' && (
                        <div className="animate-slide-up space-y-4">
                            {requests.filter(r => !['accepted', 'on the way', 'in progress', 'completed', 'cancelled'].includes((r.status || '').toLowerCase())).length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="text-gray-400 w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No active requests</h3>
                                    <p className="text-gray-500">You don't have any pending service requests.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {requests.filter(r => !['accepted', 'on the way', 'in progress', 'completed', 'cancelled'].includes((r.status || '').toLowerCase())).map(req => (
                                        <div key={req._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="font-bold text-gray-900 text-lg">{req.serviceType}</h4>
                                                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Pending</span>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{req.details}</p>
                                            <div className="space-y-2 text-sm text-gray-500 pt-4 border-t border-gray-50">
                                                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(req.createdAt).toLocaleDateString()}</div>
                                                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> <span className="truncate">{formatLocation(req.location)}</span></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* NEW My Bookings Section */}
                    {activeTab === 'bookings' && (
                        <div className="animate-slide-up w-full">
                            {/* Status Filters and Sort */}
                            {/* Status Filters and Sort */}
                            <div className="flex justify-end items-center gap-4 mb-6 relative">
                                {/* Filter & Sort Button */}
                                <div>
                                    <button 
                                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
                                    >
                                        <Filter className="w-4 h-4 text-blue-500" />
                                        <span>Filter & Sort</span>
                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>

                                {/* Custom Dropdown Menu */}
                                {isFilterOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
                                        
                                        {/* Filter Section */}
                                        <div className="p-3">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">Filter by Status</h4>
                                            <div className="space-y-1">
                                                {['All', 'Requested', 'Active', 'Completed', 'Cancelled'].map(status => (
                                                    <button
                                                        key={status}
                                                        onClick={() => {
                                                            setBookingFilter(status);
                                                            setIsFilterOpen(false);
                                                        }}
                                                        className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                            bookingFilter === status 
                                                                ? 'bg-blue-50 text-blue-700' 
                                                                : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <span>{status}</span>
                                                        {bookingFilter === status && <Check className="w-4 h-4 text-blue-600" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="h-px bg-gray-100 w-full" />

                                        {/* Sort Section */}
                                        <div className="p-3">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">Sort By</h4>
                                            <div className="space-y-1">
                                                {[
                                                    { value: 'newest', label: 'Date (Newest First)', icon: <ArrowDown className="w-4 h-4 text-gray-400" /> },
                                                    { value: 'oldest', label: 'Date (Oldest First)', icon: <ArrowUp className="w-4 h-4 text-gray-400" /> },
                                                    { value: 'service_asc', label: 'Service Type (A-Z)', icon: <ArrowDownAZ className="w-4 h-4 text-gray-400" /> },
                                                    { value: 'service_desc', label: 'Service Type (Z-A)', icon: <ArrowUpZA className="w-4 h-4 text-gray-400" /> },
                                                ].map(sortOption => (
                                                    <button
                                                        key={sortOption.value}
                                                        onClick={() => {
                                                            setBookingSort(sortOption.value);
                                                            setIsFilterOpen(false);
                                                        }}
                                                        className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                            bookingSort === sortOption.value 
                                                                ? 'bg-blue-50 text-blue-700' 
                                                                : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {sortOption.icon}
                                                            <span>{sortOption.label}</span>
                                                        </div>
                                                        {bookingSort === sortOption.value && <Check className="w-4 h-4 text-blue-600" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                    </div>
                                )}
                            </div>

                            {/* Bookings Grid */}
                            {bookings.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-3xl mx-auto">
                                    <div className="w-20 h-20 bg-blue-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                                        <Calendar className="h-10 w-10 text-blue-500" />
                                    </div>
                                    <h3 className="text-2xl font-extrabold text-gray-900 mb-2">No bookings found</h3>
                                    <p className="text-gray-500 text-lg max-w-md mx-auto">You don't have any bookings matching this filter. Try changing filters or booking a new service.</p>
                                    <button onClick={() => setActiveTab('requests')} className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold transition-colors active:scale-95 shadow-sm">Explore Services</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {bookings
                                        .filter(req => {
                                            if (bookingFilter === 'All') return true;
                                            const reqStatus = (req.status || 'pending').toLowerCase();
                                            if (bookingFilter === 'Requested') return reqStatus === 'pending';
                                            if (bookingFilter === 'Active') return ['accepted', 'on the way', 'in progress', 'confirmed'].includes(reqStatus);
                                            return reqStatus === bookingFilter.toLowerCase();
                                        })
                                        .sort((a, b) => {
                                            if (bookingSort === 'service_asc') {
                                                return (a.serviceType || '').localeCompare(b.serviceType || '');
                                            }
                                            if (bookingSort === 'service_desc') {
                                                return (b.serviceType || '').localeCompare(a.serviceType || '');
                                            }
                                            if (bookingSort === 'oldest') {
                                                return new Date(a.createdAt) - new Date(b.createdAt);
                                            }
                                            // newest
                                            return new Date(b.createdAt) - new Date(a.createdAt);
                                        })
                                        .map(req => {
                                            const serviceInfo = services.find(s => s.name === req.serviceType) || services[services.length - 1];
                                            const currentStatus = (req.status || 'pending').toLowerCase();

                                            return (
                                                <div key={req._id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col h-full">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">
                                                                {serviceInfo.icon}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900 text-lg mb-1">{req.serviceType}</h4>
                                                                <p className="text-xs text-gray-400">ID: {req._id.substring(req._id.length - 6).toUpperCase()}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3 mb-4 flex-grow">
                                                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide text-gray-700 bg-gray-100 border border-gray-200">
                                                            {req.status || 'Pending'}
                                                        </span>
                                                        <div className="mt-3 flex items-center text-sm text-gray-700">
                                                            <User className="w-4 h-4 mr-2 text-gray-500" />
                                                            <span className="truncate">{req.worker ? req.worker.name : 'Waiting for professional...'}</span>
                                                        </div>
                                                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
                                                            <div className="flex items-center">
                                                                <Calendar className="w-4 h-4 mr-1" />
                                                                {req.date ? new Date(req.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                            </div>
                                                            <div className="flex items-center">
                                                                <Clock className="w-4 h-4 mr-1" />
                                                                {req.time || new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="pt-4 border-t border-gray-200 flex items-center justify-between mt-auto">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                                                {currentStatus === 'accepted' ? 'Visit Charge' : 'Payment'}
                                                            </span>
                                                            <span className="text-lg font-bold text-gray-900">
                                                                ₹{currentStatus === 'accepted' ? 100 : (req.price != null && req.price !== 0
                                                                    ? req.price
                                                                    : (serviceInfo.price ? parseInt((serviceInfo.price || '').replace(/\D/g,''),10) : 'To be confirmed')
                                                                )}
                                                            </span>
                                                        </div>
                                                        {currentStatus === 'accepted' ? (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handlePayInspection(req._id);
                                                                }}
                                                                disabled={isLoadingPrice}
                                                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1"
                                                            >
                                                                {isLoadingPrice ? <Loader2 size={14} className="animate-spin" /> : null}
                                                                Pay ₹100
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => setSelectedBooking(req)}
                                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                                                            >
                                                                Details
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Complaints Section */}
                    {activeTab === 'complaints' && (
                        <div className="animate-slide-up w-full max-w-4xl mx-auto">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900">Your Complaints</h2>
                                <button className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm flex items-center gap-2" onClick={() => navigate('/complaint')}>
                                    <MessageSquare className="w-4 h-4" /> New Complaint
                                </button>
                            </div>

                            {complaints.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                                        <ThumbsUp className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No complaints filed</h3>
                                    <p className="text-gray-500">Everything seems to be running smoothly.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {complaints.map(comp => (
                                        <div key={comp._id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                                    <AlertCircle className="w-5 h-5 text-red-500" /> {comp.subject}
                                                </h4>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${comp.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                    }`}>
                                                    {comp.status}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-[15px] mb-5 leading-relaxed bg-gray-50 p-4 rounded-xl">{comp.description}</p>
                                            {comp.reply && (
                                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                                        <MessageSquare className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <strong className="text-sm text-blue-900 block mb-1">Support Reply:</strong>
                                                        <span className="text-sm text-blue-800 leading-relaxed">{comp.reply}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Booking Details Modal */}
            {selectedBooking && activeTab === 'bookings' && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in overflow-y-auto" onClick={() => setSelectedBooking(null)}>
                    <div className="bg-white rounded-[2rem] w-full max-w-4xl my-auto shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="bg-white border-b border-gray-100 p-6 sm:p-8 flex items-center justify-between z-10 shrink-0">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Booking Details</h2>
                                <p className="text-sm text-gray-500 font-mono mt-1.5 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-400" /> Ref: {selectedBooking._id}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="w-12 h-12 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors flex items-center justify-center text-gray-400 border border-gray-200"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 sm:p-8 overflow-y-auto flex-1 custom-scrollbar bg-gray-50/30">
                            {/* Service Info & Status Banner */}
                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-white p-6 rounded-3xl border border-gray-200 shadow-sm mb-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                                <div className="flex items-center gap-5 relative z-10">
                                    <div className="w-20 h-20 rounded-[1.25rem] bg-indigo-50 flex items-center justify-center text-4xl shadow-inner border border-indigo-100/50 shrink-0">
                                        {(services.find(s => s.name === selectedBooking.serviceType) || services[services.length - 1]).icon}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">{selectedBooking.serviceType}</h3>
                                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500 font-medium">
                                            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                                                <Calendar className="w-4 h-4 text-gray-400" /> {selectedBooking.date ? new Date(selectedBooking.date).toLocaleDateString() : new Date(selectedBooking.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                                                <Clock className="w-4 h-4 text-gray-400" /> {selectedBooking.time || new Date(selectedBooking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto mt-4 md:mt-0 relative z-10 border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                                    <div className="flex items-center justify-between md:justify-end w-full gap-4">
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border shadow-sm
                                            ${(selectedBooking.status || 'pending').toLowerCase() === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                (selectedBooking.status || 'pending').toLowerCase() === 'accepted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    (selectedBooking.status || '').toLowerCase() === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        'bg-yellow-50 text-yellow-700 border-yellow-200'}`}
                                        >
                                            {selectedBooking.status || 'Pending'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between md:justify-end w-full gap-4">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            {(selectedBooking.status || '').toLowerCase() === 'accepted' ? 'Visit Charge' : 'Est. Total'}
                                        </span>
                                        <span className="text-3xl font-black text-gray-900 tracking-tight">₹{(selectedBooking.status || '').toLowerCase() === 'accepted' ? 100 : (selectedBooking.price != null && selectedBooking.price !== 0
                                                                        ? selectedBooking.price
                                                                        : (services.find(s => s.name === selectedBooking.serviceType)?.price
                                                                            ? parseInt((services.find(s => s.name === selectedBooking.serviceType).price||'').replace(/\D/g,''),10)
                                                                            : 'To be confirmed')
                                                                    )}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                                {/* Left Column: Details */}
                                <div className="lg:col-span-3 space-y-8">
                                    {/* Worker Info */}
                                    <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
                                            <User className="w-4 h-4 text-blue-500" /> Assigned Professional
                                        </h4>
                                        {selectedBooking.worker ? (
                                            <div className="flex items-center gap-5">
                                                <div className="w-[72px] h-[72px] bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center font-black text-3xl uppercase shadow-md shadow-blue-500/20">
                                                    {selectedBooking.worker.name.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-900 text-xl">{selectedBooking.worker.name}</p>
                                                    <div className="flex items-center text-sm text-yellow-500 mt-1.5 bg-yellow-50/50 w-fit px-2.5 py-1 rounded-lg border border-yellow-100/50 shadow-sm">
                                                        <Star className="w-3.5 h-3.5 fill-current" />
                                                        <span className="font-bold ml-1.5 text-yellow-700 text-xs">4.0 Rating</span>
                                                    </div>
                                                </div>
                                                <button className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all shadow-sm active:scale-95 group">
                                                    <Phone className="w-5 h-5 group-hover:fill-current" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5 flex items-start gap-4 text-orange-800 text-sm">
                                                <AlertCircle className="w-6 h-6 shrink-0 text-orange-500" />
                                                <div>
                                                    <p className="font-bold text-base mb-1">Finding a professional...</p>
                                                    <p className="text-orange-700/80 leading-relaxed">We are currently looking for a skilled professional nearby to accept your service request.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Location & Problem */}
                                    <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 pb-3">
                                            <FileText className="w-4 h-4 text-blue-500" /> Service Description
                                        </h4>

                                        <div className="flex gap-4 items-start">
                                            <div className="w-12 h-12 rounded-[1rem] bg-gray-50 flex items-center justify-center text-gray-500 shrink-0 border border-gray-100 mt-1">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Service Address</p>
                                                <p className="text-base text-gray-900 font-medium leading-relaxed">{formatLocation(selectedBooking.location)}</p>
                                            </div>
                                        </div>

                                        {selectedBooking.details && (
                                            <>
                                                <div className="w-full h-px bg-gray-100 ml-16"></div>
                                                <div className="flex gap-4 items-start">
                                                    <div className="w-12 h-12 rounded-[1rem] bg-gray-50 flex items-center justify-center text-gray-500 shrink-0 border border-gray-100 mt-1">
                                                        <MessageSquare className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Issue Reported</p>
                                                        <p className="text-base text-gray-700 italic leading-relaxed">"{selectedBooking.details}"</p>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column: Timeline & Payment */}
                                <div className="lg:col-span-2 space-y-8 flex flex-col">
                                    {/* Timeline */}
                                    <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm flex-1">
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2 border-b border-gray-100 pb-3">
                                            <Clock4 className="w-4 h-4 text-blue-500" /> Track Process
                                        </h4>
                                        <div className="relative pl-6 space-y-9 before:absolute before:inset-0 before:ml-[31px] before:-translate-x-px before:h-full before:w-[2px] before:bg-gray-100">

                                            {['Pending', 'Accepted', 'On The Way', 'In Progress', 'Completed'].map((step, idx) => {
                                                const currentStatus = (selectedBooking.status || 'pending').toLowerCase();
                                                const statusArray = ['pending', 'accepted', 'on the way', 'in progress', 'completed'];
                                                const currentIndex = statusArray.indexOf(currentStatus);

                                                // Handle cancelled state specially
                                                if (currentStatus === 'cancelled' && idx > 0) return null;
                                                if (currentStatus === 'cancelled' && idx === 0) {
                                                    return (
                                                        <div key="cancelled" className="relative flex items-center gap-5">
                                                            <div className="absolute -left-[20px] w-10 h-10 rounded-full bg-red-100 border-4 border-white flex items-center justify-center shadow-sm text-red-500 z-10">
                                                                <XCircle size={18} />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-base font-bold text-red-600">Booking Cancelled</span>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                const isCompleted = idx <= currentIndex;
                                                const isCurrent = idx === currentIndex;

                                                const icons = [Clock, ThumbsUp, Truck, Wrench, CheckCircle];
                                                const StepIcon = icons[idx];

                                                return (
                                                    <div key={step} className={`relative flex items-center gap-5 transition-all duration-500 ${isCompleted ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                                                        <div className={`absolute -left-[20px] w-10 h-10 rounded-full border-[3px] border-white flex items-center justify-center shadow-sm z-10 transition-all duration-300
                                                            ${isCompleted ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}
                                                            ${isCurrent ? 'ring-4 ring-blue-100/50 scale-110' : ''}
                                                        `}>
                                                            <StepIcon size={16} />
                                                        </div>
                                                        <div className="flex flex-col ml-3">
                                                            <span className={`text-base font-bold ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                                                                {step}
                                                            </span>
                                                            {isCurrent && <span className="text-xs text-blue-500 font-bold uppercase tracking-wider mt-0.5">Active</span>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Payment Info Box / Price Confirmation */}
                                    {(selectedBooking.status || '').toLowerCase() === 'accepted' ? (
                                        <div className="bg-indigo-50 rounded-3xl p-6 sm:p-8 shadow-lg border-2 border-indigo-200 relative overflow-hidden">
                                            <h4 className="text-xs font-black text-indigo-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <Banknote className="w-4 h-4 text-indigo-600" /> Inspection Charge
                                            </h4>
                                            <div className="mb-6">
                                                <p className="text-sm text-indigo-700/80 mb-3">Please pay the inspection/visit charge to proceed with the service:</p>
                                                <div className="bg-white rounded-2xl p-4 flex items-center justify-between border border-indigo-100 mb-4">
                                                    <span className="text-gray-600 font-bold">Visit Charge:</span>
                                                    <span className="text-3xl font-black text-indigo-600">₹ 100</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handlePayInspection(selectedBooking._id)}
                                                disabled={isLoadingPrice}
                                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 shadow-lg"
                                            >
                                                {isLoadingPrice ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                                Pay Inspection Charge
                                            </button>
                                        </div>
                                    ) : selectedBooking?.priceSubmitted === true && selectedBooking?.priceConfirmed !== true ? (
                                        // Price Confirmation Pending
                                        <div className="bg-amber-50 rounded-3xl p-6 sm:p-8 shadow-lg border-2 border-amber-200 relative overflow-hidden">
                                            <h4 className="text-xs font-black text-amber-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <Banknote className="w-4 h-4 text-amber-600" /> Price Submitted for Confirmation
                                            </h4>
                                            <div className="mb-6">
                                                <p className="text-sm text-amber-700/80 mb-3">The professional has submitted a price for your service:</p>
                                                <div className="bg-white rounded-2xl p-4 flex items-center justify-between border border-amber-100 mb-4">
                                                    <span className="text-gray-600 font-bold">Quoted Price:</span>
                                                    <span className="text-3xl font-black text-amber-600">₹ {selectedBooking.finalPrice}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleApprovePrice(selectedBooking._id)}
                                                disabled={isLoadingPrice}
                                                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 shadow-lg"
                                            >
                                                {isLoadingPrice ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                                Confirm Price
                                            </button>
                                        </div>
                                    ) : (
                                        // Standard Payment Info
                                        <div className="bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/30 transition-all duration-700"></div>
                                            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
                                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                                                <IndianRupee className="w-4 h-4 text-emerald-400" /> Offline Payment
                                            </h4>
                                            <p className="text-[15px] text-gray-300 leading-relaxed font-medium relative z-10">
                                                Please pay <span className="text-emerald-400 font-extrabold text-lg tracking-tight bg-emerald-500/10 px-2 py-0.5 rounded ml-1">₹ {selectedBooking.finalPrice ?? selectedBooking.price ?? 'To be confirmed'}</span> directly to the professional after the service is completely finished.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Post-Service Actions */}
                            {['completed', 'cancelled'].includes((selectedBooking.status || '').toLowerCase()) && (
                                <div className="mt-8 pt-8 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {(selectedBooking.status || '').toLowerCase() === 'completed' && (
                                        <button className="bg-gray-900 text-white hover:bg-black px-6 py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md hover:shadow-lg">
                                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Rate Professional
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            navigate('/service-request', { state: { serviceType: selectedBooking.serviceType } });
                                            setSelectedBooking(null);
                                        }}
                                        className={`${(selectedBooking.status || '').toLowerCase() === 'completed' ? 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50' : 'bg-gray-900 text-white hover:bg-black lg:col-span-2'} px-6 py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm`}
                                    >
                                        <Calendar className="w-5 h-5" /> Book Again
                                    </button>
                                    {(selectedBooking.status || '').toLowerCase() === 'completed' && (
                                        <button
                                            onClick={() => {
                                                navigate('/complaint');
                                            }}
                                            className="bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-200 px-6 py-4 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-sm border border-transparent"
                                        >
                                            <AlertCircle className="w-5 h-5" /> Report Issue
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerDashboard;
