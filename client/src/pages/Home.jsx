import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Verify path
// Import images if generated, otherwise use placeholders

const Home = () => {
    return (
        <div className="home-page">
            <header className="hero-section">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1>Your Local Workforce, On Demand.</h1>
                    <p>Connect with trusted professionals for all your home service needs. Fast, reliable, and secure.</p>
                    <div className="hero-buttons">
                        <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
                        <Link to="/register" className="btn btn-outline btn-lg">Book a Service</Link>
                    </div>
                </div>
            </header>

            <section className="features-section">
                <h2>Why Choose Us?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="icon">⚡</div>
                        <h3>Fast Service</h3>
                        <p>Get connected with a worker in minutes.</p>
                    </div>
                    <div className="feature-card">
                        <div className="icon">🛡️</div>
                        <h3>Secure Payment</h3>
                        <p>Your money is safe until the job is done.</p>
                    </div>
                    <div className="feature-card">
                        <div className="icon">⭐</div>
                        <h3>Vetted Pros</h3>
                        <p>All workers are background checked and rated.</p>
                    </div>
                </div>
            </section>

            <section className="services-preview">
                <h2>Popular Services</h2>
                <div className="services-grid">
                    <div className="service-item">Plumbing</div>
                    <div className="service-item">Electrical</div>
                    <div className="service-item">Cleaning</div>
                    <div className="service-item">Moving</div>
                </div>
            </section>
        </div>
    );
};

export default Home;
