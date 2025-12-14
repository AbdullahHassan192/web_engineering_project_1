import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Calendar, Clock, User, DollarSign, Home, BarChart3, MessageCircle, Users, TrendingUp, CheckCircle, AlertCircle, Video } from 'lucide-react';
import ChatWidget from '../../components/copilot/ChatWidget';
import NotificationBell from '../../components/NotificationBell';
import Header from '../../components/Header';
import axios from 'axios';
import io from 'socket.io-client';

export default function TutorHome() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    pendingRequests: 0,
    totalEarnings: 0,
    totalStudents: 0
  });
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/auth/student/login');
      return;
    }

    const userObj = JSON.parse(userData);
    setUser(userObj);
    fetchBookings();

    // Socket.io for real-time updates
    const socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    socket.on('booking:new', (data) => {
      if (String(data.tutorId) === String(userObj.id)) {
        fetchBookings();
        setSuccessMessage('🎉 New booking request received!');
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    });

    socket.on('booking:confirmed', (data) => {
      if (String(data.tutorId) === String(userObj.id)) {
        fetchBookings();
      }
    });

    socket.on('booking:cancelled', (data) => {
      if (String(data.tutorId) === String(userObj.id)) {
        fetchBookings();
      }
    });

    return () => socket.disconnect();
  }, [router]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await axios.get('http://localhost:5000/api/bookings', {
        params: { userId: user.id, role: 'tutor' },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const allBookings = response.data.bookings || [];
      setBookings(allBookings);

      // Calculate stats
      const completed = allBookings.filter(b => b.status === 'completed').length;
      const upcoming = allBookings.filter(b => b.status === 'confirmed' && new Date(b.startTime) > new Date()).length;
      const pending = allBookings.filter(b => b.status === 'pending').length;
      
      // Calculate earnings (only completed sessions)
      const earnings = allBookings
        .filter(b => b.status === 'completed')
        .reduce((sum, booking) => {
          const hours = (new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60);
          return sum + (hours * (user.hourlyRate || 0));
        }, 0);

      // Count unique students
      const uniqueStudents = new Set(allBookings.map(b => b.studentId?._id || b.studentId)).size;

      setStats({
        totalBookings: allBookings.length,
        completedSessions: completed,
        upcomingSessions: upcoming,
        pendingRequests: pending,
        totalEarnings: earnings,
        totalStudents: uniqueStudents
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/bookings/${bookingId}`,
        { status: 'confirmed' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBookings();
      setSuccessMessage('✅ Booking confirmed! Student has been notified.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert(error.response?.data?.error || 'Failed to confirm booking');
    }
  };

  const handleRejectBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to reject this booking?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/bookings/${bookingId}`,
        { status: 'cancelled' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBookings();
      setSuccessMessage('Booking rejected. Student has been notified.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert(error.response?.data?.error || 'Failed to reject booking');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F14] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const upcomingBookings = bookings
    .filter(b => (b.status === 'confirmed' || b.status === 'pending') && new Date(b.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, 5);

  const pendingRequests = bookings.filter(b => b.status === 'pending');

  return (
    <div className="min-h-screen bg-[#0F0F14]">
      <ChatWidget />
      <Header />

      <div className="container mx-auto px-6 py-8">
        {successMessage && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500/50 rounded-xl flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
            <p className="text-green-400">{successMessage}</p>
          </div>
        )}

        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name}!</h2>
          <p className="text-gray-400">Here's your teaching overview</p>
        </div>

        {/* Hourly Rate Warning */}
        {(!user?.hourlyRate || user.hourlyRate === 0) && (
          <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-xl flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-yellow-400 font-semibold mb-1">Set Your Hourly Rate</h3>
              <p className="text-yellow-300 text-sm mb-2">You need to set your hourly rate before students can book you.</p>
              <Link href="/tutor/dashboard">
                <span className="text-[#3B82F6] hover:text-[#2563EB] text-sm font-medium cursor-pointer">
                  Go to Dashboard →
                </span>
              </Link>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-[#1A1A1F] rounded-xl p-4 border border-gray-800">
            <Calendar className="w-5 h-5 text-[#3B82F6] mb-2" />
            <p className="text-2xl font-bold text-white">{stats.totalBookings}</p>
            <p className="text-gray-400 text-sm">Total Bookings</p>
          </div>
          <div className="bg-[#1A1A1F] rounded-xl p-4 border border-gray-800">
            <CheckCircle className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.completedSessions}</p>
            <p className="text-gray-400 text-sm">Completed</p>
          </div>
          <div className="bg-[#1A1A1F] rounded-xl p-4 border border-gray-800">
            <Clock className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.upcomingSessions}</p>
            <p className="text-gray-400 text-sm">Upcoming</p>
          </div>
          <div className="bg-[#1A1A1F] rounded-xl p-4 border border-gray-800">
            <AlertCircle className="w-5 h-5 text-yellow-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.pendingRequests}</p>
            <p className="text-gray-400 text-sm">Pending</p>
          </div>
          <div className="bg-[#1A1A1F] rounded-xl p-4 border border-gray-800">
            <DollarSign className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-2xl font-bold text-white">${stats.totalEarnings.toFixed(0)}</p>
            <p className="text-gray-400 text-sm">Earnings</p>
          </div>
          <div className="bg-[#1A1A1F] rounded-xl p-4 border border-gray-800">
            <Users className="w-5 h-5 text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.totalStudents}</p>
            <p className="text-gray-400 text-sm">Students</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Link href="/tutor/dashboard">
            <div className="bg-[#1A1A1F] hover:bg-[#2A2A2F] border border-gray-800 rounded-xl p-6 cursor-pointer transition group">
              <User className="w-8 h-8 text-[#3B82F6] mb-3 group-hover:scale-110 transition" />
              <h3 className="text-white font-semibold mb-1">My Profile</h3>
              <p className="text-gray-400 text-sm">Edit profile & settings</p>
            </div>
          </Link>
          <Link href="/tutor/students">
            <div className="bg-[#1A1A1F] hover:bg-[#2A2A2F] border border-gray-800 rounded-xl p-6 cursor-pointer transition group">
              <Users className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition" />
              <h3 className="text-white font-semibold mb-1">My Students</h3>
              <p className="text-gray-400 text-sm">View all students</p>
            </div>
          </Link>
          <Link href="/tutor/earnings">
            <div className="bg-[#1A1A1F] hover:bg-[#2A2A2F] border border-gray-800 rounded-xl p-6 cursor-pointer transition group">
              <TrendingUp className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition" />
              <h3 className="text-white font-semibold mb-1">Earnings</h3>
              <p className="text-gray-400 text-sm">View financial details</p>
            </div>
          </Link>
          <Link href="/chats">
            <div className="bg-[#1A1A1F] hover:bg-[#2A2A2F] border border-gray-800 rounded-xl p-6 cursor-pointer transition group">
              <MessageCircle className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition" />
              <h3 className="text-white font-semibold mb-1">Messages</h3>
              <p className="text-gray-400 text-sm">Chat with students</p>
            </div>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div className="bg-[#1A1A1F] rounded-xl p-6 border border-gray-800">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-yellow-400" />
                Pending Requests ({pendingRequests.length})
              </h3>
              <div className="space-y-3">
                {pendingRequests.map((booking) => (
                  <div key={booking._id} className="bg-[#2A2A32] rounded-lg p-4 border border-gray-700">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-white font-semibold">{booking.studentId?.name || 'Unknown Student'}</h4>
                        <p className="text-gray-400 text-sm">{booking.subject}</p>
                      </div>
                      <span className="text-yellow-400 text-xs font-medium px-2 py-1 bg-yellow-400/10 rounded">
                        Pending
                      </span>
                    </div>
                    <div className="flex items-center text-gray-400 text-sm mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(booking.startTime).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-gray-400 text-sm mb-3">
                      <Clock className="w-4 h-4 mr-2" />
                      {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center text-gray-400 text-sm mb-3">
                      <Video className="w-4 h-4 mr-2" />
                      {booking.platform || 'Not specified'}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleConfirmBooking(booking._id)}
                        className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectBooking(booking._id)}
                        className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Sessions */}
          <div className="bg-[#1A1A1F] rounded-xl p-6 border border-gray-800">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-[#3B82F6]" />
              Upcoming Sessions
            </h3>
            {upcomingBookings.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No upcoming sessions</p>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((booking) => (
                  <div key={booking._id} className="bg-[#2A2A32] rounded-lg p-4 border border-gray-700">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-white font-semibold">{booking.studentId?.name || 'Unknown Student'}</h4>
                        <p className="text-gray-400 text-sm">{booking.subject}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        booking.status === 'confirmed' 
                          ? 'text-blue-400 bg-blue-400/10'
                          : 'text-yellow-400 bg-yellow-400/10'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-400 text-sm mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(booking.startTime).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-gray-400 text-sm mb-2">
                      <Clock className="w-4 h-4 mr-2" />
                      {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Video className="w-4 h-4 mr-2" />
                      {booking.platform || 'Not specified'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
