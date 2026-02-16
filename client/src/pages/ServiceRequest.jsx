import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ServiceRequest = () => {
    const [formData, setFormData] = useState({
        serviceType: 'Electrician',
        details: '',
        location: ''
    });

    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    const { serviceType, details, location } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5001/api/service-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert('Request Created Successfully');
                navigate('/dashboard');
            } else {
                alert('Error creating request');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="service-request-form">
            <h2>Request a Service</h2>
            <form onSubmit={onSubmit}>
                <label>Service Type</label>
                <select name="serviceType" value={serviceType} onChange={onChange}>
                    <option value="Electrician">Electrician</option>
                    <option value="Plumber">Plumber</option>
                    <option value="Cleaner">Cleaner</option>
                    <option value="Mover">Mover</option>
                    <option value="Other">Other</option>
                </select>
                <textarea placeholder="Describe your issue..." name="details" value={details} onChange={onChange} required />
                <input type="text" placeholder="Location" name="location" value={location} onChange={onChange} required />
                <button type="submit">Submit Request</button>
            </form>
        </div>
    );
};

export default ServiceRequest;
