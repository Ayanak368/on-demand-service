import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const WorkerDashboard = () => {
    const { user, token } = useContext(AuthContext); // user from context might be stale, better to fetch fresh profile
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    // Profile state moved to UserProfile component

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Jobs (Service Requests)
                // We need to fetch the worker's ID or Profession to filter jobs if not already filtered by backend based on token
                // The backend getServiceRequests filters based on req.user (token), so we just need to call it.

                const jobsRes = await fetch('http://localhost:5001/api/service-requests', {
                    headers: { 'x-auth-token': token }
                });
                const jobsData = await jobsRes.json();
                setJobs(jobsData);

                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        if (token) fetchData();
    }, [token]);

    const handleJobAction = async (id, status) => {
        try {
            const res = await fetch(`http://localhost:5001/api/service-requests/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ status })
            });
            if (!res.ok) {
                const errData = await res.json();
                console.error('Update Job Failed:', errData);
                alert(`Action failed: ${errData.msg || 'Unknown error'}`);
                return;
            }
            const updatedJob = await res.json();
            console.log('Update Job Response:', updatedJob);
            setJobs(jobs.map(job => job._id === id ? updatedJob : job));
        } catch (err) {
            console.error('Update Job Error:', err);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="worker-dashboard container">
            <div className="dashboard-header" style={{ marginTop: '20px', marginBottom: '20px' }}>
                <h1>Welcome, {user && user.name}</h1>
                <p>Here are your new job requests and tasks.</p>
            </div>

            <hr />

            <div className="jobs-section">
                <h2>Available Jobs & My Tasks</h2>
                <div className="request-list">
                    {jobs.length === 0 ? <p>No jobs available matching your profession.</p> : jobs.map(job => (
                        <div key={job._id} className="request-card">
                            <div className="card-header">
                                <h4>{job.serviceType}</h4>
                                <span className={`status-badge ${job.status}`}>{job.status}</span>
                            </div>
                            <p>{job.details}</p>
                            <p className="card-meta">📍 {job.location} | 📅 {new Date(job.createdAt).toLocaleDateString()}</p>

                            {job.status === 'pending' && (
                                <button onClick={() => handleJobAction(job._id, 'accepted')} className="btn btn-success">Accept Job</button>
                            )}
                            {job.status === 'accepted' && job.worker == user.id && ( // using user.id from context roughly checks ownership, though UserProfile has more fresh data. Backend protects updates anyway.
                                <button onClick={() => handleJobAction(job._id, 'completed')} className="btn btn-primary">Mark Completed</button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WorkerDashboard;
