import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { requestBluetoothPermissions } from '../helpers/AppHelper';
import { checkBluetoothConnection } from '../services/BluetoothLowEnergyService';


type BluetoothContextType = {
  isBTLoading: boolean;
  isBluetoothEnabled: boolean;
  permissionGranted: boolean;
};

const BluetoothContext = createContext<BluetoothContextType | undefined>(undefined);

export const BluetoothProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(true);
  const [isBTLoading, setIsBTLoading] = useState<boolean>(true);
  

  useEffect(() => {
    setIsBTLoading(true)
    const checkBluetooth = async () => {
      if (Platform.OS === 'android') {
        
        const granted = await requestBluetoothPermissions();
        // using to mock granted
        // const granted = false;

        setPermissionGranted(granted);

        if (granted) {
          const isEnabled = await checkBluetoothConnection();
          // using to mock ble enabled
          // const isEnabled = false;

          setIsBluetoothEnabled(isEnabled);
        }
      } else {
        setPermissionGranted(false);
        setIsBluetoothEnabled(false);
      }
    };
    setIsBTLoading(false)

    const interval = setInterval(checkBluetooth, 1000);
    return () => clearInterval(interval);

    
  }, []);


  return (
    <BluetoothContext.Provider value={{ isBTLoading, isBluetoothEnabled, permissionGranted }}>
      {children}
    </BluetoothContext.Provider>
  );
};

export const useBluetooth =
 () => {
  const context = useContext(BluetoothContext);
  if (!context) throw new Error('useBluetooth must be used within BluetoothProvider');
  return context;
};
