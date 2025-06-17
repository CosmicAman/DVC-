import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { db } from '../config/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import '../styles/Dashboard.css';
import QuarterDetailsModal from '../components/QuarterDetailsModal';
import AllQuartersModal from '../components/AllQuartersModal';
import ImageSlider from '../components/ImageSlider';

export default function Dashboard() {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [stats, setStats] = useState({
    totalQuarters: 0,
    vacantQuarters: 0,
    totalBookings: 0,
    pendingBookings: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAllQuartersModalOpen, setIsAllQuartersModalOpen] = useState(false);

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

        // Fetch bookings
        const bookingsRef = collection(db, 'bookings');
        const bookingsSnapshot = await getDocs(bookingsRef);
        const bookingsData = bookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch activities
        const activitiesRef = collection(db, 'activities');
        const activitiesQuery = query(activitiesRef, orderBy('timestamp', 'desc'));
        const activitiesSnapshot = await getDocs(activitiesQuery);
        const activitiesData = activitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Calculate stats
        const totalQuarters = quartersData.length;
        const vacantQuarters = quartersData.filter(q => q.status === 'vacant').length;
        const totalBookings = bookingsData.length;
        const pendingBookings = bookingsData.filter(b => b.status === 'pending').length;

        setStats({
          totalQuarters,
          vacantQuarters,
          totalBookings,
          pendingBookings
        });

        setRecentActivities(activitiesData.slice(0, 5));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to fetch dashboard data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewQuarter = (quarterId) => {
    setSelectedQuarter(quarterId);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedQuarter(null);
  };

  const handleViewAllQuarters = () => {
    setIsAllQuartersModalOpen(true);
  };

  const handleCloseAllQuartersModal = () => {
    setIsAllQuartersModalOpen(false);
  };

  const handleBookFacilities = () => {
    navigate('/bookings');
  };

  if (loading) {
    return <div className="loading-container">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard">
      <ImageSlider />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome, {user?.name || 'User'}</h1>
          <p>Here's an overview of your quarters and bookings</p>
        </div>

        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card quarters-total">
              <h3>Total Quarters</h3>
              <p>{stats.totalQuarters}</p>
            </div>
            <div className="stat-card quarters-vacant">
              <h3>Vacant Quarters</h3>
              <p>{stats.vacantQuarters}</p>
            </div>
            <div className="stat-card bookings-total">
              <h3>Total Bookings</h3>
              <p>{stats.totalBookings}</p>
            </div>
            <div className="stat-card bookings-pending">
              <h3>Pending Bookings</h3>
              <p>{stats.pendingBookings}</p>
            </div>
          </div>

          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <button 
                className="action-button primary"
                onClick={handleViewAllQuarters}
              >
                View All Quarters
              </button>
              <button 
                className="action-button secondary"
                onClick={handleBookFacilities}
              >
                Book Facilities
              </button>
            </div>
          </div>

          <div className="activities-section">
            <h2>Recent Activities</h2>
            <div className="activity-list">
              {recentActivities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-details">
                    <p>{activity.details}</p>
                    <span>{new Date(activity.timestamp?.toDate()).toLocaleString()}</span>
                  </div>
                  <span className={`activity-status status-${activity.status}`}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="about-dvc-section">
            <div className="section-header">
              <h2>About DVC CTPS</h2>
              <p className="section-subtitle">Chandrapura Thermal Power Station - Powering Eastern India</p>
            </div>

            <div className="about-grid">
              {/* Main Overview Card */}
              <div className="about-card main-overview">
                <div className="card-header">
                  <h3>Chandrapura Thermal Power Station</h3>
                  <span className="location-badge">Chandrapura, Jharkhand</span>
                </div>
                <p className="overview-text">One of the major thermal power stations of Damodar Valley Corporation, playing a crucial role in meeting the power requirements of the eastern region of India.</p>
                <div className="key-stats">
                  <div className="stat-item">
                    <span className="stat-value">2,340 MW</span>
                    <span className="stat-label">Total Capacity</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">6</span>
                    <span className="stat-label">Power Units</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">24/7</span>
                    <span className="stat-label">Operation</span>
                  </div>
                </div>
              </div>

              {/* Power Generation Details */}
              <div className="about-card power-details">
                <h3>Power Generation Units</h3>
                <div className="units-grid">
                  <div className="unit-card">
                    <h4>Units 1 & 2</h4>
                    <div className="unit-details">
                      <span className="capacity">2 x 250 MW</span>
                      <span className="type">Coal-fired</span>
                    </div>
                  </div>
                  <div className="unit-card">
                    <h4>Units 3 & 4</h4>
                    <div className="unit-details">
                      <span className="capacity">2 x 500 MW</span>
                      <span className="type">Coal-fired</span>
                    </div>
                  </div>
                  <div className="unit-card">
                    <h4>Units 5 & 6</h4>
                    <div className="unit-details">
                      <span className="capacity">2 x 420 MW</span>
                      <span className="type">Coal-fired</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Infrastructure */}
              <div className="about-card technical-infra">
                <h3>Technical Infrastructure</h3>
                <div className="infra-grid">
                  <div className="infra-item">
                    <div className="infra-icon">⚡</div>
                    <h4>Power Systems</h4>
                    <ul>
                      <li>High-efficiency boilers</li>
                      <li>Advanced turbines</li>
                      <li>Modern generators</li>
                    </ul>
                  </div>
                  <div className="infra-item">
                    <div className="infra-icon">💧</div>
                    <h4>Water Management</h4>
                    <ul>
                      <li>Cooling water systems</li>
                      <li>Water treatment plants</li>
                      <li>Efficient recycling</li>
                    </ul>
                  </div>
                  <div className="infra-item">
                    <div className="infra-icon">🏭</div>
                    <h4>Coal Handling</h4>
                    <ul>
                      <li>Automated coal handling</li>
                      <li>Advanced pulverizing</li>
                      <li>Efficient storage</li>
                    </ul>
                  </div>
                  <div className="infra-item">
                    <div className="infra-icon">🌡️</div>
                    <h4>Control Systems</h4>
                    <ul>
                      <li>DCS automation</li>
                      <li>Real-time monitoring</li>
                      <li>Advanced analytics</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Environmental & Safety */}
              <div className="about-card env-safety">
                <h3>Environmental & Safety Measures</h3>
                <div className="measures-grid">
                  <div className="measure-item">
                    <h4>Emission Control</h4>
                    <ul>
                      <li>ESP systems</li>
                      <li>FGD technology</li>
                      <li>Continuous monitoring</li>
                    </ul>
                  </div>
                  <div className="measure-item">
                    <h4>Ash Management</h4>
                    <ul>
                      <li>Dry ash handling</li>
                      <li>Ash utilization</li>
                      <li>Zero discharge</li>
                    </ul>
                  </div>
                  <div className="measure-item">
                    <h4>Safety Protocols</h4>
                    <ul>
                      <li>Regular audits</li>
                      <li>Safety training</li>
                      <li>Emergency response</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Employee Facilities */}
              <div className="about-card employee-facilities">
                <h3>Employee Facilities</h3>
                <div className="facilities-grid">
                  <div className="facility-item">
                    <div className="facility-icon">🏠</div>
                    <h4>Residential</h4>
                    <p>Modern quarters with amenities</p>
                  </div>
                  <div className="facility-item">
                    <div className="facility-icon">🏥</div>
                    <h4>Healthcare</h4>
                    <p>24/7 medical facilities</p>
                  </div>
                  <div className="facility-item">
                    <div className="facility-icon">🎓</div>
                    <h4>Education</h4>
                    <p>Quality schools for children</p>
                  </div>
                  <div className="facility-item">
                    <div className="facility-icon">🎯</div>
                    <h4>Recreation</h4>
                    <p>Sports and cultural activities</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <QuarterDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        quarterId={selectedQuarter}
      />

      <AllQuartersModal
        isOpen={isAllQuartersModalOpen}
        onClose={handleCloseAllQuartersModal}
      />
    </div>
  );
} 