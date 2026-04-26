import { useContext, useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MdOutlineCleaningServices, MdPlumbing, MdElectricalServices, MdOutlineLocalShipping, MdCheckCircle, MdSpeed, MdSecurity, MdAttachMoney } from 'react-icons/md';
import { Star } from 'lucide-react';
import heroImg from '../assets/hero-workers.png';

const Home = () => {
    const { hash } = useLocation();
    const navigate = useNavigate();
    const { openAuthModal } = useContext(AuthContext);
    const [feedbacks, setFeedbacks] = useState([]);
    const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const res = await fetch('http://localhost:5001/api/platform-feedback');
                if (res.ok) {
                    const data = await res.json();
                    const topFeedbacks = data.filter(f => f.rating >= 4);
                    if (topFeedbacks.length > 0) {
                        setFeedbacks(topFeedbacks.slice(0, 5));
                    }
                }
            } catch (err) {
                console.error("Error fetching feedbacks", err);
            }
        };
        fetchFeedbacks();
    }, []);

    useEffect(() => {
        if (feedbacks.length <= 1 || isHovered) return;

        const interval = setInterval(() => {
            setCurrentFeedbackIndex(prev => (prev + 1) % feedbacks.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [feedbacks.length, isHovered]);

    const handleManualChange = (index) => {
        setCurrentFeedbackIndex(index);
    };

    useEffect(() => {
        if (hash) {
            const id = hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [hash]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800">
            {/* HERO SECTION */}
            <section className="relative pt-12 md:pt-20 pb-16 md:pb-24 px-4 sm:px-8 xl:px-12 overflow-hidden w-full flex justify-center">
                <div className="max-w-[1800px] w-full flex flex-col md:flex-row items-center gap-10 lg:gap-14 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex-1 text-center md:text-left"
                    >
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-white border border-blue-100/50 text-blue-700 text-sm font-bold mb-6 shadow-sm uppercase tracking-widest"
                        >
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            Smart Home Services
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="text-[2.75rem] md:text-[4rem] font-black text-slate-900 leading-[1.05] mb-6 tracking-tight"
                        >
                            Reliable Professionals <br className="hidden md:block" /> at Your Fingertips
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="text-[17px] md:text-[1.125rem] text-slate-600 mb-10 max-w-lg mx-auto md:mx-0 font-medium leading-[1.7]"
                        >
                            Book vetted and highly-rated experts for cleaning, plumbing, electrical, and moving services in just a few clicks.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start"
                        >
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full sm:w-auto bg-[#2563EB] text-white font-bold text-[16px] py-4 px-10 rounded-[14px] shadow-[0_8px_24px_-8px_rgba(37,99,235,0.5)] hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95 transition-all focus:outline-none"
                            >
                                Book a Service
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full sm:w-auto bg-white text-slate-800 font-bold text-[16px] py-4 px-10 rounded-[14px] border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center focus:outline-none shadow-sm"
                            >
                                Login as Worker
                            </button>
                        </motion.div>
                    </motion.div>

                    <div className="flex-1 hidden md:flex justify-center relative items-center w-full min-w-[45%]">
                        <div className="absolute w-[30rem] h-[30rem] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute w-[24rem] h-[24rem] bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 top-1/2 left-1/4 -translate-y-2/3"></div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="relative w-full z-10"
                        >
                            <motion.img
                                src={heroImg}
                                alt="Professional Workers"
                                className="w-full h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.1)] object-contain max-h-[550px]"
                                animate={{ y: [0, -12, 0] }}
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* SERVICES */}
            <section id="services" className="py-16 md:py-24 px-4 sm:px-8 xl:px-12 flex justify-center w-full z-10 relative">
                <div className="max-w-[1800px] w-full">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-[2rem] md:text-[2.75rem] font-black text-slate-900 mb-4 md:mb-6 tracking-tight">Our Services</h2>
                        <p className="text-[17px] text-slate-500 font-medium max-w-2xl mx-auto leading-[1.7]">Select from our wide range of professional household services, delivered by vetted experts.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {[
                            { title: 'Cleaning', desc: 'Deep home cleaning and sanitization services.', icon: <MdOutlineCleaningServices />, color: 'blue' },
                            { title: 'Electrical', desc: 'Safe repairs and new installation services.', icon: <MdElectricalServices />, color: 'purple' },
                            { title: 'Plumbing', desc: 'Fix leaks, emergency repairs, and pipe installations.', icon: <MdPlumbing />, color: 'green' },
                            { title: 'Moving', desc: 'Professional packing and secure relocation help.', icon: <MdOutlineLocalShipping />, color: 'orange' }
                        ].map((service, idx) => (
                            <div key={idx} className="bg-white p-8 lg:p-10 rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group flex flex-col items-start">
                                <div className={`w-14 h-14 bg-${service.color}-50 text-${service.color}-500 rounded-[18px] flex items-center justify-center text-[26px] mb-6 md:mb-8 group-hover:bg-${service.color}-500 group-hover:text-white transition-colors duration-300 shrink-0`}>
                                    {service.icon}
                                </div>
                                <h4 className="text-[20px] font-bold text-slate-900 mb-3 md:mb-4">{service.title}</h4>
                                <p className="text-[15px] font-medium text-slate-500 mb-6 md:mb-8 leading-[1.6] flex-1">{service.desc}</p>
                                <button onClick={() => navigate('/register')} className={`text-${service.color}-600 font-bold text-[15px] tracking-wide group-hover:text-${service.color}-700 transition-colors inline-flex items-center gap-1 focus:outline-none`}>
                                    Book Now <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="py-16 md:py-24 px-4 sm:px-8 xl:px-12 bg-white border-y border-slate-100 flex justify-center w-full">
                <div className="max-w-[1800px] w-full">
                    <div className="text-center mb-16 md:mb-20">
                        <h2 className="text-[2rem] md:text-[2.75rem] font-black text-slate-900 mb-4 md:mb-6 tracking-tight">How It Works</h2>
                        <p className="text-[17px] text-slate-500 font-medium">Simple, fast, and secure booking process.</p>
                    </div>

                    <div className="relative max-w-5xl mx-auto">
                        <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-[2px] bg-slate-100 z-0"></div>
                        <div className="grid md:grid-cols-3 gap-12 lg:gap-20 text-center relative z-10">
                            {[
                                { step: 1, title: 'Choose Service', desc: 'Select the exact help you need from our list of trusted experts.' },
                                { step: 2, title: 'Get Matched', desc: 'We instantly notify the best available professionals nearby.' },
                                { step: 3, title: 'Job Done', desc: 'The professional arrives and finishes the job safely and securely.' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex flex-col items-center">
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-[28px] font-black mb-6 md:mb-8 ${idx === 2 ? 'bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)]' : 'bg-[#F8FAFC] border-[4px] border-white text-slate-800 shadow-[0_4px_16px_rgba(0,0,0,0.06)]'}`}>
                                        {item.step}
                                    </div>
                                    <h4 className="text-[20px] font-bold text-slate-900 mb-3 md:mb-4">{item.title}</h4>
                                    <p className="text-[15px] text-slate-500 leading-[1.6] max-w-[260px]">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* WHY US */}
            <section id="about" className="py-16 md:py-24 px-4 sm:px-8 xl:px-12 flex justify-center w-full">
                <div className="max-w-[1800px] w-full grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <div>
                        <h2 className="text-[2rem] md:text-[2.75rem] font-black text-slate-900 mb-6 md:mb-8 tracking-tight leading-[1.1]">Why Choose Our Platform?</h2>
                        <p className="text-[17px] text-slate-500 font-medium mb-12 md:mb-16 leading-[1.7] max-w-lg">
                            We take the stress out of hiring local help by providing a secure, reliable, and transparent marketplace.
                        </p>
                        <div className="flex flex-col gap-6 md:gap-8">
                            {[
                                { icon: <MdCheckCircle />, colorClasses: 'bg-emerald-50 text-emerald-500', title: 'Verified Pros', desc: 'Every worker is deeply vetted and rigorously rated by the community.' },
                                { icon: <MdSecurity />, colorClasses: 'bg-blue-50 text-blue-500', title: 'Secure Payments', desc: 'Your details are safe. Pay only when the job is completely done.' },
                                { icon: <MdAttachMoney />, colorClasses: 'bg-indigo-50 text-indigo-500', title: 'Fair Pricing', desc: 'Transparent upfront rates giving you peace of mind with no hidden fees.' }
                            ].map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-5 md:gap-6 bg-white p-6 md:p-8 rounded-[24px] border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-blue-100 hover:shadow-[0_8px_24px_-10px_rgba(0,0,0,0.06)] transition-all">
                                    <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center ${feature.colorClasses} text-[28px] shrink-0`}>
                                        {feature.icon}
                                    </div>
                                    <div className="pt-1">
                                        <h5 className="font-bold text-slate-900 text-[18px] mb-2">{feature.title}</h5>
                                        <p className="text-[15px] font-medium text-slate-500 leading-[1.6]">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div
                        className="bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/40 rounded-[32px] p-6 md:p-10 lg:p-12 border border-blue-100/80 flex flex-col items-center justify-center min-h-[420px] md:min-h-[500px] overflow-hidden relative shadow-[inset_0_2px_20px_rgba(255,255,255,1)]"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        {/* Huge decorative quote mark watermark */}
                        <div className="absolute top-4 left-6 md:left-8 text-[120px] md:text-[160px] text-blue-200/40 leading-none font-serif select-none pointer-events-none">&ldquo;</div>

                        {feedbacks.length > 0 ? (
                            <>
                                <div className="relative w-full h-[260px] flex items-center justify-center z-10 mt-4 md:mt-8">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentFeedbackIndex}
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                            className="bg-white p-8 md:p-12 rounded-[24px] md:rounded-[32px] border border-slate-100/80 shadow-[0_20px_40px_-16px_rgba(0,0,0,0.1),0_0_10px_rgba(37,99,235,0.02)] text-left max-w-[540px] w-full absolute"
                                        >
                                            <div className="flex items-center gap-4 md:gap-5 mb-6 md:mb-8">
                                                <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold uppercase text-[18px] shadow-[0_4px_12px_rgba(37,99,235,0.3)] shrink-0">
                                                    {feedbacks[currentFeedbackIndex].customer?.name?.charAt(0) || 'A'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 capitalize text-[17px] md:text-[18px] tracking-tight">{feedbacks[currentFeedbackIndex].customer?.name || 'Anonymous'}</p>
                                                    <div className="flex items-center gap-1 text-amber-400 mt-1 md:mt-1.5">
                                                        {[1, 2, 3, 4, 5].map(i => (
                                                            <Star key={i} size={16} className={i <= feedbacks[currentFeedbackIndex].rating ? "fill-current" : "text-slate-100 fill-current"} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-slate-600 text-[16px] md:text-[18px] leading-[1.8] font-medium line-clamp-3">"{feedbacks[currentFeedbackIndex].feedback}"</p>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                {/* Refined Navigation Dots */}
                                {feedbacks.length > 1 && (
                                    <div className="flex gap-2.5 mt-8 md:mt-10 z-10 relative">
                                        {feedbacks.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleManualChange(idx)}
                                                className={`h-2 rounded-full transition-all duration-300 focus:outline-none ${currentFeedbackIndex === idx ? 'bg-blue-600 w-10 shadow-[0_2px_8px_rgba(37,99,235,0.4)]' : 'bg-slate-300 w-2.5 hover:bg-slate-400'}`}
                                                aria-label={`Go to slide ${idx + 1}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-white p-8 md:p-12 rounded-[24px] md:rounded-[32px] border border-slate-100/80 shadow-[0_20px_40px_-16px_rgba(0,0,0,0.1)] text-left w-full max-w-[540px] relative z-10 mt-4 md:mt-8">
                                <div className="flex items-center gap-4 md:gap-5 mb-6 md:mb-8">
                                    <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold uppercase text-[18px] shadow-[0_4px_12px_rgba(37,99,235,0.3)] shrink-0">
                                        SJ
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-[17px] md:text-[18px] tracking-tight">Sarah Jenkins</p>
                                        <div className="flex items-center gap-1 text-amber-400 mt-1 md:mt-1.5">
                                            <Star size={16} className="fill-current" /><Star size={16} className="fill-current" /><Star size={16} className="fill-current" /><Star size={16} className="fill-current" /><Star size={16} className="fill-current" />
                                        </div>
                                    </div>
                                </div>
                                <p className="text-slate-600 text-[16px] md:text-[18px] leading-[1.8] font-medium line-clamp-3">"The plumber arrived in 30 minutes and fixed the leak perfectly. Incredibly easy to use!"</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-12 md:py-16 px-4 sm:px-8 xl:px-12 flex justify-center w-full">
                <div className="max-w-[1800px] w-full bg-blue-600 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] md:rounded-[2.5rem] py-16 md:py-20 px-4 md:px-6 relative overflow-hidden shadow-[0_20px_60px_-16px_rgba(37,99,235,0.4)] flex flex-col items-center text-center">
                    {/* Decorative glowing shapes inside CTA rounded box */}
                    <div className="absolute w-[30rem] md:w-[40rem] h-[30rem] md:h-[40rem] bg-blue-400/30 rounded-full blur-3xl -top-1/4 -right-1/4 z-0 pointer-events-none mix-blend-lighten"></div>
                    <div className="absolute w-[20rem] md:w-[30rem] h-[20rem] md:h-[30rem] bg-indigo-500/30 rounded-full blur-3xl -bottom-1/4 -left-1/4 z-0 pointer-events-none mix-blend-lighten"></div>
                    
                    <div className="relative z-10 flex flex-col items-center">
                        <h2 className="text-[2rem] md:text-[3.5rem] font-black mb-6 md:mb-8 tracking-tight text-white drop-shadow-md">Ready to get started?</h2>
                        <p className="text-[17px] md:text-[20px] font-medium text-blue-100 mb-8 md:mb-10 max-w-2xl leading-relaxed text-center drop-shadow-sm">Join thousands of users booking secure, reliable local services today.</p>
                        <button onClick={() => navigate('/register')} className="bg-white text-blue-700 font-bold text-[17px] py-4 px-12 md:px-16 min-w-[280px] rounded-[16px] shadow-[0_12px_30px_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:bg-slate-50 active:scale-95 transition-all inline-flex justify-center items-center focus:outline-none">
                            Create Free Account
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
