import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Calendar, Clock, User, LogOut, Search, DollarSign, BookOpen, X, Loader2, Home, BarChart3, MessageCircle, Edit2, Trash2, Star, AlertCircle, Video } from 'lucide-react';
import ChatWidget from '../../components/copilot/ChatWidget';
import NotificationBell from '../../components/NotificationBell';
import Header from '../../components/Header';
import axios from 'axios';
import io from 'socket.io-client';

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    startTime: '',
    duration: 1,
    subject: '',
    message: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedBookingForRating, setSelectedBookingForRating] = useState(null);
  const [rating, setRating] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [showEditTimeModal, setShowEditTimeModal] = useState(false);
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState(null);
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/auth/student/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchBookings();
    fetchTutors();

    // Set up Socket.io connection for real-time updates
    const socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    socket.on('booking:confirmed', (data) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      // Convert both to strings for comparison
      if (String(data.studentId) === String(user.id)) {
        setSuccessMessage('Lecture Successfully Placed!');
        fetchBookings(); // Refresh bookings
        fetchTutors(); // Refresh tutors to get updated hourly rates
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    });

    socket.on('booking:cancelled', (data) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (String(data.studentId) === String(user.id)) {
        fetchBookings();
      }
    });

    socket.on('booking:timeChangeRequest', (data) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (String(data.studentId) === String(user.id)) {
        fetchBookings();
      }
    });

    socket.on('booking:timeChangeResponse', (data) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (String(data.studentId) === String(user.id)) {
        fetchBookings();
        if (data.accepted) {
          setSuccessMessage('Time change request accepted!');
        } else {
          setSuccessMessage('Time change request rejected.');
        }
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    });

    socket.on('tutor:rateUpdated', (data) => {
      // Refresh tutors list when any tutor updates their rate
      fetchTutors();
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [router]);

  // Handle bookTutor query parameter separately
  useEffect(() => {
    if (router.isReady && router.query.bookTutor && tutors.length > 0 && !showBookingModal) {
      const tutorToBook = tutors.find(t => (t._id || t.id) === router.query.bookTutor);
      if (tutorToBook) {
        handleBookTutor(tutorToBook);
        // Clear the query parameter to prevent re-triggering
        router.replace('/student/home', undefined, { shallow: true });
      }
    }
  }, [router.isReady, router.query.bookTutor, tutors, showBookingModal]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await axios.get('http://localhost:5000/api/bookings', {
        params: { userId: user.id, role: 'student' },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTutors = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedSubject) params.subject = selectedSubject;

      const response = await axios.get('http://localhost:5000/api/tutors', { params });
      setTutors(response.data.tutors || []);
    } catch (error) {
      console.error('Error fetching tutors:', error);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm || selectedSubject) {
        fetchTutors();
      } else {
        fetchTutors();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedSubject]);

  const handleBookTutor = (tutor) => {
    setSelectedTutor(tutor);
    setShowBookingModal(true);
    setBookingError('');
    // Set default time (1 hour from now)
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0);
    
    setBookingForm({
      startTime: now.toISOString().slice(0, 16),
      duration: 1,
      subject: tutor.subjects?.[0] || '',
      platform: 'Jitsi Meet',
      message: ''
    });
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingLoading(true);

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      // Calculate end time from start time + duration
      const startTime = new Date(bookingForm.startTime);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + bookingForm.duration);

      const response = await axios.post(
        'http://localhost:5000/api/bookings',
        {
          studentId: user.id,
          tutorId: selectedTutor._id || selectedTutor.id,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          subject: bookingForm.subject,
          platform: bookingForm.platform,
          message: bookingForm.message
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setShowBookingModal(false);
      setSelectedTutor(null);
      fetchBookings(); // Refresh bookings
      setSuccessMessage('Booking request sent! The tutor will be notified and you will receive a confirmation once they accept.');
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      setBookingError(error.response?.data?.error || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
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
      setSuccessMessage('Booking cancelled successfully. The tutor has been notified.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert(error.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const handleEditTime = (booking) => {
    setSelectedBookingForEdit(booking);
    setNewStartTime(new Date(booking.startTime).toISOString().slice(0, 16));
    setNewEndTime(new Date(booking.endTime).toISOString().slice(0, 16));
    setShowEditTimeModal(true);
  };

  const handleSubmitTimeChange = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/bookings/${selectedBookingForEdit._id}/time`,
        { newStartTime, newEndTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowEditTimeModal(false);
      fetchBookings();
      setSuccessMessage('Time change request sent. Waiting for tutor confirmation.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error requesting time change:', error);
      alert(error.response?.data?.error || 'Failed to request time change');
    }
  };

  const handleRateBooking = (booking) => {
    setSelectedBookingForRating(booking);
    setRating(0);
    setRatingFeedback('');
    setShowRatingModal(true);
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/bookings/${selectedBookingForRating._id}/rating`,
        { rating, feedback: ratingFeedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowRatingModal(false);
      fetchBookings();
      setSuccessMessage('Rating submitted successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert(error.response?.data?.error || 'Failed to submit rating');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-text-main">Loading...</div>
      </div>
    );
  }

  const allSubjects = [...new Set(tutors.flatMap(t => t.subjects || []))];

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
          <h2 className="text-3xl font-bold text-white mb-2">Find a Tutor</h2>
          <p className="text-gray-400">Browse and book sessions with expert tutors</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-[#1A1A1F] rounded-xl p-6 border border-gray-800 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Search className="w-5 h-5 mr-2 text-[#3B82F6]" />
            Find Tutors
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search by name, bio, or subject
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tutors..."
                className="w-full px-4 py-2 bg-[#2A2A32] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Filter by subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2 bg-[#2A2A32] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              >
                <option value="">All Subjects</option>
                {allSubjects.map((subject, idx) => (
                  <option key={idx} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Available Tutors Section */}
          <div className="lg:col-span-2">
            <div className="bg-[#1A1A1F] rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-[#3B82F6]" />
                Available Tutors ({tutors.length})
              </h2>
              {tutors.length === 0 ? (
                <p className="text-gray-400">No tutors found. Try adjusting your search.</p>
              ) : (
                <div className="space-y-4">
                  {tutors.map((tutor, index) => (
                    <div
                      key={tutor._id || tutor.id}
                      className="bg-[#2A2A32] rounded-xl p-4 border border-gray-700 hover:border-[#3B82F6] transition cursor-pointer"
                      onClick={() => router.push(`/tutor/profile/${tutor._id}`)}
                    >
                      <div className="flex justify-between items-start gap-4">
                        {/* Tutor Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#F5E6D3] to-[#E8D4BB] flex items-center justify-center">
                            <span className="text-4xl">
                              {index % 4 === 0 ? '👩' : index % 4 === 1 ? '👨' : index % 4 === 2 ? '👩' : '👨'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {tutor.name}
                          </h3>
                          
                          {/* Rating */}
                          <div className="flex items-center mb-2">
                            {tutor.totalReviews > 0 ? (
                              <>
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-white font-semibold ml-1 text-sm">
                                  {tutor.averageRating.toFixed(1)}
                                </span>
                                <span className="text-gray-400 text-xs ml-1">({tutor.totalReviews})</span>
                              </>
                            ) : (
                              <span className="text-gray-400 text-xs">New tutor</span>
                            )}
                          </div>
                          
                          {tutor.bio && (
                            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{tutor.bio}</p>
                          )}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {tutor.subjects?.slice(0, 3).map((subject, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-[#3B82F6]/20 text-[#3B82F6] rounded text-xs"
                              >
                                {subject}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center space-x-4 text-gray-400 text-sm">
                            <span className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              ${tutor.hourlyRate || 0}/hr
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Link
                            href={`/chat?tutorId=${tutor._id || tutor.id}`}
                            className="p-2 bg-[#2A2A32] hover:bg-[#3A3A42] text-white rounded-lg border border-gray-700 transition"
                            title="Chat with tutor"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MessageCircle className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleBookTutor(tutor); }}
                            className="px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg transition whitespace-nowrap text-sm"
                          >
                            Book Session
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Profile and Bookings */}
          <div className="space-y-6">
            <div className="bg-[#1A1A1F] rounded-xl p-6 border border-gray-800">
              <div className="flex items-center space-x-3 mb-4">
                <User className="w-6 h-6 text-[#3B82F6]" />
                <h2 className="text-xl font-semibold text-white">Profile</h2>
              </div>
              <div className="space-y-2 text-gray-400">
                <p><span className="text-white">Email:</span> {user?.email}</p>
                <p><span className="text-white">Bio:</span> {user?.bio || 'No bio set'}</p>
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
                    <div key={booking._id} className="border border-gray-700 rounded-lg p-3 bg-[#2A2A32]">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="text-white font-medium">{booking.tutorId?.name}</p>
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
                              {booking.status === 'confirmed' ? '✓ Confirmed' :
                               booking.status === 'pending' ? '⏳ Pending' :
                               booking.status === 'cancelled' ? '✗ Cancelled' :
                               booking.status}
                            </span>
                          </p>
                          {booking.status === 'confirmed' && (
                            <p className="text-green-400 text-xs mt-1">✓ Lecture Successfully Placed</p>
                          )}
                          {booking.timeChangeRequest?.status === 'pending' && (
                            <p className="text-yellow-400 text-xs mt-1">⏳ Time change request pending</p>
                          )}
                          {booking.tutorFeedback && (
                            <div className="mt-2 p-2 bg-[#1A1A1F] rounded border border-gray-700">
                              <p className="text-xs text-gray-400 mb-1">Tutor Feedback:</p>
                              <p className="text-sm text-white">{booking.tutorFeedback}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col space-y-1 ml-2">
                          <Link
                            href={`/chat?tutorId=${booking.tutorId?._id || booking.tutorId}`}
                            className="p-2 bg-secondary hover:bg-gray-700 text-text-main rounded border border-gray-700 transition relative"
                            title="Chat with tutor"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Link>
                          <Link
                            href="/chats"
                            className="p-2 bg-secondary hover:bg-gray-700 text-text-main rounded border border-gray-700 transition text-xs text-center"
                            title="All conversations"
                          >
                            All
                          </Link>
                          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                            <>
                              <button
                                onClick={() => handleEditTime(booking)}
                                className="p-2 bg-secondary hover:bg-gray-700 text-text-main rounded border border-gray-700 transition"
                                title="Edit time"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleCancelBooking(booking._id)}
                                className="p-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded border border-red-500/50 transition"
                                title="Cancel booking"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {booking.status === 'completed' && !booking.rating && (
                            <button
                              onClick={() => handleRateBooking(booking)}
                              className="p-2 bg-yellow-900/20 hover:bg-yellow-900/40 text-yellow-400 rounded border border-yellow-500/50 transition"
                              title="Rate this lecture"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          )}
                          {booking.videoLink && booking.status === 'confirmed' && (
                            <a
                              href={booking.videoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-action-primary hover:bg-action-hover text-white rounded transition text-xs text-center"
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
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedTutor && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#1A1A1F] rounded-2xl p-6 border border-gray-800 max-w-md w-full shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  Book a Session
                </h3>
                <p className="text-gray-400 text-sm">with {selectedTutor.name}</p>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-white hover:bg-[#2A2A32] p-2 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingError && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-xl text-red-400 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {bookingError}
              </div>
            )}

            <form onSubmit={handleCreateBooking} className="space-y-4">
              {/* Date & Time */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  When would you like to start?
                </label>
                <input
                  type="datetime-local"
                  value={bookingForm.startTime}
                  onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-[#2A2A32] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/20 transition"
                />
              </div>

              {/* Duration Selection */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Session Duration
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 1.5, 2, 2.5].map((duration) => {
                    const price = ((selectedTutor.hourlyRate || 0) * duration).toFixed(2);
                    return (
                      <button
                        key={duration}
                        type="button"
                        onClick={() => setBookingForm({ ...bookingForm, duration })}
                        className={`p-3 rounded-lg border-2 transition ${
                          bookingForm.duration === duration
                            ? 'border-[#3B82F6] bg-[#3B82F6]/10'
                            : 'border-gray-700 bg-[#2A2A32] hover:border-gray-600'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-sm font-bold text-white mb-1">
                            {duration === 1 ? '1 hour' : duration === 1.5 ? '1.5 hrs' : duration === 2 ? '2 hours' : '2.5 hrs'}
                          </div>
                          <div className="text-[#3B82F6] font-semibold text-xs">
                            ${price}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  <BookOpen className="w-4 h-4 inline mr-1" />
                  Subject
                </label>
                <select
                  value={bookingForm.subject}
                  onChange={(e) => setBookingForm({ ...bookingForm, subject: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-[#2A2A32] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/20 transition"
                >
                  <option value="">Select a subject</option>
                  {selectedTutor?.subjects?.map((subject, idx) => (
                    <option key={idx} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  <Video className="w-4 h-4 inline mr-1" />
                  Meeting Platform
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Jitsi Meet', 'Google Meet', 'Zoom', 'Microsoft Teams', 'Skype', 'Other'].map((platformOption) => (
                    <button
                      key={platformOption}
                      type="button"
                      onClick={() => setBookingForm({ ...bookingForm, platform: platformOption })}
                      className={`p-2 rounded-lg border-2 transition text-sm ${
                        bookingForm.platform === platformOption
                          ? 'border-[#3B82F6] bg-[#3B82F6]/10 text-white'
                          : 'border-gray-700 bg-[#2A2A32] text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      {platformOption}
                    </button>
                  ))}
                </div>
                <p className="text-gray-500 text-xs mt-1">The tutor will send you a meeting link for your preferred platform</p>
              </div>

              {/* Message (Optional) */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  <MessageCircle className="w-4 h-4 inline mr-1" />
                  Message (Optional)
                </label>
                <textarea
                  value={bookingForm.message}
                  onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                  placeholder="Add a message for the tutor..."
                  rows="2"
                  className="w-full px-3 py-2 bg-[#2A2A32] border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/20 transition resize-none"
                />
                <p className="text-gray-500 text-xs mt-1">Let the tutor know what you'd like to focus on</p>
              </div>

              {/* Total Price Summary */}
              <div className="bg-[#2A2A32] rounded-lg p-3 border border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Total</span>
                  <span className="text-xl font-bold text-[#3B82F6]">
                    ${((selectedTutor.hourlyRate || 0) * bookingForm.duration).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 py-2 bg-[#2A2A32] hover:bg-[#3A3A42] text-white rounded-lg font-medium text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="flex-1 px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      Confirm
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedBookingForRating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary rounded-lg p-6 border border-gray-800 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-text-main">Rate Your Lecture</h3>
              <button
                onClick={() => setShowRatingModal(false)}
                className="text-text-muted hover:text-text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-text-muted mb-4">How was your lecture with {selectedBookingForRating.tutorId?.name}?</p>
            <form onSubmit={handleSubmitRating} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-2 rounded ${
                        rating >= star
                          ? 'text-yellow-400 bg-yellow-900/20'
                          : 'text-gray-600 bg-primary'
                      }`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Feedback (optional)</label>
                <textarea
                  value={ratingFeedback}
                  onChange={(e) => setRatingFeedback(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 bg-primary border border-gray-700 rounded-lg text-text-main placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-action-primary"
                  placeholder="Share your experience..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowRatingModal(false)}
                  className="flex-1 px-4 py-2 bg-secondary hover:bg-gray-700 text-text-main rounded-lg border border-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-action-primary hover:bg-action-hover text-white rounded-lg transition"
                >
                  Submit Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Time Modal */}
      {showEditTimeModal && selectedBookingForEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary rounded-lg p-6 border border-gray-800 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-text-main">Reschedule Lecture</h3>
              <button
                onClick={() => setShowEditTimeModal(false)}
                className="text-text-muted hover:text-text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-text-muted mb-4">Request a new time for your lecture with {selectedBookingForEdit.tutorId?.name}</p>
            <form onSubmit={handleSubmitTimeChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">New Start Time</label>
                <input
                  type="datetime-local"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-primary border border-gray-700 rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-action-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">New End Time</label>
                <input
                  type="datetime-local"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-primary border border-gray-700 rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-action-primary"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditTimeModal(false)}
                  className="flex-1 px-4 py-2 bg-secondary hover:bg-gray-700 text-text-main rounded-lg border border-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-action-primary hover:bg-action-hover text-white rounded-lg transition"
                >
                  Request Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
