import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import NotificationBell from './NotificationBell';
import { LogOut, Menu, X } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setMobileMenuOpen(false);
    router.push('/');
  };

  const navigate = (path) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-[#1A1A1F] border-b border-gray-800">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 
              className="text-2xl font-bold text-white cursor-pointer"
              onClick={() => router.push('/')}
            >
              TutorConnect
            </h1>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-6">
              {user && user.role === 'student' && (
                <>
                  <button 
                    onClick={() => router.push('/student/home')} 
                    className="text-white hover:text-gray-300 transition"
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => router.push('/search')} 
                    className="text-white hover:text-gray-300 transition"
                  >
                    Find a Tutor
                  </button>
                  <button 
                    onClick={() => router.push('/student/dashboard')} 
                    className="text-white hover:text-gray-300 transition"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => router.push('/chats')} 
                    className="text-white hover:text-gray-300 transition"
                  >
                    Messages
                  </button>
                </>
              )}
              {user && user.role === 'tutor' && (
                <>
                  <button 
                    onClick={() => router.push('/tutor/home')} 
                    className="text-white hover:text-gray-300 transition"
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => router.push('/tutor/dashboard')} 
                    className="text-white hover:text-gray-300 transition"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => router.push('/tutor/students')} 
                    className="text-white hover:text-gray-300 transition"
                  >
                    My Students
                  </button>
                  <button 
                    onClick={() => router.push('/tutor/earnings')} 
                    className="text-white hover:text-gray-300 transition"
                  >
                    Earnings
                  </button>
                  <button 
                    onClick={() => router.push('/chats')} 
                    className="text-white hover:text-gray-300 transition"
                  >
                    Messages
                  </button>
                </>
              )}
              {!user && (
                <button 
                  onClick={() => router.push('/search')} 
                  className="text-white hover:text-gray-300 transition"
                >
                  Find Tutors
                </button>
              )}
            </nav>
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <>
                <NotificationBell />
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#2A2A32] hover:bg-[#3A3A42] text-white rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push('/auth/student/login')}
                  className="px-4 py-2 bg-[#2A2A32] hover:bg-[#3A3A42] text-white rounded-lg transition"
                >
                  Log in
                </button>
                <button
                  onClick={() => router.push('/auth/register')}
                  className="px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg transition"
                >
                  Sign up
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button & Notification */}
          <div className="lg:hidden flex items-center space-x-3">
            {user && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2 hover:bg-[#2A2A32] rounded-lg transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-800 pt-4">
            <nav className="flex flex-col space-y-3">
              {user && user.role === 'student' && (
                <>
                  <button 
                    onClick={() => navigate('/student/home')} 
                    className="text-white hover:text-gray-300 transition text-left px-2 py-2 hover:bg-[#2A2A32] rounded"
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => navigate('/search')} 
                    className="text-white hover:text-gray-300 transition text-left px-2 py-2 hover:bg-[#2A2A32] rounded"
                  >
                    Find a Tutor
                  </button>
                  <button 
                    onClick={() => navigate('/student/dashboard')} 
                    className="text-white hover:text-gray-300 transition text-left px-2 py-2 hover:bg-[#2A2A32] rounded"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => navigate('/chats')} 
                    className="text-white hover:text-gray-300 transition text-left px-2 py-2 hover:bg-[#2A2A32] rounded"
                  >
                    Messages
                  </button>
                </>
              )}
              {user && user.role === 'tutor' && (
                <>
                  <button 
                    onClick={() => navigate('/tutor/home')} 
                    className="text-white hover:text-gray-300 transition text-left px-2 py-2 hover:bg-[#2A2A32] rounded"
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => navigate('/tutor/dashboard')} 
                    className="text-white hover:text-gray-300 transition text-left px-2 py-2 hover:bg-[#2A2A32] rounded"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => navigate('/tutor/students')} 
                    className="text-white hover:text-gray-300 transition text-left px-2 py-2 hover:bg-[#2A2A32] rounded"
                  >
                    My Students
                  </button>
                  <button 
                    onClick={() => navigate('/tutor/earnings')} 
                    className="text-white hover:text-gray-300 transition text-left px-2 py-2 hover:bg-[#2A2A32] rounded"
                  >
                    Earnings
                  </button>
                  <button 
                    onClick={() => navigate('/chats')} 
                    className="text-white hover:text-gray-300 transition text-left px-2 py-2 hover:bg-[#2A2A32] rounded"
                  >
                    Messages
                  </button>
                </>
              )}
              {!user && (
                <button 
                  onClick={() => navigate('/search')} 
                  className="text-white hover:text-gray-300 transition text-left px-2 py-2 hover:bg-[#2A2A32] rounded"
                >
                  Find Tutors
                </button>
              )}
              
              {/* Mobile Actions */}
              <div className="pt-3 border-t border-gray-700 space-y-3">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#2A2A32] hover:bg-[#3A3A42] text-white rounded-lg transition w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => navigate('/auth/student/login')}
                      className="px-4 py-2 bg-[#2A2A32] hover:bg-[#3A3A42] text-white rounded-lg transition w-full text-left"
                    >
                      Log in
                    </button>
                    <button
                      onClick={() => navigate('/auth/register')}
                      className="px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg transition w-full text-left"
                    >
                      Sign up
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
