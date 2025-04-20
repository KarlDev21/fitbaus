import React, { createContext, useContext, useEffect, useState } from 'react';
import { isConnectedAsync } from '../helpers/AppHelper';

type ConnectivityContextType = {
    isOnline: boolean;
    continueOffline: boolean;
    setContinueOffline: (value: boolean) => void;
  };
  
  const ConnectivityContext = createContext<ConnectivityContextType | undefined>(undefined);
  
  export const ConnectivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOnline, setIsOnline] = useState(true);
    const [continueOffline, setContinueOffline] = useState(false);
  
    useEffect(() => {
      const checkConnectivity = async () => {
        const online = await isConnectedAsync();
        // used this to mock offline
        // const online = false;    
        setIsOnline(online);
      };
  
      checkConnectivity();
  
      const interval = setInterval(checkConnectivity, 5000);
      return () => clearInterval(interval);
    }, []);
  
    return (
      <ConnectivityContext.Provider
        value={{ isOnline, continueOffline, setContinueOffline }}
      >
        {children}
      </ConnectivityContext.Provider>
    );
  };
  
  export const useConnectivity = () => {
    const context = useContext(ConnectivityContext);
    if (!context) throw new Error('useConnectivity must be used within ConnectivityProvider');
    return context;
  };
  