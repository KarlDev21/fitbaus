import {UploadFileRequest} from '../types/ApiRequest';
import {
  ApiResponse,
  Device,
  DeviceRegistrationResponse,
  FetchAllDeviceUnitsResponse,
  UploadFileResponse,
} from '../types/ApiResponse';
import {BatteryData, BatteryInfo, InverterState} from '../types/BleTypes';
import {getSelectedInverter} from './storage';
import {API_BASE_URL, buildHeaders} from './UserProfileService';

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
        error: errorResponse.errMessage,
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
        error: errorResponse.errMessage,
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
  request: UploadFileRequest,
): Promise<ApiResponse<UploadFileResponse>> {
  try {
    const headers = await buildHeaders();

    const response = await fetch(`${API_BASE_URL}/device/log/upload`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      return {
        success: errorResponse.success,
        error: errorResponse.errMessage,
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

    console.log('DATA:: ', {inverterState: inverterData, batteries: batteries});

    const response = await fetch(`${API_BASE_URL}/device`, {
      method: 'POST',
      headers,
      body: JSON.stringify({inverterState: inverterData, batteries: batteries}),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      return {
        success: errorResponse.success,
        error: errorResponse.errMessage,
      };
    }

    const data: ApiResponse<{message: string}> = await response.json();

    return data;
  } catch (error: any) {
    console.error('Error uploading inverter and battery data:', error);
    return {success: false, error: 'Network error'};
  }
}
