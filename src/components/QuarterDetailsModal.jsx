import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import QuarterApplicationForm from './QuarterApplicationForm';

export default function QuarterDetailsModal({ isOpen, onClose, quarterId }) {
  const { user } = useAuth();
  const [quarter, setQuarter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    const fetchQuarterDetails = async () => {
      if (!quarterId) return;
      
      try {
        setLoading(true);
        const quartersRef = collection(db, 'quarters');
        const q = query(quartersRef, where('number', '==', quarterId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const quarterData = querySnapshot.docs[0].data();
          setQuarter({
            id: querySnapshot.docs[0].id,
            ...quarterData
          });
        } else {
          setError('Quarter not found');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quarter details:', error);
        setError('Failed to fetch quarter details');
        setLoading(false);
      }
    };

    if (isOpen && quarterId) {
      fetchQuarterDetails();
      setShowApplicationForm(false);
    }
  }, [quarterId, isOpen]);

  const handleApplyForQuarter = () => {
    setShowApplicationForm(true);
  };

  const handleCloseApplicationForm = () => {
    setShowApplicationForm(false);
  };

  const handleApplicationSuccess = () => {
    // Optionally refresh the quarter data or show success message
    setShowApplicationForm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Quarter Details</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        {loading ? (
          <div className="loading-message">Loading quarter details...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : quarter ? (
          <div className="quarter-details">
            {!showApplicationForm ? (
              <>
                <div className="detail-row">
                  <span className="label">Quarter Number:</span>
                  <span className="value">{quarter.number}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Type:</span>
                  <span className="value">{quarter.type}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Location:</span>
                  <span className="value">{quarter.location}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Status:</span>
                  <span className={`status-badge ${quarter.status}`}>
                    {quarter.status}
                  </span>
                </div>

                {quarter.status === 'vacant' && (
                  <button
                    className="btn btn-primary book-button"
                    onClick={handleApplyForQuarter}
                  >
                    Apply for Quarter
                  </button>
                )}

                {quarter.status === 'occupied' && (
                  <div className="occupied-message">
                    This quarter is currently occupied.
                  </div>
                )}

                {quarter.status === 'maintenance' && (
                  <div className="maintenance-message">
                    This quarter is currently under maintenance.
                  </div>
                )}
              </>
            ) : (
              <QuarterApplicationForm
                quarter={quarter}
                onClose={handleCloseApplicationForm}
                onSuccess={handleApplicationSuccess}
              />
            )}
          </div>
        ) : (
          <div className="error-message">Quarter not found</div>
        )}
      </div>
    </div>
  );
} 