import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { MessageCircle, Send, ArrowLeft, Home, Search, BarChart3 } from 'lucide-react';
import ChatWidget from '../components/copilot/ChatWidget';
import Header from '../components/Header';
import axios from 'axios';
import io from 'socket.io-client';

export default function ChatPage() {
  const router = useRouter();
  const { tutorId, studentId } = router.query;
  const [user, setUser] = useState(null);
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/auth/student/login');
      return;
    }

    const userObj = JSON.parse(userData);
    setUser(userObj);
    
    // Wait for router.query to be populated
    if (!router.isReady) {
      return;
    }
    
    const otherUserId = userObj.role === 'student' ? tutorId : studentId;
    console.log('Chat page - User role:', userObj.role, 'Other user ID:', otherUserId);
    
    if (otherUserId) {
      fetchChat(otherUserId);
    } else {
      console.error('No tutorId or studentId provided');
      setLoading(false);
    }
  }, [tutorId, studentId, router, router.isReady]);

  useEffect(() => {
    if (chat && user) {
      // Set up Socket.io connection for real-time messaging
      socketRef.current = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      socketRef.current.on('connect', () => {
        console.log('Chat socket connected');
      });

      socketRef.current.on('disconnect', () => {
        console.log('Chat socket disconnected');
      });

      socketRef.current.on('message:new', (data) => {
        if (data.chatId === chat._id) {
          const otherUserId = user.role === 'student' ? tutorId : studentId;
          fetchChat(otherUserId);
          // Mark as read automatically when receiving new message
          const token = localStorage.getItem('token');
          if (token && chat._id) {
            axios.patch(
              `http://localhost:5000/api/chat/${chat._id}/read`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            ).catch(err => console.error('Error marking as read:', err));
          }
        }
      });

      socketRef.current.on('user:typing', (data) => {
        // Could add typing indicator here in the future
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [chat, tutorId, studentId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const fetchChat = async (otherUserId) => {
    try {
      console.log('Fetching chat for other user:', otherUserId);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/chat/user/${otherUserId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Chat fetched successfully:', response.data.chat);
      setChat(response.data.chat);
      
      // Mark messages as read
      if (response.data.chat._id) {
        await axios.patch(
          `http://localhost:5000/api/chat/${response.data.chat._id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(err => console.error('Error marking as read:', err));
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    
    // Validation
    if (!trimmedMessage || sending) return;
    if (trimmedMessage.length > 1000) {
      alert('Message is too long. Maximum 1000 characters allowed.');
      return;
    }

    setSending(true);
    const messageToSend = trimmedMessage;
    setMessage(''); // Optimistic update - clear input immediately
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/chat/${chat._id}/message`,
        { message: messageToSend },
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000 // 10 second timeout
        }
      );
      
      // Refresh chat to get latest messages
      const otherUserId = user.role === 'student' ? tutorId : studentId;
      await fetchChat(otherUserId);
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message on error
      setMessage(messageToSend);
      
      if (error.code === 'ECONNABORTED') {
        alert('Request timed out. Please check your connection and try again.');
      } else if (error.response?.status === 403) {
        alert('You are not authorized to send messages in this chat.');
      } else if (error.response?.status === 404) {
        alert('Chat not found. Please refresh the page.');
      } else {
        alert(error.response?.data?.error || 'Failed to send message. Please try again.');
      }
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F14] flex items-center justify-center">
        <div className="text-white">Loading chat...</div>
      </div>
    );
  }

  if (!chat && !loading) {
    return (
      <div className="min-h-screen bg-[#0F0F14]">
        <ChatWidget />
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="bg-[#1A1A1F] rounded-xl p-8 border border-gray-800 text-center">
            <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Chat not found</h2>
            <p className="text-gray-400 mb-4">
              {!tutorId && !studentId 
                ? 'No tutor or student ID provided in the URL.' 
                : 'Unable to load chat. The user may not exist or there may be a connection issue.'}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Debug info - TutorId: {tutorId || 'not provided'}, StudentId: {studentId || 'not provided'}, User role: {user?.role || 'unknown'}
            </p>
            <Link
              href={user?.role === 'student' ? '/student/home' : user?.role === 'tutor' ? '/tutor/dashboard' : '/'}
              className="px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg transition inline-block"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const otherUser = user?.role === 'student' ? chat.tutorId : chat.studentId;

  return (
    <div className="min-h-screen bg-[#0F0F14]">
      <ChatWidget />
      <Header />
      
      {/* Chat Header with Back Button and User Info */}
      <div className="bg-[#1A1A1F] border-b border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white transition p-2 hover:bg-[#2A2A32] rounded-lg"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center">
                <span className="text-2xl">
                  {user?.role === 'student' ? '👩' : '👨'}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{otherUser?.name}</h1>
                <p className="text-gray-400 text-sm">{otherUser?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="container mx-auto px-6 py-6" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="bg-[#1A1A1F] rounded-xl border border-gray-800 flex flex-col shadow-2xl h-full">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#0F0F14] rounded-t-xl">
            {chat.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="w-20 h-20 rounded-full bg-[#1A1A1F] flex items-center justify-center mb-4 border border-gray-800">
                  <MessageCircle className="w-10 h-10 text-[#3B82F6]" />
                </div>
                <p className="text-lg font-medium text-gray-300 mb-2">No messages yet</p>
                <p className="text-sm text-gray-500">Start the conversation with {otherUser?.name}</p>
              </div>
            ) : (
              chat.messages.map((msg, idx) => {
                const isOwn = String(msg.senderId._id || msg.senderId) === String(user?.id);
                return (
                  <div
                    key={idx}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
                        isOwn
                          ? 'bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white'
                          : 'bg-[#1A1A1F] text-white border border-gray-800'
                      }`}
                    >
                      <p className={`text-xs font-semibold mb-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                        {isOwn ? 'You' : msg.senderId?.name || 'Unknown'}
                      </p>
                      <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                          {formatMessageTime(msg.createdAt)}
                        </p>
                        {msg.read && isOwn && (
                          <span className="text-xs text-blue-200 flex items-center">
                            <span className="mr-1">✓✓</span> Read
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="border-t border-gray-800 p-4 bg-[#1A1A1F] rounded-b-xl">
            <div className="flex space-x-3">
              <input
                type="text"
                value={message}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 1000) {
                    setMessage(value);
                  }
                }}
                placeholder="Type your message..."
                maxLength={1000}
                className="flex-1 px-4 py-3 bg-[#2A2A32] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition"
                disabled={sending}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={!message.trim() || sending}
                className="px-6 py-3 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg font-medium"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {message.length}/1000 characters
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}








