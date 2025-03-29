//TODO: Fetch from remote config
export const API_BASE_URL = 'http://192.168.101.107:3000/api/v1';

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

type UserProfile = {
  userID: string;
  name: string;
  email: string;
  phone: string;
  token: string;
  role: string;
};

export async function loginAsync(
  email: string,
  password: string,
): Promise<ApiResponse<UserProfile>> {
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
        error: errorResponse.errMessage,
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
): Promise<ApiResponse<UserProfile>> {
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
        error: errorResponse.errMessage,
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
