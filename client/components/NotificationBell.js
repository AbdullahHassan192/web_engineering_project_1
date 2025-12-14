import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import axios from 'axios';
import io from 'socket.io-client';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Check every 30 seconds

    // Set up Socket.io connection for real-time notifications
    const socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    socket.on('booking:confirmed', () => {
      // Refresh notifications when booking is confirmed
      fetchNotifications();
    });

    socket.on('booking:new', () => {
      // Refresh notifications when new booking is created
      fetchNotifications();
    });

    socket.on('connect', () => {
      console.log('Notification socket connected');
    });

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.notifications?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    if (notification.link) {
      window.open(notification.link, '_blank');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-text-muted hover:text-text-main transition"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-secondary border border-gray-800 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-text-main">Notifications</h3>
              <button
                onClick={() => setShowDropdown(false)}
                className="text-text-muted hover:text-text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="divide-y divide-gray-800">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-text-muted">No notifications</div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 cursor-pointer hover:bg-primary transition ${
                      !notification.read ? 'bg-primary/50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-text-main mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-xs text-text-muted">{notification.message}</p>
                        {notification.link && (
                          <p className="text-xs text-action-primary mt-1">Click to join lecture</p>
                        )}
                      </div>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-action-primary rounded-full ml-2 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-text-muted mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}






