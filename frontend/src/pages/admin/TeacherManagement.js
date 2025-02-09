import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './TeacherManagement.css';

function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    subject: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showRatingsModal, setShowRatingsModal] = useState(false);

  // Fetch teachers on component mount
  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/teachers');
      setTeachers(response.data);
    } catch (error) {
      setError('Failed to fetch teachers');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      console.log('Adding teacher:', formData); // Debug log
      const response = await api.post('/admin/teachers', formData);
      console.log('Response:', response.data); // Debug log

      setSuccess('Teacher added successfully!');
      setFormData({
        name: '',
        email: '',
        password: '',
        department: '',
        subject: ''
      });
      fetchTeachers(); // Refresh the teachers list
    } catch (error) {
      console.error('Error adding teacher:', error);
      setError(error.response?.data?.message || 'Failed to add teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRatings = (teacher) => {
    setSelectedTeacher(teacher);
    setShowRatingsModal(true);
  };

  const handleCloseModal = () => {
    setSelectedTeacher(null);
    setShowRatingsModal(false);
  };

  return (
    <div className="teacher-management">
      <h2>Teacher Management</h2>
      
      <div className="add-teacher-form">
        <h3>Add New Teacher</h3>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Department"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              required
            />
          </div>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Teacher'}
          </button>
        </form>
      </div>

      <div className="teachers-list">
        <h3>All Teachers</h3>
        {teachers.length === 0 ? (
          <p>No teachers found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Subject</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher._id}>
                  <td>{teacher.name}</td>
                  <td>{teacher.email}</td>
                  <td>{teacher.department}</td>
                  <td>{teacher.subject}</td>
                  <td>
                    <div className="rating-info">
                      {teacher.averageRating > 0 ? (
                        <>
                          <div className="stars">
                            {[...Array(5)].map((_, index) => (
                              <span
                                key={index}
                                className={`star ${index < Math.round(teacher.averageRating) ? 'filled' : ''}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="rating-text">
                            {teacher.averageRating} ({teacher.totalRatings} ratings)
                          </span>
                        </>
                      ) : (
                        'No ratings yet'
                      )}
                    </div>
                  </td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => handleViewRatings(teacher)}
                    >
                      View Ratings
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showRatingsModal && selectedTeacher && (
        <div className="ratings-modal">
          <div className="modal-header">
            <h3>Ratings for {selectedTeacher.name}</h3>
            <button className="close-btn" onClick={handleCloseModal}>×</button>
          </div>
          <div className="ratings-list">
            {selectedTeacher.ratings.length > 0 ? (
              selectedTeacher.ratings.map((rating) => (
                <div key={rating._id} className="rating-item">
                  <div className="rating-header">
                    <span className="student-name">
                      Student: {rating.student.name}
                    </span>
                    <span className="rating-date">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </span>
                  </div>
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
                  <p className="feedback">{rating.feedback}</p>
                </div>
              ))
            ) : (
              <p>No ratings available for this teacher.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherManagement; 