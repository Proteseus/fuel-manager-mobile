import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';
import { User, AuthResponse } from '../types/schema';

export const auth = {
  async login(phone: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', { phone, password });
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('No data received');
    
    await AsyncStorage.setItem('token', response.data.token);
    return response.data;
  },

  async register(data: { name: string; phone: string; password: string }): Promise<User> {
    const response = await api.post<User>('/auth/register', data);
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('No data received');
    
    return response.data;
  },

  async forgotPassword(phone: string): Promise<void> {
    const response = await api.post<{ message: string }>('/auth/forgot-password', { phone });
    if (response.error) throw new Error(response.error);
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await api.post<{ message: string }>('/auth/reset-password', {
      token,
      newPassword,
    });
    if (response.error) throw new Error(response.error);
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('token');
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  },
};
