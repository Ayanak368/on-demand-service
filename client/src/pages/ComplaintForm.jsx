import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ComplaintForm = () => {
    const [formData, setFormData] = useState({
        workerId: '', // Ideally selected from a list or pre-filled if navigating from a completed job
        subject: '',
        description: ''
    });
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    const { workerId, subject, description } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            await fetch('http://localhost:5001/api/complaints', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(formData)
            });
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="container">
            <h1>Submit a Complaint</h1>
            <form onSubmit={onSubmit}>
                {/* Simplified for demo: Worker ID input manually for now, or we can fetch workers */}
                <input type="text" placeholder="Worker ID (Optional)" name="workerId" value={workerId} onChange={onChange} />
                <input type="text" placeholder="Subject" name="subject" value={subject} onChange={onChange} required />
                <textarea placeholder="Description" name="description" value={description} onChange={onChange} required rows="5"></textarea>
                <button type="submit" className="btn btn-primary">Submit Complaint</button>
            </form>
        </div>
    );
};

export default ComplaintForm;
