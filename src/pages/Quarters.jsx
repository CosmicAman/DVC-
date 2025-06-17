import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, getDocs, addDoc, serverTimestamp, writeBatch, doc, query, orderBy } from 'firebase/firestore';

// Quarter data initialization
const initializeQuarters = async () => {
  const quartersRef = collection(db, 'quarters');
  const batch = writeBatch(db);
  
  const quartersData = [
    { number: 'A-1', type: 'A-type', status: 'vacant', location: 'Block A' },
    { number: 'A-2', type: 'A-type', status: 'vacant', location: 'Block A' },
    { number: 'A-3', type: 'A-type', status: 'vacant', location: 'Block A' },
    { number: 'MB-1A', type: 'MB-type', status: 'vacant', location: 'Block MB' },
    { number: 'MB-1B', type: 'MB-type', status: 'vacant', location: 'Block MB' },
    { number: 'MB-2A', type: 'MB-type', status: 'vacant', location: 'Block MB' },
    { number: 'MB-2B', type: 'MB-type', status: 'vacant', location: 'Block MB' },
    { number: 'MB-3A', type: 'MB-type', status: 'vacant', location: 'Block MB' },
    { number: 'MB-3B', type: 'MB-type', status: 'vacant', location: 'Block MB' },
    { number: 'B-1', type: 'B-type', status: 'vacant', location: 'Block B' },
    { number: 'B-2', type: 'B-type', status: 'vacant', location: 'Block B' },
    { number: 'B-3', type: 'B-type', status: 'vacant', location: 'Block B' },
    { number: 'B-4', type: 'B-type', status: 'vacant', location: 'Block B' },
    // ... Add all other quarters here
  ];

  // Check if quarters already exist
  const existingQuarters = await getDocs(quartersRef);
  if (existingQuarters.empty) {
    quartersData.forEach(quarter => {
      const docRef = doc(quartersRef);
      batch.set(docRef, {
        ...quarter,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });
    await batch.commit();
  }
};

export default function Quarters() {
  const { user } = useAuth();
  const [quarters, setQuarters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'vacant', 'occupied', 'maintenance'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('number'); // 'number', 'type', 'location'

  useEffect(() => {
    const fetchQuarters = async () => {
      try {
        const quartersRef = collection(db, 'quarters');
        const quartersQuery = query(quartersRef, orderBy('number'));
        const quartersSnapshot = await getDocs(quartersQuery);
        const quartersData = quartersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setQuarters(quartersData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quarters:', error);
        setError('Failed to fetch quarters data');
        setLoading(false);
      }
    };

    fetchQuarters();
  }, []);

  const handleApply = async (quarterId) => {
    try {
      // Create application record
      const applicationsRef = collection(db, 'applications');
      await addDoc(applicationsRef, {
        quarterId,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        status: 'pending',
        timestamp: serverTimestamp()
      });

      // Create activity record
      const activitiesRef = collection(db, 'activities');
      await addDoc(activitiesRef, {
        type: 'quarter_application',
        details: `Application submitted for quarter ${quarterId}`,
        status: 'pending',
        userId: user.id,
        userName: user.name,
        timestamp: serverTimestamp()
      });

      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Error applying for quarter:', error);
      setError('Failed to submit application');
    }
  };

  const filteredQuarters = quarters
    .filter(quarter => {
      const matchesFilter = filter === 'all' || quarter.status === filter;
      const matchesSearch = quarter.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          quarter.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          quarter.location.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'number':
          return a.number.localeCompare(b.number);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'location':
          return a.location.localeCompare(b.location);
        default:
          return 0;
      }
    });

  if (loading) {
    return <div className="loading-container">Loading quarters data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">Available Quarters</h2>
        
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by quarter number, type, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
            />
          </div>
          
          <div className="filter-controls">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="form-input"
            >
              <option value="all">All Quarters</option>
              <option value="vacant">Vacant</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-input"
            >
              <option value="number">Sort by Number</option>
              <option value="type">Sort by Type</option>
              <option value="location">Sort by Location</option>
            </select>
          </div>
        </div>

        <div className="quarters-grid">
          {filteredQuarters.map(quarter => (
            <div key={quarter.id} className={`quarter-card status-${quarter.status}`}>
              <div className="quarter-header">
                <h3>Quarter {quarter.number}</h3>
                <span className={`status-badge ${quarter.status}`}>
                  {quarter.status}
                </span>
              </div>
              <div className="quarter-details">
                <p><strong>Type:</strong> {quarter.type}</p>
                <p><strong>Location:</strong> {quarter.location}</p>
              </div>
              {quarter.status === 'vacant' && (
                <button
                  className="btn btn-primary"
                  onClick={() => handleApply(quarter.id)}
                >
                  Apply for Quarter
                </button>
              )}
            </div>
          ))}
        </div>

        {filteredQuarters.length === 0 && (
          <div className="no-results">
            <p>No quarters found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
} 