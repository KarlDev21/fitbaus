import {UploadFileRequest} from '../types/ApiRequest';
import {
  ApiResponse,
  Device,
  DeviceRegistrationResponse,
  FetchAllDeviceUnitsResponse,
  UploadFileResponse,
} from '../types/ApiResponse';
import {API_BASE_URL} from './UserProfileService';

export async function createDeedOfRegistrationAsync(
  userID: string,
  devices: Device[],
): Promise<ApiResponse<DeviceRegistrationResponse>> {
  try {
    const payload = {
      userID,
      devices,
    };

    const response = await fetch(`${API_BASE_URL}/device/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const response = await fetch(`${API_BASE_URL}/device/${userID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const response = await fetch(`${API_BASE_URL}/device/log/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
