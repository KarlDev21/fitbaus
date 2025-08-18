import {getSelectedInverter} from '../helpers/BluetoothHelper';
import {getItemAsync, SECURE_STORE_KEYS} from '../helpers/SecureStorageHelper';
import {UploadFileRequest} from '../types/ApiRequest';
import {
  ApiResponse,
  Device,
  DeviceRegistrationResponse,
  FetchAllDeviceUnitsResponse,
  UploadFileResponse,
  UserProfileResponse,
} from '../types/ApiResponse';
import {BatteryData, InverterState} from '../types/BleTypes';
import {API_BASE_URL} from '../types/constants/constants';
import {buildHeaders} from './UserProfileService';

export async function createDeedOfRegistrationAsync(
  userID: string,
  devices: Device[],
): Promise<ApiResponse<DeviceRegistrationResponse>> {
  try {
    const payload = {
      userID,
      devices,
    };

    const headers = await buildHeaders();

    const response = await fetch(`${API_BASE_URL}/device/add`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      return {
        success: errorResponse.success,
        error: errorResponse.message,
      };
    }

    const data: ApiResponse<DeviceRegistrationResponse> = await response.json();

    return data;
  } catch (error: any) {
    return {success: false, error: 'Network error'};
  }
}

export async function fetchAllDeviceUnitsAsync(
  userID: string,
): Promise<ApiResponse<FetchAllDeviceUnitsResponse>> {
  try {
    const headers = await buildHeaders();

    const response = await fetch(`${API_BASE_URL}/device/${userID}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      return {
        success: errorResponse.success,
        error: errorResponse.message,
      };
    }

    const data: ApiResponse<FetchAllDeviceUnitsResponse> =
      await response.json();

    return data;
  } catch (error: any) {
    return {success: false, error: 'Network error'};
  }
}

export async function uploadFileToServerAsync(
  request: FormData,
): Promise<ApiResponse<UploadFileResponse>> {
  try {
    const userProfile = await getItemAsync<UserProfileResponse>(
      SECURE_STORE_KEYS.USER_PROFILE,
    );

    const response = await fetch(`${API_BASE_URL}/device/log/upload`, {
      method: 'POST',
      headers: {
        Authorization: userProfile?.token ?? '',
        'Content-Type': 'multipart/form-data',
        'inverter-id': getSelectedInverter()?.id ?? '',
      },
      body: request,
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      return {
        success: errorResponse.success,
        error: errorResponse.message,
      };
    }

    const data: ApiResponse<UploadFileResponse> = await response.json();

    return data;
  } catch (error: any) {
    return {success: false, error: 'Network error'};
  }
}

export async function uploadInverterAndBatteryDataAsync(
  inverter: InverterState,
  batteries: BatteryData[],
): Promise<ApiResponse<{message: string}>> {
  try {
    const headers = await buildHeaders();
    const deviceID = getSelectedInverter()?.id;

    const inverterData = {
      ...inverter,
      deviceID: deviceID,
    };

    const response = await fetch(`${API_BASE_URL}/device`, {
      method: 'POST',
      headers,
      body: JSON.stringify({inverterState: inverterData, batteries: batteries}),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      return {
        success: errorResponse.success,
        error: errorResponse.message,
      };
    }

    const data: ApiResponse<{message: string}> = await response.json();

    return data;
  } catch (error: any) {
    console.error('Error uploading inverter and battery data:', error);
    return {success: false, error: 'Network error'};
  }
}
