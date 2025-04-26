import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authenticateInverter } from '../services/InverterService';
import { getSelectedInverter, getSelectedNodes, setConnectedInverter, setConnectedInverterDevice } from '../services/storage';
import { Colours } from '../styles/properties/colours';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../nav/AppNavigation';
import { Flex, GenericSize, Margin, Padding } from '../styles/properties/dimensions';
import { textStyles } from '../styles/components/textStyles';

export default function FinalizingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const finalizeConnection = async () => {

      //hack workaround for now
      const selectedInverter = getSelectedInverter();
      const selectedNodes = getSelectedNodes();

      if (selectedInverter && selectedNodes) {
        setConnectedInverterDevice(selectedInverter);
        setConnectedInverter(selectedInverter);
      }

      //issue here with the commison process
      try {
        const timer = setTimeout( async () => {

        //might need to pass in inverter device from connected devices
        const selectedInverter = getSelectedInverter();
        const selectedNodes = getSelectedNodes();

        if (selectedInverter && selectedNodes) {
          await authenticateInverter(selectedInverter, selectedNodes);
          
          setConnectedInverterDevice(selectedInverter);
          setConnectedInverter(selectedInverter);
        }
      }, 5000)
        setIsLoading(false);
      
        return () => clearTimeout(timer)

      } catch (error) {
        console.error('Error during finalizing connection:', error);
        setIsLoading(false);
      }
    };

    finalizeConnection();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home', params: { from: 'Finalizing', success: true } }],

      });
    }
  }, [isLoading, navigation]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size={GenericSize.large} color={Colours.primary} style={styles.loader} />
          <Text variant="headlineSmall" style={textStyles.heading}>
            Finalizing Connection
          </Text>
          <Text variant="bodyMedium" style={textStyles.subtitle}>
            Please wait while we complete the authentication process and establish the connection...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return null; // This will never render because navigation happens when `isLoading` is false
}

const styles = StyleSheet.create({
  container: {
    flex: Flex.xsmall,
    backgroundColor: Colours.backgroundPrimary,
  },
  content: {
    flex: Flex.xsmall,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Padding.large,
  },
  loader: {
    marginBottom: Margin.large,
  },
});

