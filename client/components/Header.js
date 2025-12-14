import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import NotificationBell from './NotificationBell';
import { LogOut } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
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
            <nav className="hidden md:flex space-x-6">
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
          <div className="flex items-center space-x-4">
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
        </div>
      </div>
    </header>
  );
}
