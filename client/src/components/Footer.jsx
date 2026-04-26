import { Link } from 'react-router-dom';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';

const Footer = () => {
    return (
        <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                    <div className="col-span-1 md:col-span-1">
                        <span className="text-xl font-bold text-gray-900 tracking-tight block mb-4">On-Demand</span>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Connecting you with trusted professionals for your home and business. Fast, reliable, and secure.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Services</h4>
                        <ul className="flex flex-col gap-3 text-sm text-gray-600">
                            <li><Link to="/#services" className="hover:text-blue-600">Cleaning</Link></li>
                            <li><Link to="/#services" className="hover:text-blue-600">Electrical</Link></li>
                            <li><Link to="/#services" className="hover:text-blue-600">Plumbing</Link></li>
                            <li><Link to="/#services" className="hover:text-blue-600">Moving</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Company</h4>
                        <ul className="flex flex-col gap-3 text-sm text-gray-600">
                            <li><Link to="/#about" className="hover:text-blue-600">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-blue-600">Contact</Link></li>
                            <li><span className="hover:text-blue-600 cursor-pointer">Privacy Policy</span></li>
                            <li><span className="hover:text-blue-600 cursor-pointer">Terms of Service</span></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Contact</h4>
                        <ul className="flex flex-col gap-3 text-sm text-gray-600">
                            <li className="flex items-center gap-2"><MdLocationOn className="text-gray-400" /> Tech City, TC 10010</li>
                            <li className="flex items-center gap-2"><MdPhone className="text-gray-400" /> +1 (800) 123-4567</li>
                            <li className="flex items-center gap-2"><MdEmail className="text-gray-400" /> support@ondemand.com</li>
                        </ul>
                    </div>

                </div>

                <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} On-Demand Platform. All rights reserved.</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <a href="#" className="hover:text-gray-900">Twitter</a>
                        <a href="#" className="hover:text-gray-900">LinkedIn</a>
                        <a href="#" className="hover:text-gray-900">Facebook</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
