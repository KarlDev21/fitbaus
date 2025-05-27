export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string | any;
};

export interface UploadFileResponse {
  userID: string;
  inverterID: string;
  fileName: string;
  filePath: string;
  uploadedAt: string;
}

export interface Device {
  unitIdentifier?: string;
  deviceID: string;
  deviceType: string;
  userID?: string;
}

export interface DeviceRegistrationResponse {
  unitID: string;
  userID: string;
  unitIdentifier: string;
  deviceID: string;
  deviceType: string;
}

export interface Unit {
  devices: Device[];
}

export interface FetchAllDeviceUnitsResponse {
  success: boolean;
  units: Unit[];
}

export type UserProfileResponse = {
  userID: string;
  name: string;
  email: string;
  phone: string;
  token: string;
  role: string;
};
