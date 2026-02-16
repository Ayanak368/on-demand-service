import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        role: 'customer',
        profession: '',
        location: 'Local',
        experience: ''
    });
    const [photo, setPhoto] = useState(null);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const { name, email, password, phone, address, role, profession, location, experience } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onFileChange = e => {
        setPhoto(e.target.files[0]);
    };

    const onSubmit = async e => {
        e.preventDefault();
        console.log('Register form submitted');

        const data = new FormData();
        data.append('name', name);
        data.append('email', email);
        data.append('password', password);
        data.append('phone', phone);
        data.append('address', address);
        data.append('role', role);
        data.append('location', location);

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
                body: data // FormData automatically sets content-type to multipart/form-data
            });
            const resData = await res.json();
            if (res.ok) {
                alert('Registration successful! Please login.');
                navigate('/login');
            } else {
                alert(resData.msg || 'Registration failed');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="register-form">
            <h2>Register</h2>
            <form onSubmit={onSubmit}>
                <input type="text" placeholder="Name" name="name" value={name} onChange={onChange} required />
                <input type="email" placeholder="Email" name="email" value={email} onChange={onChange} required />
                <input type="password" placeholder="Password" name="password" value={password} onChange={onChange} required />
                <input type="text" placeholder="Phone Number" name="phone" value={phone} onChange={onChange} required />
                <textarea placeholder="Address" name="address" value={address} onChange={onChange} required rows="3"></textarea>
                <select name="role" value={role} onChange={onChange}>
                    <option value="customer">Customer</option>
                    <option value="worker">Worker</option>
                </select>
                {role === 'worker' && (
                    <>
                        <select name="profession" value={profession} onChange={onChange} required>
                            <option value="">Select Profession</option>
                            <option value="Electrician">Electrician</option>
                            <option value="Plumber">Plumber</option>
                            <option value="Cleaner">Cleaner</option>
                            <option value="Mover">Mover</option>
                            <option value="Other">Other</option>
                        </select>
                        <input type="text" placeholder="Job Experience (e.g. 5 years)" name="experience" value={experience} onChange={onChange} required />
                        <label>Profile Photo:</label>
                        <input type="file" name="photo" onChange={onFileChange} accept="image/*" />
                    </>
                )}
                <input type="text" placeholder="Location" name="location" value={location} onChange={onChange} />
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;
