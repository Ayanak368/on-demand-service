import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';
import {
    Menu, X, Search, Bell, LogOut, User as UserIcon, ArrowLeft,
    Home, Briefcase, CheckCircle, Clock, Zap, Wrench, Droplet, Paintbrush, Loader2, Pencil, Save, Phone, Star, AlertCircle, MessageSquare, Send,
    Heart, Facebook, Twitter, Instagram, Linkedin, MapPin, Calendar, ClipboardList, Mail, Camera, Navigation, Map, Banknote, BarChart as BarChartIcon, XCircle, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MapModal from '../components/MapModal';


// helper to fetch a small image for a service type
const getServiceImage = (type) => {
    if (!type) return 'https://via.placeholder.com/160x90?text=Service';
    // Using ui-avatars to get a consistent, reliable service icon placeholder
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(type)}&background=random&color=fff&size=160&font-size=0.33`;
};

// Helper function to get location string for URL encoding
const getLocationString = (job) => {
    if (typeof job.location === 'string' && job.location.trim() !== '') return job.location;
    if (job.address) return job.address;
    if (job.customer?.address) return job.customer.address;
    if (job.location?.coordinates && (job.location.coordinates[0] !== 0 || job.location.coordinates[1] !== 0)) {
        return `${job.location.coordinates[1]}, ${job.location.coordinates[0]}`;
    }
    return '';
};

// Helper function to format complete location
const getCompleteLocation = (job) => {
    // Priority: location string > address > customer address > coordinates
    if (typeof job.location === 'string' && job.location.trim() !== '') return job.location;
    if (job.address) return job.address;
    if (job.customer?.address) return job.customer.address;
    if (job.location?.coordinates && (job.location.coordinates[0] !== 0 || job.location.coordinates[1] !== 0)) {
        return `${job.location.coordinates[1]}, ${job.location.coordinates[0]}`;
    }
    return 'Location Hidden';
};

const WorkerDashboard = () => {
    const { user, token, logout, login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [isActionLoading, setIsActionLoading] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLocating, setIsLocating] = useState(false);
    const [showMapModal, setShowMapModal] = useState(false);
    const [mapSearchText, setMapSearchText] = useState('');
    const [isSearchingMap, setIsSearchingMap] = useState(false);
    const [activeSort, setActiveSort] = useState('newest');
    const [mapResults, setMapResults] = useState([]);
    const [finalPrices, setFinalPrices] = useState({});
    const [expandedLocations, setExpandedLocations] = useState({});
    const [isRenewing, setIsRenewing] = useState(false);
    
    // Mock Payment States for Renewal
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [cardDetails, setCardDetails] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: ''
    });

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(user?.photo ? `http://localhost:5001/${user.photo.replace(/\\/g, '/')}` : null);

    // Worker stats (rating, reviews, earnings)
    const [workerStats, setWorkerStats] = useState({
        averageRating: 0,
        totalReviews: 0,
        completedJobs: 0,
        totalEarnings: 0,
        reviews: []
    });

    const [paymentInfo, setPaymentInfo] = useState(null);

    // Profile editable state
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        profession: user?.profession || '',
        experience: user?.experience || '',
        address: user?.address || '',
        latitude: user?.latitude || null,
        longitude: user?.longitude || null
    });

    // Load jobs & full profile
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch Jobs
                const jobsRes = await fetch('http://localhost:5001/api/service-requests', {
                    headers: { 'x-auth-token': token }
                });
                if (jobsRes.ok) {
                    const data = await jobsRes.json();
                    setJobs(Array.isArray(data) ? data : []);
                }

                // Fetch Full Profile for Worker
                const profileRes = await fetch('http://localhost:5001/api/users/me', {
                    headers: { 'x-auth-token': token }
                });
                if (profileRes.ok) {
                    const fullUser = await profileRes.json();
                    setProfileForm({
                        name: fullUser.name || '',
                        email: fullUser.email || '',
                        phone: fullUser.phone || '',
                        profession: fullUser.profession || '',
                        experience: fullUser.experience || '',
                        address: fullUser.address || ''
                    });
                    if (fullUser.photo) {
                        setPhotoPreview(`http://localhost:5001/${fullUser.photo.replace(/\\/g, '/')}`);
                    }
                    // Update global user seamlessly
                    login(fullUser, token);
                }

                // Fetch Notifications
                const notifRes = await fetch('http://localhost:5001/api/notifications', {
                    headers: { 'x-auth-token': token }
                });
                if (notifRes.ok) {
                    const ndata = await notifRes.json();
                    setNotifications(ndata);
                }

                // Fetch Worker Stats (rating, reviews, earnings)
                const statsRes = await fetch('http://localhost:5001/api/users/my-stats', {
                    headers: { 'x-auth-token': token }
                });
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setWorkerStats(statsData);
                }

                // Fetch Registration Payment
                const paymentRes = await fetch('http://localhost:5001/api/users/my-payment', {
                    headers: { 'x-auth-token': token }
                });
                if (paymentRes.ok) {
                    const paymentData = await paymentRes.json();
                    setPaymentInfo(paymentData);
                }
            } catch (err) {
                console.error(err);
                setToast({ show: true, message: 'Error fetching data', type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchDashboardData();
    }, [token, login]);

    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'name':
                if (!value) error = 'Name is required';
                else if (!/^[a-zA-Z\s]+$/.test(value)) error = 'Name should contain only letters';
                break;
            case 'phone':
                if (!value) error = 'Phone number is required';
                else if (!/^\d{10}$/.test(value)) error = 'Phone number must be exactly 10 digits';
                break;
            case 'profession':
                if (!value) error = 'Profession is required';
                break;
            case 'experience':
                if (!value) error = 'Experience is required';
                break;
            default:
                break;
        }
        return error;
    };

    const handleFieldChange = (name, value) => {
        setProfileForm(prev => ({ ...prev, [name]: value }));
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const showNotification = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2000);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isSubscriptionExpired = user?.status === 'active' && user?.subscriptionExpiry && new Date() > new Date(user.subscriptionExpiry);

    const getDaysUntilExpiry = (expiryDate) => {
        if (!expiryDate) return null;
        const diff = new Date(expiryDate).getTime() - new Date().getTime();
        return Math.ceil(diff / (1000 * 3600 * 24));
    };
    
    const daysUntilExpiry = getDaysUntilExpiry(user?.subscriptionExpiry);
    const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0;

    const handleRenewSubscription = async () => {
        setIsRenewing(true);
        try {
            const res = await fetch('http://localhost:5001/api/users/renew-subscription', {
                method: 'POST',
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) {
                const updatedUser = { ...user, subscriptionExpiry: data.subscriptionExpiry };
                login(updatedUser, token);
                showNotification('Subscription renewed successfully!', 'success');
            } else {
                showNotification(data.msg || 'Failed to renew subscription', 'error');
            }
        } catch (error) {
            console.error('Renew error:', error);
            showNotification('Server error', 'error');
        } finally {
            setIsRenewing(false);
            setPaymentSuccess(false); // Reset for next time
            setCardDetails({ number: '', name: '', expiry: '', cvv: '' });
        }
    };

    const onCardChange = e => {
        let { name, value } = e.target;
        if (name === 'number') {
            value = value.replace(/\D/g, '').substring(0, 16);
            value = value.replace(/(\d{4})/g, '$1 ').trim();
        } else if (name === 'expiry') {
            value = value.replace(/\D/g, '').substring(0, 4);
            if (value.length > 2) {
                value = `${value.substring(0, 2)}/${value.substring(2)}`;
            }
        } else if (name === 'cvv') {
            value = value.replace(/\D/g, '').substring(0, 3);
        }
        setCardDetails(prev => ({ ...prev, [name]: value }));
    };

    const isCardValid = () => {
        return cardDetails.number.trim() !== '' && cardDetails.name.trim() !== '' && cardDetails.expiry.trim() !== '' && cardDetails.cvv.trim() !== '';
    };

    const handleMockPayment = () => {
        if (!isCardValid()) return;
        setIsProcessingPayment(true);
        setTimeout(() => {
            setPaymentSuccess(true);
            setTimeout(() => {
                setIsProcessingPayment(false);
                setShowPaymentModal(false);
                handleRenewSubscription();
            }, 1000);
        }, 2000);
    };

    const handleJobAction = async (id, status) => {
        setIsActionLoading(id);
        try {
            const res = await fetch(`http://localhost:5001/api/service-requests/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                const updatedJob = await res.json();
                setJobs(jobs.map(job => job._id === id ? updatedJob : job));
                showNotification(status === 'accepted' ? 'Job accepted successfully!' : 'Job marked as completed!');
            } else {
                const errorText = await res.text();
                console.error('status update error response', res.status, errorText);
                showNotification('Failed to update job status: ' + (errorText || res.status), 'error');
                // reload list in case it changed on server
                try {
                    const jobsRes = await fetch('http://localhost:5001/api/service-requests', {
                        headers: { 'x-auth-token': token }
                    });
                    if (jobsRes.ok) {
                        const data = await jobsRes.json();
                        setJobs(Array.isArray(data) ? data : []);
                    }
                } catch (fetchErr) {
                    console.error('error reloading jobs after failure', fetchErr);
                }
            }
        } catch (err) {
            console.error("Error updating job:", err);
            showNotification('Error updating job status.', 'error');
        } finally {
            setIsActionLoading(null);
        }
    };

    const handleUpdatePrice = async (id, finalPrice) => {
        if (!finalPrice || isNaN(finalPrice)) {
            showNotification('Please enter a valid price', 'error');
            return;
        }

        setIsActionLoading(`price-${id}`);
        try {
            const res = await fetch(`http://localhost:5001/api/service-requests/worker/update-price/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ price: finalPrice })
            });

            if (res.ok) {
                const updatedJob = await res.json();
                setJobs(jobs.map(job => job._id === id ? updatedJob : job));
                showNotification('Price updated successfully! Waiting for customer confirmation.', 'success');
            } else {
                const errorText = await res.text();
                showNotification('Failed to update price: ' + (errorText || res.status), 'error');
            }
        } catch (err) {
            console.error("Error updating price:", err);
            showNotification('Error updating price.', 'error');
        } finally {
            setIsActionLoading(null);
        }
    };

    const markNotificationAsRead = async (id) => {
        try {
            await fetch(`http://localhost:5001/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Error marking notification as read', err);
        }
    };

    const handlePhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedPhoto(e.target.files[0]);
            setPhotoPreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleLocateMe = async () => {
        setIsLocating(true);

        const fallbackToIpGeolocation = async () => {
             try {
                 const ipRes = await fetch('https://ipapi.co/json/');
                 if(ipRes.ok){
                      const data = await ipRes.json();
                      const { latitude, longitude, city, region, country_name } = data;
                      const addressString = `${city}, ${region}, ${country_name}`;
                      
                      setProfileForm(prev => ({
                          ...prev,
                          address: addressString,
                          location: city,
                          latitude,
                          longitude
                      }));
                      showNotification('Location updated via IP fallback successfully!');
                 } else {
                     showNotification('Could not fetch location automatically.', 'error');
                 }
             } catch(err) {
                 showNotification('Could not fetch location automatically.', 'error');
             } finally {
                 setIsLocating(false);
             }
        };

        if (!navigator.geolocation) {
             await fallbackToIpGeolocation();
             return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const isMockedSeoul = Math.abs(latitude - 37.56) < 0.1 && Math.abs(longitude - 126.99) < 0.1;

                if(!latitude || !longitude || (latitude === 0 && longitude === 0) || isMockedSeoul) {
                    await fallbackToIpGeolocation();
                    return;
                }

                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();
                    const town = data.address?.city || data.address?.town || data.address?.village || data.address?.suburb || data.address?.municipality || "Unknown";
                    const fullAddress = data.display_name;
                    
                    setProfileForm(prev => ({
                        ...prev,
                        address: fullAddress,
                        location: town,
                        latitude,
                        longitude
                    }));
                    showNotification('Location updated successfully!');
                } catch (error) {
                    setProfileForm(prev => ({ ...prev, latitude, longitude }));
                    showNotification('Coordinates detected, but could not fetch address name.', 'warning');
                }
                setIsLocating(false);
            },
            async (error) => {
                await fallbackToIpGeolocation();
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
        );
    };

    const handleLocationSelect = (location) => {
        setProfileForm(prev => ({
            ...prev,
            latitude: location.lat,
            longitude: location.lng,
            address: location.address,
            location: location.town || location.address.split(',')[0]
        }));
        setShowMapModal(false);
    };


    const handleProfileUpdate = async (e) => {
        e.preventDefault();

        // Final validation check
        const newErrors = {};
        Object.keys(profileForm).forEach(key => {
            const error = validateField(key, profileForm[key]);
            if (error) newErrors[key] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            showNotification('Please fix the errors in the form', 'error');
            return;
        }

        setIsActionLoading('profile');
        try {
            const formData = new FormData();
            formData.append('name', profileForm.name);
            formData.append('email', profileForm.email);
            formData.append('phone', profileForm.phone);
            if (profileForm.profession) formData.append('profession', profileForm.profession);
            if (profileForm.experience) formData.append('experience', profileForm.experience);
            formData.append('address', profileForm.address);
            if (profileForm.latitude) formData.append('latitude', profileForm.latitude);
            if (profileForm.longitude) formData.append('longitude', profileForm.longitude);

            if (selectedPhoto) {
                formData.append('photo', selectedPhoto);
            }

            const res = await fetch('http://localhost:5001/api/users/profile', {
                method: 'PUT',
                headers: {
                    'x-auth-token': token
                },
                body: formData
            });

            if (res.ok) {
                const updatedUser = await res.json();
                login(updatedUser, token);
                showNotification('Profile updated successfully!');
                setIsEditingProfile(false);
            } else {
                showNotification('Failed to update profile', 'error');
            }
        } catch (err) {
            console.error("Profile update error:", err);
            showNotification('Error updating profile.', 'error');
        } finally {
            setIsActionLoading(null);
        }
    };

    const workerId = user?.id || user?._id;
    const workerServiceType = profileForm.serviceType;

    // Filter Logic
    const requestedJobs = jobs.filter(j =>
        j.status === 'pending'
    );

    const activeJobsRaw = jobs.filter(j =>
        (['accepted', 'confirmed', 'Price Submitted', 'price submitted', 'Price Approved', 'price approved'].includes(j.status)) && (j.worker === workerId || j.worker?._id === workerId)
    );

    const now = new Date();
    const isJobOverdue = (job) => {
        if (!job.date) return false;
        let jobDateObj;
        if (job.time) {
            jobDateObj = new Date(`${job.date}T${job.time}:00`);
        } else {
            jobDateObj = new Date(job.date);
            jobDateObj.setHours(23, 59, 59, 999);
        }
        return !isNaN(jobDateObj.getTime()) && jobDateObj < now;
    };

    const activeJobs = activeJobsRaw.filter(j => !isJobOverdue(j)).sort((a, b) => {
        if (activeSort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        if (activeSort === 'status') {
            const statusOrder = { 'confirmed': 1, 'accepted': 2, 'on the way': 3, 'in progress': 4 };
            return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
        }
        return new Date(b.createdAt) - new Date(a.createdAt); // newest default
    });
    const overdueJobs = activeJobsRaw.filter(j => isJobOverdue(j));

    const completedJobs = jobs.filter(j =>
        j.status === 'completed' && (j.worker === workerId || j.worker?._id === workerId)
    );


    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'requests', label: 'Job Requests', icon: ClipboardList, badge: requestedJobs.length > 0 ? requestedJobs.length : null },
        { id: 'active', label: 'My Jobs', icon: Briefcase, badge: activeJobs.length > 0 ? activeJobs.length : null },
        { id: 'overdue', label: 'Overdue Jobs', icon: AlertCircle, badge: overdueJobs.length > 0 ? overdueJobs.length : null },
        { id: 'completed', label: 'Completed Jobs', icon: CheckCircle },
        { id: 'report', label: 'Report', icon: BarChartIcon },
        { id: 'payments', label: 'Payments', icon: Banknote },
        { id: 'subscription', label: 'Subscription', icon: Target },
        { id: 'profile', label: 'Profile', icon: UserIcon },
    ];

    const handleExportReport = () => {
        // CSV Header
        let csvContent = "data:text/csv;charset=utf-8,Service,Customer,Date Completed,Final Price,Status\n";
        
        // Add Rows
        completedJobs.forEach(job => {
            const date = new Date(job.createdAt).toLocaleDateString();
            const price = job.finalPrice || job.price || '0';
            const status = job.status.toUpperCase();
            csvContent += `"${job.serviceType}","${job.customer?.name || 'Customer'}","${date}","${price}","${status}"\n`;
        });

        // Add Total Row
        const total = completedJobs.reduce((sum, job) => sum + (Number(job.finalPrice || job.price) || 0), 0);
        csvContent += `,,,"Total","${total}"\n`;

        // Download action
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "earnings_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Calculate complex report metrics
    const reportTotalEarnings = completedJobs.reduce((sum, job) => sum + (Number(job.finalPrice || job.price) || 0), 0);
    
    // This month's earnings
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthEarnings = completedJobs.reduce((sum, job) => {
        const jobDate = new Date(job.createdAt);
        if (jobDate.getMonth() === currentMonth && jobDate.getFullYear() === currentYear) {
            return sum + (Number(job.finalPrice || job.price) || 0);
        }
        return sum;
    }, 0);

    // Last Payment string
    const sortedCompleted = [...completedJobs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const lastPaymentDate = sortedCompleted.length > 0 ? new Date(sortedCompleted[0].createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never';

    // Pie Chart Data (Status Distribution)
    const cancelledJobsCount = jobs.filter(j => j.status === 'cancelled' && (j.worker === workerId || j.worker?._id === workerId)).length;
    const pieData = [
        { name: 'Completed', value: completedJobs.length, color: '#10b981' },
        { name: 'Active', value: activeJobs.length, color: '#3b82f6' },
        { name: 'Cancelled', value: cancelledJobsCount, color: '#ef4444' }
    ].filter(item => item.value > 0);

    // Bar Chart Data (Monthly Completed Jobs)
    const monthlyJobCounts = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize last 6 months to 0
    for(let i=5; i>=0; i--) {
        let d = new Date();
        d.setMonth(d.getMonth() - i);
        monthlyJobCounts[`${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`] = 0;
    }

    // Populate data
    completedJobs.forEach(job => {
        const d = new Date(job.createdAt);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
        if (monthlyJobCounts[key] !== undefined) {
            monthlyJobCounts[key]+=1;
        }
    });

    const barData = Object.keys(monthlyJobCounts).map(key => ({
        name: key,
        Completed: monthlyJobCounts[key]
    }));

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-in">
                    <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Loading your dashboard...</p>
                </div>
            );
        }

        if (isSubscriptionExpired && activeTab !== 'profile') {
            return (
                <div className="flex flex-col items-center justify-center h-[70vh] text-center animate-fade-in px-4">
                    <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg border border-red-100 flex flex-col items-center">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                            <Clock size={40} className="text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-4">Subscription Expired</h2>
                        <p className="text-gray-500 mb-8 text-lg">Your one-month access to the platform has expired. Please renew your subscription to continue receiving and managing jobs.</p>
                        <button 
                            onClick={() => setShowPaymentModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-3 w-full justify-center"
                        >
                            <Zap size={24} />
                            Renew Subscription (₹99)
                        </button>
                    </div>
                </div>
            );
        }

        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="space-y-6 animate-fade-in">
                        {/* hero banner with photo and animation */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="relative bg-slate-900 rounded-3xl p-8 sm:p-12 shadow-2xl text-white overflow-hidden border border-slate-800"
                        >
                            {/* Decorative background shapes */}
                            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-blue-500/20 rounded-full blur-[60px] pointer-events-none"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none hidden md:block"></div>

                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div>
                                    <h2 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight">Welcome back, {user?.name || 'Worker'}! 👋</h2>
                                    <p className="text-blue-100 text-lg max-w-xl">Manage your jobs, view earnings, and accept new requests easily. Keep up the great work!</p>
                                    <div className="mt-6 flex gap-4">
                                        <button
                                            onClick={() => setActiveTab('requests')}
                                            className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 hover:shadow-md transition-all active:scale-95"
                                        >
                                            View New Requests
                                        </button>
                                    </div>
                                </div>
                                <div className="hidden lg:flex gap-6 items-center">
                                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center min-w-[120px]">
                                        <div className="text-3xl font-black mb-1">{workerStats.averageRating || 'New'}</div>
                                        <div className="text-blue-100 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1">Rating <Star size={12} className="fill-blue-100" /></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Total Jobs', icon: ClipboardList, value: jobs.length, color: 'blue' },
                                { label: 'Active Jobs', icon: Briefcase, value: activeJobs.length, color: 'indigo' },
                                { label: 'Completed', icon: CheckCircle, value: completedJobs.length, color: 'emerald' },
                                { label: 'Rating', icon: Star, value: workerStats.totalReviews > 0 ? `${workerStats.averageRating} ⭑` : 'N/A', color: 'amber' },
                                { label: 'Total Earnings', icon: Banknote, value: `₹ ${completedJobs.reduce((sum, job) => sum + (Number(job.finalPrice || job.price) || 0), 0)}`, color: 'emerald' }
                            ].map((card, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -4, shadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col hover:shadow-lg transition-all"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-4 rounded-2xl ${card.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                            card.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                                                card.color === 'amber' ? 'bg-amber-50 text-amber-500' :
                                                    'bg-emerald-50 text-emerald-500'
                                            }`}>
                                            <card.icon size={28} />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-gray-500 text-sm font-semibold mb-1">{card.label}</h3>
                                        <motion.p
                                            className="text-3xl font-black text-gray-900 tracking-tight"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 + (idx * 0.1) }}
                                        >
                                            {card.value}
                                        </motion.p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Registration & Account Status Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 mt-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-2xl ${user?.status === 'active' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                                    {user?.status === 'active' ? <CheckCircle size={28} /> : <Loader2 size={28} />}
                                </div>
                                <div>
                                    <h3 className="text-gray-900 font-bold text-lg">Account Status: <span className={user?.status === 'active' ? 'text-emerald-600 uppercase' : 'text-amber-500 uppercase'}>{user?.status || 'Pending'}</span></h3>
                                    <p className="text-gray-500 text-sm">Keep your profile updated to receive more job requests.</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4 w-full md:w-auto justify-end">
                                {user?.subscriptionExpiry && (
                                    <div className={`border rounded-2xl p-4 flex-1 md:flex-none md:min-w-[160px] ${isSubscriptionExpired ? 'bg-red-50 border-red-200' : isExpiringSoon ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-100'}`}>
                                        <span className={`text-xs font-bold uppercase tracking-wider block mb-1 ${isSubscriptionExpired ? 'text-red-500' : isExpiringSoon ? 'text-amber-600' : 'text-blue-500'}`}>
                                            Subscription Expiry
                                        </span>
                                        <span className={`text-lg font-black ${isSubscriptionExpired ? 'text-red-700' : isExpiringSoon ? 'text-amber-700' : 'text-blue-700'}`}>
                                            {new Date(user.subscriptionExpiry).toLocaleDateString()}
                                        </span>
                                        {isExpiringSoon && (
                                            <span className="text-xs font-bold text-red-600 block mt-1 animate-pulse">
                                                Expires in {daysUntilExpiry} {daysUntilExpiry === 1 ? 'day' : 'days'}!
                                            </span>
                                        )}
                                        {isSubscriptionExpired && (
                                            <span className="text-xs font-bold text-red-600 block mt-1">
                                                Expired
                                            </span>
                                        )}
                                    </div>
                                )}
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex-1 md:flex-none md:min-w-[140px]">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Reg Fee</span>
                                    <span className="text-xl font-black text-slate-700">₹{paymentInfo?.amount || 99}</span>
                                </div>
                                <div className={`border rounded-2xl p-4 flex-1 md:flex-none md:min-w-[140px] ${(paymentInfo?.payment_status || '').toLowerCase() === 'paid' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                                    <span className={`text-xs font-bold uppercase tracking-wider block mb-1 ${(paymentInfo?.payment_status || '').toLowerCase() === 'paid' ? 'text-emerald-600/70' : 'text-red-600/70'}`}>Payment</span>
                                    <span className={`text-xl font-bold ${(paymentInfo?.payment_status || '').toLowerCase() === 'paid' ? 'text-emerald-700' : 'text-red-700'}`}>{(paymentInfo?.payment_status || 'Pending').toUpperCase()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col h-full hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">Recent Requests</h3>
                                    <button onClick={() => setActiveTab('requests')} className="text-blue-600 text-sm font-bold hover:text-blue-800 transition-colors bg-blue-50 px-4 py-2 rounded-xl">View All</button>
                                </div>
                                {requestedJobs.length > 0 ? (
                                    <div className="space-y-4 flex-1">
                                        {requestedJobs.slice(0, 3).map((job, idx) => (
                                            <motion.div
                                                key={job._id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: idx * 0.1 }}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-blue-50/50 transition-all cursor-pointer"
                                            >
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-extrabold text-gray-900 leading-tight truncate text-lg mb-1">{job.serviceType}</h4>
                                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                            <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100/50">
                                                                <Calendar size={12} className="stroke-[2.5]" />
                                                                <span className="text-[10px] font-black uppercase tracking-wider">{job.date || 'No Date'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100/50">
                                                                <Clock size={12} className="stroke-[2.5]" />
                                                                <span className="text-[10px] font-black uppercase tracking-wider">{job.time || 'No Time'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-gray-400 mt-2">
                                                            <Zap size={10} />
                                                            <span className="text-[9px] font-bold italic uppercase tracking-widest">Booking Done: {new Date(job.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                <button
                                                    onClick={() => handleJobAction(job._id, 'accepted')}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-transform active:scale-95 shadow-sm"
                                                >
                                                    Accept
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center py-10 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <ClipboardList size={32} className="text-gray-300 mb-3" />
                                        <p className="font-medium">No pending requests right now.</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col h-full hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">My Active Jobs</h3>
                                    <button onClick={() => setActiveTab('active')} className="text-indigo-600 text-sm font-bold hover:text-indigo-800 transition-colors bg-indigo-50 px-4 py-2 rounded-xl">View All</button>
                                </div>
                                {activeJobs.length > 0 ? (
                                    <div className="space-y-4 flex-1">
                                        {activeJobs.slice(0, 3).map((job, idx) => (
                                            <motion.div
                                                key={job._id}
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: idx * 0.1 }}
                                                className="flex items-center justify-between p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
                                            >
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-extrabold text-indigo-900 leading-tight truncate text-lg mb-1">{job.serviceType}</h4>
                                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                            <div className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100/50">
                                                                <Calendar size={12} className="stroke-[2.5]" />
                                                                <span className="text-[10px] font-black uppercase tracking-wider">{job.date || 'No Date'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100/50">
                                                                <Clock size={12} className="stroke-[2.5]" />
                                                                <span className="text-[10px] font-black uppercase tracking-wider">{job.time || 'No Time'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-gray-400 mt-2">
                                                            <CheckCircle size={10} className="text-emerald-500" />
                                                            <span className="text-[9px] font-bold italic uppercase tracking-widest text-emerald-600/70">Booking Done: {new Date(job.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>

                                                <div className="flex flex-col gap-2 min-w-[140px] items-end">
                                                    {job.status === 'confirmed' ? (
                                                        <button
                                                            onClick={() => handleJobAction(job._id, 'completed')}
                                                            disabled={isActionLoading === job._id}
                                                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-transform active:scale-95 shadow-sm"
                                                        >
                                                            {isActionLoading === job._id ? 'Please Wait...' : 'Complete Job'}
                                                        </button>
                                                    ) : (
                                                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-500">
                                                            {job.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center py-10 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <CheckCircle size={32} className="text-gray-300 mb-3" />
                                        <p className="font-medium">You have no active jobs.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Section */}
                        <div className="mt-12 pt-10 border-t border-gray-200 text-center sm:text-left flex flex-col md:flex-row justify-between items-center gap-6 pb-6">
                            <div className="flex items-center gap-2 text-gray-400">
                                <Zap className="fill-gray-400" size={24} />
                                <span className="text-xl font-bold text-gray-400 tracking-tight">On-Demand</span>
                            </div>

                            <p className="text-sm text-gray-500 font-medium">
                                &copy; {new Date().getFullYear()} On-Demand Services. All rights reserved. Made with <Heart size={14} className="inline text-red-500 fill-red-500 mx-1" />
                            </p>

                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                    <Facebook size={18} />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-400 transition-colors">
                                    <Twitter size={18} />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                                    <Instagram size={18} />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                                    <Linkedin size={18} />
                                </a>
                            </div>
                        </div>
                    </div>
                );

            case 'requests':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="border-b border-gray-200 pb-5 mb-6">
                            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Job Requests</h2>
                            <p className="text-gray-500 mt-2 text-base">New jobs available for you to accept matching your service type.</p>
                        </div>

                        {requestedJobs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {requestedJobs.map(job => (
                                    <motion.div
                                        key={job._id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4 }}
                                        className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group"
                                    >
                                        <div className="p-8 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-2xl font-black text-gray-900 leading-none mb-1">{job.serviceType}</h3>
                                                        {job.appliedOffer && (
                                                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                                                                <Zap size={10} className="text-indigo-500" />
                                                                {job.appliedOffer} Applied
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium">
                                                        <Clock size={12} />
                                                        Booking Done: {new Date(job.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-blue-100 shadow-sm">New Request</div>
                                            </div>
                                            <p className="text-gray-500 text-sm leading-relaxed mb-8 italic line-clamp-2 min-h-[40px] border-l-2 border-blue-100 pl-4">
                                                "{job.details || 'No additional details provided.'}"
                                            </p>

                                            <div className="bg-gray-50/50 rounded-3xl p-6 mb-8 space-y-4 border border-gray-50 shadow-sm">
                                                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-500">
                                                            <UserIcon size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Customer</p>
                                                            <p className="text-sm font-bold text-gray-900 leading-none">{job.customer?.name || 'Valued User'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none flex items-center gap-1">
                                                            <Calendar size={10} /> Booking Date
                                                        </p>
                                                        <p className="text-sm font-extrabold text-blue-600">{job.date || 'No Date'}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none flex items-center gap-1">
                                                            <Clock size={10} /> Booking Time
                                                        </p>
                                                        <p className="text-sm font-extrabold text-blue-600">{job.time || 'No Time'}</p>
                                                    </div>
                                                    <div className="sm:col-span-2 space-y-1 bg-white/70 p-3 rounded-xl border border-gray-100/50">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none flex items-center gap-1 mb-1">
                                                            <MapPin size={10} /> Location
                                                        </p>
                                                        <p className="text-xs font-bold text-gray-700 leading-snug">{getCompleteLocation(job)}</p>
                                                    </div>
                                                    <div className="sm:col-span-2 space-y-1 bg-white/70 p-3 rounded-xl border border-gray-100/50">
                                                        <div className="flex justify-between items-center">
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Base Service Fee</p>
                                                            <p className="text-sm font-black text-gray-900">₹{job.price !== undefined ? job.price : 500}</p>
                                                        </div>
                                                        {job.appliedOffer && job.originalFinalPrice && (
                                                            <div className="flex justify-between items-center text-xs mt-1 border-t border-gray-100/50 pt-1.5">
                                                                <span className="text-gray-400 font-medium">Original: <span className="line-through">₹{job.originalFinalPrice}</span></span>
                                                                <span className="text-indigo-600 font-bold flex items-center gap-1"><Zap size={10} /> {job.appliedOffer}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-4 flex flex-col gap-3">
                                                <div className="grid grid-cols-5 gap-3">
                                                    <a
                                                        href={(job.latitude && job.longitude && job.latitude !== 0 && job.longitude !== 0)
                                                            ? `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${job.latitude},${job.longitude}&travelmode=driving`
                                                            : `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${encodeURIComponent(getLocationString(job))}&travelmode=driving`
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="col-span-2 flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-black py-4 rounded-2xl transition-all active:scale-95 text-xs uppercase tracking-widest border border-slate-100"
                                                    >
                                                        <Navigation size={16} className="stroke-[3]" /> Start
                                                    </a>
                                                    <button
                                                        onClick={() => handleJobAction(job._id, 'accepted')}
                                                        disabled={isActionLoading === job._id}
                                                        className="col-span-3 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)] active:scale-95 flex items-center justify-center text-xs uppercase tracking-widest gap-2"
                                                    >
                                                        {isActionLoading === job._id ? <Loader2 size={18} className="animate-spin" /> : <>Accept <ArrowLeft size={16} className="rotate-180 stroke-[3]" /></>}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
                                <div className="bg-gray-50 p-6 rounded-full mb-4">
                                    <ClipboardList className="text-gray-400" size={48} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Job Requests Available</h3>
                                <p className="text-gray-500 max-w-sm">There are currently no new jobs matching your service type.</p>
                            </div>
                        )}
                    </div>
                );

            case 'active':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-gray-200 pb-5 mb-6 gap-4">
                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Active Jobs</h2>
                                <p className="text-gray-500 mt-2 text-base">Manage jobs you have accepted and mark them as completed.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-500">Sort by:</span>
                                <select 
                                    value={activeSort}
                                    onChange={(e) => setActiveSort(e.target.value)}
                                    className="bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm cursor-pointer"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="status">Status (Action Required)</option>
                                </select>
                            </div>
                        </div>

                        {activeJobs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {activeJobs.map(job => (
                                    <motion.div
                                        key={job._id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4 }}
                                        className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden flex flex-col transition-all duration-300"
                                    >
                                        <div className="p-6 flex-1 flex flex-col">
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-5 pb-4 border-b border-gray-100">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-xl font-bold text-gray-900">{job.serviceType}</h3>
                                                        {job.appliedOffer && (
                                                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                                                                <Zap size={10} className="text-indigo-500" />
                                                                {job.appliedOffer} Applied
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                                                    job.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                                                }`}>
                                                    {job.status === 'confirmed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                                    {job.status === 'confirmed' ? 'Confirmed' : 'Ongoing'}
                                                </div>
                                            </div>

                                            {/* Job Info Rows */}
                                            <div className="space-y-4 mb-6">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 text-gray-400"><UserIcon size={18} /></div>
                                                    <div className="flex-1 flex justify-between items-center">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{job.customer?.name || 'Customer'}</p>
                                                        </div>
                                                        <a href={`tel:${job.customer?.phone}`} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
                                                            <Phone size={16} />
                                                        </a>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 text-gray-400"><Calendar size={18} /></div>
                                                    <div>
                                                        <p className="text-sm text-gray-700">{job.date || 'Pending Date'} at {job.time || 'Pending Time'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 text-gray-400"><MapPin size={18} /></div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 leading-snug">{getCompleteLocation(job)}</p>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100 mt-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Base Service Fee</span>
                                                        <span className="font-black text-gray-900 text-sm">₹{job.price !== undefined ? job.price : 500}</span>
                                                    </div>
                                                    {job.appliedOffer && job.originalFinalPrice && (
                                                        <div className="flex justify-between items-center text-[11px] mt-1.5 border-t border-gray-200/60 pt-1.5">
                                                            <span className="text-gray-400 font-medium">Original: <span className="line-through">₹{job.originalFinalPrice}</span></span>
                                                            <span className="text-indigo-600 font-bold flex items-center gap-1"><Zap size={10} /> {job.appliedOffer}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Price Section */}
                                            <div className="bg-gray-50 p-4 rounded-xl mb-6">
                                                {job.status === 'accepted' ? (
                                                    <div className="flex items-center gap-3 text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100">
                                                        <Clock size={16} />
                                                        <span className="text-sm font-semibold">Waiting for customer to pay ₹100 Visit Charge</span>
                                                    </div>
                                                ) : job.status === 'confirmed' && !job.priceSubmitted ? (
                                                    <div className="flex flex-col gap-3">
                                                        {job.appliedOffer && (
                                                            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-2 rounded-lg mb-2 text-indigo-700 w-fit">
                                                                <Zap size={14} className="text-indigo-500" />
                                                                <span className="text-xs font-bold">Offer Applied: {job.appliedOffer}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100 w-fit mb-2">
                                                            <CheckCircle size={14} />
                                                            <span className="text-xs font-bold">₹100 Visit Charge Paid</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 flex items-center bg-white rounded-lg border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all overflow-hidden">
                                                                <span className="pl-3 pr-1 text-gray-500 font-medium select-none pointer-events-none">₹</span>
                                                                <input 
                                                                    type="number" 
                                                                    placeholder={job.finalPrice ? `Updated: ${job.finalPrice}` : "Enter Final Price"} 
                                                                    value={finalPrices[job._id] !== undefined ? finalPrices[job._id] : (job.finalPrice || '')}
                                                                    onChange={(e) => setFinalPrices({...finalPrices, [job._id]: e.target.value})}
                                                                    className="w-full py-2 pr-3 bg-transparent text-sm font-semibold text-gray-900 focus:outline-none placeholder-gray-400"
                                                                />
                                                            </div>
                                                            <button 
                                                                onClick={() => handleUpdatePrice(job._id, finalPrices[job._id] !== undefined ? finalPrices[job._id] : job.finalPrice)}
                                                                disabled={isActionLoading === `price-${job._id}` || (finalPrices[job._id] === undefined && !job.finalPrice)}
                                                                className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
                                                            >
                                                                {isActionLoading === `price-${job._id}` ? <Loader2 size={14} className="animate-spin" /> : 'Submit Price'}
                                                            </button>
                                                        </div>
                                                        {job.appliedOffer && (finalPrices[job._id] !== undefined ? finalPrices[job._id] : job.finalPrice) && (() => {
                                                            const currentVal = parseFloat(finalPrices[job._id] !== undefined ? finalPrices[job._id] : job.finalPrice);
                                                            if (isNaN(currentVal) || currentVal <= 0) return null;
                                                            
                                                            let calculatedPrice = currentVal;
                                                            const match = job.appliedOffer.match(/(\d+)%/);
                                                            if (match && match[1]) {
                                                                const discountPercentage = parseInt(match[1], 10);
                                                                calculatedPrice = currentVal - ((currentVal * discountPercentage) / 100);
                                                            } else if (job.appliedOffer.toLowerCase().includes('free')) {
                                                                // For free consultations, the discount applies to the base inspection fee,
                                                                // not the final quoted price for actual repair work.
                                                                calculatedPrice = currentVal;
                                                            }
                                                            
                                                            if (calculatedPrice === currentVal) return null;

                                                            return (
                                                                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mt-1 flex justify-between items-center animate-fade-in shadow-sm">
                                                                    <span className="text-xs font-bold text-indigo-800 flex items-center gap-1.5"><Zap size={12} className="text-indigo-500"/> Customer pays after discount:</span>
                                                                    <span className="text-sm font-black text-indigo-700">₹{calculatedPrice}</span>
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col space-y-3">
                                                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-200 pb-2"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> Payment Details</h4>
                                                        
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-gray-500 font-semibold">{job.status === 'completed' ? 'Final Service Fee' : 'Confirmed Price'}</span>
                                                            <span className="font-black text-gray-900 text-base">₹{job.finalPrice !== undefined ? job.finalPrice : (job.price !== undefined ? job.price : 500)}</span>
                                                        </div>
                                                        {job.appliedOffer && job.originalFinalPrice && (
                                                            <div className="flex justify-between items-center text-xs mt-1 border-t border-gray-100 pt-1">
                                                                <span className="text-gray-400 font-medium">Original Quote: <span className="line-through">₹{job.originalFinalPrice}</span></span>
                                                                <span className="text-indigo-600 font-bold flex items-center gap-1"><Zap size={10} /> {job.appliedOffer}</span>
                                                            </div>
                                                        )}

                                                        {job.status === 'completed' && (
                                                            <div className="flex justify-between items-center text-sm pt-1">
                                                                <span className="text-gray-500 font-semibold">Payment Status</span>
                                                                <span className="font-bold text-gray-900">
                                                                    {!job.finalPaymentMethod ? (
                                                                        <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 text-[10px] font-black uppercase tracking-widest">Awaiting Payment</span>
                                                                    ) : job.finalPaymentMethod === 'online' ? (
                                                                        <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><CheckCircle size={12} /> Paid Online</span>
                                                                    ) : (
                                                                        <span className="text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200 text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><CheckCircle size={12} /> Collect Cash</span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {job.status !== 'completed' && (
                                                            <div className="flex justify-between items-center text-sm pt-1">
                                                                <span className="text-gray-500 font-semibold">Job Status</span>
                                                                <span className={`px-2 py-1 rounded border text-[10px] font-black uppercase tracking-widest ${job.priceConfirmed ? 'text-blue-600 bg-blue-50 border-blue-100' : 'text-amber-600 bg-amber-50 border-amber-100'}`}>
                                                                    {job.priceConfirmed ? 'Confirmed' : 'Waiting Confirmation'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="mt-auto pt-2 grid grid-cols-2 gap-3">
                                                <a
                                                    href={(job.latitude && job.longitude && job.latitude !== 0 && job.longitude !== 0)
                                                        ? `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${job.latitude},${job.longitude}&travelmode=driving`
                                                        : `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${encodeURIComponent(getLocationString(job))}&travelmode=driving`
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-colors text-sm"
                                                >
                                                    <Navigation size={16} /> Start Work
                                                </a>
                                                <button
                                                    onClick={() => handleJobAction(job._id, 'completed')}
                                                    disabled={isActionLoading === job._id || !job.priceSubmitted || !job.priceConfirmed}
                                                    title={!job.priceSubmitted ? "Please update and submit the final price first" : (!job.priceConfirmed ? "Waiting for customer to confirm price" : "")}
                                                    className={`font-semibold py-3 rounded-xl flex items-center justify-center text-sm gap-2 transition-colors duration-200 ${(isActionLoading === job._id || !job.priceSubmitted || !job.priceConfirmed) ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow active:scale-95'}`}
                                                >
                                                    {isActionLoading === job._id ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={16} /> Finish Job</>}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
                                <div className="bg-blue-50 p-6 rounded-full mb-4">
                                    <Briefcase className="text-blue-300" size={48} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Jobs</h3>
                                <p className="text-gray-500 max-w-sm">You haven't accepted any jobs yet. Check the requests tab to find work.</p>
                                <button onClick={() => setActiveTab('requests')} className="mt-6 bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold px-6 py-2 rounded-xl transition-colors">Find Jobs</button>
                            </div>
                        )}
                    </div>
                );

            case 'overdue':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="border-b border-gray-200 pb-5 mb-6">
                            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Overdue Jobs</h2>
                            <p className="text-gray-500 mt-2 text-base">These active jobs have passed their scheduled booking date and time.</p>
                        </div>

                        {overdueJobs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {overdueJobs.map(job => (
                                    <motion.div
                                        key={job._id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4 }}
                                        className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-red-100 overflow-hidden flex flex-col transition-all duration-300"
                                    >
                                        <div className="p-6 flex-1 flex flex-col relative">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-[40px] pointer-events-none"></div>
                                            {/* Header */}
                                            <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-100 relative z-10">
                                                <h3 className="text-xl font-bold text-gray-900">{job.serviceType}</h3>
                                                <div className="text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-100">
                                                    <AlertCircle size={12} /> Overdue
                                                </div>
                                            </div>

                                            {/* Job Info Rows */}
                                            <div className="space-y-4 mb-6 relative z-10">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 text-gray-400"><UserIcon size={18} /></div>
                                                    <div className="flex-1 flex justify-between items-center">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{job.customer?.name || 'Customer'}</p>
                                                        </div>
                                                        <a href={`tel:${job.customer?.phone}`} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
                                                            <Phone size={16} />
                                                        </a>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 text-red-400"><Calendar size={18} /></div>
                                                    <div>
                                                        <p className="text-sm font-bold text-red-600">{job.date || 'Pending Date'} at {job.time || 'Pending Time'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 text-gray-400"><MapPin size={18} /></div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 leading-snug">{getCompleteLocation(job)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Price Section */}
                                            <div className="bg-gray-50 p-4 rounded-xl mb-6 relative z-10">
                                                {job.status === 'accepted' ? (
                                                    <div className="flex items-center gap-3 text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100">
                                                        <Clock size={16} />
                                                        <span className="text-sm font-semibold">Waiting for customer to pay ₹100 Visit Charge</span>
                                                    </div>
                                                ) : job.status === 'confirmed' && !job.priceSubmitted ? (
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100 w-fit">
                                                            <CheckCircle size={14} />
                                                            <span className="text-xs font-bold">₹100 Visit Charge Paid</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 flex items-center bg-white rounded-lg border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all overflow-hidden">
                                                                <span className="pl-3 pr-1 text-gray-500 font-medium select-none pointer-events-none">₹</span>
                                                                <input 
                                                                    type="number" 
                                                                    placeholder={job.finalPrice ? `Updated: ${job.finalPrice}` : "Enter Final Price"} 
                                                                    value={finalPrices[job._id] !== undefined ? finalPrices[job._id] : (job.finalPrice || '')}
                                                                    onChange={(e) => setFinalPrices({...finalPrices, [job._id]: e.target.value})}
                                                                    className="w-full py-2 pr-3 bg-transparent text-sm font-semibold text-gray-900 focus:outline-none placeholder-gray-400"
                                                                />
                                                            </div>
                                                            <button 
                                                                onClick={() => handleUpdatePrice(job._id, finalPrices[job._id] !== undefined ? finalPrices[job._id] : job.finalPrice)}
                                                                disabled={isActionLoading === `price-${job._id}` || (finalPrices[job._id] === undefined && !job.finalPrice)}
                                                                className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
                                                            >
                                                                {isActionLoading === `price-${job._id}` ? <Loader2 size={14} className="animate-spin" /> : 'Submit Price'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col space-y-3">
                                                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-200 pb-2"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> Payment Details</h4>
                                                        
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-gray-500 font-semibold">{job.status === 'completed' ? 'Final Service Fee' : 'Confirmed Price'}</span>
                                                            <span className="font-black text-gray-900 text-base">₹{job.finalPrice || job.price}</span>
                                                        </div>

                                                        {job.status === 'completed' && (
                                                            <div className="flex justify-between items-center text-sm pt-1">
                                                                <span className="text-gray-500 font-semibold">Payment Status</span>
                                                                <span className="font-bold text-gray-900">
                                                                    {!job.finalPaymentMethod ? (
                                                                        <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 text-[10px] font-black uppercase tracking-widest">Awaiting Payment</span>
                                                                    ) : job.finalPaymentMethod === 'online' ? (
                                                                        <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><CheckCircle size={12} /> Paid Online</span>
                                                                    ) : (
                                                                        <span className="text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200 text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><CheckCircle size={12} /> Collect Cash</span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {job.status !== 'completed' && (
                                                            <div className="flex justify-between items-center text-sm pt-1">
                                                                <span className="text-gray-500 font-semibold">Job Status</span>
                                                                <span className={`px-2 py-1 rounded border text-[10px] font-black uppercase tracking-widest ${job.priceConfirmed ? 'text-red-600 bg-red-50 border-red-100' : 'text-amber-600 bg-amber-50 border-amber-100'}`}>
                                                                    {job.priceConfirmed ? 'Overdue / Confirmed' : 'Waiting Confirmation'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="mt-auto pt-2 grid grid-cols-2 gap-3 relative z-10">
                                                <a
                                                    href={(job.latitude && job.longitude && job.latitude !== 0 && job.longitude !== 0)
                                                        ? `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${job.latitude},${job.longitude}&travelmode=driving`
                                                        : `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${encodeURIComponent(getLocationString(job))}&travelmode=driving`
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-colors text-sm"
                                                >
                                                    <Navigation size={16} /> Start Work
                                                </a>
                                                <button
                                                    onClick={() => handleJobAction(job._id, 'completed')}
                                                    disabled={isActionLoading === job._id || !job.priceSubmitted || !job.priceConfirmed}
                                                    title={!job.priceSubmitted ? "Please update and submit the final price first" : (!job.priceConfirmed ? "Waiting for customer to confirm price" : "")}
                                                    className={`font-semibold py-3 rounded-xl flex items-center justify-center text-sm gap-2 transition-colors duration-200 ${(isActionLoading === job._id || !job.priceSubmitted || !job.priceConfirmed) ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow active:scale-95'}`}
                                                >
                                                    {isActionLoading === job._id ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={16} /> Finish Job</>}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
                                <div className="bg-red-50 p-6 rounded-full mb-4">
                                    <AlertCircle className="text-red-300" size={48} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Overdue Jobs</h3>
                                <p className="text-gray-500 max-w-sm">You're completely caught up with your schedule! Great job.</p>
                            </div>
                        )}
                    </div>
                );

            case 'completed':
                const tableTotalEarnings = completedJobs.reduce((sum, job) => sum + (Number(job.finalPrice || job.price) || 0), 0);
                
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-gray-200 pb-5 mb-6 gap-4">
                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Completed Jobs</h2>
                                <p className="text-gray-500 mt-2 text-base">History of all the jobs you have successfully completed.</p>
                            </div>
                            <button 
                                onClick={handleExportReport}
                                disabled={completedJobs.length === 0}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                Export Report
                            </button>
                        </div>

                        {completedJobs.length > 0 ? (
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4">Job Info</th>
                                                <th className="px-6 py-4">Date Completed</th>
                                                <th className="px-6 py-4">Final Price</th>
                                                <th className="px-6 py-4 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-sm">
                                            {completedJobs.map((job, idx) => (
                                                <motion.tr
                                                    key={job._id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-900 text-base">{job.customer?.name || 'Customer'}</div>
                                                        <div 
                                                            onClick={() => setExpandedLocations(prev => ({...prev, [job._id]: !prev[job._id]}))}
                                                            className={`text-gray-500 text-xs mt-1 cursor-pointer transition-all ${!expandedLocations[job._id] ? 'truncate max-w-[200px]' : 'max-w-[300px]'}`}
                                                            title="Click to toggle full location"
                                                        >
                                                            {getCompleteLocation(job)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500">{new Date(job.updatedAt || job.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 text-gray-900 font-bold">{job.finalPrice ? `₹ ${job.finalPrice}` : 'N/A'}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        {job.status === 'confirmed' ? (
                                                            <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                                                <CheckCircle size={12} /> Confirmed
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                                                <CheckCircle size={12} /> Completed
                                                            </span>
                                                        )}
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-emerald-50 border-t-2 border-emerald-100">
                                            <tr>
                                                <td colSpan="2" className="px-6 py-4 text-right font-extrabold text-emerald-800 uppercase tracking-wider text-xs">Total Earnings:</td>
                                                <td className="px-6 py-4 font-black text-emerald-600 text-lg">₹ {tableTotalEarnings}</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
                                <div className="bg-emerald-50 p-6 rounded-full mb-4">
                                    <CheckCircle className="text-emerald-300" size={48} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Completed Jobs</h3>
                                <p className="text-gray-500 max-w-sm">You haven't completed any jobs yet.</p>
                            </div>
                        )}
                    </div>
                );

            case 'payments':
                const paymentJobs = [...activeJobsRaw, ...completedJobs].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

                return (
                    <div className="space-y-6 animate-fade-in relative z-10">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-gray-200 pb-5 mb-6 gap-4">
                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                                    <Banknote className="text-emerald-500" size={32} />
                                    Payment Details
                                </h2>
                                <p className="text-gray-500 mt-2 text-base">Track your advance and final payments across all active and completed jobs.</p>
                            </div>
                        </div>

                        {paymentJobs.length > 0 ? (
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4">Job Info</th>
                                                <th className="px-6 py-4">Advance (₹100)</th>
                                                <th className="px-6 py-4">Final Payment</th>
                                                <th className="px-6 py-4 text-right">Job Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-sm">
                                            {paymentJobs.map((job, idx) => {
                                                // Advance Payment Logic
                                                const isAdvancePaid = job.priceConfirmed || job.status === 'confirmed' || job.status === 'completed';
                                                
                                                return (
                                                    <motion.tr
                                                        key={job._id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        className="hover:bg-gray-50 transition-colors"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-gray-900 text-base">{job.customer?.name || 'Customer'}</div>
                                                            <div 
                                                                onClick={() => setExpandedLocations(prev => ({...prev, [job._id]: !prev[job._id]}))}
                                                                className={`text-gray-500 text-xs mt-1 cursor-pointer transition-all ${!expandedLocations[job._id] ? 'truncate max-w-[200px]' : 'max-w-[300px]'}`}
                                                                title="Click to toggle full location"
                                                            >
                                                                {getCompleteLocation(job)} • {new Date(job.updatedAt || job.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {isAdvancePaid ? (
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="font-bold text-gray-900">₹100</span>
                                                                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200 w-fit">
                                                                        <CheckCircle size={10} /> Paid Online
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 text-[10px] font-black uppercase tracking-widest">Pending</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {job.status === 'completed' ? (
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="font-bold text-gray-900">₹{job.finalPrice || job.price}</span>
                                                                    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${!job.finalPaymentMethod ? 'bg-amber-50 text-amber-600 border-amber-100' : job.finalPaymentMethod === 'online' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'} w-fit`}>
                                                                        {!job.finalPaymentMethod ? 'Awaiting Payment' : job.finalPaymentMethod === 'online' ? <><CheckCircle size={10} /> Paid Online</> : <><CheckCircle size={10} /> Paid Cash</>}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="font-semibold text-gray-600">{job.finalPrice ? `₹${job.finalPrice}` : 'Unpriced'}</span>
                                                                    <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Awaiting Completion</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${job.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                <CheckCircle size={12} /> {job.status === 'completed' ? 'Completed' : 'Active'}
                                                            </span>
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
                                <div className="bg-emerald-50 p-6 rounded-full mb-4">
                                    <Banknote className="text-emerald-300" size={48} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Payment Records Found</h3>
                                <p className="text-gray-500 max-w-sm">Accept some jobs to start tracking your payments here.</p>
                            </div>
                        )}
                    </div>
                );

            case 'report':
                return (
                    <div className="space-y-6 animate-fade-in relative z-10">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-gray-200 pb-5 mb-6 gap-4">
                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Earnings Report</h2>
                                <p className="text-gray-500 mt-2 text-base">View your total earnings summary, performance charts, and export data.</p>
                            </div>
                            <button 
                                onClick={handleExportReport}
                                disabled={completedJobs.length === 0}
                                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-md"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                Download CSV
                            </button>
                        </div>

                        {/* ROW 1: QUICK STATS */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {[
                                { label: 'Total Jobs', value: jobs.filter(j => j.worker === workerId || j.worker?._id === workerId).length, bgColor: 'bg-indigo-50', textColor: 'text-indigo-600' },
                                { label: 'Completed', value: completedJobs.length, bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
                                { label: 'Active Jobs', value: activeJobs.length, bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
                                { label: 'Cancelled', value: cancelledJobsCount, bgColor: 'bg-red-50', textColor: 'text-red-600' }
                            ].map((stat, idx) => (
                                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} 
                                    className={`rounded-3xl p-6 ${stat.bgColor} border border-white shadow-sm flex flex-col justify-center items-center text-center`}
                                >
                                    <h4 className="text-xs sm:text-sm font-bold text-gray-500 tracking-wider uppercase mb-1">{stat.label}</h4>
                                    <p className={`text-4xl font-black ${stat.textColor}`}>{stat.value}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* ROW 2: EARNINGS & PIE CHART */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                            
                            {/* EARNINGS SUMMARY - Spans 2 cols */}
                            <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden border border-slate-800 flex flex-col justify-center">
                                {/* Decor */}
                                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-[60px] pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-48 h-48 bg-blue-500/20 rounded-full blur-[50px] pointer-events-none"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-emerald-500/20 p-3 rounded-2xl border border-emerald-500/30 text-emerald-400">
                                            <Banknote size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-200 tracking-tight">Financial Overview</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        <div>
                                            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Total Earnings</p>
                                            <p className="text-4xl font-black text-white tracking-tight">₹ {reportTotalEarnings}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">This Month</p>
                                            <p className="text-3xl font-black text-emerald-400 tracking-tight">₹ {thisMonthEarnings}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Last Payment</p>
                                            <p className="text-lg font-bold text-slate-300 tracking-tight mt-1">{lastPaymentDate}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* PIE CHART - Spans 1 col */}
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                                <h3 className="text-gray-900 font-bold mb-2">Job Distribution</h3>
                                {pieData.length > 0 ? (
                                    <div className="h-[200px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                                    itemStyle={{ color: '#1f2937' }}
                                                />
                                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="text-gray-400 text-sm my-auto text-center font-medium placeholder-gray">No Job Data</div>
                                )}
                            </div>
                        </div>

                        {/* ROW 3: BAR CHART */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
                            <h3 className="text-gray-900 font-bold mb-6 text-lg">Completed Jobs (Last 6 Months)</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 'bold' }} dy={10} />
                                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 'bold' }} dx={-10} />
                                        <Tooltip 
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                        />
                                        <Bar dataKey="Completed" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* ROW 4: RECENT COMPLETED JOBS TABLE */}
                        {completedJobs.length > 0 && (
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                                <div className="p-6 border-b border-gray-100">
                                   <h3 className="text-gray-900 font-bold text-lg">Recent Completed Jobs</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4 rounded-tl-lg">Service</th>
                                                <th className="px-6 py-4">Customer</th>
                                                <th className="px-6 py-4">Date Completed</th>
                                                <th className="px-6 py-4 text-right rounded-tr-lg">Final Price</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-sm">
                                            {sortedCompleted.slice(0, 5).map((job, idx) => (
                                                <motion.tr
                                                    key={job._id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="hover:bg-gray-50/50 transition-colors"
                                                >
                                                    <td className="px-6 py-4 font-bold text-gray-900">{job.serviceType}</td>
                                                    <td className="px-6 py-4 text-gray-600">{job.customer?.name || 'Customer'}</td>
                                                    <td className="px-6 py-4 text-gray-500">{new Date(job.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 text-right font-black text-emerald-600">₹ {job.finalPrice || job.price || 0}</td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                );


            case 'subscription':
                return (
                    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
                        {/* Header Area */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-gray-200 pb-5 mb-6 gap-4">
                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Subscription</h2>
                                <p className="text-gray-500 mt-2 text-base">Manage your platform access and renewal.</p>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black text-gray-900 mb-2">Subscription Details</h3>
                                <p className="text-gray-500">Your monthly platform access status</p>
                            </div>
                            <div className="flex items-center gap-4 bg-gray-50 px-6 py-4 rounded-2xl border border-gray-200 w-full md:w-auto relative z-10">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isSubscriptionExpired ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                    {isSubscriptionExpired ? <XCircle size={24} /> : <CheckCircle size={24} />}
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Current Status</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${isSubscriptionExpired ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                                        <span className={`text-lg font-black tracking-wide ${isSubscriptionExpired ? 'text-red-600' : 'text-emerald-600'}`}>
                                            {isSubscriptionExpired ? 'EXPIRED' : 'ACTIVE'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mt-16 -mr-16 transition-transform duration-500 group-hover:scale-150 pointer-events-none"></div>
                                <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-6 bg-blue-50 inline-block px-3 py-1 rounded-md">Current Plan</h3>
                                
                                <div className="space-y-6 relative z-10">
                                    <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Plan Name</p>
                                            <p className="text-xl font-black text-gray-900">Monthly Standard</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Billing Cycle</p>
                                            <p className="text-lg font-bold text-gray-900">30 Days</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Expiry Date</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className={`p-2.5 rounded-xl border ${isSubscriptionExpired ? 'bg-red-50 border-red-100 text-red-500' : 'bg-blue-50 border-blue-100 text-blue-500'}`}>
                                                <Calendar size={20} />
                                            </div>
                                            <p className={`text-xl font-black ${isSubscriptionExpired ? 'text-red-600' : 'text-gray-900'}`}>
                                                {user?.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not Available'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/50 rounded-full -mt-16 -mr-16 transition-transform duration-500 group-hover:scale-150 pointer-events-none"></div>
                                <div>
                                    <h3 className="text-sm font-black text-amber-600 uppercase tracking-widest mb-6 bg-amber-50 inline-block px-3 py-1 rounded-md relative z-10">Renewal</h3>
                                    <p className="text-gray-500 mb-6 relative z-10 text-sm leading-relaxed font-medium">
                                        Renew your subscription to continue receiving job requests and accessing platform features. The renewal fee is <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">₹99 per month</span>.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowPaymentModal(true)}
                                    className={`py-4 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2 w-full relative z-10 shadow-lg active:scale-95 ${
                                        isSubscriptionExpired 
                                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20' 
                                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                                    }`}
                                >
                                    <Zap size={20} /> {isSubscriptionExpired ? 'Renew Now to Restore Access (₹99)' : 'Extend Subscription (₹99)'}
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'profile':
                return (
                    <form onSubmit={handleProfileUpdate} className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
                        {/* Header Area */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-gray-200 pb-5 mb-6 gap-4">
                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Profile Settings</h2>
                                <p className="text-gray-500 mt-2 text-base">Manage your personal information, contact details, and service location.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {!isEditingProfile ? (
                                    <button 
                                        type="button"
                                        onClick={() => setIsEditingProfile(true)} 
                                        className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm active:scale-95"
                                    >
                                        <Pencil size={16} /> Edit Profile
                                    </button>
                                ) : (
                                    <>
                                        <button 
                                            type="button"
                                            onClick={() => { setIsEditingProfile(false); setPhotoPreview(user?.photo ? `http://localhost:5001/${user.photo.replace(/\\/g, '/')}` : null); setSelectedPhoto(null); }} 
                                            className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={isActionLoading === 'profile'} 
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-70"
                                        >
                                            {isActionLoading === 'profile' ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Avatar & Quick Info */}
                            <div className="lg:col-span-1 space-y-6">
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col items-center text-center relative overflow-hidden group"
                                >
                                    {/* Beautiful Background Banner */}
                                    <div className="w-full h-40 relative overflow-hidden">
                                        <img src="https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop" alt="Profile Banner" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40"></div>
                                    </div>
                                    
                                    <div className="relative w-full px-8 pb-8 flex flex-col items-center">
                                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white flex items-center justify-center text-blue-600 text-5xl font-extrabold -mt-16 mb-4 shrink-0 z-10 ring-4 ring-blue-50">
                                            {photoPreview ? (
                                                <img src={photoPreview} alt="Profile" className="absolute inset-0 w-full h-full object-cover" />
                                            ) : (
                                                profileForm.name?.charAt(0) || 'W'
                                            )}
                                            {isEditingProfile && (
                                                <label className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-all cursor-pointer text-white z-20">
                                                    <Camera size={24} className="mb-2" />
                                                    <span className="text-[10px] uppercase tracking-wider font-bold">Update Photo</span>
                                                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                                                </label>
                                            )}
                                        </div>
                                        
                                        <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-1">{profileForm.name || 'Your Name'}</h3>
                                        <p className="text-blue-700 font-black text-[11px] uppercase tracking-widest mb-6 bg-blue-50 px-4 py-2 rounded-full inline-block shadow-sm border border-blue-100">{profileForm.profession || 'Service Provider'}</p>
                                        
                                        <div className="w-full pt-6 border-t border-gray-100 space-y-4 text-left">
                                            <div className="flex items-center gap-3 text-gray-600 group/item">
                                                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 group-hover/item:bg-blue-50 group-hover/item:border-blue-200 transition-colors"><Mail size={18} className="text-blue-500" /></div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Email Address</p>
                                                    <p className="text-sm font-bold text-gray-900 truncate">{profileForm.email || 'No email'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-600 group/item">
                                                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 group-hover/item:bg-emerald-50 group-hover/item:border-emerald-200 transition-colors"><Phone size={18} className="text-emerald-500" /></div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Phone Number</p>
                                                    <p className="text-sm font-bold text-gray-900">{profileForm.phone || 'No phone'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-600 group/item">
                                                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 group-hover/item:bg-amber-50 group-hover/item:border-amber-200 transition-colors"><MapPin size={18} className="text-amber-500" /></div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Primary Location</p>
                                                    <p className="text-sm font-bold text-gray-900 truncate">{profileForm.address ? profileForm.address.split(',').pop().trim() : 'Location not set'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Account Status Card */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-sm font-bold text-gray-900">Account Status</h4>
                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                            user?.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                            {user?.status === 'active' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                            {user?.status || 'Pending'}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        {user?.status === 'active' 
                                            ? 'Your account is active and visible to customers.' 
                                            : 'Your account is pending review. Please ensure all details are filled out.'}
                                    </p>
                                </motion.div>
                            </div>

                            {/* Right Column: Editable Forms */}
                            <div className="lg:col-span-2 space-y-6">
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                                >
                                    <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                                        <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                                            <UserIcon size={20} className="text-blue-500" />
                                            Personal Details
                                        </h3>
                                    </div>
                                    <div className="p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                                                {isEditingProfile ? (
                                                    <input 
                                                        type="text" 
                                                        value={profileForm.name} 
                                                        onChange={e => handleFieldChange('name', e.target.value)} 
                                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none transition-all" 
                                                    />
                                                ) : (
                                                    <div className="bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-900">{profileForm.name || '-'}</div>
                                                )}
                                                {errors.name && <p className="text-red-500 text-[10px] mt-1 font-bold flex items-center gap-1"><AlertCircle size={10} />{errors.name}</p>}
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                                                <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-500 flex items-center gap-2 cursor-not-allowed">
                                                    <Mail size={16} className="text-gray-400" /> {profileForm.email || '-'}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                                                {isEditingProfile ? (
                                                    <input 
                                                        type="text" 
                                                        value={profileForm.phone} 
                                                        onChange={e => handleFieldChange('phone', e.target.value)} 
                                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none transition-all" 
                                                    />
                                                ) : (
                                                    <div className="bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-900">{profileForm.phone || '-'}</div>
                                                )}
                                                {errors.phone && <p className="text-red-500 text-[10px] mt-1 font-bold flex items-center gap-1"><AlertCircle size={10} />{errors.phone}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Profession</label>
                                                {isEditingProfile ? (
                                                    <input 
                                                        type="text" 
                                                        value={profileForm.profession} 
                                                        onChange={e => handleFieldChange('profession', e.target.value)} 
                                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none transition-all" 
                                                    />
                                                ) : (
                                                    <div className="bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-900">{profileForm.profession || '-'}</div>
                                                )}
                                            </div>

                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Experience Level</label>
                                                {isEditingProfile ? (
                                                    <input 
                                                        type="text" 
                                                        placeholder="e.g., 5 years of experience in residential plumbing"
                                                        value={profileForm.experience} 
                                                        onChange={e => handleFieldChange('experience', e.target.value)} 
                                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none transition-all" 
                                                    />
                                                ) : (
                                                    <div className="bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-900">{profileForm.experience || '-'}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                                >
                                    <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                        <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                                            <MapPin size={20} className="text-emerald-500" />
                                            Service Location
                                        </h3>
                                        {isEditingProfile && (
                                            <div className="flex gap-2">
                                                <button type="button" onClick={handleLocateMe} disabled={isLocating} className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm">
                                                    {isLocating ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} className="text-blue-500" />} Auto-Locate
                                                </button>
                                                <button type="button" onClick={() => setShowMapModal(true)} className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                                                    <Map size={14} /> Open Map
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Detailed Address</label>
                                            {isEditingProfile ? (
                                                <textarea 
                                                    rows={3}
                                                    value={profileForm.address} 
                                                    onChange={e => handleFieldChange('address', e.target.value)} 
                                                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none transition-all resize-none" 
                                                    placeholder="Enter your full service address..."
                                                />
                                            ) : (
                                                <div className="bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-4 text-sm font-bold text-gray-900 leading-relaxed min-h-[80px] flex items-start gap-3">
                                                    <MapPin size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                                                    {profileForm.address || 'No address provided. Please update your profile.'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </form>
                );
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#f9fafb] flex flex-col md:flex-row">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed top-6 right-6 px-6 py-4 rounded-xl shadow-xl border flex items-center gap-3 z-50 animate-slide-in ${toast.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-600 text-white border-emerald-500'
                    }`}>
                    {toast.type === 'error' ? <X size={20} /> : <CheckCircle size={20} />}
                    <span className="font-bold text-sm tracking-wide">{toast.message}</span>
                </div>
            )}

            {/* Mobile Sidebar Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden animate-fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside className={`fixed md:sticky top-0 h-screen bg-white shadow-[1px_0_10px_rgba(0,0,0,0.03)] z-30 transition-all duration-300 ease-in-out flex flex-col overflow-hidden ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'}`}>
                <div className="w-64 flex flex-col h-full">
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <img src={logo} alt="Logo" className="h-8 w-8" />
                            <span className="text-xl font-bold text-gray-900 tracking-tight">On-Demand</span>
                        </div>
                        <button className="text-gray-500 hover:text-gray-700 bg-gray-50 p-2 rounded-lg" onClick={() => setIsSidebarOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4 px-3">Menu</div>

                        {navItems.slice(0, 4).map(item => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === item.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon size={18} className={activeTab === item.id ? 'text-blue-600' : 'text-gray-400'} />
                                    {item.label}
                                </div>
                                {item.badge && (
                                    <span className={`inline-flex items-center justify-center px-2 py-0.5 ml-3 text-xs font-bold rounded-full ${activeTab === item.id ? 'bg-blue-200 text-blue-800' : 'bg-rose-100 text-rose-600'}`}>
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        ))}

                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-8 px-3">Account</div>

                        {navItems.slice(4).map(item => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === item.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                <item.icon size={18} className={activeTab === item.id ? 'text-blue-600' : 'text-gray-400'} />
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-gray-100">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f4f7f9]">
                {/* Navbar */}
                <header className="h-20 bg-white shadow-[0_1px_10px_rgba(0,0,0,0.02)] sticky top-0 z-10 px-6 md:px-10 flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button
                            className={`p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors ${isSidebarOpen ? 'hidden' : 'block'}`}
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        {activeTab !== 'dashboard' && (
                            <button
                                className="p-1.5 sm:p-2 rounded-lg transition-colors flex items-center justify-center border border-transparent text-gray-400 hover:text-gray-700 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-200"
                                onClick={() => setActiveTab('dashboard')}
                                title="Go to Dashboard"
                            >
                                <ArrowLeft size={18} strokeWidth={2.5} />
                            </button>
                        )}
                        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight hidden sm:block">
                            {navItems.find(i => i.id === activeTab)?.label}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors focus:outline-none"
                            >
                                <Bell size={20} />
                                {notifications.filter(n => !n.isRead).length > 0 && (
                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in origin-top-right">
                                    <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                        <h3 className="font-bold text-gray-900">Notifications</h3>
                                        {notifications.filter(n => !n.isRead).length > 0 && (
                                            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{notifications.filter(n => !n.isRead).length} New</span>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.map(notif => (
                                                <div
                                                    key={notif._id}
                                                    className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${notif.isRead ? 'opacity-70' : ''}`}
                                                    onClick={() => {
                                                        if (!notif.isRead) markNotificationAsRead(notif._id);
                                                    }}
                                                >
                                                    <p className={`text-sm leading-relaxed ${notif.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                                                        {!notif.isRead && <span className="text-blue-600 mr-2">●</span>}
                                                        {notif.message}
                                                    </p>
                                                    <span className="text-xs text-gray-400 mt-2 block ml-4">{new Date(notif.createdAt).toLocaleString()}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
                                                <Bell size={24} className="text-gray-300" />
                                                <span className="text-sm font-medium">No activity yet</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('profile')}>
                            <div className="relative w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 shadow-sm overflow-hidden group-hover:opacity-90 transition-opacity">
                                {profileForm.name.charAt(0) || 'W'}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-bold text-gray-900">{profileForm.name || 'Worker'}</p>
                                <p className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest">{profileForm.profession || 'Service Provider'}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-6 sm:p-10">
                    {renderContent()}
                </div>
            </main>

            {/* Map Selection Modal */}
            <MapModal 
                isOpen={showMapModal}
                onClose={() => setShowMapModal(false)}
                onSelect={handleLocationSelect}
                initialLocation={{ lat: profileForm.latitude, lng: profileForm.longitude, address: profileForm.address }}
            />
            {/* Mock Payment Modal for Subscription Renewal */}
            <AnimatePresence>
                {showPaymentModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative"
                        >
                            <div className="h-32 bg-gradient-to-br from-indigo-500 via-blue-600 to-blue-700 w-full absolute top-0 left-0"></div>
                            
                            <div className="px-6 pt-8 pb-8 relative z-10">
                                {paymentSuccess ? (
                                    <motion.div 
                                        initial={{ scale: 0.8, opacity: 0 }} 
                                        animate={{ scale: 1, opacity: 1 }} 
                                        className="py-12 flex flex-col items-center justify-center text-center"
                                    >
                                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-green-500/20 shadow-xl relative">
                                            <motion.svg 
                                                className="w-12 h-12 text-green-500" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24" 
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 0.5, ease: "easeOut" }}
                                            >
                                                <motion.path 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round" 
                                                    strokeWidth="3" 
                                                    d="M5 13l4 4L19 7"
                                                ></motion.path>
                                            </motion.svg>
                                        </div>
                                        <h3 className="text-3xl font-black text-gray-900 mb-2">Payment Successful!</h3>
                                        <p className="text-gray-500 font-medium">Your subscription has been renewed.</p>
                                    </motion.div>
                                ) : (
                                    <>
                                        <div className="text-center mb-6">
                                            <h3 className="text-3xl font-black text-white drop-shadow-md mb-1">Checkout</h3>
                                            <p className="text-blue-100 font-medium text-sm drop-shadow-sm">Secure Payment Gateway</p>
                                        </div>

                                        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 mb-6">
                                            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Amount Due</p>
                                                    <p className="text-3xl font-black text-gray-900 drop-shadow-sm">₹99<span className="text-lg text-gray-400 font-semibold">.00</span></p>
                                                </div>
                                                <div className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide">
                                                    Monthly Renewal
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">Cardholder Name</label>
                                                    <input 
                                                        type="text" 
                                                        name="name" 
                                                        value={cardDetails.name}
                                                        onChange={onCardChange}
                                                        placeholder="Name on card" 
                                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
                                                        disabled={isProcessingPayment}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">Card Number</label>
                                                    <div className="relative">
                                                        <input 
                                                            type="text" 
                                                            name="number" 
                                                            value={cardDetails.number}
                                                            onChange={onCardChange}
                                                            placeholder="0000 0000 0000 0000" 
                                                            maxLength="19"
                                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold tracking-wide text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
                                                            disabled={isProcessingPayment}
                                                        />
                                                        <svg className="w-6 h-6 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">Expiry Date</label>
                                                        <input 
                                                            type="text" 
                                                            name="expiry" 
                                                            value={cardDetails.expiry}
                                                            onChange={onCardChange}
                                                            placeholder="MM/YY" 
                                                            maxLength="5"
                                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner text-center"
                                                            disabled={isProcessingPayment}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">CVV</label>
                                                        <input 
                                                            type="password" 
                                                            name="cvv" 
                                                            value={cardDetails.cvv}
                                                            onChange={onCardChange}
                                                            placeholder="•••" 
                                                            maxLength="3"
                                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold tracking-widest text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner text-center"
                                                            disabled={isProcessingPayment}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button 
                                                type="button"
                                                onClick={() => setShowPaymentModal(false)}
                                                disabled={isProcessingPayment}
                                                className="w-1/3 py-4 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl font-bold transition-all disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={handleMockPayment}
                                                disabled={isProcessingPayment || !isCardValid()}
                                                className={`w-2/3 py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 relative overflow-hidden ${
                                                    isProcessingPayment 
                                                    ? 'bg-blue-800 text-white cursor-wait' 
                                                    : !isCardValid() 
                                                        ? 'bg-blue-300 text-white cursor-not-allowed shadow-none' 
                                                        : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl hover:-translate-y-0.5'
                                                }`}
                                            >
                                                {isProcessingPayment ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin shadow-sm"></div>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        <span>Pay ₹99 Securely</span>
                                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                                    </span>
                                                )}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WorkerDashboard;
