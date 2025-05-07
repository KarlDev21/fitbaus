# Stower App

Stower App is a React Native application designed to interact with Stower BLE devices. The app scans for nearby Stower BLE devices, connects to them, and handles authentication and enrollment of the device's battery. Additionally, it uploads log files and data from the Stower BLE devices to a server for further processing and analysis. Stower App provides a seamless and efficient way to manage and monitor Stower BLE devices.

## Getting Started

> **Note**: Ensure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions up to the "Creating a new application" step before proceeding.

### Step 1: Start the Metro Server

Metro is the JavaScript bundler that ships with React Native. To start Metro, run the following command from the root of your project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

### Step 2: Start Your Application
Open a new terminal and run the following commands to start your app:

For Android:
```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

For iOS:
```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your app running in the Android Emulator or iOS Simulator.

## Project Structure
- **App.tsx:** The main entry point of the app, handling navigation and permissions.
- **helpers/:** Contains utility functions like requestBluetoothPermissions.
- **hooks/:** Includes custom hooks like useGlobalFileUploader.
- **nav/:** Manages navigation stacks for authenticated and unauthenticated users.
- **screens/:** Contains screen components such as NoInternetScreen and NoPermissionScreen.
- **state/:** Manages global state using Jotai.
- **android/ and ios/:** Platform-specific configurations and native code.