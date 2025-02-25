import { api } from './api';
import type { FuelRecord } from '../types/schema';

export const fuelRecords = {
  async list(vehicleId: string): Promise<FuelRecord[]> {
    const response = await api.get<FuelRecord[]>(`/vehicles/${vehicleId}/fuel-records`);
    if (response.error) throw new Error(response.error);
    return response.data || [];
  },

  async create(vehicleId: string, data: Omit<FuelRecord, 'id' | 'vehicleId'>): Promise<FuelRecord> {
    const response = await api.post<FuelRecord>(`/vehicles/${vehicleId}/fuel-records`, data);
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('No data received');
    return response.data;
  },

  async get(vehicleId: string, id: string): Promise<FuelRecord> {
    const response = await api.get<FuelRecord>(`/vehicles/${vehicleId}/fuel-records/${id}`);
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('No data received');
    return response.data;
  },

  async update(vehicleId: string, id: string, data: Partial<FuelRecord>): Promise<FuelRecord> {
    const response = await api.put<FuelRecord>(`/vehicles/${vehicleId}/fuel-records/${id}`, data);
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('No data received');
    return response.data;
  },

  async delete(vehicleId: string, id: string): Promise<void> {
    const response = await api.delete(`/vehicles/${vehicleId}/fuel-records/${id}`);
    if (response.error) throw new Error(response.error);
  },
};
