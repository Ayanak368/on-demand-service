import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import logo from '../assets/logo.svg';
import heroImg from '../assets/hero-workers.png';
import { XCircle, MapPin, Navigation, Map as MapIcon, X, Search, Loader2, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MapModal from '../components/MapModal';


const Register = ({ isModal = false }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        address: '',
        role: 'customer',
        profession: '',
        experience: '',
        latitude: null,
        longitude: null
    });
    const [showMapModal, setShowMapModal] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [services, setServices] = useState([]);
    
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch('http://localhost:5001/api/services');
                if (res.ok) {
                    const data = await res.json();
                    setServices(data.filter(s => s.isActive));
                }
            } catch (err) {
                console.error("Failed to fetch services:", err);
            }
        };
        fetchServices();
    }, []);
    
    // Payment Mock States
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [cardDetails, setCardDetails] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: ''
    });

    const { login, openAuthModal, closeAuthModal } = useContext(AuthContext);
    const navigate = useNavigate();

    const { name, email, password, confirmPassword, phone, address, role, profession, experience, latitude, longitude } = formData;

    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'name':
                if (!value) error = 'Name is required';
                else if (!/^[a-zA-Z\s]+$/.test(value)) error = 'Name should contain only letters';
                break;
            case 'email':
                if (!value) error = 'Email is required';
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
                break;
            case 'password':
                if (!value) error = 'Password is required';
                else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value)) {
                    error = 'Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character';
                }
                break;
            case 'confirmPassword':
                if (!value) error = 'Confirm password is required';
                else if (value !== password) error = 'Passwords do not match';
                break;
            case 'phone':
                if (!value) error = 'Phone number is required';
                else if (!/^\d{10}$/.test(value)) error = 'Phone number must be exactly 10 digits';
                break;
            case 'address':
                if (!value) error = 'Address is required';
                break;
            case 'profession':
                if (role === 'worker' && !value) error = 'Profession is required for workers';
                break;
            case 'experience':
                if (role === 'worker' && !value) error = 'Experience is required for workers';
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

    const onBlur = e => {
        const { name } = e.target;
        setTouched({ ...touched, [name]: true });
    };

    const onFileChange = e => {
        setPhoto(e.target.files[0]);
    };

    const handleLocationSelect = (location) => {
        setFormData(prev => ({
            ...prev,
            latitude: location.lat,
            longitude: location.lng,
            address: location.address
        }));
        setShowMapModal(false);
    };

    const updateLocationFromCoords = async (lat, lng) => {
        setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng
        }));

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            const data = await response.json();
            if (data && data.display_name) {
                setFormData(prev => ({
                    ...prev,
                    address: data.display_name
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
                      
                      setFormData(prev => ({
                          ...prev,
                          latitude,
                          longitude,
                          address: addressString
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


    const isFormValid = () => {
        const requiredFields = ['name', 'email', 'password', 'confirmPassword', 'phone', 'address'];
        if (role === 'worker') requiredFields.push('profession', 'experience');
        return requiredFields.every(field => formData[field] && !errors[field]) && !Object.values(errors).some(e => e);
    };

    const submitRegistration = async () => {
        const data = new FormData();
        data.append('name', name);
        data.append('email', email);
        data.append('password', password);
        data.append('phone', phone);
        data.append('address', address);
        data.append('role', role);
        if (latitude) data.append('latitude', latitude);
        if (longitude) data.append('longitude', longitude);

        if (role === 'worker') {
            data.append('profession', profession);
            data.append('experience', experience);
            if (photo) {
                data.append('photo', photo);
            }
        }

        try {
            const res = await fetch('http://localhost:5001/api/users/register', {
                method: 'POST',
                body: data
            });
            const resData = await res.json();
            if (res.ok) {
                alert('You are successfully registered!');
                if (isModal) {
                    closeAuthModal();
                    navigate('/');
                } else {
                    navigate('/');
                }
            } else {
                alert(resData.msg || 'Registration failed');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleMockPayment = () => {
        if (!isCardValid()) return;
        setIsProcessingPayment(true);
        setTimeout(() => {
            setPaymentSuccess(true);
            setTimeout(() => {
                setIsProcessingPayment(false);
                setShowPaymentModal(false);
                submitRegistration();
            }, 1000);
        }, 2000);
    };

    const onSubmit = async e => {
        e.preventDefault();
        if (!isFormValid()) return;

        if (role === 'worker') {
            setShowPaymentModal(true);
        } else {
            submitRegistration();
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

                    {/* Register Form */}
                    <div className="p-6 sm:p-8 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
                        {/* Logo */}
                        <div className="mb-4 text-center sm:text-left flex justify-center sm:justify-start">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                                <img src={logo} alt="On-Demand" className="h-6 w-auto filter brightness-0 invert" />
                            </div>
                        </div>

                        {/* Header */}
                        <div className="mb-6 text-center sm:text-left">
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">Sign up</h1>
                            <p className="text-gray-600 text-sm">Create a new account</p>
                        </div>

                        {/* Form */}
                        <form className="space-y-4" onSubmit={onSubmit} autoComplete="off">
                            {/* Role Selection */}
                            <div>
                                <select
                                    className="w-full px-5 py-3 border-2 rounded-xl text-gray-900 text-base transition-all duration-200 focus:outline-none border-gray-300 focus:border-blue-500 bg-white font-medium"
                                    name="role"
                                    value={role}
                                    onChange={onChange}
                                >
                                    <option value="customer">I want to hire a worker (Customer)</option>
                                    <option value="worker">I want to provide services (Worker)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Name Field */}
                                <div>
                                    <input
                                        id="name"
                                        className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 text-sm placeholder-gray-400 transition-all duration-200 focus:outline-none ${touched.name && errors.name
                                            ? 'border-red-400 focus:border-red-500 bg-red-50'
                                            : 'border-gray-300 focus:border-blue-500 bg-white'
                                            }`}
                                        type="text"
                                        name="name"
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={onChange}
                                        onBlur={onBlur}
                                        required
                                    />
                                    {touched.name && errors.name && (
                                        <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name}</p>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div>
                                    <input
                                        id="email"
                                        className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 text-sm placeholder-gray-400 transition-all duration-200 focus:outline-none ${touched.email && errors.email
                                            ? 'border-red-400 focus:border-red-500 bg-red-50'
                                            : 'border-gray-300 focus:border-blue-500 bg-white'
                                            }`}
                                        type="email"
                                        name="email"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={onChange}
                                        onBlur={onBlur}
                                        required
                                    />
                                    {touched.email && errors.email && (
                                        <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Password Field */}
                                <div>
                                    <input
                                        id="password"
                                        className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 text-sm placeholder-gray-400 transition-all duration-200 focus:outline-none ${touched.password && errors.password
                                            ? 'border-red-400 focus:border-red-500 bg-red-50'
                                            : 'border-gray-300 focus:border-blue-500 bg-white'
                                            }`}
                                        type="password"
                                        name="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={onChange}
                                        onBlur={onBlur}
                                        required
                                    />
                                    {touched.password && errors.password && (
                                        <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password}</p>
                                    )}
                                </div>

                                {/* Confirm Password Field */}
                                <div>
                                    <input
                                        id="confirmPassword"
                                        className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 text-sm placeholder-gray-400 transition-all duration-200 focus:outline-none ${touched.confirmPassword && errors.confirmPassword
                                            ? 'border-red-400 focus:border-red-500 bg-red-50'
                                            : 'border-gray-300 focus:border-blue-500 bg-white'
                                            }`}
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={onChange}
                                        onBlur={onBlur}
                                        required
                                    />
                                    {touched.confirmPassword && errors.confirmPassword && (
                                        <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.confirmPassword}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Phone Field */}
                                <div>
                                    <input
                                        id="phone"
                                        className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 text-sm placeholder-gray-400 transition-all duration-200 focus:outline-none ${touched.phone && errors.phone
                                            ? 'border-red-400 focus:border-red-500 bg-red-50'
                                            : 'border-gray-300 focus:border-blue-500 bg-white'
                                            }`}
                                        type="text"
                                        name="phone"
                                        placeholder="Phone Number"
                                        value={phone}
                                        onChange={onChange}
                                        onBlur={onBlur}
                                        required
                                    />
                                    {touched.phone && errors.phone && (
                                        <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.phone}</p>
                                    )}
                                </div>
                                 <div>
                                     {/* Latitude/Longitude hidden inputs already implicitly stored in state and sent via data.append */}
                                 </div>
                             </div>
 
                             {/* Dedicated Live Location Field */}
                             <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 mb-2">
                                 <div className="flex items-center gap-3 min-w-0">
                                     <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                         <MapPin size={20} className="text-blue-600" />
                                     </div>
                                     <div className="min-w-0 flex-1">
                                         <p className="text-sm font-bold text-gray-900 leading-tight">Live Location</p>
                                         <p className="text-[11px] text-gray-500 truncate">
                                             {address ? 'Location Pinned' : 'Pin your exact spot'}
                                         </p>
                                     </div>
                                 </div>
                                 <div className="flex gap-2 shrink-0">
                                     <button
                                         type="button"
                                         onClick={handleLocateMe}
                                         disabled={isLocating}
                                         className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 font-bold text-xs transition-all ${
                                             isLocating 
                                             ? 'bg-blue-50 border-blue-200 text-blue-400 cursor-wait' 
                                             : 'bg-white border-gray-200 hover:border-blue-500 hover:text-blue-500 text-gray-600 active:scale-95 shadow-sm'
                                         }`}
                                     >
                                         <Navigation size={14} className={isLocating ? 'animate-pulse' : ''} />
                                         {isLocating ? 'Locating...' : 'Locate Me'}
                                     </button>
                                     <button
                                         type="button"
                                         onClick={() => setShowMapModal(true)}
                                         className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-500 hover:text-blue-500 text-gray-600 font-bold text-xs transition-all active:scale-95 shadow-sm"
                                     >
                                         <MapIcon size={14} />
                                         Map
                                     </button>
                                 </div>
                             </div>

                            {/* Address Field */}
                            <div>
                                <textarea
                                    id="address"
                                    className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 text-sm placeholder-gray-400 transition-all duration-200 focus:outline-none resize-none ${touched.address && errors.address
                                        ? 'border-red-400 focus:border-red-500 bg-red-50'
                                        : 'border-gray-200 bg-white'
                                        }`}
                                    name="address"
                                    placeholder="Full Address (Auto-filled via Live Location)"
                                    value={address}
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    required
                                    rows="2"
                                ></textarea>
                                <p className="text-[10px] text-gray-400 mt-1 italic">* Please use "Locate Me" or "Map" to fill your address automatically.</p>
                                {touched.address && errors.address && (
                                    <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.address}</p>
                                )}
                            </div>

                            {/* Worker specific fields */}
                            {role === 'worker' && (
                                <div className="space-y-4 pt-2">
                                    <p className="text-sm font-semibold text-gray-700">Worker Details</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <select
                                                id="profession"
                                                className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 text-sm transition-all duration-200 focus:outline-none ${touched.profession && errors.profession
                                                    ? 'border-red-400 focus:border-red-500 bg-red-50'
                                                    : 'border-gray-300 focus:border-blue-500 bg-white'
                                                    }`}
                                                name="profession"
                                                value={profession}
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                required
                                            >
                                                <option value="">Select Profession</option>
                                                {services.map(s => (
                                                    <option key={s._id} value={s.name}>{s.name}</option>
                                                ))}
                                                <option value="Other">Other</option>
                                            </select>
                                            {touched.profession && errors.profession && (
                                                <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.profession}</p>
                                            )}
                                        </div>
                                        <div>
                                            <input
                                                id="experience"
                                                className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 text-sm placeholder-gray-400 transition-all duration-200 focus:outline-none ${touched.experience && errors.experience
                                                    ? 'border-red-400 focus:border-red-500 bg-red-50'
                                                    : 'border-gray-300 focus:border-blue-500 bg-white'
                                                    }`}
                                                type="text"
                                                name="experience"
                                                placeholder="Job Experience (e.g., 5 years)"
                                                value={experience}
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                required
                                            />
                                            {touched.experience && errors.experience && (
                                                <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.experience}</p>
                                            )}
                                        </div>
                                    </div>


                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 block mb-1.5">Profile Photo</label>
                                        <input className="w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors" type="file" name="photo" onChange={onFileChange} accept="image/*" />
                                    </div>
                                </div>
                            )}

                            {/* Sign Up Button */}
                            <button
                                className={`w-full py-3.5 px-4 mt-4 font-semibold rounded-xl transition-all duration-200 text-white text-base shadow-md ${isFormValid()
                                    ? 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
                                    : 'bg-blue-400 cursor-not-allowed'
                                    }`}
                                type="submit"
                                disabled={!isFormValid()}
                            >
                                Create Account
                            </button>
                        </form>

                        {/* Sign In Link */}
                        <div className="mt-5 text-center">
                            <p className="text-gray-600 text-sm">
                                Already have an account?{' '}
                                <Link to="/login" className="text-blue-600 font-semibold hover:underline transition-colors">
                                    Sign in
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
            {/* Custom scrollbar styling for the form */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 10px;
                }
            `}</style>
            {/* Map Selection Modal */}
            <MapModal 
                isOpen={showMapModal}
                onClose={() => setShowMapModal(false)}
                onSelect={handleLocationSelect}
                initialLocation={{ lat: latitude, lng: longitude, address: address }}
            />

            {/* Mock Payment Modal */}
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
                            {/* Decorative Header */}
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
                                        <p className="text-gray-500 font-medium">Your platform fee has been processed.</p>
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
                                                    One-time Fee
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
                                        <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <svg className="w-3.5 h-3.5 text-green-500 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                                            256-bit SSL Encryption
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

export default Register;
