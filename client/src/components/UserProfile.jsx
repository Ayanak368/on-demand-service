import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const UserProfile = () => {
    const { token } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({});
    const [photo, setPhoto] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('http://localhost:5001/api/users/me', {
                    headers: { 'x-auth-token': token }
                });
                const data = await res.json();
                setProfile(data);
                setEditData({
                    name: data.name,
                    phone: data.phone,
                    address: data.address,
                    profession: data.profession,
                    experience: data.experience,
                    location: data.location
                });
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        if (token) fetchProfile();
    }, [token]);

    const handleEditChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setPhoto(e.target.files[0]);
    };

    const saveProfile = async () => {
        const formData = new FormData();
        Object.keys(editData).forEach(key => formData.append(key, editData[key]));
        if (photo) formData.append('photo', photo);

        try {
            const res = await fetch('http://localhost:5001/api/users/profile', {
                method: 'PUT',
                headers: { 'x-auth-token': token },
                body: formData
            });
            if (!res.ok) {
                const errData = await res.json();
                console.error('Update Profile Failed:', errData);
                alert(`Update failed: ${errData.msg || 'Unknown error'}`);
                return;
            }
            const updatedProfile = await res.json();
            setProfile(updatedProfile);
            setEditMode(false);
            alert('Profile updated successfully!');
        } catch (err) {
            console.error(err);
        }
    };

    console.log('UserProfile Render. EditMode:', editMode);

    if (loading) return <div>Loading Profile...</div>;
    if (!profile) return <div>Error loading profile.</div>;

    return (
        <div className="user-profile">
            <div className="profile-section">
                <h2>My Profile</h2>
                {editMode ? (
                    <div className="edit-profile-form">
                        <div className="form-group">
                            <label>Profile Photo:</label>
                            <input type="file" onChange={handleFileChange} />
                        </div>
                        <input type="text" name="name" value={editData.name} onChange={handleEditChange} placeholder="Name" />
                        <input type="text" name="phone" value={editData.phone} onChange={handleEditChange} placeholder="Phone" />
                        <textarea name="address" value={editData.address} onChange={handleEditChange} placeholder="Address" />
                        {profile.role === 'worker' && (
                            <>
                                <input type="text" name="profession" value={editData.profession} onChange={handleEditChange} placeholder="Profession" />
                                <input type="text" name="experience" value={editData.experience} onChange={handleEditChange} placeholder="Experience" />
                            </>
                        )}
                        <input type="text" name="location" value={editData.location} onChange={handleEditChange} placeholder="Location" />
                        <button onClick={saveProfile} className="btn btn-primary">Save Changes</button>
                        <button onClick={() => setEditMode(false)} className="btn btn-secondary">Cancel</button>
                    </div>
                ) : (
                    <div className="profile-display">
                        {profile.photo && <img src={`http://localhost:5001/${profile.photo.replace(/\\/g, '/')}`} alt="Profile" className="profile-photo" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%' }} />}
                        <h3>{profile.name} {profile.role === 'worker' && <span className="badge badge-secondary">{profile.profession}</span>}</h3>
                        {profile.role === 'worker' && <p><strong>Experience:</strong> {profile.experience}</p>}
                        <p><strong>Location:</strong> {profile.location}</p>
                        <p><strong>Phone:</strong> {profile.phone}</p>
                        <p><strong>Address:</strong> {profile.address}</p>
                        <button onClick={() => setEditMode(true)} className="btn btn-outline-primary">Edit Profile</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
