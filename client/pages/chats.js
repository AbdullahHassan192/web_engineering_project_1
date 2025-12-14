import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { MessageCircle, Home, Search, BarChart3, ArrowLeft, Clock } from 'lucide-react';
import ChatWidget from '../components/copilot/ChatWidget';
import Header from '../components/Header';
import axios from 'axios';

export default function ChatsListPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/auth/student/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchChats();
  }, [router, page]);

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/chat/list', {
        params: { page, limit: 20 },
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(response.data.chats || []);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F14] flex items-center justify-center">
        <div className="text-white">Loading conversations...</div>
      </div>
    );
  }

  const getOtherUser = (chat) => {
    return user?.role === 'student' ? chat.tutorId : chat.studentId;
  };

  const formatMessageTime = (date) => {
    const msgDate = new Date(date);
    const now = new Date();
    const diffMs = now - msgDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return msgDate.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#0F0F14]">
      <ChatWidget />
      <Header />

      {/* Page Header */}
      <div className="bg-[#1A1A1F] border-b border-gray-800">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center space-x-4">
            <Link
              href={user?.role === 'student' ? '/student/home' : '/tutor/dashboard'}
              className="text-gray-400 hover:text-white transition p-2 hover:bg-[#2A2A32] rounded-lg"
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">My Conversations</h1>
                <p className="text-gray-400 text-sm">{chats.length} {chats.length === 1 ? 'conversation' : 'conversations'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {chats.length === 0 ? (
          <div className="bg-[#1A1A1F] rounded-xl p-12 border border-gray-800 text-center">
            <div className="w-20 h-20 rounded-full bg-[#2A2A32] flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-10 h-10 text-[#3B82F6]" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No conversations yet</h2>
            <p className="text-gray-400 mb-6">Start chatting with tutors or students from your home page</p>
            <Link
              href={user?.role === 'student' ? '/student/home' : '/tutor/dashboard'}
              className="inline-flex items-center px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg transition font-medium"
            >
              Go to Home
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {chats.map((chat) => {
                const otherUser = getOtherUser(chat);
                const lastMessage = chat.lastMessage;
                const unreadCount = chat.unreadCount || 0;
                const chatUrl = user?.role === 'student' 
                  ? `/chat?tutorId=${otherUser?._id || otherUser}`
                  : `/chat?studentId=${otherUser?._id || otherUser}`;

                return (
                  <Link
                    key={chat._id}
                    href={chatUrl}
                    className="block bg-[#1A1A1F] rounded-xl p-5 border border-gray-800 hover:border-[#3B82F6] transition group"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center relative">
                          <span className="text-2xl">
                            {user?.role === 'student' ? '👩' : '👨'}
                          </span>
                          {unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-[#1A1A1F]">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="text-lg font-semibold text-white group-hover:text-[#3B82F6] transition">
                            {otherUser?.name}
                          </h3>
                          {lastMessage && (
                            <div className="flex items-center text-xs text-gray-500 ml-2">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatMessageTime(lastMessage.createdAt)}
                            </div>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{otherUser?.email}</p>
                        {lastMessage ? (
                          <div className="flex items-center space-x-2">
                            <p className={`text-sm truncate ${unreadCount > 0 ? 'text-white font-medium' : 'text-gray-500'}`}>
                              {lastMessage.message}
                            </p>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm italic">No messages yet</p>
                        )}
                      </div>

                      {/* Arrow Icon */}
                      <div className="flex-shrink-0 text-gray-600 group-hover:text-[#3B82F6] transition">
                        <MessageCircle className="w-6 h-6" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-5 py-2.5 bg-[#2A2A32] hover:bg-[#3A3A42] text-white rounded-lg border border-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Previous
                </button>
                <span className="text-gray-400 font-medium">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-5 py-2.5 bg-[#2A2A32] hover:bg-[#3A3A42] text-white rounded-lg border border-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}








