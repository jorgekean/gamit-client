import { api } from '../lib/api';

export interface MaintenanceFilters {
  status?: string;
  assetId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  type: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  description: string;
  scheduledDate: string;
  completedDate?: string;
  cost?: number;
  performedBy?: string;
  createdAt: string;
  updatedAt: string;
  asset?: {
    name: string;
    propertyNo: string;
  };
}

export interface CreateMaintenanceInput {
  assetId: string;
  type: string;
  status?: string;
  description: string;
  scheduledDate: string;
  completedDate?: string;
  cost?: number;
  performedBy?: string;
}

export interface UpdateMaintenanceInput {
  type?: string;
  status?: string;
  description?: string;
  scheduledDate?: string;
  completedDate?: string;
  cost?: number;
  performedBy?: string;
}

export const maintenanceApi = {
  getAll: async (filters?: MaintenanceFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assetId) params.append('assetId', filters.assetId);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get<{ data: MaintenanceRecord[], meta: { total: number, page: number, totalPages: number } }>(`/maintenance?${params.toString()}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<MaintenanceRecord>(`/maintenance/${id}`);
    return response.data;
  },

  create: async (data: CreateMaintenanceInput) => {
    const response = await api.post<MaintenanceRecord>('/maintenance', data);
    return response.data;
  },

  update: async (id: string, data: UpdateMaintenanceInput) => {
    const response = await api.put<MaintenanceRecord>(`/maintenance/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/maintenance/${id}`);
    return response.data;
  }
};
