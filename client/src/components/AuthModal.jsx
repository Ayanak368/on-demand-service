import { useContext, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import AuthContext from '../context/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';

const AuthModal = () => {
    const { isAuthModalOpen, authModalView, closeAuthModal } = useContext(AuthContext);

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') closeAuthModal();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [closeAuthModal]);

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isAuthModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isAuthModalOpen]);

    if (!isAuthModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={closeAuthModal}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">

                {/* Close Button */}
                <button
                    onClick={closeAuthModal}
                    className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Close modal"
                >
                    <MdClose size={24} />
                </button>

                {/* Scrollable Container for Form */}
                <div className="overflow-y-auto w-full max-h-full auth-modal-content custom-scrollbar">
                    {authModalView === 'login' ? <Login isModal={true} /> : <Register isModal={true} />}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
