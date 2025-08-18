import {getItemAsync, SECURE_STORE_KEYS} from '../helpers/SecureStorageHelper';
import {ApiResponse, UserProfileResponse} from '../types/ApiResponse';
import {API_BASE_URL} from '../types/constants/constants';

export async function loginAsync(
  email: string,
  password: string,
): Promise<ApiResponse<UserProfileResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({email, password}),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      return {
        success: errorResponse.success,
        error: errorResponse.message,
      };
    }

    const data = await response.json();

    return {
      success: data.success,
      data: {
        ...data.user,
        token: data.token,
        role: data.user.role.roleName,
      },
    };
  } catch (error: any) {
    return {success: false, error: 'Network error'};
  }
}

export async function registerAsync(
  name: string,
  email: string,
  password: string,
  phone: string,
): Promise<ApiResponse<UserProfileResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({name, email, password, phone}),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      return {
        success: errorResponse.success,
        error: errorResponse.message,
      };
    }

    const data = await response.json();

    return {
      success: data.success,
      data: {
        ...data.user,
        token: data.token,
        role: data.user.role.roleName,
      },
    };
  } catch (error: any) {
    return {success: false, error: error.message || 'Network error'};
  }
}

/**
 * Builds the headers for API requests.
 *
 * @returns {Promise<Headers>} - A promise that resolves to the headers object.
 */
type Headers = {
  [key: string]: string;
};

export async function buildHeaders(): Promise<Headers> {
  try {
    const userProfile = await getItemAsync<UserProfileResponse>(
      SECURE_STORE_KEYS.USER_PROFILE,
    );

    const headers: Headers = {
      'Content-Type': 'application/json',
    };

    if (userProfile) {
      headers.Authorization = userProfile.token;
    }

    return headers;
  } catch (error) {
    throw new Error('Failed to build headers');
  }
}
