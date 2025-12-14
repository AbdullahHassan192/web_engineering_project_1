import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Users, Search, Calendar, CheckCircle, MessageCircle, Star } from 'lucide-react';
import ChatWidget from '../../components/copilot/ChatWidget';
import Header from '../../components/Header';
import axios from 'axios';

export default function MyStudents() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/student/login');
      return;
    }
    fetchStudents();
  }, [router]);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await axios.get('http://localhost:5000/api/bookings', {
        params: { userId: user.id, role: 'tutor' },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const bookings = response.data.bookings || [];
      
      // Group bookings by student
      const studentMap = new Map();
      bookings.forEach(booking => {
        const studentId = booking.studentId?._id || booking.studentId;
        const studentName = booking.studentId?.name || 'Unknown Student';
        const studentEmail = booking.studentId?.email || '';

        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            id: studentId,
            name: studentName,
            email: studentEmail,
            totalSessions: 0,
            completedSessions: 0,
            upcomingSessions: 0,
            subjects: new Set(),
            totalHours: 0,
            lastSession: null
          });
        }

        const student = studentMap.get(studentId);
        student.totalSessions++;
        
        if (booking.status === 'completed') {
          student.completedSessions++;
          const hours = (new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60);
          student.totalHours += hours;
          
          if (!student.lastSession || new Date(booking.endTime) > new Date(student.lastSession)) {
            student.lastSession = booking.endTime;
          }
        }
        
        if (booking.status === 'confirmed' && new Date(booking.startTime) > new Date()) {
          student.upcomingSessions++;
        }
        
        if (booking.subject) {
          student.subjects.add(booking.subject);
        }
      });

      const studentsList = Array.from(studentMap.values()).map(student => ({
        ...student,
        subjects: Array.from(student.subjects)
      }));

      setStudents(studentsList);
      setFilteredStudents(studentsList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchTerm, students]);

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

      <div className="container mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">My Students</h2>
          <p className="text-gray-400">Students you've tutored</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search students by name, email, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#1A1A1F] text-white rounded-xl border border-gray-800 focus:border-[#3B82F6] focus:outline-none"
            />
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1A1A1F] rounded-xl p-4 border border-gray-800">
            <Users className="w-5 h-5 text-[#3B82F6] mb-2" />
            <p className="text-2xl font-bold text-white">{students.length}</p>
            <p className="text-gray-400 text-sm">Total Students</p>
          </div>
          <div className="bg-[#1A1A1F] rounded-xl p-4 border border-gray-800">
            <CheckCircle className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-2xl font-bold text-white">
              {students.reduce((sum, s) => sum + s.completedSessions, 0)}
            </p>
            <p className="text-gray-400 text-sm">Total Sessions</p>
          </div>
          <div className="bg-[#1A1A1F] rounded-xl p-4 border border-gray-800">
            <Calendar className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white">
              {students.reduce((sum, s) => sum + s.upcomingSessions, 0)}
            </p>
            <p className="text-gray-400 text-sm">Upcoming</p>
          </div>
          <div className="bg-[#1A1A1F] rounded-xl p-4 border border-gray-800">
            <Star className="w-5 h-5 text-yellow-400 mb-2" />
            <p className="text-2xl font-bold text-white">
              {students.reduce((sum, s) => sum + s.totalHours, 0).toFixed(1)}
            </p>
            <p className="text-gray-400 text-sm">Total Hours</p>
          </div>
        </div>

        {/* Students List */}
        {filteredStudents.length === 0 ? (
          <div className="bg-[#1A1A1F] rounded-xl p-12 border border-gray-800 text-center">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Students Found</h3>
            <p className="text-gray-400">
              {searchTerm ? 'Try a different search term' : 'You haven\'t tutored any students yet'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="bg-[#1A1A1F] rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition"
              >
                {/* Student Info */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center text-white font-semibold text-lg">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{student.name}</h3>
                      <p className="text-gray-400 text-sm">{student.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/chat?studentId=${student.id}`)}
                    className="text-[#3B82F6] hover:text-[#2563EB] transition"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-[#2A2A32] rounded-lg p-3">
                    <p className="text-xl font-bold text-white">{student.completedSessions}</p>
                    <p className="text-gray-400 text-xs">Completed</p>
                  </div>
                  <div className="bg-[#2A2A32] rounded-lg p-3">
                    <p className="text-xl font-bold text-white">{student.upcomingSessions}</p>
                    <p className="text-gray-400 text-xs">Upcoming</p>
                  </div>
                </div>

                {/* Subjects */}
                <div className="mb-3">
                  <p className="text-gray-400 text-xs mb-2">Subjects:</p>
                  <div className="flex flex-wrap gap-1">
                    {student.subjects.slice(0, 3).map((subject, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-[#3B82F6]/10 text-[#3B82F6] text-xs rounded"
                      >
                        {subject}
                      </span>
                    ))}
                    {student.subjects.length > 3 && (
                      <span className="px-2 py-1 bg-[#2A2A32] text-gray-400 text-xs rounded">
                        +{student.subjects.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Total Hours */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Total Hours:</span>
                  <span className="text-white font-semibold">{student.totalHours.toFixed(1)}h</span>
                </div>

                {/* Last Session */}
                {student.lastSession && (
                  <div className="mt-2 text-xs text-gray-500">
                    Last session: {new Date(student.lastSession).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
