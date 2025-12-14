import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { 
  User, Calendar, Clock, BookOpen, TrendingUp, Edit2, 
  Lock, Mail, Save, X, CheckCircle, AlertCircle, Star, BarChart3
} from 'lucide-react';
import ChatWidget from '../../components/copilot/ChatWidget';
import Header from '../../components/Header';
import axios from 'axios';

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    upcomingBookings: 0,
    uniqueTutors: 0
  });
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ name: '', email: '' });
  const [passwordChange, setPasswordChange] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/auth/student/login');
      return;
    }

    const userObj = JSON.parse(userData);
    setUser(userObj);
    setEditData({ name: userObj.name, email: userObj.email });
    fetchDashboardData(userObj.id);
    fetchPerformance();
  }, [router]);

  const fetchDashboardData = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/bookings', {
        params: { userId, role: 'student' },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const allBookings = response.data.bookings || [];
      setBookings(allBookings);

      // Calculate stats
      const now = new Date();
      const completed = allBookings.filter(b => b.status === 'completed').length;
      const upcoming = allBookings.filter(b => new Date(b.startTime) > now && b.status === 'confirmed').length;
      const uniqueTutors = new Set(allBookings.map(b => b.tutorId?._id || b.tutorId)).size;

      setStats({
        totalBookings: allBookings.length,
        completedBookings: completed,
        upcomingBookings: upcoming,
        uniqueTutors
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/performance/student', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPerformance(response.data);
    } catch (error) {
      console.error('Error fetching performance:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:5000/api/users/profile',
        { name: editData.name, email: editData.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = { ...user, name: editData.name, email: editData.email };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setEditMode(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update profile' });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordChange.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5000/api/users/password',
        {
          currentPassword: passwordChange.currentPassword,
          newPassword: passwordChange.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPasswordChange({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordChange(false);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to change password' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F14] flex items-center justify-center">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  const upcomingBookings = bookings
    .filter(b => new Date(b.startTime) > new Date() && b.status === 'confirmed')
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, 5);

  const pastBookings = bookings
    .filter(b => new Date(b.endTime) < new Date() || b.status === 'completed')
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    .slice(0, 5);

  const tutorsList = Array.from(
    new Map(bookings.map(b => [b.tutorId?._id || b.tutorId, b.tutorId])).values()
  ).slice(0, 8);

  return (
    <div className="min-h-screen bg-[#0F0F14]">
      <ChatWidget />
      <Header />

      <div className="container mx-auto px-6 py-8">
        {/* Success/Error Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between ${
            message.type === 'success' 
              ? 'bg-green-900/20 border-green-500/50' 
              : 'bg-red-900/20 border-red-500/50'
          }`}>
            <div className="flex items-center space-x-3">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <p className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>
                {message.text}
              </p>
            </div>
            <button onClick={() => setMessage({ type: '', text: '' })}>
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Dashboard</h1>
          <p className="text-gray-400">Welcome back, {user?.name}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1A1A1F] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <Calendar className="w-8 h-8 text-[#3B82F6]" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.totalBookings}</p>
            <p className="text-gray-400 text-sm">Total Bookings</p>
          </div>
          <div className="bg-[#1A1A1F] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.completedBookings}</p>
            <p className="text-gray-400 text-sm">Completed Sessions</p>
          </div>
          <div className="bg-[#1A1A1F] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.upcomingBookings}</p>
            <p className="text-gray-400 text-sm">Upcoming Sessions</p>
          </div>
          <div className="bg-[#1A1A1F] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <BookOpen className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.uniqueTutors}</p>
            <p className="text-gray-400 text-sm">Tutors Worked With</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Bookings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <div className="bg-[#1A1A1F] rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <User className="w-5 h-5 mr-2 text-[#3B82F6]" />
                  Profile Information
                </h2>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#2A2A32] hover:bg-[#3A3A42] text-white rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {editMode ? (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-[#2A2A32] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="w-full px-4 py-2 bg-[#2A2A32] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      required
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex items-center space-x-2 px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg transition"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false);
                        setEditData({ name: user.name, email: user.email });
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-[#2A2A32] hover:bg-[#3A3A42] text-white rounded-lg transition"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Name</p>
                    <p className="text-white font-medium">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Email</p>
                    <p className="text-white font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Role</p>
                    <p className="text-white font-medium capitalize">{user?.role}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-700">
                    <button
                      onClick={() => setShowPasswordChange(!showPasswordChange)}
                      className="flex items-center space-x-2 px-4 py-2 bg-[#2A2A32] hover:bg-[#3A3A42] text-white rounded-lg transition"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Change Password</span>
                    </button>
                  </div>
                </div>
              )}

              {showPasswordChange && !editMode && (
                <form onSubmit={handlePasswordChange} className="mt-6 pt-6 border-t border-gray-700 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={passwordChange.currentPassword}
                      onChange={(e) => setPasswordChange({ ...passwordChange, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 bg-[#2A2A32] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordChange.newPassword}
                      onChange={(e) => setPasswordChange({ ...passwordChange, newPassword: e.target.value })}
                      className="w-full px-4 py-2 bg-[#2A2A32] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordChange.confirmPassword}
                      onChange={(e) => setPasswordChange({ ...passwordChange, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 bg-[#2A2A32] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex items-center space-x-2 px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg transition"
                    >
                      <Save className="w-4 h-4" />
                      <span>Update Password</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordChange(false);
                        setPasswordChange({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-[#2A2A32] hover:bg-[#3A3A42] text-white rounded-lg transition"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Upcoming Bookings */}
            <div className="bg-[#1A1A1F] rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-[#3B82F6]" />
                Upcoming Sessions
              </h2>
              {upcomingBookings.length === 0 ? (
                <p className="text-gray-400">No upcoming sessions</p>
              ) : (
                <div className="space-y-3">
                  {upcomingBookings.map((booking) => (
                    <div key={booking._id} className="bg-[#2A2A32] rounded-lg p-4 border border-gray-700">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-white font-medium">{booking.tutorId?.name}</p>
                        <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {new Date(booking.startTime).toLocaleString()}
                      </p>
                      {booking.subject && (
                        <p className="text-gray-400 text-sm">Subject: {booking.subject}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Performance Analytics */}
            {performance && (
              <>
                <div className="bg-[#1A1A1F] rounded-xl p-6 border border-gray-800">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-[#3B82F6]" />
                    Learning Analytics
                  </h2>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-[#2A2A32] rounded-lg p-4 border border-gray-700">
                      <p className="text-gray-400 text-sm mb-1">Total Lectures</p>
                      <p className="text-2xl font-bold text-white">
                        {performance?.subjectStats?.reduce((sum, stat) => sum + stat.lecturesCount, 0) || 0}
                      </p>
                    </div>
                    <div className="bg-[#2A2A32] rounded-lg p-4 border border-gray-700">
                      <p className="text-gray-400 text-sm mb-1">Total Hours</p>
                      <p className="text-2xl font-bold text-white">
                        {performance?.subjectStats?.reduce((sum, stat) => sum + stat.totalHours, 0).toFixed(1) || 0}h
                      </p>
                    </div>
                    <div className="bg-[#2A2A32] rounded-lg p-4 border border-gray-700">
                      <p className="text-gray-400 text-sm mb-1">Subjects</p>
                      <p className="text-2xl font-bold text-white">
                        {performance?.subjectStats?.length || 0}
                      </p>
                    </div>
                  </div>

                  {/* Subject Breakdown */}
                  {performance?.subjectStats?.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-gray-400 mb-2">Subject Breakdown</h3>
                      {performance.subjectStats.map((stat, idx) => (
                        <div key={idx} className="bg-[#2A2A32] rounded-lg p-3 border border-gray-700">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="text-white font-medium">{stat.subject}</h4>
                            <span className="text-gray-400 text-sm">{stat.lecturesCount} lectures</span>
                          </div>
                          <div className="flex gap-4 text-xs text-gray-400">
                            <span>{stat.totalHours}h total</span>
                            <span>{stat.tutorsCount} tutor{stat.tutorsCount !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tutor Feedback */}
                {performance?.tutorFeedbacks && performance.tutorFeedbacks.length > 0 && (
                  <div className="bg-[#1A1A1F] rounded-xl p-6 border border-gray-800">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <Star className="w-5 h-5 mr-2 text-[#3B82F6]" />
                      Tutor Feedback
                    </h2>
                    <div className="space-y-3">
                      {performance.tutorFeedbacks.map((feedback, idx) => (
                        <div key={idx} className="bg-[#2A2A32] rounded-lg p-4 border border-gray-700">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-white font-medium">{feedback.tutorName}</h3>
                              <p className="text-gray-400 text-sm">{feedback.subject}</p>
                            </div>
                            <span className="text-gray-400 text-xs">
                              {new Date(feedback.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">{feedback.feedback}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Past Bookings */}
            <div className="bg-[#1A1A1F] rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-[#3B82F6]" />
                Recent Past Sessions
              </h2>
              {pastBookings.length === 0 ? (
                <p className="text-gray-400">No past sessions</p>
              ) : (
                <div className="space-y-3">
                  {pastBookings.map((booking) => (
                    <div key={booking._id} className="bg-[#2A2A32] rounded-lg p-4 border border-gray-700">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-white font-medium">{booking.tutorId?.name}</p>
                        <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                          Completed
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {new Date(booking.startTime).toLocaleDateString()}
                      </p>
                      {booking.subject && (
                        <p className="text-gray-400 text-sm">Subject: {booking.subject}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Tutors */}
          <div className="space-y-6">
            <div className="bg-[#1A1A1F] rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-[#3B82F6]" />
                Your Tutors ({tutorsList.length})
              </h2>
              {tutorsList.length === 0 ? (
                <p className="text-gray-400">No tutors yet</p>
              ) : (
                <div className="space-y-3">
                  {tutorsList.map((tutor, idx) => (
                    <div
                      key={tutor?._id || idx}
                      className="flex items-center space-x-3 p-3 bg-[#2A2A32] rounded-lg border border-gray-700 hover:border-[#3B82F6] transition cursor-pointer"
                      onClick={() => router.push(`/tutor/profile/${tutor?._id}`)}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center">
                        <span className="text-xl">👩</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{tutor?.name}</p>
                        <p className="text-gray-400 text-xs">{tutor?.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-[#1A1A1F] rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">

                <button
                  onClick={() => router.push('/chats')}
                  className="w-full px-4 py-3 bg-[#2A2A32] hover:bg-[#3A3A42] text-white rounded-lg transition font-medium"
                >
                  View Messages
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
