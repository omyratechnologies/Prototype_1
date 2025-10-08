import React, { createContext, useContext, useState, useEffect } from 'react';

const OnlineStatusContext = createContext();

export function OnlineStatusProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  const value = {
    isOnline,
    wasOffline
  };

  return (
    <OnlineStatusContext.Provider value={value}>
      {children}
      {!isOnline && <OfflineBanner />}
    </OnlineStatusContext.Provider>
  );
}

function OfflineBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 px-4 z-50">
      <div className="flex items-center justify-center space-x-2">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span className="text-sm font-medium">You are currently offline</span>
      </div>
    </div>
  );
}

export function useOnlineStatus() {
  const context = useContext(OnlineStatusContext);
  if (!context) {
    throw new Error('useOnlineStatus must be used within an OnlineStatusProvider');
  }
  return context;
}

// HOC for components that need online status
export function withOnlineStatus(Component) {
  return function OnlineStatusWrapper(props) {
    const onlineStatus = useOnlineStatus();
    return <Component {...props} onlineStatus={onlineStatus} />;
  };
}

export default OnlineStatusProvider;