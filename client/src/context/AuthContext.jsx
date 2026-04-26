import { createContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(sessionStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Auth Modal State
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalView, setAuthModalView] = useState('login'); // 'login' or 'register'

    const openAuthModal = useCallback((view = 'login') => {
        setAuthModalView(view);
        setIsAuthModalOpen(true);
    }, []);

    const closeAuthModal = useCallback(() => {
        setIsAuthModalOpen(false);
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                try {
                    const res = await fetch('http://localhost:5001/api/users/me', {
                        headers: { 'x-auth-token': token }
                    });
                    if (res.ok) {
                        const userData = await res.json();
                        setUser(userData);
                        sessionStorage.setItem('user', JSON.stringify(userData));
                    } else {
                        const storedUser = JSON.parse(sessionStorage.getItem('user'));
                        if (storedUser) setUser(storedUser);
                    }
                } catch (err) {
                    const storedUser = JSON.parse(sessionStorage.getItem('user'));
                    if (storedUser) setUser(storedUser);
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, [token]);

    const login = useCallback((userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        sessionStorage.setItem('token', authToken);
        sessionStorage.setItem('user', JSON.stringify(userData));
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
    }, []);

    return (
        <AuthContext.Provider value={{
            user, token, login, logout, loading,
            isAuthModalOpen, authModalView, openAuthModal, closeAuthModal
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
