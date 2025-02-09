import React, { useState } from 'react';
import './RatingModal.css';

function RatingModal({ appointment, onSubmit, onClose }) {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setError('Please provide feedback');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Let the parent component handle the API call
      await onSubmit({
        rating,
        feedback: feedback.trim()
      });
    } catch (error) {
      console.error('Rating submission error:', error);
      setError(error.response?.data?.message || 'Error submitting rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rating-modal-overlay">
      <div className="rating-modal">
        <h3>Rate Your Session</h3>
        <p>Teacher: {appointment.teacher.name}</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= rating ? 'active' : ''}`}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
          </div>
          
          <textarea
            placeholder="Share your feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
          />
          
          <div className="modal-buttons">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading || !feedback.trim()}
            >
              {loading ? 'Submitting...' : 'Submit Rating'}
            </button>
            <button 
              type="button" 
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RatingModal; 