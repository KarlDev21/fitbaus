import { useEffect, useState } from 'react';
import { Device } from 'react-native-ble-plx';
import { checkAndConnectToInverter } from '../services/InverterService';

interface UseInverterFileListenerProps {
  node: Device;
  serviceUUID: string;
  characteristicUUID: string;
}

const useInverterFileListener = ({
  node,
  serviceUUID,
  characteristicUUID,
}: UseInverterFileListenerProps) => {
  const [fileData, setFileData] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    
    console.log(node)

    const status = checkAndConnectToInverter(node);
    console.log(status)

    if (!node) return;

    const connectAndListen = async () => {
      try {
        // console.log(node.id)
        // console.log(node.name)
        // const connectedNode = await node.connect();
        await node.discoverAllServicesAndCharacteristics();

        setIsListening(true);

        await node.monitorCharacteristicForService(
          serviceUUID,
          characteristicUUID,
          (error, characteristic) => {
            if (error) {
              console.warn('Monitor error', error);
              return;
            }

            if (characteristic?.value) {
              const decoded = Buffer.from(characteristic.value, 'base64').toString('utf-8');
              setFileData(decoded);
            }
          }
        );
      } catch (e) {
        console.warn('Connection or monitor failed', e);
      }
    };

    connectAndListen();

    return () => {
      // node.cancelConnection();
      setIsListening(false);
    };
  });

  return { fileData, isListening };
};

export default useInverterFileListener;
