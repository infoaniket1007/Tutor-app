import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './TeacherDashboard.css';

function TeacherDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [teacherProfile, setTeacherProfile] = useState({
    name: '',
    department: '',
    subject: '',
    averageRating: 0,
    totalRatings: 0
  });

  useEffect(() => {
    fetchAppointments();
    fetchTeacherProfile();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments/teacher');
      setAppointments(response.data);
    } catch (error) {
      setError('Failed to fetch appointments');
      console.error('Error:', error);
    }
  };

  const fetchTeacherProfile = async () => {
    try {
      const response = await api.get('/teachers/profile');
      if (response.data.success) {
        setTeacherProfile(response.data.data);
      } else {
        setError('Failed to fetch profile');
      }
    } catch (error) {
      setError('Failed to fetch profile');
      console.error('Error:', error);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.put(`/appointments/${appointmentId}/status`, { 
        status: newStatus 
      });

      if (response.data.success) {
        setSuccess(`Appointment marked as ${newStatus}`);
        // Refresh both appointments and profile data
        await Promise.all([
          fetchAppointments(),
          fetchTeacherProfile()
        ]);
      } else {
        setError(response.data.message || 'Failed to update appointment status');
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setError(error.response?.data?.message || 'Failed to update appointment status');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="teacher-dashboard">
      <h2>Teacher Dashboard</h2>

      <div className="profile-section">
        <h3>My Profile</h3>
        <div className="rating-info">
          <p>
            <strong>Name:</strong> {teacherProfile.name}
          </p>
          <p>
            <strong>Department:</strong> {teacherProfile.department}
          </p>
          <p>
            <strong>Subject:</strong> {teacherProfile.subject}
          </p>
          <p>
            <strong>Average Rating:</strong>{' '}
            {teacherProfile.averageRating > 0 ? (
              <span className="rating">
                {Number(teacherProfile.averageRating).toFixed(1)} / 5
                <span className="rating-count">
                  ({teacherProfile.totalRatings} ratings)
                </span>
              </span>
            ) : (
              'No ratings yet'
            )}
          </p>
        </div>
      </div>

      <div className="ratings-section">
        <h3>Student Ratings & Feedback</h3>
        {teacherProfile.ratings && teacherProfile.ratings.length > 0 ? (
          <div className="ratings-grid">
            {teacherProfile.ratings.map((rating) => (
              <div key={rating._id} className="rating-card">
                <div className="rating-header">
                  <div className="stars">
                    {[...Array(5)].map((_, index) => (
                      <span
                        key={index}
                        className={`star ${index < rating.rating ? 'filled' : ''}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="rating-date">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="student-name">
                  Student: {rating.student?.name || 'Anonymous'}
                </p>
                <p className="feedback">{rating.feedback}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No ratings yet</p>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="appointments-section">
        <h3>Appointments</h3>
        {appointments.length === 0 ? (
          <p>No appointments found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Date</th>
                <th>Time</th>
                <th>Message</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td>{appointment.student.name}</td>
                  <td>{formatDate(appointment.date)}</td>
                  <td>{appointment.time}</td>
                  <td>{appointment.message || 'No message'}</td>
                  <td>
                    <span className={`status-${appointment.status.toLowerCase()}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td>
                    {appointment.status === 'pending' && (
                      <div className="action-buttons">
                        <button
                          className="approve-btn"
                          onClick={() => handleStatusUpdate(appointment._id, 'approved')}
                          disabled={loading}
                        >
                          Approve
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                          disabled={loading}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {appointment.status === 'approved' && (
                      <button
                        className="complete-btn"
                        onClick={() => handleStatusUpdate(appointment._id, 'completed')}
                        disabled={loading}
                      >
                        Mark Complete
                      </button>
                    )}
                    {appointment.status === 'completed' && (
                      <span className="completed-badge">
                        {appointment.isRated ? '✓ Rated' : 'Completed'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default TeacherDashboard; 