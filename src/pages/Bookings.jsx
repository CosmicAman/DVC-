import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

export default function Bookings() {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [existingBookings, setExistingBookings] = useState([]);

  useEffect(() => {
    console.log('Bookings component mounted');
    const initializeFacilities = async () => {
      try {
        console.log('Initializing facilities...');
        const facilitiesRef = collection(db, 'facilities');
        const facilitiesSnapshot = await getDocs(facilitiesRef);
        let facilitiesData = facilitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Initialize facilities if empty
        if (facilitiesData.length === 0) {
          console.log('No facilities found, creating initial data...');
          const initialFacilities = [
            {
              name: 'Marriage Hall',
              description: 'Large hall suitable for weddings and large gatherings',
              capacity: '500 people',
              amenities: ['Stage', 'Parking', 'Catering Area', 'Decoration Space'],
              images: ['https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3'],
              pricePerDay: 50000
            },
            {
              name: 'Club',
              description: 'Recreation club for social events and activities',
              capacity: '200 people',
              amenities: ['Indoor Games', 'Swimming Pool', 'Gym', 'Restaurant'],
              images: ['https://images.unsplash.com/photo-1560185007-5f0bb1866cab?ixlib=rb-4.0.3'],
              pricePerDay: 25000
            },
            {
              name: 'Guest House',
              description: 'Comfortable accommodation for guests',
              capacity: '50 people',
              amenities: ['AC Rooms', 'WiFi', 'Room Service', 'Laundry'],
              images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3'],
              pricePerDay: 15000
            }
          ];

          // Add each facility to Firestore
          for (const facility of initialFacilities) {
            await addDoc(facilitiesRef, facility);
          }

          // Fetch the newly added facilities
          const newFacilitiesSnapshot = await getDocs(facilitiesRef);
          facilitiesData = newFacilitiesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log('Initial facilities created successfully');
        }

        setFacilities(facilitiesData);
        setLoading(false);
        console.log('Facilities loaded successfully');
      } catch (error) {
        console.error('Error initializing facilities:', error);
        setError('Failed to load facilities');
        setLoading(false);
      }
    };

    initializeFacilities();
  }, []);

  useEffect(() => {
    if (selectedFacility) {
      fetchExistingBookings();
    }
  }, [selectedFacility]);

  const fetchExistingBookings = async () => {
    if (!selectedFacility) return;
    
    try {
      console.log('Fetching existing bookings...');
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('facilityId', '==', selectedFacility),
        where('status', 'in', ['approved', 'pending'])
      );
      const querySnapshot = await getDocs(q);
      const bookings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExistingBookings(bookings);
      console.log('Existing bookings loaded successfully');
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const isDateRangeAvailable = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    return !existingBookings.some(booking => {
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);
      return (
        (startDate >= bookingStart && startDate <= bookingEnd) ||
        (endDate >= bookingStart && endDate <= bookingEnd) ||
        (startDate <= bookingStart && endDate >= bookingEnd)
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Validate dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start < today) {
        throw new Error('Start date cannot be in the past');
      }

      if (end < start) {
        throw new Error('End date cannot be before start date');
      }

      // Check availability
      if (!isDateRangeAvailable(startDate, endDate)) {
        throw new Error('Selected dates are not available. Please choose different dates.');
      }

      const selectedFacilityData = facilities.find(f => f.id === selectedFacility);
      if (!selectedFacilityData) {
        throw new Error('Selected facility not found');
      }

      // Calculate total price
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const totalPrice = days * selectedFacilityData.pricePerDay;

      // Create booking record
      const bookingsRef = collection(db, 'bookings');
      const bookingData = {
        facilityId: selectedFacility,
        facilityName: selectedFacilityData.name,
        startDate,
        endDate,
        totalPrice,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        status: 'pending',
        timestamp: serverTimestamp()
      };
      await addDoc(bookingsRef, bookingData);

      // Create activity record
      const activitiesRef = collection(db, 'activities');
      await addDoc(activitiesRef, {
        type: 'facility_booking',
        details: `${selectedFacilityData.name} booking request submitted`,
        status: 'pending',
        userId: user.id,
        userName: user.name,
        timestamp: serverTimestamp()
      });

      setSuccess(true);
      setSelectedFacility('');
      setStartDate('');
      setEndDate('');
      fetchExistingBookings();
    } catch (error) {
      console.error('Error submitting booking:', error);
      setError(error.message || 'Failed to submit booking request');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading facilities...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">Book Facilities</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            Booking request submitted successfully! We will review your request and get back to you soon.
          </div>
        )}

        <div className="facilities-grid">
          {facilities.map(facility => (
            <div 
              key={facility.id}
              className={`facility-card ${selectedFacility === facility.id ? 'selected' : ''}`}
              onClick={() => setSelectedFacility(facility.id)}
            >
              {facility.images && facility.images[0] && (
                <img 
                  src={facility.images[0]} 
                  alt={facility.name} 
                  className="facility-image"
                />
              )}
              <div className="facility-content">
                <h3>{facility.name}</h3>
                <p>{facility.description}</p>
                <div className="facility-details">
                  <p><strong>Capacity:</strong> {facility.capacity}</p>
                  <p><strong>Price per day:</strong> ₹{facility.pricePerDay.toLocaleString()}</p>
                  <div className="amenities">
                    <strong>Amenities:</strong>
                    <ul>
                      {facility.amenities.map((amenity, index) => (
                        <li key={index}>{amenity}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedFacility && (
          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-input"
                required
                disabled={loading}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-input"
                required
                disabled={loading}
                min={startDate || new Date().toISOString().split('T')[0]}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Booking Request'}
            </button>
          </form>
        )}

        {selectedFacility && existingBookings.length > 0 && (
          <div className="existing-bookings">
            <h3>Existing Bookings</h3>
            <div className="bookings-list">
              {existingBookings.map(booking => (
                <div key={booking.id} className="booking-item">
                  <p>From: {new Date(booking.startDate).toLocaleDateString()}</p>
                  <p>To: {new Date(booking.endDate).toLocaleDateString()}</p>
                  <p>Status: {booking.status}</p>
                  <p>Total Price: ₹{booking.totalPrice?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 