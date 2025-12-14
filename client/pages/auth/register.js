import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { UserPlus, Mail, Lock, User, Loader2 } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    bio: '',
    subjects: [],
    hourlyRate: ''
  });

  const availableSubjects = ['Math', 'Physics', 'Chemistry', 'Statistics', 'Calculus'];
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const registerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        bio: formData.bio || undefined
      };

      if (formData.role === 'tutor') {
        registerData.subjects = Array.isArray(formData.subjects) ? formData.subjects : [];
        registerData.hourlyRate = formData.hourlyRate ? parseFloat(formData.hourlyRate) : 0;
      }

      const response = await axios.post('http://localhost:5000/api/auth/register', registerData);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        const role = response.data.user.role;
        if (role === 'student') {
          router.push('/student/home');
        } else if (role === 'tutor') {
          router.push('/tutor/dashboard');
        }
      }
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        setError('Cannot connect to server. Please ensure the backend server is running on port 5000.');
      } else {
        setError('Registration failed. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F14] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1A1A1F] rounded-xl shadow-2xl p-8 border border-gray-800">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">TutorConnect</h1>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#3B82F6] rounded-full mb-4 mt-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-gray-400">Join the tutoring marketplace</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 bg-[#2A2A32] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-muted mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-text-muted" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 bg-primary border border-gray-700 rounded-lg text-text-main placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-action-primary focus:border-transparent transition"
                  placeholder="user@seecs.edu.pk"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-text-muted mb-2">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="block w-full px-4 py-3 bg-primary border border-gray-700 rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-action-primary focus:border-transparent transition"
              >
                <option value="student">Student</option>
                <option value="tutor">Tutor</option>
              </select>
            </div>

            {formData.role === 'tutor' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Select Subjects to Teach
                  </label>
                  <div className="grid grid-cols-2 gap-3 p-4 bg-primary border border-gray-700 rounded-lg">
                    {availableSubjects.map((subject) => (
                      <label
                        key={subject}
                        className="flex items-center space-x-2 cursor-pointer hover:text-action-primary transition"
                      >
                        <input
                          type="checkbox"
                          checked={formData.subjects.includes(subject)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                subjects: [...formData.subjects, subject]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                subjects: formData.subjects.filter(s => s !== subject)
                              });
                            }
                          }}
                          className="w-4 h-4 text-action-primary bg-primary border-gray-600 rounded focus:ring-action-primary"
                        />
                        <span className="text-text-main">{subject}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted mt-2">
                    Selected: {formData.subjects.length > 0 ? formData.subjects.join(', ') : 'None'}
                  </p>
                </div>
                <div>
                  <label htmlFor="hourlyRate" className="block text-sm font-medium text-text-muted mb-2">
                    Hourly Rate ($)
                  </label>
                  <input
                    id="hourlyRate"
                    name="hourlyRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.hourlyRate}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-primary border border-gray-700 rounded-lg text-text-main placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-action-primary focus:border-transparent transition"
                    placeholder="50"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-text-muted mb-2">
                Bio (optional)
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="3"
                className="block w-full px-4 py-3 bg-primary border border-gray-700 rounded-lg text-text-main placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-action-primary focus:border-transparent transition resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-muted mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-muted" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 bg-primary border border-gray-700 rounded-lg text-text-main placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-action-primary focus:border-transparent transition"
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-muted mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-muted" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 bg-primary border border-gray-700 rounded-lg text-text-main placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-action-primary focus:border-transparent transition"
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-action-primary hover:bg-action-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-action-primary disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-muted">
              Already have an account?{' '}
              <a href="/auth/student/login" className="text-action-primary hover:text-action-hover font-medium">
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


