import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { 
  collection, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('quarters');
  const [quarters, setQuarters] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch quarters
        const quartersRef = collection(db, 'quarters');
        const quartersSnapshot = await getDocs(quartersRef);
        const quartersData = quartersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setQuarters(quartersData);

        // Fetch bookings
        const bookingsRef = collection(db, 'bookings');
        const bookingsQuery = query(
          bookingsRef,
          orderBy('timestamp', 'desc')
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const bookingsData = bookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBookings(bookingsData);

        // Fetch applications
        const applicationsRef = collection(db, 'applications');
        const applicationsQuery = query(
          applicationsRef,
          orderBy('timestamp', 'desc')
        );
        const applicationsSnapshot = await getDocs(applicationsQuery);
        const applicationsData = applicationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setApplications(applicationsData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = async (type, id, newStatus) => {
    try {
      const collectionRef = collection(db, type);
      const docRef = doc(collectionRef, id);
      
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // Create activity record
      const activitiesRef = collection(db, 'activities');
      await addDoc(activitiesRef, {
        type: `${type}_status_update`,
        details: `${type} ${id} status updated to ${newStatus}`,
        status: newStatus,
        userId: user.id,
        userName: user.name,
        timestamp: serverTimestamp()
      });

      // Update local state
      if (type === 'quarters') {
        setQuarters(quarters.map(q => 
          q.id === id ? { ...q, status: newStatus } : q
        ));
      } else if (type === 'bookings') {
        setBookings(bookings.map(b => 
          b.id === id ? { ...b, status: newStatus } : b
        ));
      } else if (type === 'applications') {
        setApplications(applications.map(a => 
          a.id === id ? { ...a, status: newStatus } : a
        ));
      }

      alert(`Status updated successfully!`);
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status');
    }
  };

  if (loading) {
    return <div className="loading-container">Loading admin data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">Admin Panel</h2>
        
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'quarters' ? 'active' : ''}`}
            onClick={() => setActiveTab('quarters')}
          >
            Quarters
          </button>
          <button
            className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            Bookings
          </button>
          <button
            className={`tab ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            Applications
          </button>
        </div>

        {activeTab === 'quarters' && (
          <div className="tab-content">
            <h3>Manage Quarters</h3>
            <div className="quarters-grid">
              {quarters.map(quarter => (
                <div key={quarter.id} className="quarter-card">
                  <h4>Quarter {quarter.number}</h4>
                  <p>Type: {quarter.type}</p>
                  <p>Location: {quarter.location}</p>
                  <p>Status: {quarter.status}</p>
                  <select
                    value={quarter.status}
                    onChange={(e) => handleStatusChange('quarters', quarter.id, e.target.value)}
                    className="form-input"
                  >
                    <option value="vacant">Vacant</option>
                    <option value="allotted">Allotted</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="tab-content">
            <h3>Manage Bookings</h3>
            <div className="bookings-list">
              {bookings.map(booking => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-details">
                    <h4>{booking.type}</h4>
                    <p>User: {booking.userName}</p>
                    <p>Dates: {booking.startDate} to {booking.endDate}</p>
                    <p>Status: {booking.status}</p>
                  </div>
                  <select
                    value={booking.status}
                    onChange={(e) => handleStatusChange('bookings', booking.id, e.target.value)}
                    className="form-input"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="tab-content">
            <h3>Manage Applications</h3>
            <div className="applications-list">
              {applications.map(application => (
                <div key={application.id} className="application-card">
                  <div className="application-details">
                    <h4>Quarter {application.quarterId}</h4>
                    <p>Applicant: {application.userName}</p>
                    <p>Email: {application.userEmail}</p>
                    <p>Status: {application.status}</p>
                  </div>
                  <select
                    value={application.status}
                    onChange={(e) => handleStatusChange('applications', application.id, e.target.value)}
                    className="form-input"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 