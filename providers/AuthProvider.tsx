import React, {createContext, useContext, useEffect, useState, ReactNode} from 'react';
import {loginAsync, registerAsync} from '../services/UserProfileService';
import {
  getItemAsync,
  removeItemAsync,
  setItemAsync,
  SECURE_STORE_KEYS,
} from '../helpers/SecureStorageHelper';
import {UserProfileResponse} from '../types/ApiResponse';

type AuthContextType = {
  user: UserProfileResponse | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    phone: string,
  ) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [user, setUser] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      const storedUser = await getItemAsync<UserProfileResponse>(SECURE_STORE_KEYS.USER_PROFILE);
      if (storedUser) {
        setUser(storedUser);
      }
      setIsLoading(false);
    };

    loadUserFromStorage();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await loginAsync(email, password);
    if (result.success && result.data) {
      await setItemAsync(SECURE_STORE_KEYS.USER_PROFILE, result.data);
      setUser(result.data);
      return true;
    }
    return false;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone: string,
  ): Promise<boolean> => {
    const result = await registerAsync(name, email, password, phone);
    if (result.success && result.data) {
      await setItemAsync(SECURE_STORE_KEYS.USER_PROFILE, result.data);
      setUser(result.data);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await removeItemAsync(SECURE_STORE_KEYS.USER_PROFILE);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{user, isLoading, login, register, logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
