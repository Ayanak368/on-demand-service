import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import logo from '../assets/logo.svg';
import {
    Menu, X, Search, Bell, LogOut, User as UserIcon, Users, ArrowRight, MapPin,
    Home, Grid, Calendar, Calendar as CalendarIcon, Settings, ChevronRight, ArrowLeft,
    Briefcase, CheckCircle, Clock, Zap, Wrench, Droplet, Paintbrush, Loader2, Pencil, Save, Phone, Star, AlertCircle, MessageSquare, Send,
    Shield, Award, Heart, Facebook, Twitter, Instagram, Linkedin, EyeOff, Eye, Navigation, Map as MapIcon, Filter, ChevronDown, Check, ArrowDownAZ, ArrowUpZA, ArrowUp, ArrowDown
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom modern marker icon
const customIcon = new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div class='marker-pin'></div><div class='marker-pulse'></div>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42]
});

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper function to format location for display
const formatLocation = (location) => {
    if (!location) return 'Address not provided';
    if (typeof location === 'string') return location;
    if (location.type === 'Point' && Array.isArray(location.coordinates)) {
        return `${location.coordinates[1]}, ${location.coordinates[0]}`;
    }
    return 'Address not provided';
};

const Customer = ({ user, token }) => {
    const { logout, login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isBooking, setIsBooking] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [bookings, setBookings] = useState([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(true);
    const [bookingFilter, setBookingFilter] = useState('All');
    const [bookingSort, setBookingSort] = useState('newest');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [apiNotifications, setApiNotifications] = useState([]);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(null);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [workerStats, setWorkerStats] = useState(null);
    const [isLoadingWorkerStats, setIsLoadingWorkerStats] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, feedback: '' });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        location: user?.location || '',
        address: user?.address || ''
    });
    const [complaints, setComplaints] = useState([]);
    const [isLoadingComplaints, setIsLoadingComplaints] = useState(false);
    const [complaintForm, setComplaintForm] = useState({ worker: '', subject: '', description: '' });
    const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
    const [complaintError, setComplaintError] = useState('');
    const [complaintSuccess, setComplaintSuccess] = useState(false);
    const [workers, setWorkers] = useState([]);
    const [recommendedWorkers, setRecommendedWorkers] = useState([]);
    const [services, setServices] = useState([]); // Dynamic Services State

    const handleNextOffers = () => {
        if (currentOfferIndex + 3 < offers.length) {
            setCurrentOfferIndex(prev => prev + 1);
        }
    };

    const handlePrevOffers = () => {
        if (currentOfferIndex > 0) {
            setCurrentOfferIndex(prev => prev - 1);
        }
    };

    // Offers State
    const [offers, setOffers] = useState([]);
    const [currentOfferIndex, setCurrentOfferIndex] = useState(0);

    // New Booking Flow States
    const [userRating, setUserRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState('');
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [bookingFlowState, setBookingFlowState] = useState('none'); // 'none', 'options', 'manual-workers', 'form'
    const [selectedServiceForBooking, setSelectedServiceForBooking] = useState(null);
    const [selectedWorkerForBooking, setSelectedWorkerForBooking] = useState(null);
    const [availableWorkersForService, setAvailableWorkersForService] = useState([]);
    const [isLoadingWorkers, setIsLoadingWorkers] = useState(false);
    const [bookingForm, setBookingForm] = useState({
        location: user?.address || '',
        date: '',
        time: '',
        description: '',
        latitude: user?.latitude || null,
        longitude: user?.longitude || null
    });
    const [showMapModal, setShowMapModal] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    const [platformFeedbackForm, setPlatformFeedbackForm] = useState({ rating: 5, feedback: '' });
    const [isSubmittingPlatformFeedback, setIsSubmittingPlatformFeedback] = useState(false);
    const [platformFeedbacks, setPlatformFeedbacks] = useState([]);
    const [visibleReplies, setVisibleReplies] = useState({});

    // Payment Mock States
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
    const [paymentType, setPaymentType] = useState('inspection'); // 'inspection' or 'final'
    const [paymentAmount, setPaymentAmount] = useState(100);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentBookingId, setPaymentBookingId] = useState(null);
    const [cardDetails, setCardDetails] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: ''
    });

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

    const toggleReplyVisibility = (id) => {
        setVisibleReplies(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Update profile form when user changes
    useEffect(() => {
        if (user) {
            setProfileForm({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                location: user.location || '',
                address: user.address || ''
            });
            setPhotoPreview(user.photo ? `http://localhost:5001/${user.photo.replace(/\\/g, '/')}` : null);
        }
    }, [user]);

    // Fetch workers for complaint form
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

    // Fetch recommended workers on load
    useEffect(() => {
        const fetchRecommendedWorkers = async () => {
            try {
                const res = await fetch('http://localhost:5001/api/users/workers/active', {
                    headers: { 'x-auth-token': token }
                });
                if (res.ok) {
                    const data = await res.json();
                    setRecommendedWorkers(data.slice(0, 4)); // Only top 4 
                }
            } catch (err) {
                console.error('Error fetching recommended workers:', err);
            }
        };

        if (token) {
            fetchRecommendedWorkers();
        }
    }, [token]);

    // Fetch Dynamic Services
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch('http://localhost:5001/api/services');
                if (res.ok) {
                    const data = await res.json();
                    setServices(data);
                }
            } catch (err) {
                console.error('Error fetching services:', err);
            }
        };

        fetchServices();
    }, []);

    // Fetch Active Offers
    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const res = await fetch('http://localhost:5001/api/offers?active=true', {
                    headers: { 'x-auth-token': token }
                });
                if (res.ok) {
                    const data = await res.json();
                    setOffers(data);
                }
            } catch (err) {
                console.error('Error fetching offers:', err);
            }
        };

        if (token) {
            fetchOffers();
        }
    }, [token]);

    // Fetch Platform Feedbacks
    useEffect(() => {
        const fetchPlatformFeedbacks = async () => {
            if (!token) return;
            try {
                const res = await fetch('http://localhost:5001/api/platform-feedback', {
                    headers: { 'x-auth-token': token }
                });
                if (res.ok) {
                    const data = await res.json();
                    setPlatformFeedbacks(data);
                }
            } catch (err) {
                console.error("Failed to fetch platform feedbacks:", err);
            }
        };

        fetchPlatformFeedbacks();
    }, [token]);

    // Fetch API Notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!token) return;
            try {
                const res = await fetch('http://localhost:5001/api/notifications', {
                    headers: { 'x-auth-token': token }
                });
                if (res.ok) {
                    const data = await res.json();
                    setApiNotifications(data);
                }
            } catch (err) {
                console.error("Failed to fetch notifications:", err);
            }
        };

        fetchNotifications();
    }, [token]);

    const handleMarkNotificationRead = async (id) => {
        try {
            await fetch(`http://localhost:5001/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
            setApiNotifications(apiNotifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Failed to mark read', err);
        }
    };

    const handlePlatformFeedbackSubmit = async () => {
        if (!platformFeedbackForm.feedback.trim()) {
            setToastMessage('Please enter some feedback');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return;
        }

        setIsSubmittingPlatformFeedback(true);
        try {
            const res = await fetch('http://localhost:5001/api/platform-feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(platformFeedbackForm)
            });

            if (res.ok) {
                const newFeedback = await res.json();
                setPlatformFeedbacks([{ ...newFeedback, customer: user }, ...platformFeedbacks]);
                setPlatformFeedbackForm({ rating: 5, feedback: '' });
                setToastMessage('Feedback submitted successfully!');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            } else {
                alert('Failed to submit feedback');
            }
        } catch (err) {
            console.error("Platform feedback error:", err);
            alert('Error submitting feedback.');
        } finally {
            setIsSubmittingPlatformFeedback(false);
        }
    };


    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsActionLoading('profile');
        try {
            const formData = new FormData();
            formData.append('name', profileForm.name);
            formData.append('phone', profileForm.phone);
            if (profileForm.location) formData.append('location', profileForm.location);
            formData.append('address', profileForm.address);
            if (profilePhoto) formData.append('photo', profilePhoto);

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
                setToastMessage('Profile updated successfully!');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
                setIsEditingProfile(false);
                setProfilePhoto(null);
            } else {
                alert('Failed to update profile');
            }
        } catch (err) {
            console.error("Profile update error:", err);
            alert('Error updating profile.');
        } finally {
            setIsActionLoading(null);
        }
    };

    const handlePhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfilePhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    // Fetch Bookings from API
    useEffect(() => {
        const fetchBookings = async () => {
            if (!token) return;
            try {
                const res = await fetch('http://localhost:5001/api/service-requests', {
                    headers: { 'x-auth-token': token }
                });
                if (res.ok) {
                    const data = await res.json();
                    setBookings(data);
                }
            } catch (err) {
                console.error("Failed to fetch bookings:", err);
            } finally {
                setIsLoadingBookings(false);
            }
        };

        fetchBookings();
    }, [token]);

    // Fetch Worker Stats when a booking is selected
    useEffect(() => {
        const fetchWorkerStats = async () => {
            if (!selectedBooking || !selectedBooking.worker) {
                setWorkerStats(null);
                return;
            }

            const workerId = selectedBooking.worker._id || selectedBooking.worker;

            // Only fetch if it's a new worker
            if (workerStats && workerStats.workerId === workerId) {
                return;
            }

            setIsLoadingWorkerStats(true);
            try {
                const res = await fetch(`http://localhost:5001/api/users/worker/${workerId}/stats`, {
                    headers: {
                        'x-auth-token': token
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setWorkerStats({ ...data, workerId });
                } else {
                    console.error('Failed to fetch worker stats');
                    setWorkerStats(null);
                }
            } catch (err) {
                console.error("Error fetching worker stats:", err);
                setWorkerStats(null);
            } finally {
                setIsLoadingWorkerStats(false);
            }
        };

        fetchWorkerStats();
    }, [selectedBooking, token]);

    // Fetch Complaints
    useEffect(() => {
        const fetchComplaints = async () => {
            if (!token) return;
            setIsLoadingComplaints(true);
            try {
                const res = await fetch('http://localhost:5001/api/complaints', {
                    headers: { 'x-auth-token': token }
                });
                if (res.ok) {
                    const data = await res.json();
                    setComplaints(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error("Failed to fetch complaints:", err);
                setComplaints([]);
            } finally {
                setIsLoadingComplaints(false);
            }
        };

        if (activeTab === 'complaints') {
            fetchComplaints();
        }
    }, [token, activeTab]);

    const handleSubmitComplaint = async (e) => {
        e.preventDefault();
        if (!complaintForm.subject || !complaintForm.description) {
            setComplaintError('Please fill in all required fields');
            return;
        }

        setIsSubmittingComplaint(true);
        setComplaintError('');
        try {
            const res = await fetch('http://localhost:5001/api/complaints', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(complaintForm)
            });

            if (res.ok) {
                setComplaintSuccess(true);
                setComplaintForm({ worker: '', subject: '', description: '' });
                // Refresh complaints list
                const listRes = await fetch('http://localhost:5001/api/complaints', {
                    headers: { 'x-auth-token': token }
                });
                if (listRes.ok) {
                    const data = await listRes.json();
                    setComplaints(Array.isArray(data) ? data : []);
                }
                setTimeout(() => setComplaintSuccess(false), 3000);
            } else {
                const data = await res.json();
                setComplaintError(data.msg || 'Failed to submit complaint');
            }
        } catch (err) {
            console.error(err);
            setComplaintError('Error submitting complaint');
        } finally {
            setIsSubmittingComplaint(false);
        }
    };

    const handleComplaintChange = (e) => {
        const { name, value } = e.target;
        setComplaintForm({ ...complaintForm, [name]: value });
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        setIsActionLoading(bookingId);
        try {
            const res = await fetch(`http://localhost:5001/api/service-requests/${bookingId}/cancel`, {
                method: 'PUT',
                headers: {
                    'x-auth-token': token
                }
            });

            if (res.ok) {
                setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
                setToastMessage('Booking cancelled successfully.');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            } else {
                alert('Failed to cancel booking');
            }
        } catch (err) {
            console.error("Cancel booking error:", err);
            alert('Error cancelling booking.');
        } finally {
            setIsActionLoading(null);
        }
    };

    const handleConfirmPrice = async (bookingId) => {
        if (!window.confirm("Are you sure you want to confirm this updated price?")) return;
        setIsActionLoading(bookingId);
        try {
            const res = await fetch(`http://localhost:5001/api/service-requests/customer/approve-price/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'x-auth-token': token
                }
            });

            if (res.ok) {
                const updatedBooking = await res.json();
                setBookings(bookings.map(b => b._id === bookingId ? { ...b, ...updatedBooking } : b));
                setToastMessage('Price confirmed successfully!');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            } else {
                const data = await res.json();
                alert(data.msg || 'Failed to confirm price');
            }
        } catch (err) {
            console.error("Confirm price error:", err);
            alert('Error confirming price.');
        } finally {
            setIsActionLoading(null);
        }
    };

    const handlePayInspection = (bookingId) => {
        setPaymentBookingId(bookingId);
        setPaymentType('inspection');
        setPaymentAmount(100);
        setPaymentSuccess(false);
        setIsProcessingPayment(false);
        setCardDetails({ number: '', name: '', expiry: '', cvv: '' });
        setShowPaymentModal(true);
    };

    const handlePayFinalOnline = (bookingId, amount) => {
        setPaymentBookingId(bookingId);
        setPaymentType('final');
        setPaymentAmount(amount);
        setPaymentSuccess(false);
        setIsProcessingPayment(false);
        setCardDetails({ number: '', name: '', expiry: '', cvv: '' });
        setShowPaymentMethodModal(false);
        setShowPaymentModal(true);
    };

    const handlePayFinalOffline = async (bookingId) => {
        setIsActionLoading(`offline-${bookingId}`);
        try {
            const res = await fetch(`http://localhost:5001/api/service-requests/customer/pay/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ paymentMethod: 'offline', isPaid: false })
            });

            if (res.ok) {
                const updatedBooking = await res.json();
                setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, ...updatedBooking } : b));
                setToastMessage('Offline payment selected!');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
                setShowPaymentMethodModal(false);
            } else {
                alert('Failed to update payment method');
            }
        } catch (err) {
            console.error('Error setting offline payment:', err);
            alert('Error processing request');
        } finally {
            setIsActionLoading(null);
        }
    };

    const executeMockPayment = async () => {
        if (!isCardValid() || !paymentBookingId) return;
        setIsProcessingPayment(true);
        
        // Simulate network delay for payment gateway
        setTimeout(async () => {
            setPaymentSuccess(true);
            
            // Execute the actual status update
            try {
                let res;
                if (paymentType === 'inspection') {
                    res = await fetch(`http://localhost:5001/api/service-requests/${paymentBookingId}/confirm`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': token
                        }
                    });
                } else {
                    res = await fetch(`http://localhost:5001/api/service-requests/customer/pay/${paymentBookingId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': token
                        },
                        body: JSON.stringify({ paymentMethod: 'online', isPaid: true })
                    });
                }

                if (res.ok) {
                    const updatedBooking = await res.json();
                    
                    // Add slight delay so user sees success state
                    setTimeout(() => {
                        setBookings(prev => prev.map(b => b._id === paymentBookingId ? { ...b, ...updatedBooking } : b));
                        setToastMessage(paymentType === 'inspection' ? 'Inspection charge paid successfully!' : 'Final payment successful!');
                        setShowToast(true);
                        setTimeout(() => setShowToast(false), 3000);
                        setShowPaymentModal(false);
                        setIsProcessingPayment(false);
                    }, 1500);
                } else {
                    alert('Failed to process payment with server');
                    setIsProcessingPayment(false);
                    setShowPaymentModal(false);
                }
            } catch (err) {
                console.error('Error processing payment:', err);
                alert('Error processing payment');
                setIsProcessingPayment(false);
                setShowPaymentModal(false);
            }
        }, 2000);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setIsSubmittingReview(true);
        try {
            const res = await fetch('http://localhost:5001/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    workerId: selectedBooking.worker._id || selectedBooking.worker,
                    serviceRequestId: selectedBooking._id,
                    rating: reviewForm.rating,
                    feedback: reviewForm.feedback
                })
            });

            const data = await res.json();
            if (res.ok) {
                setToastMessage('Review submitted successfully!');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
                setIsReviewModalOpen(false);
                setReviewForm({ rating: 5, feedback: '' });

                // Refresh worker stats if viewing worker details
                if (workerStats && workerStats.workerId === (selectedBooking.worker._id || selectedBooking.worker)) {
                    // Quick mock update to ui
                    setWorkerStats(prev => ({
                        ...prev,
                        totalReviews: prev.totalReviews + 1,
                        reviews: [{ rating: reviewForm.rating, feedback: reviewForm.feedback, customer: { name: user.name } }, ...prev.reviews]
                    }));
                }
            } else {
                alert(data.msg || 'Failed to submit review');
            }
        } catch (err) {
            console.error("Review submission error:", err);
            alert('Error submitting review.');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const renderStars = (rating = 4) => {
        return (
            <div className="flex text-yellow-400 text-lg tracking-widest drop-shadow-sm">
                {"★".repeat(rating)}{"☆".repeat(5 - rating)}
            </div>
        );
    };

    // Dynamic Stats
    const activeJobsCount = bookings.filter(b => b.status === 'accepted' || b.status === 'pending').length;
    const completedJobsCount = bookings.filter(b => b.status === 'completed').length;

    // Derived Notifications
    const bookingNotifications = bookings
        .filter(b => b.status === 'accepted' && b.worker)
        .map(b => ({
            id: b._id,
            booking: b,
            message: `Your ${b.serviceType} booking was accepted by ${b.worker.name}.`,
            time: b.updatedAt || b.createdAt || Date.now(),
            isApi: false
        }));

    const mappedApiNotifications = apiNotifications.map(n => ({
        id: n._id,
        message: n.message,
        time: n.createdAt,
        isRead: n.isRead,
        isApi: true
    }));

    const notifications = [...bookingNotifications, ...mappedApiNotifications].sort((a, b) => new Date(b.time) - new Date(a.time));

    // Dummy Data
    const stats = [
        { title: 'Total Bookings', value: bookings.length.toString(), icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-100' },
        { title: 'Active Jobs', value: activeJobsCount.toString(), icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100' },
        { title: 'Completed Jobs', value: completedJobsCount.toString(), icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
    ];

    const filteredServices = services.filter(s =>
        (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const iconMap = {
        Zap, Droplet, Wrench, Paintbrush, Loader2, CheckCircle, Shield, Briefcase
    };

    const updateLocationFromCoords = async (lat, lng) => {
        setBookingForm(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng
        }));

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            const data = await response.json();
            if (data && data.display_name) {
                setBookingForm(prev => ({
                    ...prev,
                    location: data.display_name
                }));
            }
        } catch (error) {
            console.error('Error reverse geocoding:', error);
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
                      
                      setBookingForm(prev => ({
                          ...prev,
                          latitude,
                          longitude,
                          location: addressString
                      }));
                      alert('Location updated via IP fallback successfully!');
                 } else {
                     alert('Unable to retrieve your location automatically.');
                 }
             } catch(err) {
                 alert('Unable to retrieve your location automatically.');
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
                updateLocationFromCoords(latitude, longitude);
                setIsLocating(false);
            },
            async (error) => {
                await fallbackToIpGeolocation();
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
        );
    };

    const LocationPicker = () => {
        const map = useMapEvents({
            click(e) {
                updateLocationFromCoords(e.latlng.lat, e.latlng.lng);
            },
        });

        useEffect(() => {
            if (bookingForm.latitude && bookingForm.longitude) {
                map.flyTo([bookingForm.latitude, bookingForm.longitude], map.getZoom());
            }
        }, [bookingForm.latitude, bookingForm.longitude, map]);

        return bookingForm.latitude && bookingForm.longitude ? (
            <Marker position={[bookingForm.latitude, bookingForm.longitude]} icon={customIcon} />
        ) : null;
    };

    const fetchWorkersForService = async (serviceName) => {
        setIsLoadingWorkers(true);
        setBookingFlowState('manual-workers');
        try {
            const res = await fetch(`http://localhost:5001/api/users/workers/active`, {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                
                const getTargetProfession = (name) => {
                    if (name.includes('Cleaning')) return 'Cleaner';
                    if (name.includes('AC')) return 'AC Technician';
                    return name;
                };
                const targetProf = getTargetProfession(serviceName);

                const filtered = data.filter(w => 
                    (w.profession || '').toLowerCase() === serviceName.toLowerCase() ||
                    (w.profession || '').toLowerCase() === targetProf.toLowerCase()
                );
                
                setAvailableWorkersForService(filtered);
            }
        } catch (err) {
            console.error('Error fetching workers for service:', err);
        } finally {
            setIsLoadingWorkers(false);
        }
    };

    const handleBookNow = (service) => {
        setSelectedServiceForBooking(service);
        setBookingFlowState('options');
        setBookingForm(prev => ({ ...prev, location: user?.address || '', date: '', time: '', description: '' }));
    };

    const handleOfferClick = (offer) => {
        // Prevent reusing the same offer
        const hasUsedOffer = bookings.some(b => b.appliedOffer === offer.title);
        if (hasUsedOffer) {
            alert(`You have already used the offer: "${offer.title}". This offer is limited to one use per customer.`);
            return;
        }

        console.log("Offer clicked:", offer.title, "Category:", offer.serviceCategory);
        setSelectedOffer(offer.title);
        setActiveTab('services');
        
        const matchingService = services.find(s => 
            s.name.toLowerCase() === (offer.serviceCategory || '').toLowerCase() || 
            s.name.toLowerCase().includes((offer.serviceCategory || '').toLowerCase()) ||
            (offer.serviceCategory || '').toLowerCase().includes(s.name.toLowerCase())
        );
        console.log("Matching service found:", matchingService?.name);
        
        if (matchingService) {
            setTimeout(() => {
                setSelectedServiceForBooking(matchingService);
                setSelectedWorkerForBooking(null); // Force automatic assignment for offers
                setBookingFlowState('form');
                setBookingForm(prev => ({ ...prev, location: user?.address || '', date: '', time: '', description: '' }));
            }, 100);
        } else {
            console.warn("No matching service found for category:", offer.serviceCategory);
            // If no exact match, just go to services tab so they can pick manually
        }
    };

    const handleFinalBookingSubmit = async (e) => {
        e.preventDefault();
        setIsBooking(true);
        try {
            const payload = {
                serviceType: selectedServiceForBooking.name,
                details: bookingForm.description || selectedServiceForBooking.description,
                location: bookingForm.location,
                date: bookingForm.date,
                time: bookingForm.time,
                price: parseInt((selectedServiceForBooking.price || '').replace(/\D/g, ''), 10) || 500,
                appliedOffer: selectedOffer
            };

            // If manual worker selected
            if (selectedWorkerForBooking) {
                payload.worker = selectedWorkerForBooking._id;
            }

            const res = await fetch('http://localhost:5001/api/service-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                let newBooking = await res.json();

                // ensure worker details are available immediately when manual choice
                if (selectedWorkerForBooking) {
                    newBooking.worker = selectedWorkerForBooking;
                }

                setBookings([newBooking, ...bookings]); // Prepend new booking
                setActiveTab('bookings'); // Redirect to bookings tab
                setToastMessage('Service booked successfully!');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);

                // Reset flow
                setBookingFlowState('none');
                setSelectedServiceForBooking(null);
                setSelectedWorkerForBooking(null);
                setSelectedOffer(null);
                setBookingForm({ location: user?.address || '', date: '', time: '', description: '' });
            } else {
                const errData = await res.json();
                console.error("Failed to book service", errData);
                alert(errData.msg || "Failed to book service. Please check your connection.");
            }
        } catch (err) {
            console.error("Error booking service:", err);
            alert("Error booking service.");
        } finally {
            setIsBooking(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'accepted': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    // Content rendering based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <>
                        <div className="space-y-8 animate-fade-in">
                            {/* 1. Welcome Section */}
                            <div className="relative bg-gradient-to-br from-blue-50 to-white rounded-3xl p-8 sm:p-12 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-blue-100 overflow-hidden">
                                <div className="absolute top-0 right-0 -translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 pointer-events-none"></div>

                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="flex-1 max-w-2xl">
                                        <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 text-gray-900 tracking-tight">
                                            Welcome back, <span className="text-blue-600">{user?.name || 'Guest'}</span>! 👋
                                        </h2>
                                        <p className="text-gray-600 text-[1.1rem] leading-relaxed mb-8">
                                            Find trusted, highly-rated workers for your home services instantly. Quality and reliability right at your doorstep.
                                        </p>
                                        <button
                                            onClick={() => setActiveTab('services')}
                                            className="bg-[#2a64f6] text-white font-bold text-lg py-4 px-10 rounded-2xl shadow-[0_8px_24px_-6px_rgba(42,100,246,0.5)] hover:bg-blue-700 hover:-translate-y-1 transition-all focus:outline-none flex items-center gap-2 group"
                                        >
                                            Book a Service
                                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                    <div className="hidden lg:flex flex-1 justify-end">
                                        <img
                                            src="/hero-workers.png"
                                            alt="Professional Workers"
                                            className="w-full max-w-md h-auto drop-shadow-2xl object-contain hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 4. Services Provided */}
                            <div className="pt-4 pb-8 mb-4 border-b border-gray-100">
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">Professional services we provide</p>
                                <div className="flex flex-wrap items-center justify-center gap-3 px-2">
                                    {[
                                        { name: 'Electrician', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                                        { name: 'Plumber', icon: Droplet, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                                        { name: 'Carpenter', icon: Wrench, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
                                        { name: 'Painter', icon: Paintbrush, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
                                        { name: 'AC Repair', icon: Loader2, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100' },
                                        { name: 'Cleaning', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                                        { name: 'CCTV Info', icon: Shield, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100' },
                                        { name: 'Pest Control', icon: Zap, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
                                    ].map((cat, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full border ${cat.border} ${cat.bg} shadow-sm`}
                                        >
                                            <cat.icon size={16} className={cat.color} />
                                            <span className="text-sm font-bold text-gray-700">{cat.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>



                            {/* Explore Services Preview */}
                            <div id="popular-services" className="max-w-7xl mx-auto rounded-3xl pb-8">
                                <div className="flex justify-between items-center mb-10">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">{searchQuery ? 'Search Results' : 'Popular Services'}</h3>
                                        <p className="text-gray-500 mt-1">{searchQuery ? 'Services matching your search' : 'Most requested services by our customers'}</p>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('services')}
                                        className="text-blue-600 font-medium hover:text-blue-800 focus:outline-none flex items-center"
                                    >
                                        View All <ChevronRight size={18} className="ml-1" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[320px] content-start">
                                    {(searchQuery ? filteredServices : services.slice(0, 4)).map(service => {
                                        // Derive color classes based on the service's base color utility
                                        const colorClass = service.color || 'text-blue-500';
                                        const baseColor = colorClass.replace('text-', ''); // e.g., 'yellow-500'
                                        const bgColor = `bg-${baseColor.split('-')[0]}-50`; // e.g., 'bg-yellow-50'
                                        const IconComponent = iconMap[service.iconName] || Wrench;

                                        return (
                                            <div key={service._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex flex-col justify-between" onClick={() => setActiveTab('services')}>
                                                <div>
                                                    <div className={`w-12 h-12 ${bgColor} ${colorClass} rounded-xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                                        <IconComponent size={22} />
                                                    </div>
                                                    <h4 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h4>
                                                    <p className="text-gray-600 text-sm mb-5 line-clamp-2">{service.description}</p>
                                                </div>
                                                <button className="text-blue-600 font-medium hover:text-blue-800 text-sm focus:outline-none text-left flex items-center mt-auto">
                                                    Book <span aria-hidden="true" className="ml-1">&rarr;</span>
                                                </button>
                                            </div>
                                        );
                                    })}
                                    {filteredServices.length === 0 && (
                                        <div className="col-span-full text-center py-10 bg-white rounded-2xl text-gray-500 font-medium border border-gray-100">
                                            No services found matching "{searchQuery}".
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 5. Offers / Tips Section */}
                            {offers.length > 0 && (
                                <div className="pt-4 pb-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-2xl font-bold text-gray-900">Special Offers & Tips</h3>
                                        {offers.length > 3 && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handlePrevOffers}
                                                    disabled={currentOfferIndex === 0}
                                                    className="p-2 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <ArrowLeft size={20} />
                                                </button>
                                                <button
                                                    onClick={handleNextOffers}
                                                    disabled={currentOfferIndex + 3 >= offers.length}
                                                    className="p-2 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <ArrowRight size={20} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {offers.slice(currentOfferIndex, currentOfferIndex + 3).map((offer) => {
                                            let bgClass, shadowClass, iconColorClass, btnTextClass, hoverBtnClass;
                                            switch (offer.colorTheme) {
                                                case 'purple':
                                                    bgClass = 'bg-[#4f46e5]'; shadowClass = 'shadow-indigo-200/50'; iconColorClass = 'text-indigo-700'; btnTextClass = 'text-indigo-700'; hoverBtnClass = 'hover:bg-indigo-50'; break;
                                                case 'green':
                                                    bgClass = 'bg-[#059669]'; shadowClass = 'shadow-emerald-200/50'; iconColorClass = 'text-emerald-700'; btnTextClass = 'text-emerald-700'; hoverBtnClass = 'hover:bg-emerald-50'; break;
                                                case 'orange':
                                                    bgClass = 'bg-[#ea580c]'; shadowClass = 'shadow-orange-200/50'; iconColorClass = 'text-orange-700'; btnTextClass = 'text-orange-700'; hoverBtnClass = 'hover:bg-orange-50'; break;
                                                case 'blue':
                                                    bgClass = 'bg-[#2563eb]'; shadowClass = 'shadow-blue-200/50'; iconColorClass = 'text-blue-700'; btnTextClass = 'text-blue-700'; hoverBtnClass = 'hover:bg-blue-50'; break;
                                                case 'red':
                                                    bgClass = 'bg-[#dc2626]'; shadowClass = 'shadow-red-200/50'; iconColorClass = 'text-red-700'; btnTextClass = 'text-red-700'; hoverBtnClass = 'hover:bg-red-50'; break;
                                                default:
                                                    bgClass = 'bg-[#4f46e5]'; shadowClass = 'shadow-indigo-200/50'; iconColorClass = 'text-indigo-700'; btnTextClass = 'text-indigo-700'; hoverBtnClass = 'hover:bg-indigo-50';
                                            }

                                            let IconComponent;
                                            switch (offer.iconType) {
                                                case 'Zap': IconComponent = Zap; break;
                                                case 'Droplet': IconComponent = Droplet; break;
                                                case 'Wrench': IconComponent = Wrench; break;
                                                case 'CheckCircle': IconComponent = CheckCircle; break;
                                                case 'Shield': IconComponent = Shield; break;
                                                default: IconComponent = Zap;
                                            }

                                            return (
                                                <div key={offer._id} className={`${bgClass} p-8 rounded-3xl shadow-lg ${shadowClass} text-white hover:-translate-y-1 transition-transform cursor-pointer relative overflow-hidden group`} onClick={() => handleOfferClick(offer)}>
                                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><IconComponent size={100} /></div>
                                                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">{offer.type === 'Tip' ? 'Pro Tip' : (offer.type === 'Discount' ? 'Limited Offer' : offer.type)}</span>
                                                    <h4 className="text-2xl font-bold mb-2">{offer.title}</h4>
                                                    <p className="text-white/90 mb-6 text-sm">{offer.description}</p>
                                                    <button className={`bg-white ${btnTextClass} px-5 py-2.5 rounded-xl font-bold text-sm w-max ${hoverBtnClass} transition-colors`}>{offer.buttonText}</button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* 6. Customer Feedback Section */}
                            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-12">
                                <div className="flex-1">
                                    <h3 className="text-3xl font-bold mb-3 text-gray-900">How are we doing?</h3>
                                    <p className="text-gray-500 mb-8">We value your feedback to improve our On-Demand platform.</p>

                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                        <div className="flex gap-2 mb-4">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => setPlatformFeedbackForm({ ...platformFeedbackForm, rating: star })}
                                                    className={`${star <= platformFeedbackForm.rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 focus:outline-none transition-colors`}>
                                                    <Star size={32} className="fill-current" />
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            value={platformFeedbackForm.feedback}
                                            onChange={(e) => setPlatformFeedbackForm({ ...platformFeedbackForm, feedback: e.target.value })}
                                            className="w-full bg-white border border-gray-200 rounded-xl p-4 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none mb-4"
                                            rows="3"
                                            placeholder="Tell us about your experience..."
                                        ></textarea>
                                        <button
                                            onClick={handlePlatformFeedbackSubmit}
                                            disabled={isSubmittingPlatformFeedback}
                                            className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                                            {isSubmittingPlatformFeedback ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> Submit Feedback</>}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-100 pt-8 md:pt-0 md:pl-12">
                                    <h4 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2"><MessageSquare size={20} className="text-blue-500" /> Recent Feedback</h4>
                                    <div className="space-y-6">
                                        {platformFeedbacks.length > 0 ? platformFeedbacks.slice(0, 3).map((fb, idx) => (
                                            <div key={fb._id || idx} className="border-b border-gray-50 pb-6">
                                                <div className="flex items-center gap-1 text-yellow-400 mb-2">
                                                    {[1, 2, 3, 4, 5].map(i => (<Star key={i} size={14} className={i <= fb.rating ? "fill-current" : "text-gray-300 fill-current"} />))}
                                                </div>
                                                <p className="text-gray-600 italic text-sm mb-3">"{fb.feedback}"</p>
                                                {fb.reply && (fb.customer?._id === user._id || fb.customer === user._id) && (
                                                    <div className="mt-1">
                                                        {visibleReplies[fb._id] ? (
                                                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-3 relative before:absolute before:-top-2 before:left-4 before:border-8 before:border-transparent before:border-b-blue-100 animate-fade-in">
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <p className="text-blue-800 text-xs font-bold">Admin Response:</p>
                                                                    <button
                                                                        onClick={() => toggleReplyVisibility(fb._id)}
                                                                        className="flex items-center gap-1 text-gray-400 hover:text-gray-600 focus:outline-none bg-blue-100/50 hover:bg-blue-200/50 px-2 py-1 rounded-md transition-colors"
                                                                        title="Hide reply"
                                                                    >
                                                                        <EyeOff size={14} />
                                                                        <span className="text-[10px] font-medium">Hide</span>
                                                                    </button>
                                                                </div>
                                                                <p className="text-blue-700 text-sm">{fb.reply}</p>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => toggleReplyVisibility(fb._id)}
                                                                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-xs font-bold focus:outline-none mb-3 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors border border-blue-100 shadow-sm"
                                                                title="Show admin reply"
                                                            >
                                                                <Eye size={14} /> Show Admin Reply
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="text-xs font-bold text-gray-400">- {fb.customer?.name || 'Anonymous'}</div>
                                            </div>
                                        )) : (
                                            <p className="text-gray-500 italic text-sm">No recent feedback yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 7. Footer Section */}
                        <div className="mt-12 pt-12 border-t border-gray-200" >
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                                <div className="col-span-1 md:col-span-2">
                                    <div className="flex items-center gap-2 text-gray-900 mb-4">
                                        <div className="bg-blue-600 p-1.5 rounded-lg"><Zap className="text-white" size={24} /></div>
                                        <span className="text-2xl font-black tracking-tight">On-Demand</span>
                                    </div>
                                    <p className="text-gray-500 max-w-sm mb-6">Connecting you with trusted local professionals for all your home and business service needs.</p>
                                    <div className="flex gap-4">
                                        <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-colors"><Facebook size={18} /></a>
                                        <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-400 hover:text-white transition-colors"><Twitter size={18} /></a>
                                        <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-rose-600 hover:text-white transition-colors"><Instagram size={18} /></a>
                                        <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-800 hover:text-white transition-colors"><Linkedin size={18} /></a>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-4 uppercase text-sm tracking-wider">Company</h4>
                                    <ul className="space-y-3 text-gray-500 font-medium">
                                        <li><a href="#" className="hover:text-blue-600 transition-colors">About Us</a></li>
                                        <li><a href="#" className="hover:text-blue-600 transition-colors">Careers</a></li>
                                        <li><a href="#" className="hover:text-blue-600 transition-colors">Press</a></li>
                                        <li><a href="#" className="hover:text-blue-600 transition-colors">Blog</a></li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-4 uppercase text-sm tracking-wider">Support</h4>
                                    <ul className="space-y-3 text-gray-500 font-medium">
                                        <li><a href="#" className="hover:text-blue-600 transition-colors">Help Center</a></li>
                                        <li><a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
                                        <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
                                        <li><a href="#" className="hover:text-blue-600 transition-colors">Contact Us</a></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="border-t border-gray-100 pt-6 pb-6 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
                                <p className="text-sm text-gray-400 font-medium">
                                    &copy; {new Date().getFullYear()} On-Demand Services. All rights reserved.
                                </p>
                                <p className="text-sm text-gray-400 font-medium flex items-center gap-1">
                                    Made with <Heart size={14} className="text-red-500 fill-red-500 mx-1" /> by Our Team
                                </p>
                            </div>
                        </div >
                    </>
                );

            case 'services':
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">Our Services</h2>
                                <div className="mt-2 flex flex-col items-start gap-3">
                                    <p className="text-gray-500">Book a trusted professional for your home</p>
                                    <p className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 inline-block">
                                        * Prices shown are minimum inspection charges. Final price will be updated by the professional after site inspection.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredServices.map(service => {
                                const IconComponent = iconMap[service.iconName] || Wrench;
                                const colorClass = service.color || 'text-blue-500';
                                return (
                                    <div key={service._id || service.id} className="bg-white relative overflow-hidden rounded-2xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                        <div className="absolute top-0 right-0 p-6">
                                            <span className="bg-blue-50 text-blue-700 text-sm font-bold px-4 py-2 rounded-full shadow-sm">
                                                ₹{service.price.startsWith('₹') ? service.price.replace('₹', '') : service.price}
                                            </span>
                                        </div>
                                        <div className={`p-5 rounded-2xl bg-gray-50 inline-block mb-6 ${colorClass}`}>
                                            <IconComponent size={36} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.name}</h3>
                                        <p className="text-gray-500 text-base mb-8 h-12 leading-relaxed">{service.description}</p>
                                        <button
                                            onClick={() => handleBookNow(service)}
                                            disabled={isBooking}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md transition-all active:scale-95 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {isBooking ? <><Loader2 size={20} className="animate-spin" /> Booking...</> : 'Book Now'}
                                        </button>
                                    </div>
                                )
                            })}
                            {filteredServices.length === 0 && (
                                <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 text-gray-500">
                                    No services found matching "{searchQuery}".
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'bookings':
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">My Bookings</h2>
                                <p className="text-gray-500 mt-2">Manage your ongoing and past services</p>
                            </div>
                        </div>

                        {/* Status Filters and Sort */}
                        <div className="flex justify-end items-center gap-4 mb-4 relative z-50">
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
                                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in">
                                    
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

                        {isLoadingBookings ? (
                            <div className="flex flex-col items-center justify-center p-16">
                                <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
                                <p className="text-gray-500 font-medium">Loading your bookings...</p>
                            </div>
                        ) : bookings.filter(req => {
                            if (bookingFilter === 'All') return true;
                            const reqStatus = (req.status || 'pending').toLowerCase();
                            if (bookingFilter === 'Requested') return reqStatus === 'pending';
                            if (bookingFilter === 'Active') return ['accepted', 'on the way', 'in progress', 'confirmed'].includes(reqStatus);
                            return reqStatus === bookingFilter.toLowerCase();
                        }).length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-3xl mx-auto">
                                <div className="w-20 h-20 bg-blue-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                                    <Calendar className="h-10 w-10 text-blue-500" />
                                </div>
                                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">No bookings found</h3>
                                <p className="text-gray-500 text-lg max-w-md mx-auto">You don't have any bookings matching this filter. Try changing filters or booking a new service.</p>
                                <button onClick={() => setActiveTab('services')} className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold transition-colors shadow-sm">Explore Services</button>
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
                                    .map((booking) => {
                                        const serviceInfo = services.find(s => s.name === booking.serviceType) || { name: booking.serviceType, iconName: 'Briefcase', color: 'text-gray-500' };
                                        const IconComponent = iconMap[serviceInfo.iconName] || Briefcase;
                                        const colorClass = serviceInfo.color || 'text-gray-500';

                                        const currentStatus = (booking.status || 'pending').toLowerCase();

                                        return (
                                            <div key={booking._id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col h-full">
                                                {/* simplified card, no status bar */}

                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">
                                                            <IconComponent size={24} className={colorClass} />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-semibold text-gray-900 text-lg">{booking.serviceType}</h4>
                                                                {booking.appliedOffer && (
                                                                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                                                                        <Zap size={10} className="text-indigo-500" />
                                                                        {booking.appliedOffer} Applied
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-400">ID: {booking._id.substring(booking._id.length - 6).toUpperCase()}</p>
                                                        </div>
                                                    </div>
                                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide text-gray-700 bg-gray-100 border border-gray-200">
                                                        {booking.status || 'Pending'}
                                                    </span>
                                                </div>

                                                <div className="space-y-3 mb-6 flex-grow">
                                                    <div className="flex items-center text-sm text-gray-700 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                                        <UserIcon className="w-4 h-4 mr-3 text-blue-500 shrink-0" />
                                                        <span className="font-bold truncate">{booking.worker ? booking.worker.name : 'Waiting for professional...'}</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="flex items-center text-sm text-gray-600 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                                            <CalendarIcon className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                                                            <span className="truncate font-medium">{booking.date ? new Date(booking.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : new Date(booking.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-600 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                                            <Clock className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                                                            <span className="font-medium">{booking.time ? booking.time : new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </div>
                                                </div>



                                                {currentStatus === 'completed' && (
                                                    <div className="mb-6 bg-green-50 rounded-xl p-3 border border-green-100 flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2 text-green-700">
                                                            <CheckCircle size={16} />
                                                            <span className="font-semibold">Job Completed</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-green-800 font-bold">{new Date(booking.updatedAt || booking.createdAt).toLocaleDateString()}</div>
                                                            <div className="text-green-600 text-xs">{new Date(booking.updatedAt || booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                        </div>
                                                    </div>
                                                )}

                                                {currentStatus === 'accepted' ? (
                                                    <div className="mb-6 bg-indigo-50 rounded-xl p-3 border border-indigo-100 flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2 text-indigo-700">
                                                            <span className="font-semibold">Inspection Charge: {booking.appliedOffer && booking.appliedOffer.toLowerCase().includes('free') ? 'Free' : '₹100'}</span>
                                                        </div>
                                                        <button
                                                            onClick={async (e) => { 
                                                                e.stopPropagation(); 
                                                                if (booking.appliedOffer && booking.appliedOffer.toLowerCase().includes('free')) {
                                                                    setIsActionLoading(booking._id);
                                                                    try {
                                                                        const res = await fetch(`http://localhost:5001/api/service-requests/${booking._id}/confirm`, {
                                                                            method: 'PUT',
                                                                            headers: { 'Content-Type': 'application/json', 'x-auth-token': token }
                                                                        });
                                                                        if (res.ok) {
                                                                            const updated = await res.json();
                                                                            setBookings(prev => prev.map(b => b._id === booking._id ? { ...b, ...updated } : b));
                                                                        }
                                                                    } finally {
                                                                        setIsActionLoading(null);
                                                                    }
                                                                } else {
                                                                    handlePayInspection(booking._id); 
                                                                }
                                                            }}
                                                            disabled={isActionLoading === booking._id}
                                                            className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-2"
                                                        >
                                                            {isActionLoading === booking._id ? <Loader2 size={14} className="animate-spin" /> : null}
                                                            {booking.appliedOffer && booking.appliedOffer.toLowerCase().includes('free') ? 'Confirm Free Inspection' : 'Pay ₹100'}
                                                        </button>
                                                    </div>
                                                ) : ['confirmed', 'on the way', 'in progress'].includes(currentStatus) && !booking.priceSubmitted ? (
                                                    <div className="mb-6 bg-amber-50 rounded-xl p-3 border border-amber-100 flex items-start gap-3 text-sm animate-pulse">
                                                        <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                                        <div>
                                                            <div className="text-amber-800 font-bold">Waiting for Final Price Updation</div>
                                                            <div className="text-amber-600 text-xs mt-0.5">The professional will inspect and submit the final quote here.</div>
                                                        </div>
                                                    </div>
                                                ) : null}

                                                <div className="pt-5 border-t border-gray-100 flex items-center justify-between mt-auto">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                                                            {currentStatus === 'accepted' ? 'Visit Charge' : (booking.priceConfirmed ? 'Final Price' : (booking.priceSubmitted ? 'Pending Confirmation' : 'Price'))}
                                                        </span>
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                            <span className="text-[15px] font-black text-gray-900 flex items-center gap-1">
                                                                {currentStatus === 'accepted' ? (booking.appliedOffer && booking.appliedOffer.toLowerCase().includes('free') ? 'Free' : '₹100') : (booking.finalPrice != null 
                                                                    ? `₹${booking.finalPrice}`
                                                                    : (booking.price != null && booking.price !== 0
                                                                        ? `₹${booking.price}`
                                                                        : (serviceInfo.price ? `₹${parseInt((serviceInfo.price || '').replace(/\D/g, ''), 10)}` : 'To be confirmed')))}
                                                            </span>
                                                            {booking.appliedOffer && booking.originalFinalPrice && currentStatus !== 'accepted' && (
                                                                <div className="flex items-center gap-2 mt-1 sm:mt-0">
                                                                    <span className="text-sm font-bold text-gray-400 line-through">₹{booking.originalFinalPrice}</span>
                                                                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                        <Zap size={10} className="text-indigo-500" />
                                                                        {booking.appliedOffer}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {booking.priceSubmitted && !booking.priceConfirmed && (
                                                            <button
                                                                onClick={() => handleConfirmPrice(booking._id)}
                                                                disabled={isActionLoading === booking._id}
                                                                className="text-sm font-bold border-2 border-emerald-500 hover:bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl transition-colors shrink-0"
                                                            >
                                                                {isActionLoading === booking._id ? 'Wait...' : 'Confirm'}
                                                            </button>
                                                        )}
                                                        {booking.status === 'completed' && !booking.finalPaymentMethod && (
                                                            <button
                                                                onClick={() => {
                                                                    setPaymentBookingId(booking._id);
                                                                    setPaymentAmount(booking.finalPrice);
                                                                    setShowPaymentMethodModal(true);
                                                                }}
                                                                className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors shrink-0"
                                                            >
                                                                Pay Final Price
                                                            </button>
                                                        )}
                                                        {booking.worker && currentStatus !== 'pending' && currentStatus !== 'cancelled' && (
                                                            <button
                                                                className="text-gray-600 hover:text-blue-600 text-sm font-bold bg-gray-50 hover:bg-blue-50 px-3 py-2 rounded-xl transition-colors shrink-0"
                                                                onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${booking.worker.phone || ''}` }}
                                                            >
                                                                <Phone size={16} />
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() => setSelectedBooking(booking)}
                                                            disabled={currentStatus === 'pending' && !booking.worker}
                                                            className={`text-sm font-bold px-4 py-2 rounded-xl transition-colors ${currentStatus === 'pending' && !booking.worker ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100'}`}
                                                        >
                                                            {(currentStatus === 'pending' && !booking.worker) ? 'Finding Worker...' : 'View Details'}
                                                        </button>
                                                        {booking.status !== 'completed' && booking.status !== 'accepted' && booking.status !== 'cancelled' && (
                                                            <button
                                                                onClick={() => handleCancelBooking(booking._id)}
                                                                disabled={isActionLoading === booking._id}
                                                                className="text-sm font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors"
                                                            >
                                                                {isActionLoading === booking._id ? 'Wait...' : 'Cancel'}
                                                            </button>
                                                        )}
                                                        {booking.finalPaymentMethod === 'offline' && (
                                                            <div className="text-xs font-semibold text-amber-600 uppercase tracking-wide px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-100">
                                                                Paid Cash
                                                            </div>
                                                        )}
                                                        {booking.finalPaymentMethod === 'online' && (
                                                            <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
                                                                Paid Online
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div >
                );

            case 'profile':
                return (
                    <div className="animate-fade-in max-w-5xl mx-auto space-y-6 pb-12">
                        {/* Page Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Profile Settings</h2>
                                <p className="text-gray-500 mt-2 text-base">Manage your personal information and preferences.</p>
                            </div>
                        </div>

                        {/* Top Profile Card */}
                        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden group">
                            {/* Beautiful Background Banner */}
                            <div className="h-48 relative overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop" alt="Profile Banner" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/60"></div>
                            </div>

                            {/* Profile Info */}
                            <div className="px-6 sm:px-10 pb-8">
                                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-20 sm:-mt-24 relative z-10 text-center sm:text-left">
                                    {/* Avatar */}
                                    <div className="relative shrink-0">
                                        <div className="w-36 h-36 bg-white rounded-full p-1.5 shadow-2xl relative overflow-hidden ring-4 ring-white/50">
                                            {photoPreview ? (
                                                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover rounded-full border-4 border-white" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center text-blue-600 text-5xl font-black uppercase border-4 border-white">
                                                    {user?.name ? user.name.charAt(0) : 'A'}
                                                </div>
                                            )}
                                        </div>
                                        {isEditingProfile && (
                                            <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity m-1.5 border-4 border-transparent z-20">
                                                <div className="text-white flex flex-col items-center">
                                                    <Pencil size={20} />
                                                    <span className="text-xs font-medium mt-1">Change</span>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handlePhotoChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
                                    </div>

                                    {/* Basic Info & Edit Button Container */}
                                    <div className="flex-1 pb-2 flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
                                        <div>
                                            <h3 className="text-3xl font-black text-gray-900 capitalize tracking-tight">{user?.name || 'Customer'}</h3>
                                            <p className="text-blue-700 font-black text-[11px] uppercase tracking-widest mt-2 bg-blue-50 px-4 py-2 rounded-full inline-flex items-center gap-2 shadow-sm border border-blue-100">
                                                <UserIcon size={14} /> Customer Account
                                            </p>
                                        </div>

                                        {/* Edit Profile Button on Right */}
                                        {!isEditingProfile && (
                                            <button onClick={() => setIsEditingProfile(true)} className="flex shrink-0 items-center justify-center gap-1.5 bg-white text-gray-700 border border-gray-200 font-bold px-5 py-2.5 text-sm rounded-xl shadow-sm hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-300 ease-in-out active:scale-95 whitespace-nowrap mt-4 sm:mt-0">
                                                <Pencil size={16} /> Edit Profile
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Information */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Personal Details Card */}
                            <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100">
                                <h4 className="text-xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
                                    <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                                        <Settings size={22} />
                                    </span>
                                    Contact Information
                                </h4>

                                <form id="customer-profile-form" onSubmit={handleProfileUpdate} className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="group">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block pl-1">Full Name</label>
                                        {isEditingProfile ? (
                                            <input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-gray-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold shadow-sm" required />
                                        ) : (
                                            <div className="p-3.5 bg-gray-50/50 rounded-xl border border-gray-100 group-hover:border-blue-100 group-hover:bg-blue-50/30 transition-all">
                                                <p className="text-gray-900 font-bold text-[15px] capitalize">{user?.name || 'N/A'}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="group">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block pl-1">Email Address</label>
                                        {isEditingProfile ? (
                                            <input type="email" value={profileForm.email} className="w-full border border-gray-100 text-gray-400 bg-gray-50 text-sm rounded-xl px-4 py-3 cursor-not-allowed font-bold" disabled />
                                        ) : (
                                            <div className="p-3.5 bg-gray-50/50 rounded-xl border border-gray-100 group-hover:border-blue-100 group-hover:bg-blue-50/30 transition-all">
                                                <p className="text-gray-900 font-bold text-[15px]">{user?.email || 'N/A'}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="group">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block pl-1">Phone Number</label>
                                        {isEditingProfile ? (
                                            <input type="text" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-gray-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold shadow-sm" />
                                        ) : (
                                            <div className="p-3.5 bg-gray-50/50 rounded-xl border border-gray-100 group-hover:border-emerald-100 group-hover:bg-emerald-50/30 transition-all">
                                                <p className="text-gray-900 font-bold text-[15px]">{user?.phone || 'Not provided'}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="group">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block pl-1">City / Region</label>
                                        {isEditingProfile ? (
                                            <input type="text" value={profileForm.location} onChange={e => setProfileForm({ ...profileForm, location: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-gray-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold shadow-sm" />
                                        ) : (
                                            <div className="p-3.5 bg-gray-50/50 rounded-xl border border-gray-100 group-hover:border-amber-100 group-hover:bg-amber-50/30 transition-all">
                                                <p className="text-gray-900 font-bold text-[15px]">{user?.location ? formatLocation(user.location) : 'Not provided'}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="sm:col-span-2 group">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block pl-1">Full Home Address</label>
                                        {isEditingProfile ? (
                                            <input type="text" value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-gray-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold shadow-sm" />
                                        ) : (
                                            <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 group-hover:border-blue-100 group-hover:bg-blue-50/30 transition-all">
                                                <p className="text-gray-900 font-bold text-[15px] leading-relaxed">
                                                    {user?.address || 'No address provided. Please update your profile.'}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {isEditingProfile && (
                                        <div className="sm:col-span-2 flex items-center justify-end gap-3 mt-4 pt-6 border-t border-gray-100">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditingProfile(false)}
                                                className="flex items-center justify-center gap-2 bg-white text-gray-600 border border-gray-200 font-bold px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-colors duration-300 active:scale-95"
                                            >
                                                <X size={16} /> Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isActionLoading === 'profile'}
                                                className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md hover:bg-blue-700 transition-colors duration-300 active:scale-95 disabled:opacity-70"
                                            >
                                                {isActionLoading === 'profile' ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>

                            {/* Activity Summary / Quick Actions */}
                            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col">
                                <h4 className="text-xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
                                    <span className="p-2.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
                                        <Zap size={22} />
                                    </span>
                                    Quick Summary
                                </h4>

                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center justify-between p-4 bg-gray-50/80 rounded-2xl border border-transparent hover:border-gray-200 hover:bg-white transition-all shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-[10px]">
                                                <Briefcase size={18} />
                                            </div>
                                            <span className="font-bold text-gray-700 text-sm">Total Bookings</span>
                                        </div>
                                        <span className="text-xl font-black text-gray-900">{bookings.length}</span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50/80 rounded-2xl border border-transparent hover:border-gray-200 hover:bg-white transition-all shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-green-100 text-green-600 rounded-[10px]">
                                                <CheckCircle size={18} />
                                            </div>
                                            <span className="font-bold text-gray-700 text-sm">Completed</span>
                                        </div>
                                        <span className="text-xl font-black text-gray-900">{completedJobsCount}</span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50/80 rounded-2xl border border-transparent hover:border-gray-200 hover:bg-white transition-all shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-amber-100 text-amber-600 rounded-[10px]">
                                                <Clock size={18} />
                                            </div>
                                            <span className="font-bold text-gray-700 text-sm">Active</span>
                                        </div>
                                        <span className="text-xl font-black text-gray-900">{activeJobsCount}</span>
                                    </div>
                                </div>

                                <button onClick={() => setActiveTab('bookings')} className="w-full mt-8 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-3.5 text-center rounded-xl transition-colors border border-gray-200 shadow-sm active:scale-95 text-sm flex items-center justify-center gap-2">
                                    View All Bookings
                                </button>
                            </div>
                        </div>
                    </div >
                );

            case 'complaints':
                return (
                    <div className="animate-fade-in max-w-5xl mx-auto space-y-6">
                        {/* Page Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">File a Complaint</h2>
                                <p className="text-gray-500 mt-2 text-base">Report an issue and help us improve our service quality.</p>
                            </div>
                        </div>

                        {/* New Complaint Form and Existing Complaints Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Complaint Form - Left Side */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                        <span className="p-2 bg-red-50 text-red-600 rounded-lg">
                                            <AlertCircle size={22} />
                                        </span>
                                        Submit New Complaint
                                    </h3>

                                    {complaintError && (
                                        <div className="mb-5 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                                            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-red-700 text-sm">{complaintError}</p>
                                        </div>
                                    )}

                                    {complaintSuccess && (
                                        <div className="mb-5 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                                            <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-green-700 text-sm">Complaint submitted successfully!</p>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmitComplaint} className="space-y-5">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2 block">Worker *</label>
                                            <select
                                                name="worker"
                                                value={complaintForm.worker}
                                                onChange={handleComplaintChange}
                                                className="w-full h-11 px-4 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            >
                                                <option value="">Select a worker...</option>
                                                <option value="general">General Complaint (Not about specific worker)</option>
                                                {workers.map((workerOption) => (
                                                    <option key={workerOption._id} value={workerOption._id}>
                                                        {workerOption.name} - {workerOption.profession} ({formatLocation(workerOption.location)})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2 block">Subject *</label>
                                            <input
                                                type="text"
                                                name="subject"
                                                value={complaintForm.subject}
                                                onChange={handleComplaintChange}
                                                placeholder="Brief summary (e.g., Poor service quality)"
                                                className="w-full h-11 px-4 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2 block">Description *</label>
                                            <textarea
                                                name="description"
                                                value={complaintForm.description}
                                                onChange={handleComplaintChange}
                                                placeholder="Provide detailed information about your complaint..."
                                                rows="5"
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={!complaintForm.subject || !complaintForm.description || isSubmittingComplaint}
                                            className={`w-full h-11 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${complaintForm.subject && complaintForm.description && !isSubmittingComplaint
                                                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg active:scale-95'
                                                : 'bg-gray-400 text-gray-700 cursor-not-allowed opacity-50'
                                                }`}
                                        >
                                            {isSubmittingComplaint ? (
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
                                    </form>
                                </div>
                            </div>

                            {/* Complaints Statistics - Right Side */}
                            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 h-fit">
                                <h4 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                                    <MessageSquare size={20} />
                                    Your Complaints
                                </h4>

                                {isLoadingComplaints ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 size={24} className="animate-spin text-blue-500" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-3xl font-bold text-gray-900 mb-2">{complaints.length}</div>
                                        <p className="text-gray-500 text-sm mb-6">Total complaints filed</p>

                                        {complaints.length > 0 && (
                                            <div className="space-y-3">
                                                {complaints.map(complaint => (
                                                    <div key={complaint._id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                                                        <div className="flex items-start gap-2">
                                                            <div className={`mt-1 px-2.5 py-1 rounded text-xs font-medium ${complaint.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                {complaint.status === 'resolved' ? 'Resolved' : 'Open'}
                                                            </div>
                                                        </div>
                                                        <h5 className="font-medium text-gray-900 text-sm mt-2 line-clamp-2">{complaint.subject}</h5>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date(complaint.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#f9fafb] flex flex-col md:flex-row">
            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-20 right-5 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg border border-emerald-400 flex items-center gap-3 z-50 animate-slide-in">
                    <CheckCircle size={20} />
                    <span className="font-medium">{toastMessage || 'Success!'}</span>
                </div>
            )}

            {/* Sidebar - Desktop & Mobile */}
            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-800/50 z-20 md:hidden backdrop-blur-sm"
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

                        <button
                            onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                        >
                            <Grid size={18} /> Dashboard
                        </button>

                        <button
                            onClick={() => { setActiveTab('services'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'services' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                        >
                            <Wrench size={18} /> Services
                        </button>

                        <button
                            onClick={() => { setActiveTab('bookings'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'bookings' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                        >
                            <Calendar size={18} /> My Bookings
                        </button>

                        <button
                            onClick={() => { setActiveTab('complaints'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'complaints' ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                        >
                            <AlertCircle size={18} /> File Complaint
                        </button>

                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-8 px-3">Account</div>

                        <button
                            onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                        >
                            <UserIcon size={18} /> Profile
                        </button>
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
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f4f7f9] relative z-0">
                {/* Top Navbar */}
                <header className="h-20 bg-white shadow-[0_1px_10px_rgba(0,0,0,0.02)] sticky top-0 z-50 px-6 md:px-10 flex items-center justify-between">
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
                        <div className="hidden sm:block">
                            {activeTab === 'dashboard' ? (
                                <div className="flex items-center gap-2">
                                    <img src={logo} alt="Logo" className="h-8 w-8" />
                                    <span className="text-xl font-bold text-gray-900 tracking-tight">On-Demand</span>
                                </div>
                            ) : (
                                <h1 className="text-2xl font-bold text-gray-900 capitalize">
                                    {activeTab}
                                </h1>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-8">
                        {activeTab === 'services' && (
                            <div className="relative hidden md:flex items-center group">
                                <Search className="absolute left-4 text-gray-400 pointer-events-none transition-colors group-focus-within:text-blue-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search services..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-gray-50 text-gray-900 border border-gray-200 text-sm rounded-full pl-12 pr-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white w-56 lg:w-72 transition-all placeholder:text-gray-400"
                                />
                            </div>
                        )}

                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2.5 rounded-full hover:bg-gray-50 text-gray-600 transition-colors border border-transparent hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            >
                                <Bell size={22} />
                                {notifications.filter(n => (n.isApi ? !n.isRead : true)).length > 0 && (
                                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[100] animate-fade-in origin-top-right">
                                    <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                        <h3 className="font-bold text-gray-900">Notifications</h3>
                                        {notifications.filter(n => (n.isApi ? !n.isRead : true)).length > 0 && (
                                            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{notifications.filter(n => (n.isApi ? !n.isRead : true)).length} New</span>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.map(notif => (
                                                <button
                                                    key={notif.id}
                                                    className="w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:bg-gray-100"
                                                    onClick={() => {
                                                        if (notif.isApi) {
                                                            if (!notif.isRead) {
                                                                handleMarkNotificationRead(notif.id);
                                                            }
                                                            setActiveTab('dashboard');
                                                            setTimeout(() => {
                                                                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                                                            }, 100);
                                                        } else if (!notif.isApi && notif.booking) {
                                                            setActiveTab('bookings');
                                                            setSelectedBooking(notif.booking);
                                                        }
                                                        setShowNotifications(false);
                                                    }}
                                                >
                                                    <p className={`text-sm text-gray-800 leading-relaxed ${notif.isApi && notif.isRead ? 'opacity-60' : ''}`}><span className={`${notif.isApi && notif.isRead ? 'text-gray-400' : 'text-blue-600'} mr-2`}>●</span>{notif.message}</p>
                                                    <span className="text-xs text-gray-400 mt-2 block ml-4">{new Date(notif.time).toLocaleString()}</span>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
                                                <Bell size={24} className="text-gray-300" />
                                                <span className="text-sm font-medium">No new notifications</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

                        <div className="flex items-center gap-3 cursor-pointer group p-1.5 pr-3 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all font-semibold" onClick={() => setActiveTab('profile')}>
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 border-2 border-white shadow-sm uppercase">
                                {user?.name ? user.name.charAt(0) : 'A'}
                            </div>
                            <span className="text-sm text-gray-700 hidden sm:block capitalize">{user?.name || 'Customer'}</span>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content Area */}
                <div className="flex-1 overflow-auto p-6 md:p-10">
                    {renderContent()}
                </div>
            </main>

            {/* Booking Details Modal */}
            {selectedBooking && selectedBooking.worker && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-2xl font-extrabold text-gray-900">Activity Details</h2>
                            <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-700 transition-colors p-2 hover:bg-gray-200 rounded-full">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-8 flex-1 overflow-y-auto">
                            {/* Worker Profile Card */}
                            <div className="bg-white border text-center border-gray-100 rounded-2xl p-6 shadow-sm mb-6 mt-12 relative">
                                <div className="absolute -top-10 inset-x-0 mx-auto w-20 h-20 bg-blue-100 rounded-full border-4 border-white shadow-md flex items-center justify-center text-blue-600 font-bold text-2xl uppercase">
                                    {selectedBooking.worker.name ? selectedBooking.worker.name.charAt(0) : 'W'}
                                </div>
                                <div className="mt-8">
                                    <h3 className="text-xl font-bold text-gray-900 capitalize">{selectedBooking.worker.name || 'Assigned Worker'}</h3>

                                    {isLoadingWorkerStats ? (
                                        <div className="flex justify-center mt-2 mb-3">
                                            <Loader2 size={16} className="animate-spin text-gray-400" />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex justify-center mt-1 mb-1 items-center gap-2">
                                                {renderStars(Math.round(workerStats?.averageRating || 4))}
                                                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{workerStats?.averageRating || '4.0'}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium tracking-wide pb-3 border-b border-gray-100/60 w-3/4 mx-auto">{workerStats?.completedJobs || 0} jobs completed • {workerStats?.totalReviews || 0} reviews</p>
                                        </>
                                    )}

                                    <div className="flex justify-center flex-wrap gap-4 mt-4">
                                        {selectedBooking.worker.phone ? (
                                            <a href={`tel:${selectedBooking.worker.phone}`} className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold hover:bg-blue-100 transition-colors shadow-sm">
                                                <Phone size={16} /> {selectedBooking.worker.phone}
                                            </a>
                                        ) : (
                                            <span className="inline-flex items-center gap-2 bg-gray-50 text-gray-500 px-4 py-2 rounded-full text-sm font-bold shadow-sm">
                                                <Phone size={16} /> No phone provided
                                            </span>
                                        )}
                                    </div>

                                    {/* Recent Feedback Preview (Optional) */}
                                    {workerStats?.reviews && workerStats.reviews.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 text-left bg-gray-50/50 p-4 rounded-xl shadow-inner">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Recent Feedback</p>
                                            <p className="text-sm text-gray-700 italic">"{workerStats.reviews[0].feedback || 'Great service!'}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Booking Info */}
                            <div className="space-y-4 text-gray-700 mb-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2"><Briefcase size={16} className="text-blue-500" /> Booking Details</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 mb-1">Service</span>
                                        <span className="font-bold text-gray-900">{selectedBooking.serviceType}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 mb-1">Booking ID</span>
                                        <span className="font-mono text-gray-900 bg-white px-2 py-0.5 rounded shadow-sm border border-gray-200 w-fit">{selectedBooking._id.substring(0, 8).toUpperCase()}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 mb-1">Date</span>
                                        <span className="font-semibold text-gray-900">{new Date(selectedBooking.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 mb-1">Time</span>
                                        <span className="font-semibold text-gray-900">{selectedBooking.time || new Date(selectedBooking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="col-span-2 flex flex-col pt-2 border-t border-gray-100">
                                        <span className="text-xs font-semibold text-gray-500 mb-1">Address</span>
                                        <span className="font-medium text-gray-800 leading-relaxed break-words">{formatLocation(selectedBooking.location)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Vertical Timeline */}
                            <div className="mb-6">
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2"><Clock size={16} className="text-orange-500" /> Job Timeline</h4>
                                <div className="space-y-0 pl-2">
                                    {(function () {
                                        const b = selectedBooking;
                                        const status = (b.status || 'pending').toLowerCase();
                                        const isCancelled = status === 'cancelled';

                                        const timeline = [
                                            { title: 'Request Sent', desc: 'Awaiting professional to accept.', time: new Date(b.createdAt).toLocaleString(), active: true, done: true }
                                        ];

                                        if (!isCancelled && status !== 'pending') {
                                            timeline.push({ title: 'Worker Accepted', desc: `${b.worker?.name || 'Professional'} accepted the job.`, time: new Date(b.updatedAt || b.createdAt).toLocaleString(), active: true, done: true });
                                        }

                                        if (['confirmed', 'in progress', 'completed'].includes(status)) {
                                            timeline.push({ title: 'Visit Charge Paid', desc: '₹100 inspection charge paid successfully.', time: 'Confirmed', active: true, done: true });
                                        } else if (!isCancelled && status === 'accepted') {
                                            timeline.push({ title: 'Visit Charge Paid', desc: 'Awaiting ₹100 payment to proceed.', time: 'Pending', active: true, done: false });
                                        }

                                        if (b.priceConfirmed || ['in progress', 'completed'].includes(status)) {
                                            timeline.push({ title: 'Service Started', desc: 'Work has commenced.', time: 'In progress', active: true, done: true });
                                        } else if (!isCancelled && ['accepted', 'confirmed'].includes(status)) {
                                            timeline.push({ title: 'Service Started', desc: 'Work will commence soon.', time: 'Pending', active: false, done: false });
                                        }

                                        if (status === 'completed') {
                                            timeline.push({ title: 'Completed', desc: 'Service finished successfully.', time: new Date(b.updatedAt || b.createdAt).toLocaleString(), active: true, done: true });
                                        } else if (!isCancelled) {
                                            timeline.push({ title: 'Completed', desc: 'Awaiting completion.', time: 'Pending', active: false, done: false });
                                        }

                                        if (status === 'completed') {
                                            if (b.isFinalPaid || b.finalPaymentMethod === 'online') {
                                                timeline.push({ title: 'Final Payment', desc: `₹${b.finalPrice} paid online securely.`, time: new Date(b.updatedAt || b.createdAt).toLocaleString(), active: true, done: true });
                                            } else if (b.finalPaymentMethod === 'offline') {
                                                timeline.push({ title: 'Final Payment', desc: `₹${b.finalPrice} to be paid in cash.`, time: 'Pending completion', active: true, done: false });
                                            } else {
                                                timeline.push({ title: 'Final Payment', desc: 'Awaiting payment method selection.', time: 'Pending', active: true, done: false });
                                            }
                                        } else if (!isCancelled && b.priceConfirmed) {
                                            timeline.push({ title: 'Final Payment', desc: 'Payment due after service completion.', time: 'Pending', active: false, done: false });
                                        }

                                        if (isCancelled) {
                                            timeline.push({ title: 'Cancelled', desc: 'This booking was cancelled.', time: new Date(b.updatedAt || b.createdAt).toLocaleString(), active: true, done: true, isError: true });
                                        }

                                        return timeline.map((evt, idx) => {
                                            const isLast = idx === timeline.length - 1;
                                            return (
                                                <div key={evt.title} className="flex relative">
                                                    {!isLast && (
                                                        <div className={`absolute top-6 bottom-0 left-[11px] w-0.5 -ml-px ${evt.done && !evt.isError ? 'bg-blue-500' : 'bg-gray-200'} z-0`}></div>
                                                    )}
                                                    <div className="relative z-10 flex flex-col items-center mr-4">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm mt-1 
                                                            ${evt.isError ? 'bg-red-500' : (evt.done ? 'bg-blue-500' : (evt.active ? 'bg-white border-blue-500 !border-2' : 'bg-gray-200'))}`}
                                                        >
                                                            {evt.isError ? <X size={12} className="text-white font-bold" /> : (evt.done ? <CheckCircle size={12} className="text-white" /> : (evt.active ? <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div> : null))}
                                                        </div>
                                                    </div>
                                                    <div className={`pb-6 ${isLast ? 'pb-2' : ''} ${!evt.active && !evt.done ? 'opacity-50 grayscale' : ''}`}>
                                                        <h5 className={`text-sm font-bold ${evt.isError ? 'text-red-600' : 'text-gray-900'} mb-0.5`}>{evt.title}</h5>
                                                        <p className="text-xs text-gray-500">{evt.desc}</p>
                                                        <p className="text-xs font-mono text-gray-400 mt-1">{evt.time}</p>
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div className="mb-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2"><Zap size={16} className="text-yellow-500" /> Payment Details</h4>
                                <div className="flex flex-col space-y-3">
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                        <span className="text-sm font-semibold text-gray-500">Service Fee (Advance)</span>
                                        <span className="text-base font-black text-gray-900">
                                        ₹{selectedBooking.price != null && selectedBooking.price !== 0
                                            ? selectedBooking.price
                                            : (selectedBooking.serviceType && services.find(s => s.name === selectedBooking.serviceType)?.price
                                                ? parseInt((services.find(s => s.name === selectedBooking.serviceType).price || '').replace(/\D/g, ''), 10)
                                                : 'Pending Confirmation')
                                        }
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                        <span className="text-sm font-semibold text-gray-500">Advance Payment Method</span>
                                        <span className="text-sm font-bold text-emerald-700 bg-emerald-50 border-emerald-200 px-3 py-1 rounded shadow-sm border">
                                            Online Paid
                                        </span>
                                    </div>
                                    
                                    {selectedBooking.finalPrice && (
                                        <>
                                            <div className="flex justify-between items-center pb-2 border-b border-gray-100 pt-2">
                                                <span className="text-sm font-semibold text-gray-500">Final Price</span>
                                                <span className="text-base font-black text-gray-900">₹{selectedBooking.finalPrice}</span>
                                            </div>
                                            <div className="flex justify-between items-center pb-2">
                                                <span className="text-sm font-semibold text-gray-500">Final Payment Method</span>
                                                <span className={`text-sm font-bold ${selectedBooking.finalPaymentMethod === 'online' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : (selectedBooking.finalPaymentMethod === 'offline' ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-gray-700 bg-gray-50 border-gray-200')} px-3 py-1 rounded shadow-sm border`}>
                                                    {selectedBooking.finalPaymentMethod === 'online' ? 'Online Paid' : (selectedBooking.finalPaymentMethod === 'offline' ? 'Paid Cash' : 'Pending Selection')}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* View Feedback if available */}
                            {selectedBooking.status?.toLowerCase() === 'completed' && (
                                <button
                                    onClick={() => setIsReviewModalOpen(true)}
                                    className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2"
                                >
                                    <Star size={20} className="fill-white shrink-0" />
                                    <span>Leave a Review</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Booking Flow Overlay */}
            {bookingFlowState !== 'none' && selectedServiceForBooking && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 sm:p-6 animate-fade-in overflow-y-auto">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col my-auto relative">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                            <div>
                                <h2 className="text-2xl font-extrabold text-gray-900">
                                    {bookingFlowState === 'options' && 'Select Booking Type'}
                                    {bookingFlowState === 'manual-workers' && 'Choose a Professional'}
                                    {bookingFlowState === 'form' && 'Complete Your Booking'}
                                </h2>
                                <p className="text-gray-500 text-sm mt-1 flex items-center gap-1 font-medium">
                                    {(() => {
                                        const IconComp = iconMap[selectedServiceForBooking.iconName] || Wrench;
                                        return <IconComp size={16} className={selectedServiceForBooking.color} />;
                                    })()}
                                    {selectedServiceForBooking.name} Service
                                </p>
                            </div>
                            <button onClick={() => { setBookingFlowState('none'); setSelectedServiceForBooking(null); setSelectedWorkerForBooking(null); }} className="text-gray-400 hover:text-gray-700 transition-colors p-2 hover:bg-gray-200 rounded-full">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body content based on state */}
                        <div className="p-6 sm:p-8 overflow-y-auto max-h-[70vh]">
                            {/* Option Selection State */}
                            {bookingFlowState === 'options' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Option 1: Auto */}
                                    <button
                                        onClick={() => { setSelectedWorkerForBooking(null); setBookingFlowState('form'); }}
                                        className="text-left bg-white border-2 border-gray-100 hover:border-blue-500 rounded-2xl p-6 transition-all hover:shadow-xl group"
                                    >
                                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                                            <Zap size={28} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Automatic Assignment</h3>
                                        <p className="text-gray-500 text-sm mb-6 leading-relaxed">We'll find the nearest available worker to get your job done quickly and efficiently.</p>
                                        <div className="text-blue-600 font-bold text-sm flex items-center gap-1">
                                            Select Option <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </button>

                                    {/* Option 2: Manual */}
                                    <button
                                        onClick={() => fetchWorkersForService(selectedServiceForBooking.name)}
                                        className="text-left bg-white border-2 border-gray-100 hover:border-purple-500 rounded-2xl p-6 transition-all hover:shadow-xl group"
                                    >
                                        <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                                            <Users size={28} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Choose Manually</h3>
                                        <p className="text-gray-500 text-sm mb-6 leading-relaxed">Browse worker profiles, ratings, and reviews to select the exact professional you want.</p>
                                        <div className="text-purple-600 font-bold text-sm flex items-center gap-1">
                                            Select Option <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </button>
                                </div>
                            )}

                            {/* Manual Worker Selection State */}
                            {bookingFlowState === 'manual-workers' && (
                                <div className="space-y-4">
                                    <button onClick={() => setBookingFlowState('options')} className="text-gray-500 text-sm font-medium flex items-center gap-1 mb-4 hover:text-gray-800 transition-colors">
                                        <ArrowLeft size={16} /> Back to options
                                    </button>

                                    {isLoadingWorkers ? (
                                        <div className="text-center py-10 text-gray-500">
                                            <Loader2 size={32} className="animate-spin mx-auto text-purple-500 mb-4" />
                                            Finding available professionals...
                                        </div>
                                    ) : availableWorkersForService.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {availableWorkersForService.map(worker => (
                                                <div key={worker._id} className="border border-gray-200 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-300 transition-colors">
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <div>
                                                            <h4 className="font-bold text-gray-900">{worker.name}</h4>
                                                            <div className="flex flex-col gap-1 mt-0.5">
                                                                <div className="flex items-center gap-1 text-sm text-yellow-500">
                                                                    <Star size={14} className="fill-current" />
                                                                    <span className="font-medium text-gray-700">{worker.rating > 0 ? worker.rating : 'New'}</span>
                                                                    <span className="text-gray-400 ml-1">({worker.totalReviews || 0} reviews)</span>
                                                                </div>
                                                                {worker.experience && (
                                                                    <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-md inline-block w-max">
                                                                        {worker.experience} Exp
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => { setSelectedWorkerForBooking(worker); setBookingFlowState('form'); }}
                                                        className="w-full bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white font-medium py-2 rounded-xl transition-colors text-sm"
                                                    >
                                                        Select {worker.name.split(' ')[0]}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                            <Users size={32} className="mx-auto text-gray-400 mb-2" />
                                            <p>No {selectedServiceForBooking.name}s available right now.</p>
                                            <button onClick={() => { setSelectedWorkerForBooking(null); setBookingFlowState('form'); }} className="text-blue-600 font-medium mt-2 hover:underline">
                                                Proceed with Automatic Assignment instead
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Final Booking Form State */}
                            {bookingFlowState === 'form' && (
                                <form className="space-y-6" onSubmit={handleFinalBookingSubmit}>
                                    <button type="button" onClick={() => setBookingFlowState(selectedWorkerForBooking ? 'manual-workers' : 'options')} className="text-gray-500 text-sm font-medium flex items-center gap-1 mb-2 hover:text-gray-800 transition-colors">
                                        <ArrowLeft size={16} /> Back
                                    </button>

                                    {/* Location Input */}
                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold text-gray-700 mb-1 flex justify-between items-center">
                                            <span className="flex items-center gap-1"><MapPin size={16} className="text-red-500" /> Service Location</span>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={handleLocateMe}
                                                    disabled={isLocating}
                                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border font-bold text-xs transition-all ${
                                                        isLocating 
                                                        ? 'bg-blue-50 border-blue-200 text-blue-400 cursor-wait' 
                                                        : 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100 active:scale-95 shadow-sm'
                                                    }`}
                                                >
                                                    <Navigation size={12} className={isLocating ? 'animate-pulse' : ''} />
                                                    {isLocating ? 'Locating...' : 'Locate Me'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowMapModal(true)}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-purple-100 bg-purple-50 hover:bg-purple-100 text-purple-600 font-bold text-xs transition-all active:scale-95 shadow-sm"
                                                >
                                                    <MapIcon size={12} />
                                                    Map
                                                </button>
                                            </div>
                                        </label>
                                        <textarea
                                            value={bookingForm.location}
                                            onChange={(e) => setBookingForm({ ...bookingForm, location: e.target.value })}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                                            placeholder="Enter full address or use Locate Me/Map"
                                            rows="2"
                                            required
                                        ></textarea>
                                    </div>

                                    {/* Date and Time Group */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                                                <CalendarIcon size={16} className="text-blue-500" /> Preferred Date
                                            </label>
                                            <input
                                                type="date"
                                                min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]}
                                                value={bookingForm.date}
                                                onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                                                <Clock size={16} className="text-orange-500" /> Preferred Time
                                            </label>
                                            <input
                                                type="time"
                                                value={bookingForm.time}
                                                onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Problem Description */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                                            <MessageSquare size={16} className="text-emerald-500" /> Problem Description
                                        </label>
                                        <textarea
                                            value={bookingForm.description}
                                            onChange={(e) => setBookingForm({ ...bookingForm, description: e.target.value })}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none transition-all"
                                            rows="3"
                                            placeholder="Describe what needs to be fixed..."
                                            required
                                        />
                                    </div>

                                    {/* Pricing Notice */}
                                    <div className="bg-[#fff9f0] border border-[#ffedd5] rounded-xl p-4 flex gap-3 items-start">
                                        <AlertCircle size={20} className="text-orange-500 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-bold text-orange-800 mb-1">Important Pricing Notice</h4>
                                            <p className="text-xs text-orange-700 leading-relaxed font-medium">
                                                The price displayed is only an <span className="font-bold">inspection fee / starting price</span>. Once the professional arrives and inspects the site, they will provide a final price. The final price is given by the <span className="font-bold">worker itself</span>. You will need to confirm this final price from your Bookings tab and pay the amount directly to the worker.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isBooking}
                                        className="w-full bg-[#16a34a] hover:bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-95 flex justify-center items-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isBooking ? <><Loader2 size={20} className="animate-spin" /> Confirming...</> : 'Confirm Booking Request'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {isReviewModalOpen && selectedBooking && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-2xl font-extrabold text-gray-900">Rate Service</h2>
                            <button onClick={() => setIsReviewModalOpen(false)} disabled={isSubmittingReview} className="text-gray-400 hover:text-gray-700 transition-colors p-2 hover:bg-gray-200 rounded-full disabled:opacity-50">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleReviewSubmit} className="p-8">
                            <div className="text-center mb-6">
                                <p className="text-gray-500 mb-4">How was your experience with <span className="font-bold text-gray-800">{selectedBooking.worker.name || 'the professional'}</span>?</p>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                            className="focus:outline-none transform transition-transform hover:scale-110"
                                        >
                                            <Star
                                                size={36}
                                                className={`transition-colors duration-200 ${reviewForm.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Write a Review (Optional)</label>
                                <textarea
                                    value={reviewForm.feedback}
                                    onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl p-4 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none transition-all shadow-sm"
                                    rows="4"
                                    placeholder="Tell us what you liked or how they can improve..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmittingReview}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-95 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmittingReview ? <><Loader2 size={20} className="animate-spin" /> Submitting...</> : 'Submit Review'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Map Selection Modal */}
            {showMapModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[80vh] relative animate-slide-up">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                            <div>
                                <h2 className="text-2xl font-extrabold text-gray-900">Choose your area</h2>
                                <p className="text-sm text-gray-500 mt-1">Select your service location on the map</p>
                            </div>
                            <button onClick={() => setShowMapModal(false)} className="text-gray-400 hover:text-gray-700 transition-colors p-2 hover:bg-gray-200 rounded-full">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="flex-grow relative z-10">
                            <MapContainer 
                                center={[bookingForm.latitude || 20.5937, bookingForm.longitude || 78.9629]} 
                                zoom={bookingForm.latitude ? 15 : 5} 
                                style={{ height: '100%', width: '100%' }}
                                zoomControl={false}
                            >
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                />
                                <LocationPicker />
                                
                                <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                                    <button 
                                        type="button"
                                        onClick={() => setShowMapModal(false)}
                                        className="bg-white p-2 rounded-xl shadow-lg hover:bg-gray-50 text-gray-700 transition-colors w-10 h-10 flex items-center justify-center"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-4">
                                    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-4 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                            <MapPin size={20} className="text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Service Area</p>
                                            <p className="text-sm font-bold text-gray-900 truncate">
                                                {bookingForm.location || 'Pin your location on map'}
                                            </p>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => setShowMapModal(false)}
                                            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 active:scale-95 transition-all"
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                </div>
                            </MapContainer>
                        </div>
                    </div>
                </div>
            )}
            {/* Mock Payment Modal for Inspection */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative animate-slide-up">
                        {/* Decorative Header */}
                        <div className="h-32 bg-gradient-to-br from-indigo-500 via-blue-600 to-blue-700 w-full absolute top-0 left-0"></div>
                        
                        <div className="px-6 pt-8 pb-8 relative z-10">
                            {paymentSuccess ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center animate-fade-in">
                                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-green-500/20 shadow-xl relative">
                                        <CheckCircle className="w-12 h-12 text-green-500" />
                                    </div>
                                    <h3 className="text-3xl font-black text-gray-900 mb-2">Payment Successful!</h3>
                                    <p className="text-gray-500 font-medium">Your inspection charge has been processed.</p>
                                </div>
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
                                                <p className="text-3xl font-black text-gray-900 drop-shadow-sm">₹{paymentAmount}<span className="text-lg text-gray-400 font-semibold">.00</span></p>
                                            </div>
                                            <div className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide">
                                                {paymentType === 'inspection' ? 'Visit Charge' : 'Final Payment'}
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
                                            onClick={executeMockPayment}
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
                                                    <span>Pay ₹{paymentAmount} Securely</span>
                                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                    <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        <svg className="w-3.5 h-3.5 text-green-500 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                                        256-bit SSL Encryption
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Method Selection Modal */}
            {showPaymentMethodModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col relative animate-slide-up p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-extrabold text-gray-900 mb-1">Select Payment</h3>
                                <p className="text-gray-500 text-sm font-medium">How would you like to pay?</p>
                            </div>
                            <button 
                                onClick={() => setShowPaymentMethodModal(false)}
                                className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <button 
                                onClick={() => handlePayFinalOnline(paymentBookingId, paymentAmount)}
                                className="w-full text-left bg-white border-2 border-gray-100 hover:border-blue-500 rounded-2xl p-5 transition-all hover:shadow-xl group flex items-center gap-4"
                            >
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                                    <Zap size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-0.5">Pay Online</h4>
                                    <p className="text-xs text-gray-500">Secure card payment via gateway</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => handlePayFinalOffline(paymentBookingId)}
                                disabled={isActionLoading === `offline-${paymentBookingId}`}
                                className="w-full text-left bg-white border-2 border-gray-100 hover:border-emerald-500 rounded-2xl p-5 transition-all hover:shadow-xl group flex items-center gap-4 disabled:opacity-50"
                            >
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-0.5">{isActionLoading === `offline-${paymentBookingId}` ? 'Processing...' : 'Pay Offline (Cash)'}</h4>
                                    <p className="text-xs text-gray-500">Pay cash directly to professional</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customer;
