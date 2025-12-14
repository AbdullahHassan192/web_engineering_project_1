import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { DollarSign, TrendingUp, Calendar, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import ChatWidget from '../../components/copilot/ChatWidget';
import Header from '../../components/Header';
import axios from 'axios';

export default function Earnings() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [earnings, setEarnings] = useState({
    total: 0,
    thisMonth: 0,
    lastMonth: 0,
    pending: 0
  });
  const [stats, setStats] = useState({
    totalHours: 0,
    completedSessions: 0,
    avgSessionLength: 0,
    avgEarningPerSession: 0
  });
  const [monthlyBreakdown, setMonthlyBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/auth/student/login');
      return;
    }

    const userObj = JSON.parse(userData);
    setUser(userObj);
    fetchBookings(userObj);
  }, [router]);

  const fetchBookings = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5000/api/bookings', {
        params: { userId: userData.id, role: 'tutor' },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const allBookings = response.data.bookings || [];
      setBookings(allBookings);

      // Calculate earnings
      const completed = allBookings.filter(b => b.status === 'completed');
      const confirmed = allBookings.filter(b => b.status === 'confirmed');

      let totalEarnings = 0;
      let totalHours = 0;
      let thisMonthEarnings = 0;
      let lastMonthEarnings = 0;
      let pendingEarnings = 0;

      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
      const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

      completed.forEach(booking => {
        const hours = (new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60);
        const earnings = hours * (userData.hourlyRate || 0);
        totalEarnings += earnings;
        totalHours += hours;

        const bookingDate = new Date(booking.startTime);
        if (bookingDate.getMonth() === thisMonth && bookingDate.getFullYear() === thisYear) {
          thisMonthEarnings += earnings;
        }
        if (bookingDate.getMonth() === lastMonth && bookingDate.getFullYear() === lastMonthYear) {
          lastMonthEarnings += earnings;
        }
      });

      confirmed.forEach(booking => {
        const hours = (new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60);
        pendingEarnings += hours * (userData.hourlyRate || 0);
      });

      setEarnings({
        total: totalEarnings,
        thisMonth: thisMonthEarnings,
        lastMonth: lastMonthEarnings,
        pending: pendingEarnings
      });

      setStats({
        totalHours: totalHours,
        completedSessions: completed.length,
        avgSessionLength: completed.length > 0 ? totalHours / completed.length : 0,
        avgEarningPerSession: completed.length > 0 ? totalEarnings / completed.length : 0
      });

      // Calculate monthly breakdown (last 6 months)
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(thisYear, thisMonth - i, 1);
        const month = date.getMonth();
        const year = date.getFullYear();
        
        const monthEarnings = completed
          .filter(b => {
            const bookingDate = new Date(b.startTime);
            return bookingDate.getMonth() === month && bookingDate.getFullYear() === year;
          })
          .reduce((sum, b) => {
            const hours = (new Date(b.endTime) - new Date(b.startTime)) / (1000 * 60 * 60);
            return sum + (hours * (userData.hourlyRate || 0));
          }, 0);

        monthlyData.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          earnings: monthEarnings
        });
      }
      setMonthlyBreakdown(monthlyData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F14] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const completedBookings = bookings
    .filter(b => b.status === 'completed')
    .sort((a, b) => new Date(b.endTime) - new Date(a.endTime));

  const maxMonthlyEarning = Math.max(...monthlyBreakdown.map(m => m.earnings), 100);

  return (
    <div className="min-h-screen bg-[#0F0F14]">
      <ChatWidget />
      <Header />

      <div className="container mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Earnings</h2>
          <p className="text-gray-400">Track your tutoring income</p>
        </div>

        {/* Earnings Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 border border-green-500">
            <DollarSign className="w-6 h-6 text-white mb-2" />
            <p className="text-3xl font-bold text-white mb-1">${earnings.total.toFixed(2)}</p>
            <p className="text-green-100 text-sm">Total Earnings</p>
          </div>
          <div className="bg-[#1A1A1F] rounded-xl p-6 border border-gray-800">
            <TrendingUp className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-3xl font-bold text-white mb-1">${earnings.thisMonth.toFixed(2)}</p>
            <p className="text-gray-400 text-sm">This Month</p>
            {earnings.lastMonth > 0 && (
              <p className={`text-xs mt-2 ${
                earnings.thisMonth >= earnings.lastMonth ? 'text-green-400' : 'text-red-400'
              }`}>
                {earnings.thisMonth >= earnings.lastMonth ? '↑' : '↓'} 
                {Math.abs(((earnings.thisMonth - earnings.lastMonth) / earnings.lastMonth) * 100).toFixed(1)}% from last month
              </p>
            )}
          </div>
          <div className="bg-[#1A1A1F] rounded-xl p-6 border border-gray-800">
            <Calendar className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-3xl font-bold text-white mb-1">${earnings.lastMonth.toFixed(2)}</p>
            <p className="text-gray-400 text-sm">Last Month</p>
          </div>
          <div className="bg-[#1A1A1F] rounded-xl p-6 border border-gray-800">
            <Clock className="w-6 h-6 text-yellow-400 mb-2" />
            <p className="text-3xl font-bold text-white mb-1">${earnings.pending.toFixed(2)}</p>
            <p className="text-gray-400 text-sm">Pending (Confirmed)</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1A1A1F] rounded-xl p-4 border border-gray-800">
            <Clock className="w-5 h-5 text-[#3B82F6] mb-2" />
            <p className="text-2xl font-bold text-white">{stats.totalHours.toFixed(1)}h</p>
            <p className="text-gray-400 text-sm">Total Hours</p>
          </div>
          <div className="bg-[#1A1A1F] rounded-xl p-4 border border-gray-800">
            <CheckCircle className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.completedSessions}</p>
            <p className="text-gray-400 text-sm">Sessions</p>
          </div>
          <div className="bg-[#1A1A1F] rounded-xl p-4 border border-gray-800">
            <BarChart3 className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.avgSessionLength.toFixed(1)}h</p>
            <p className="text-gray-400 text-sm">Avg Session</p>
          </div>
          <div className="bg-[#1A1A1F] rounded-xl p-4 border border-gray-800">
            <DollarSign className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-2xl font-bold text-white">${stats.avgEarningPerSession.toFixed(2)}</p>
            <p className="text-gray-400 text-sm">Avg Per Session</p>
          </div>
        </div>

        {/* Monthly Breakdown Chart */}
        <div className="bg-[#1A1A1F] rounded-xl p-6 border border-gray-800 mb-8">
          <h3 className="text-xl font-semibold text-white mb-6">Monthly Earnings (Last 6 Months)</h3>
          <div className="space-y-4">
            {monthlyBreakdown.map((month, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-sm">{month.month}</span>
                  <span className="text-white font-semibold">${month.earnings.toFixed(2)}</span>
                </div>
                <div className="w-full bg-[#2A2A32] rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(month.earnings / maxMonthlyEarning) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Completed Sessions */}
        <div className="bg-[#1A1A1F] rounded-xl p-6 border border-gray-800">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Completed Sessions</h3>
          {completedBookings.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No completed sessions yet</p>
          ) : (
            <div className="space-y-3">
              {completedBookings.slice(0, 10).map((booking) => {
                const hours = (new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60);
                const earned = hours * (user?.hourlyRate || 0);
                
                return (
                  <div key={booking._id} className="bg-[#2A2A32] rounded-lg p-4 border border-gray-700 flex justify-between items-center">
                    <div>
                      <h4 className="text-white font-semibold">{booking.studentId?.name || 'Unknown Student'}</h4>
                      <p className="text-gray-400 text-sm">{booking.subject}</p>
                      <div className="flex items-center text-gray-500 text-xs mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(booking.startTime).toLocaleDateString()}
                        <Clock className="w-3 h-3 ml-3 mr-1" />
                        {hours.toFixed(1)}h
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold text-lg">${earned.toFixed(2)}</p>
                      <p className="text-gray-500 text-xs">${user?.hourlyRate}/hr</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
