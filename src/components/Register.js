// src/pages/Register.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; // Reuse login styles

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    school: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(f => ({
      ...f,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔍 Debug: show the raw formData
    console.log('Submitting formData:', formData);

    const {
      username,
      email,
      password,
      confirmPassword,
      firstName,
      lastName
    } = formData;

    // 🔍 Debug: show each destructured field
    console.log({ username, email, firstName, lastName, password, confirmPassword });

    setLoading(true);
    setError('');

    // ===== Temporarily disable the front-end validation =====
    /*
    if (!username || !email || !password || !confirmPassword || !firstName || !lastName) {
      console.log('Validation failed:', { username, email, firstName, lastName, password, confirmPassword });
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }
    */
    // ========================================================

    // Build the payload with registrationCode
    const { confirmPassword: _, ...registrationData } = formData;
    const payload = {
      ...registrationData,
      registrationCode: process.env.REACT_APP_REGISTRATION_CODE || 'TEACHER2024'
    };

    // 🔍 Debug: show the final payload
    console.log('Payload sent to register endpoint:', payload);

    // Call register() which also auto-logs in
    const result = await register(payload);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card register-card">
        <div className="login-header">
          <h1>🏫 Resource Room</h1>
          <h2>Teacher Registration</h2>
          <p>Create your account to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {/* ... your inputs unchanged ... */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text" id="firstName" name="firstName"
                value={formData.firstName} onChange={handleChange}
                placeholder="First name" disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text" id="lastName" name="lastName"
                value={formData.lastName} onChange={handleChange}
                placeholder="Last name" disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input
              type="text" id="username" name="username"
              value={formData.username} onChange={handleChange}
              placeholder="Choose a username" disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email" id="email" name="email"
              value={formData.email} onChange={handleChange}
              placeholder="your.email@school.edu" disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="school">School/District</label>
            <input
              type="text" id="school" name="school"
              value={formData.school} onChange={handleChange}
              placeholder="School or district name" disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password" id="password" name="password"
                value={formData.password} onChange={handleChange}
                placeholder="At least 6 characters" disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password" id="confirmPassword" name="confirmPassword"
                value={formData.confirmPassword} onChange={handleChange}
                placeholder="Confirm password" disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="register-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
