import { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import './Admin.css';

const Services = () => {
    const { token } = useContext(AuthContext);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Form state
    const [serviceForm, setServiceForm] = useState({ name: '', description: '', price: '', iconName: 'Wrench', color: 'text-blue-500' });
    const [editingServiceId, setEditingServiceId] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);

    const fetchServices = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/services/admin', {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setServices(data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching services:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchServices();
    }, [token]);

    const handleServiceSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingServiceId
                ? `http://localhost:5001/api/services/${editingServiceId}`
                : 'http://localhost:5001/api/services';
            const method = editingServiceId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(serviceForm)
            });

            if (res.ok) {
                fetchServices();
                resetForm();
            } else {
                const data = await res.json();
                alert(data.msg || 'Error saving service');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deleteService = async (id) => {
        if (!window.confirm('Are you sure you want to delete this service?')) return;
        try {
            await fetch(`http://localhost:5001/api/services/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            fetchServices();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditService = (service) => {
        setServiceForm({
            name: service.name,
            description: service.description,
            price: service.price,
            iconName: service.iconName,
            color: service.color
        });
        setEditingServiceId(service._id);
        setIsFormVisible(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setServiceForm({ name: '', description: '', price: '', iconName: 'Wrench', color: 'text-blue-500' });
        setEditingServiceId(null);
        setIsFormVisible(false);
    };

    if (loading) return <div className="admin-loading">Loading Services...</div>;

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-services-view">
            <div className="admin-page-header">
                <h2>Services Management</h2>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <input
                        type="text"
                        className="admin-search-input"
                        placeholder="Search services..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        className="admin-btn btn-primary"
                        onClick={() => setIsFormVisible(!isFormVisible)}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                        <MdAdd /> {isFormVisible ? 'Cancel' : 'Add Service'}
                    </button>
                </div>
            </div>

            {isFormVisible && (
                <div className="admin-form-container" style={{ background: '#fff', padding: '25px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#1e293b' }}>{editingServiceId ? 'Edit Service' : 'Add New Service'}</h3>
                    <form onSubmit={handleServiceSubmit} style={{ display: 'grid', gap: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }}>Service Name</label>
                                <input type="text" value={serviceForm.name} onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} placeholder="e.g. Electrician" required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', transition: 'border-color 0.2s' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }}>Price Indicator</label>
                                <input type="text" value={serviceForm.price} onChange={e => setServiceForm({ ...serviceForm, price: e.target.value })} placeholder="e.g. ₹500" required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', transition: 'border-color 0.2s' }} />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }}>Description</label>
                            <textarea value={serviceForm.description} onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} placeholder="Service description..." required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '100px', resize: 'vertical', outline: 'none' }}></textarea>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }}>Icon Component Name (Lucide-react)</label>
                                <input type="text" value={serviceForm.iconName} onChange={e => setServiceForm({ ...serviceForm, iconName: e.target.value })} placeholder="e.g. Wrench, Zap, Droplet" required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }}>Color Class (Tailwind)</label>
                                <input type="text" value={serviceForm.color} onChange={e => setServiceForm({ ...serviceForm, color: e.target.value })} placeholder="e.g. text-blue-500" required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                            <button type="button" onClick={resetForm} className="admin-btn btn-secondary" style={{ padding: '10px 20px' }}>Cancel</button>
                            <button type="submit" className="admin-btn btn-primary" style={{ padding: '10px 20px', background: '#4f46e5' }}>{editingServiceId ? 'Update Service' : 'Save Service'}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Service Name</th>
                            <th>Description</th>
                            <th>Price</th>
                            <th>Icon</th>
                            <th>Color</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredServices.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                                    No services found.
                                </td>
                            </tr>
                        ) : (
                            filteredServices.map(service => (
                                <tr key={service._id}>
                                    <td style={{ fontWeight: '600', color: '#1e293b' }}>{service.name}</td>
                                    <td style={{ maxWidth: '300px' }}><div className="truncate" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{service.description}</div></td>
                                    <td><span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>{service.price}</span></td>
                                    <td>{service.iconName}</td>
                                    <td><span style={{ fontSize: '13px', fontFamily: 'monospace', background: '#f8fafc', padding: '2px 6px', border: '1px solid #e2e8f0', borderRadius: '4px' }}>{service.color}</span></td>
                                    <td className="action-cell">
                                        <button onClick={() => handleEditService(service)} className="admin-btn btn-view" style={{ background: '#f8fafc', color: '#4f46e5', border: '1px solid #e0e7ff' }}><MdEdit /> Edit</button>
                                        <button onClick={() => deleteService(service._id)} className="admin-btn btn-reject" style={{ background: '#fff1f2', color: '#e11d48', border: '1px solid #ffe4e6' }}><MdDelete /> Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Services;
