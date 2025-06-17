import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function QuarterApplicationForm({ quarter, onClose, onSuccess }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    emailId: '',
    employeeId: '',
    aadharNumber: '',
    pancard: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.firstName.trim()) errors.push('First name is required');
    if (!formData.lastName.trim()) errors.push('Last name is required');
    if (!formData.phoneNumber.trim()) errors.push('Phone number is required');
    if (!formData.emailId.trim()) errors.push('Email ID is required');
    if (!formData.employeeId.trim()) errors.push('Employee ID is required');
    if (!formData.aadharNumber.trim()) errors.push('Aadhar number is required');
    if (!formData.pancard.trim()) errors.push('PAN card is required');

    // Basic validation patterns
    const phoneRegex = /^[0-9]{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const aadharRegex = /^[0-9]{12}$/;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    if (!phoneRegex.test(formData.phoneNumber)) {
      errors.push('Phone number must be 10 digits');
    }
    if (!emailRegex.test(formData.emailId)) {
      errors.push('Please enter a valid email address');
    }
    if (!aadharRegex.test(formData.aadharNumber)) {
      errors.push('Aadhar number must be 12 digits');
    }
    if (!panRegex.test(formData.pancard.toUpperCase())) {
      errors.push('Please enter a valid PAN card number');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create application record
      const applicationsRef = collection(db, 'applications');
      await addDoc(applicationsRef, {
        quarterId: quarter.id,
        quarterNumber: quarter.number,
        userId: user?.uid || 'anonymous',
        userName: `${formData.firstName} ${formData.lastName}`,
        userEmail: formData.emailId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        emailId: formData.emailId,
        employeeId: formData.employeeId,
        aadharNumber: formData.aadharNumber,
        pancard: formData.pancard.toUpperCase(),
        status: 'pending',
        timestamp: serverTimestamp()
      });

      // Create activity record
      const activitiesRef = collection(db, 'activities');
      await addDoc(activitiesRef, {
        type: 'quarter_application',
        details: `Application submitted for quarter ${quarter.number} by ${formData.firstName} ${formData.lastName}`,
        status: 'pending',
        userId: user?.uid || 'anonymous',
        userName: `${formData.firstName} ${formData.lastName}`,
        timestamp: serverTimestamp()
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="application-success">
        <div className="success-icon">✓</div>
        <h3>Application Submitted Successfully!</h3>
        <p>Your application for Quarter {quarter.number} has been submitted and is under review.</p>
        <p>You will be notified once the application is processed.</p>
      </div>
    );
  }

  return (
    <div className="application-form-container">
      <div className="form-header">
        <h3>Apply for Quarter {quarter.number}</h3>
        <p>Please fill in your details to apply for this quarter</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="application-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your first name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your last name"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number *</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter 10-digit phone number"
              maxLength="10"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="emailId">Email ID *</label>
            <input
              type="email"
              id="emailId"
              name="emailId"
              value={formData.emailId}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your email address"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="employeeId">Employee ID *</label>
          <input
            type="text"
            id="employeeId"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter your employee ID"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="aadharNumber">Aadhar Number *</label>
            <input
              type="text"
              id="aadharNumber"
              name="aadharNumber"
              value={formData.aadharNumber}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter 12-digit Aadhar number"
              maxLength="12"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="pancard">PAN Card *</label>
            <input
              type="text"
              id="pancard"
              name="pancard"
              value={formData.pancard}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter PAN card number"
              style={{ textTransform: 'uppercase' }}
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
}