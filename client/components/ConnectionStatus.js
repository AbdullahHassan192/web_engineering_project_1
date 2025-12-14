import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-red-900/90 border border-red-500 rounded-lg p-3 flex items-center space-x-2 z-50">
      <WifiOff className="w-5 h-5 text-red-400" />
      <span className="text-red-400 text-sm">You are offline</span>
    </div>
  );
}








