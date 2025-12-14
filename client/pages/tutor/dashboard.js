import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Calendar, Clock, User, LogOut, DollarSign, Edit2, Save, X, Home, Search, BarChart3, AlertCircle, MessageCircle, Trash2, CheckCircle, XCircle, FileText, Star } from 'lucide-react';
import ChatWidget from '../../components/copilot/ChatWidget';
import NotificationBell from '../../components/NotificationBell';
import Header from '../../components/Header';
import axios from 'axios';
import io from 'socket.io-client';

export default function TutorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSubjects, setEditingSubjects] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [editingRate, setEditingRate] = useState(false);
  const [hourlyRate, setHourlyRate] = useState('');
  const [rateError, setRateError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedBookingForFeedback, setSelectedBookingForFeedback] = useState(null);
  const [studentFeedback, setStudentFeedback] = useState('');

  const availableSubjects = ['Math', 'Physics', 'Chemistry', 'Statistics', 'Calculus'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/auth/student/login');
      return;
    }

    const userObj = JSON.parse(userData);
    setUser(userObj);
    setSelectedSubjects(userObj.subjects || []);
    fetchBookings();

    // Set up Socket.io connection for real-time updates
    const socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    socket.on('booking:new', (data) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      // Convert both to strings for comparison
      if (String(data.tutorId) === String(user.id)) {
        fetchBookings(); // Refresh bookings when new request comes in
      }
    });

    socket.on('booking:confirmed', (data) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      // Convert both to strings for comparison
      if (String(data.tutorId) === String(user.id)) {
        setSuccessMessage('Lecture Successfully Placed! The student has been notified.');
        fetchBookings(); // Refresh bookings
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    });

    socket.on('booking:cancelled', (data) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (String(data.tutorId) === String(user.id)) {
        fetchBookings();
      }
    });

    socket.on('booking:timeChangeRequest', (data) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (String(data.tutorId) === String(user.id)) {
        fetchBookings();
      }
    });

    socket.on('booking:timeChangeResponse', (data) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (String(data.tutorId) === String(user.id) || String(data.studentId) === String(user.id)) {
        fetchBookings();
      }
    });

    socket.on('connect', () => {
      console.log('Tutor socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Tutor socket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [router]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await axios.get('http://localhost:5000/api/bookings', {
        params: { userId: user.id, role: 'tutor' },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        'http://localhost:5000/api/users/profile',
        { subjects: selectedSubjects },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditingSubjects(false);
      
      alert('Subjects updated successfully!');
    } catch (error) {
      console.error('Error updating subjects:', error);
      alert('Failed to update subjects');
    }
  };

  const handleUpdateRate = async () => {
    if (!hourlyRate || parseFloat(hourlyRate) < 0) {
      setRateError('Please enter a valid hourly rate');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        'http://localhost:5000/api/users/rate',
        { hourlyRate: parseFloat(hourlyRate) },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditingRate(false);
      setRateError('');
      
      alert('Hourly rate updated successfully!');
    } catch (error) {
      console.error('Error updating rate:', error);
      setRateError(error.response?.data?.error || 'Failed to update hourly rate');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/bookings/${bookingId}`,
        { status: 'cancelled' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBookings();
      setSuccessMessage('Booking cancelled successfully. The student has been notified.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert(error.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const handleRespondToTimeChange = async (bookingId, accept) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/bookings/${bookingId}/time/respond`,
        { accept },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBookings();
      setSuccessMessage(accept ? 'Time change accepted' : 'Time change rejected');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error responding to time change:', error);
      alert(error.response?.data?.error || 'Failed to respond');
    }
  };

  const handleMarkCompleted = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/bookings/${bookingId}`,
        { status: 'completed' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBookings();
      setSuccessMessage('Lecture marked as completed');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error marking completed:', error);
      alert(error.response?.data?.error || 'Failed to mark as completed');
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!studentFeedback.trim()) {
      alert('Feedback cannot be empty');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/bookings/${selectedBookingForFeedback._id}/feedback`,
        { feedback: studentFeedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowFeedbackModal(false);
      fetchBookings();
      setSuccessMessage('Feedback submitted successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert(error.response?.data?.error || 'Failed to submit feedback');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F14] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F14]">
      <ChatWidget />
      <Header />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {successMessage && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500/50 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-green-400 font-semibold">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage('')}
              className="text-green-400 hover:text-green-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Tutor Dashboard</h2>
          <p className="text-gray-400">Welcome back, {user?.name}</p>
        </div>

        {/* Required: Hourly Rate Warning */}
        {(!user?.hourlyRate || user.hourlyRate === 0) && (
          <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-xl flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-yellow-400 font-semibold mb-1">Hourly Rate Required</h3>
              <p className="text-yellow-300 text-sm">You must set your hourly rate to receive bookings.</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#1A1A1F] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <User className="w-6 h-6 text-[#3B82F6]" />
                <h2 className="text-xl font-semibold text-white">Profile</h2>
              </div>
            </div>
            <div className="space-y-3 text-gray-400">
              <p><span className="text-white">Email:</span> {user?.email}</p>
              <p><span className="text-white">Bio:</span> {user?.bio || 'No bio set'}</p>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white">Subjects:</span>
                  {!editingSubjects ? (
                    <button
                      onClick={() => setEditingSubjects(true)}
                      className="text-[#3B82F6] hover:text-[#2563EB] text-sm flex items-center space-x-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleUpdateSubjects}
                        className="text-green-400 hover:text-green-300 text-sm flex items-center space-x-1"
                      >
                        <Save className="w-3 h-3" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingSubjects(false);
                          setSelectedSubjects(user?.subjects || []);
                        }}
                        className="text-red-400 hover:text-red-300 text-sm flex items-center space-x-1"
                      >
                        <X className="w-3 h-3" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
                
                {!editingSubjects ? (
                  <p>{user?.subjects?.join(', ') || 'None selected'}</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 p-3 bg-[#2A2A32] border border-gray-700 rounded-lg">
                    {availableSubjects.map((subject) => (
                      <label
                        key={subject}
                        className="flex items-center space-x-2 cursor-pointer hover:text-[#3B82F6] transition"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSubjects.includes(subject)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSubjects([...selectedSubjects, subject]);
                            } else {
                              setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
                            }
                          }}
                          className="w-4 h-4 text-[#3B82F6] bg-[#2A2A32] border-gray-600 rounded focus:ring-[#3B82F6]"
                        />
                        <span className="text-white text-sm">{subject}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Hourly Rate:
                  </span>
                  {!editingRate ? (
                    <button
                      onClick={() => {
                        setEditingRate(true);
                        setHourlyRate(user?.hourlyRate || '');
                        setRateError('');
                      }}
                      className="text-[#3B82F6] hover:text-[#2563EB] text-sm flex items-center space-x-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleUpdateRate}
                        className="text-green-400 hover:text-green-300 text-sm flex items-center space-x-1"
                      >
                        <Save className="w-3 h-3" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingRate(false);
                          setHourlyRate('');
                          setRateError('');
                        }}
                        className="text-red-400 hover:text-red-300 text-sm flex items-center space-x-1"
                      >
                        <X className="w-3 h-3" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
                {!editingRate ? (
                  <p className="text-gray-400">${user?.hourlyRate || 0}/hr</p>
                ) : (
                  <div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={hourlyRate}
                      onChange={(e) => {
                        setHourlyRate(e.target.value);
                        setRateError('');
                      }}
                      placeholder="Enter hourly rate"
                      className="w-full px-3 py-2 bg-[#2A2A32] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    />
                    {rateError && (
                      <p className="text-red-400 text-xs mt-1">{rateError}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#1A1A1F] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="w-6 h-6 text-[#3B82F6]" />
              <h2 className="text-xl font-semibold text-white">My Bookings</h2>
            </div>
            {bookings.length === 0 ? (
              <p className="text-gray-400">No bookings yet</p>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div key={booking._id} className="bg-[#2A2A32] border border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="text-white font-medium">{booking.studentId?.name}</p>
                        <p className="text-gray-400 text-sm">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {new Date(booking.startTime).toLocaleString()}
                        </p>
                        {booking.subject && (
                          <p className="text-gray-400 text-sm">Subject: {booking.subject}</p>
                        )}
                        <p className="text-gray-400 text-sm">
                          Status: <span className={`font-semibold ${
                            booking.status === 'confirmed' ? 'text-green-400' :
                            booking.status === 'pending' ? 'text-yellow-400' :
                            booking.status === 'cancelled' ? 'text-red-400' :
                            'text-white'
                          }`}>
                            {booking.status}
                          </span>
                        </p>
                        {booking.timeChangeRequest?.status === 'pending' && (
                          <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-500/50 rounded">
                            <p className="text-yellow-400 text-xs mb-1">Time Change Request</p>
                            <p className="text-text-muted text-xs">
                              New time: {new Date(booking.timeChangeRequest.newStartTime).toLocaleString()}
                            </p>
                            <div className="flex space-x-2 mt-2">
                              <button
                                onClick={() => handleRespondToTimeChange(booking._id, true)}
                                className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs flex items-center space-x-1"
                              >
                                <CheckCircle className="w-3 h-3" />
                                <span>Accept</span>
                              </button>
                              <button
                                onClick={() => handleRespondToTimeChange(booking._id, false)}
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs flex items-center space-x-1"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </div>
                          </div>
                        )}
                        {booking.rating && (
                          <div className="mt-2 flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-white text-sm">{booking.rating}/5</span>
                            {booking.studentFeedback && (
                              <span className="text-gray-400 text-xs ml-2">- {booking.studentFeedback}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col space-y-1 ml-2">
                        <Link
                          href={`/chat?studentId=${booking.studentId?._id || booking.studentId}`}
                          className="p-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded border border-gray-700 transition relative"
                          title="Chat with student"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Link>
                        <Link
                          href="/chats"
                          className="p-2 bg-[#2A2A32] hover:bg-[#3A3A42] text-white rounded border border-gray-700 transition text-xs text-center"
                          title="All conversations"
                        >
                          All
                        </Link>
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={async () => {
                                try {
                                  const token = localStorage.getItem('token');
                                  const response = await axios.patch(
                                    `http://localhost:5000/api/bookings/${booking._id}`,
                                    { status: 'confirmed' },
                                    { headers: { Authorization: `Bearer ${token}` } }
                                  );
                                  fetchBookings();
                                  setSuccessMessage('Lecture Successfully Placed! The student has been notified.');
                                  setTimeout(() => setSuccessMessage(''), 5000);
                                } catch (error) {
                                  console.error('Error confirming booking:', error);
                                  alert(error.response?.data?.error || 'Failed to confirm booking');
                                }
                              }}
                              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                              title="Confirm"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCancelBooking(booking._id)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                              title="Cancel"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => handleMarkCompleted(booking._id)}
                              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                              title="Mark as completed"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCancelBooking(booking._id)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                              title="Cancel"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {booking.status === 'completed' && !booking.tutorFeedback && (
                          <button
                            onClick={() => {
                              setSelectedBookingForFeedback(booking);
                              setStudentFeedback('');
                              setShowFeedbackModal(true);
                            }}
                            className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs"
                            title="Provide feedback"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                        {booking.videoLink && booking.status === 'confirmed' && (
                          <a
                            href={booking.videoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-action-primary hover:bg-action-hover text-white rounded text-xs text-center"
                            title="Join lecture"
                          >
                            Join
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && selectedBookingForFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1F] rounded-xl p-6 border border-gray-800 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Student Performance Feedback</h3>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-400 mb-4">How is {selectedBookingForFeedback.studentId?.name} performing?</p>
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Feedback</label>
                <textarea
                  value={studentFeedback}
                  onChange={(e) => setStudentFeedback(e.target.value)}
                  rows="4"
                  required
                  className="w-full px-4 py-2 bg-[#2A2A32] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="Provide feedback on the student's performance, participation, understanding, etc..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 px-4 py-2 bg-[#2A2A32] hover:bg-[#3A3A42] text-white rounded-lg border border-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg transition"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
