import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Pencil, Save, X } from 'lucide-react';

const UserProfile = () => {
    const { token } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({});
    const [photo, setPhoto] = useState(null);
    const [error, setError] = useState('');

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
        if (e.target.name === 'phone') {
            // Only allow numbers, max 10 digits
            let value = e.target.value.replace(/[^0-9]/g, '');
            if (value.length > 10) value = value.slice(0, 10);
            setEditData({ ...editData, phone: value });
        } else {
            setEditData({ ...editData, [e.target.name]: e.target.value });
        }
    };

    const handleFileChange = (e) => {
        setPhoto(e.target.files[0]);
    };

    const saveProfile = async () => {
        setError('');
        if (!editData.phone || editData.phone.length < 10) {
            setError('Phone number must be exactly 10 digits.');
            return;
        }
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
        <div className="user-profile animate-fade-in" style={{ maxWidth: 500, margin: '40px auto', background: '#fff', borderRadius: 24, boxShadow: '0 8px 32px rgba(0,123,255,0.10)', padding: '40px 28px 32px 28px' }}>
            <div className="profile-section">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
                    {profile.photo ? (
                        <img src={`http://localhost:5001/${profile.photo.replace(/\\/g, '/')}`} alt="Profile" className="profile-photo" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,123,255,0.10)' }} />
                    ) : (
                        <div style={{ width: 120, height: 120, borderRadius: '50%', background: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, color: '#007bff', fontWeight: 700, marginBottom: 8 }}>
                            {profile.name ? profile.name[0].toUpperCase() : '?'}
                        </div>
                    )}
                    <h2 style={{ color: '#007bff', fontWeight: 700, margin: '12px 0 0 0' }}>My Profile</h2>
                </div>
                {editMode ? (
                    <div className="edit-profile-form animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className="form-group" style={{ marginBottom: 10 }}>
                            <label style={{ fontWeight: 600, color: '#555' }}>Profile Photo:</label>
                            <input type="file" onChange={handleFileChange} />
                        </div>
                        <input type="text" name="name" value={editData.name} onChange={handleEditChange} placeholder="Name" className="auth-input" />
                        <input
                            type="text"
                            name="phone"
                            value={editData.phone}
                            onChange={handleEditChange}
                            placeholder="Phone"
                            className="auth-input"
                            maxLength={10}
                            pattern="[0-9]{10}"
                            inputMode="numeric"
                        />
                        {error && <div style={{ color: 'red', fontSize: '0.98rem', marginBottom: 4 }}>{error}</div>}
                        <textarea name="address" value={editData.address} onChange={handleEditChange} placeholder="Address" className="auth-input" />
                        {profile.role === 'worker' && (
                            <>
                                <input type="text" name="profession" value={editData.profession} onChange={handleEditChange} placeholder="Profession" className="auth-input" />
                                <input type="text" name="experience" value={editData.experience} onChange={handleEditChange} placeholder="Experience" className="auth-input" />
                            </>
                        )}
                        <input type="text" name="location" value={editData.location} onChange={handleEditChange} placeholder="Location" className="auth-input" />
                        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                            <button onClick={() => setEditMode(false)} className="flex items-center justify-center gap-2 bg-white text-blue-600 border border-blue-600 font-medium px-4 py-1.5 text-sm rounded-lg hover:bg-blue-50 transition-all duration-300 ease-in-out active:scale-95 whitespace-nowrap" style={{ flex: 1, height: '40px' }}>
                                <X size={16} /> Cancel
                            </button>
                            <button onClick={saveProfile} className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white font-medium px-5 py-1.5 text-sm rounded-lg shadow-[0_4px_10px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_15px_rgba(37,99,235,0.4)] hover:scale-[1.03] hover:brightness-95 transition-all duration-300 ease-in-out active:scale-95 whitespace-nowrap" style={{ flex: 1, height: '40px' }}>
                                <Save size={16} /> Save Changes
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="profile-display animate-slide-up" style={{ textAlign: 'center' }}>
                        <h3 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: 6 }}>{profile.name} {profile.role === 'worker' && <span className="badge badge-secondary" style={{ background: '#e3f2fd', color: '#007bff', fontSize: '1rem', marginLeft: 8, padding: '2px 10px', borderRadius: 12 }}>{profile.profession}</span>}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                            <p style={{ margin: 0 }}><strong>Email:</strong> {profile.email}</p>
                            <p style={{ margin: 0 }}><strong>Role:</strong> {profile.role}</p>
                            {profile.experience && <p style={{ margin: 0 }}><strong>Experience:</strong> {profile.experience}</p>}
                            {profile.phone && <p style={{ margin: 0 }}><strong>Phone:</strong> {profile.phone}</p>}
                            {profile.address && <p style={{ margin: 0 }}><strong>Address:</strong> {profile.address}</p>}
                            {profile.location && <p style={{ margin: 0 }}><strong>Location:</strong> {profile.location}</p>}
                            {profile.status && <p style={{ margin: 0 }}><strong>Status:</strong> {profile.status}</p>}
                            {profile.createdAt && <p style={{ margin: 0 }}><strong>Account Created:</strong> {new Date(profile.createdAt).toLocaleString()}</p>}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                            <button onClick={() => setEditMode(true)} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 text-base rounded-xl shadow-lg transition-colors duration-300 ease-in-out active:scale-95" style={{ minWidth: 160 }}>
                                <Pencil size={16} /> Edit Profile
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
