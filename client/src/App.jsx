import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ServiceRequest from './pages/ServiceRequest';
import './App.css';
import './index.css';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardView from './pages/admin/Dashboard';
import Workers from './pages/admin/Workers';
import Customers from './pages/admin/Customers';
import Complaints from './pages/admin/Complaints';
import Reports from './pages/admin/Reports';
import Feedback from './pages/admin/Feedback';
import ManageOffers from './pages/admin/ManageOffers';
import Services from './pages/admin/Services';
import Payments from './pages/admin/Payments';

import ComplaintForm from './pages/ComplaintForm';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ErrorBoundary from './ErrorBoundary';
import AuthModal from './components/AuthModal';

import AuthContext from './context/AuthContext';

const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const { user, logout } = React.useContext(AuthContext);

  React.useEffect(() => {
    const handlePopState = () => {
      if (user) {
        logout();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user, logout]);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isCustomerDashboard = location.pathname.startsWith('/dashboard') && user?.role === 'customer';
  const isWorkerDashboard = location.pathname.startsWith('/dashboard') && user?.role === 'worker';

  const hideGlobalLayout = isAdminRoute || isCustomerDashboard || isWorkerDashboard;

  return (
    <div className="App flex flex-col min-h-screen relative">
      <AuthModal />
      {!hideGlobalLayout && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {!hideGlobalLayout && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <LayoutWrapper>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<PrivateRoute><ErrorBoundary><Dashboard /></ErrorBoundary></PrivateRoute>} />
            <Route path="/service-request" element={<PrivateRoute><ServiceRequest /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
              <Route index element={<AdminDashboardView />} />
              <Route path="workers" element={<Workers />} />
              <Route path="customers" element={<Customers />} />
              <Route path="complaints" element={<Complaints />} />
              <Route path="reports" element={<Reports />} />
              <Route path="feedback" element={<Feedback />} />
              <Route path="offers" element={<ManageOffers />} />
              <Route path="services" element={<Services />} />
              <Route path="payments" element={<Payments />} />
            </Route>

            <Route path="/complaint" element={<PrivateRoute><ComplaintForm /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Routes>
        </LayoutWrapper>
      </Router>
    </AuthProvider>
  );
}

export default App;
