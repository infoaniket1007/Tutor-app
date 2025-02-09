const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Rating = require('../models/Rating');

// Create new appointment
exports.createAppointment = async (req, res) => {
  try {
    const { teacherId, date, time, message } = req.body;
    const studentId = req.user.id;

    const appointment = new Appointment({
      student: studentId,
      teacher: teacherId,
      date,
      time,
      message
    });

    await appointment.save();
    res.status(201).json({ message: 'Appointment requested successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating appointment', error: error.message });
  }
};

// Get teacher's appointments
exports.getTeacherAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ teacher: req.user.id })
      .populate('student', 'name email department rollNumber')
      .populate('ratings')
      .sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching appointments', 
      error: error.message 
    });
  }
};

// Get student's appointments
exports.getStudentAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ student: req.user.id })
      .populate('teacher', 'name department subject')
      .sort({ date: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    console.log('Updating appointment status:', { appointmentId: req.params.id, status });

    // Find the appointment first
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      teacher: req.user.id
    });

    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: 'Appointment not found' 
      });
    }

    // Update the appointment
    appointment.status = status;
    if (status === 'completed') {
      appointment.completedAt = new Date();
      appointment.isRated = false;
    }

    await appointment.save();

    // Populate and return the updated appointment
    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('student', 'name email');

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating appointment', 
      error: error.message 
    });
  }
};

// Submit rating
exports.submitRating = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const appointmentId = req.params.id;
    const studentId = req.user.id;

    console.log('Rating submission attempt:', { appointmentId, rating, feedback });

    // Find the appointment and populate teacher
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      student: studentId,
      status: 'completed',
      isRated: false
    }).populate('teacher');

    if (!appointment) {
      console.log('Appointment not found or not eligible:', { appointmentId, studentId });
      return res.status(404).json({
        success: false,
        message: 'Eligible appointment not found for rating. Please ensure the appointment is completed and not already rated.'
      });
    }

    // Create new rating
    const newRating = new Rating({
      appointment: appointmentId,
      student: studentId,
      teacher: appointment.teacher._id,
      rating,
      feedback,
      createdAt: new Date()
    });

    await newRating.save();

    // Mark appointment as rated
    appointment.isRated = true;
    await appointment.save();

    // Update teacher's ratings
    const teacher = await User.findById(appointment.teacher._id);
    if (!teacher.ratings) {
      teacher.ratings = [];
    }
    teacher.ratings.push(newRating._id);

    // Calculate new average rating
    const allTeacherRatings = await Rating.find({ teacher: teacher._id });
    const averageRating = allTeacherRatings.reduce((acc, curr) => acc + curr.rating, 0) / allTeacherRatings.length;

    teacher.averageRating = Number(averageRating.toFixed(1));
    teacher.totalRatings = allTeacherRatings.length;
    
    await teacher.save();

    // Return populated rating
    const populatedRating = await Rating.findById(newRating._id)
      .populate('student', 'name')
      .populate('teacher', 'name');

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      rating: populatedRating
    });

  } catch (error) {
    console.error('Rating submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting rating',
      error: error.message
    });
  }
}; 