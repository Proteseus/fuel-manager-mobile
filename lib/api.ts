import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Constants.expoConfig?.extra?.apiUrl;

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function getHeaders(method: string): Promise<Headers> {
  const headers = new Headers({
    'Content-Type': 'application/json',
  });

  const token = await AsyncStorage.getItem('token');
  
  // // Require token for write operations
  // if (['POST', 'PUT', 'DELETE'].includes(method) && !token) {
  //   throw new Error('Authentication required');
  // }

  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  return headers;
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (response.status === 401) {
    // Clear token and redirect to login
    await AsyncStorage.removeItem('token');
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'Request failed');
  }

  const data = await response.json();
  return { data };
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await AsyncStorage.getItem('token');
  return !!token;
}

export const api = {
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const headers = await getHeaders('GET');
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers,
      });
      return handleResponse<T>(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An error occurred' };
    }
  },

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const headers = await getHeaders('POST');
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      return handleResponse<T>(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An error occurred' };
    }
  },

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const headers = await getHeaders('PUT');
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });
      return handleResponse<T>(response);
     } catch (error) {
      return { error: error instanceof Error ? error.message : 'An error occurred' };
    }
  },

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const headers = await getHeaders('DELETE');
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers,
      });
      return handleResponse<T>(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An error occurred' };
    }
  },
};
