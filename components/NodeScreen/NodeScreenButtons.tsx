import React from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-paper';
import { buttonStyles } from '../../styles/components/buttonStyles';
import { nodeScreenButtonStyles } from '../../styles/components/nodeScreenButtonStyles';
import { Width } from '../../styles/properties/dimensions';

interface NodeScreenButtonsProps {
  showResults: boolean;
  onAuthenticate: () => void;
  onChangeSelection: () => void;
  onContinue: () => void;
  isAuthenticating: boolean;
}

export const NodeScreenButtons: React.FC<NodeScreenButtonsProps> = ({
  showResults,
  onAuthenticate,
  onChangeSelection,
  onContinue,
  isAuthenticating,
}) => (
  <View style={nodeScreenButtonStyles.buttonContainer}>
    {!showResults ? (
      <Button
        mode="contained"
        onPress={onAuthenticate}
        loading={isAuthenticating}
        style={[buttonStyles.primaryButton, { width: Width.full}]}
        labelStyle={buttonStyles.buttonLabel}
      >
        Authenticate Batteries
      </Button>
    ) : (
      <View style={nodeScreenButtonStyles.buttonRow}>
        <Button
          mode="contained"
          onPress={onChangeSelection}
          style={[buttonStyles.primaryButton, nodeScreenButtonStyles.outlineButton]}
          labelStyle={buttonStyles.buttonLabel}
        >
        Change
        </Button>
        <Button
          mode="contained"
          onPress={onContinue}
          style={[buttonStyles.primaryButton, nodeScreenButtonStyles.outlineButton]}
          labelStyle={buttonStyles.buttonLabel}
        >
        Continue
        </Button>
      </View>
    )}
  </View>
); 