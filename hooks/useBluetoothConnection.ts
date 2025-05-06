import { useState, useEffect } from 'react';
import { BleManager, State } from 'react-native-ble-plx';

export const useBluetoothConnection = () => {
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bleManager = new BleManager();
    
    const checkBluetoothState = async () => {
      try {
        const state = await bleManager.state();
        setIsBluetoothEnabled(state === State.PoweredOn);
      } catch (error) {
        console.error('Error checking Bluetooth state:', error);
        setIsBluetoothEnabled(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkBluetoothState();

    const subscription = bleManager.onStateChange((state) => {
      setIsBluetoothEnabled(state === State.PoweredOn);
    }, true);

    return () => {
      subscription.remove();
      bleManager.destroy();
    };
  }, []);

  return { isBluetoothEnabled };
}; 