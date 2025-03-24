import { api } from './api';
import type { Vehicle } from '../types/schema';

export const vehicles = {
  async listOwned(): Promise<Vehicle[]> {
    const response = await api.get<Vehicle[]>('/vehicles/owner');
    if (response.error) throw new Error(response.error);
    return response.data || [];
  },

  async listAssigned(): Promise<Vehicle[]> {
    const response = await api.get<Vehicle[]>('/vehicles/driver');
    if (response.error) throw new Error(response.error);
    return response.data || [];
  },
  
  async create(data: Omit<Vehicle, 'id' | 'userId'>): Promise<Vehicle> {
    const response = await api.post<Vehicle>('/vehicles', data);
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('No data received');
    return response.data;
  },

  async get(id: string): Promise<Vehicle> {
    const response = await api.get<Vehicle>(`/vehicles/${id}`);
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('No data received');
    return response.data;
  },

  async update(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    const response = await api.put<Vehicle>(`/vehicles/${id}`, data);
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('No data received');
    return response.data;
  },

  async delete(id: string): Promise<void> {
    const response = await api.delete(`/vehicles/${id}`);
    if (response.error) throw new Error(response.error);
  },
};
