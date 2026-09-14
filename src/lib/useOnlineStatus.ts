import { useEffect, useState } from 'react';

// The app's own data (XP, streak, rank, card reviews) is already 100% local — everything
// this screen renders comes from localStorage via the store, never a network call — so
// "offline" here is purely informational, not a degraded-functionality state. Still worth
// surfacing: a student mid-lesson who loses signal should see a calm confirmation that
// nothing is lost, not silence that reads as "did this break?".
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return isOnline;
}
