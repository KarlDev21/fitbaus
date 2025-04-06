// BluetoothContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { BleManager, State } from 'react-native-ble-plx';

type BluetoothContextType = {
  isBluetoothOn: boolean | null;
};

const BluetoothContext = createContext<BluetoothContextType>({
  isBluetoothOn: null,
});

export const useBluetooth = () => useContext(BluetoothContext);

export const BluetoothProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBluetoothOn, setIsBluetoothOn] = useState<boolean | null>(null);
  const manager = new BleManager();

  useEffect(() => {
    const subscription = manager.onStateChange((state) => {
      setIsBluetoothOn(state === State.PoweredOn);
    }, true);

    return () => {
      subscription.remove();
      manager.destroy();
    };
  }, []);

  return (
    <BluetoothContext.Provider value={{ isBluetoothOn }}>
      {children}
    </BluetoothContext.Provider>
  );
};
