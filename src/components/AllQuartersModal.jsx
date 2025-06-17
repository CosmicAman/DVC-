import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, getDocs, deleteDoc, addDoc, doc, query, where, orderBy } from 'firebase/firestore';
import QuarterDetailsModal from './QuarterDetailsModal';
import '../styles/Dashboard.css';

// Function to initialize quarters
const initializeQuarters = async () => {
  try {
    // Get reference to quarters collection
    const quartersRef = collection(db, 'quarters');
    
    // Get all existing quarters
    const snapshot = await getDocs(quartersRef);
    
    // Delete all existing quarters
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // New quarters data
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

    // Add all new quarters
    const addPromises = quartersData.map(quarter => addDoc(quartersRef, {
      ...quarter,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    await Promise.all(addPromises);
    console.log('Quarters initialized successfully');
  } catch (error) {
    console.error('Error initializing quarters:', error);
  }
};

const AllQuartersModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [quarters, setQuarters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all'
  });

  useEffect(() => {
    console.log('AllQuartersModal mounted, isOpen:', isOpen);
    const fetchQuarters = async () => {
      try {
        console.log('Fetching quarters...');
        setLoading(true);
        const quartersRef = collection(db, 'quarters');
        const q = query(quartersRef, orderBy('number'));
        const querySnapshot = await getDocs(q);
        const quartersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Quarters fetched:', quartersData.length);
        setQuarters(quartersData);
        setError(null);
      } catch (err) {
        console.error('Error fetching quarters:', err);
        setError('Failed to load quarters. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchQuarters();
    }
  }, [isOpen]);

  const handleViewQuarter = (quarter) => {
    console.log('Viewing quarter:', quarter);
    setSelectedQuarter(quarter);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedQuarter(null);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredQuarters = quarters.filter(quarter => {
    const matchesSearch = quarter.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filters.type === 'all' || quarter.type === filters.type;
    const matchesStatus = filters.status === 'all' || quarter.status === filters.status;
    return matchesSearch && matchesType && matchesStatus;
  });

  const uniqueTypes = [...new Set(quarters.map(q => q.type))];
  const uniqueStatuses = [...new Set(quarters.map(q => q.status))];

  if (!isOpen) {
    console.log('Modal not open, returning null');
    return null;
  }

  console.log('Rendering modal with quarters:', quarters.length);

  return (
    <div className="modal-overlay">
      <div className="modal-content all-quarters-modal">
        <div className="modal-header">
          <h2>All Quarters</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="filters-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by quarter number..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          
          <div className="filter-controls">
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="all">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="all">All Status</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading quarters...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="quarters-grid">
            {filteredQuarters.length === 0 ? (
              <div className="no-results">No quarters found matching your criteria</div>
            ) : (
              filteredQuarters.map(quarter => (
                <div key={quarter.id} className="quarter-card">
                  <h3>{quarter.number}</h3>
                  <p>Type: {quarter.type}</p>
                  <p>Status: {quarter.status}</p>
                  <p>Location: {quarter.location}</p>
                  <button 
                    onClick={() => handleViewQuarter(quarter)}
                    className="view-details-button"
                  >
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {selectedQuarter && (
          <QuarterDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={handleCloseDetailsModal}
            quarterId={selectedQuarter.number}
          />
        )}
      </div>
    </div>
  );
};

export default AllQuartersModal; 