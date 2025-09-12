import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BusinessService, type Business, type CreateBusinessData, type UpdateBusinessData } from '@/lib/services/business-service';
import { useApi, useMutation as useApiMutation } from './use-api';
import { toast } from 'sonner';

// Query keys
export const businessKeys = {
  all: ['businesses'] as const,
  lists: () => [...businessKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...businessKeys.lists(), { filters }] as const,
  details: () => [...businessKeys.all, 'detail'] as const,
  detail: (id: number) => [...businessKeys.details(), id] as const,
  stats: (id: number) => [...businessKeys.detail(id), 'stats'] as const,
  conversations: (id: number) => [...businessKeys.detail(id), 'conversations'] as const,
  whatsapp: (id: number) => [...businessKeys.detail(id), 'whatsapp'] as const,
  tones: (id: number) => [...businessKeys.detail(id), 'tones'] as const,
};

// Get all businesses
export function useBusinesses() {
  return useQuery({
    queryKey: businessKeys.lists(),
    queryFn: async () => {
      const response = await BusinessService.getBusinesses();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch businesses');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get single business
export function useBusiness(id: number) {
  return useQuery({
    queryKey: businessKeys.detail(id),
    queryFn: async () => {
      const response = await BusinessService.getBusiness(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch business');
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Create business mutation
export function useCreateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBusinessData) => {
      const response = await BusinessService.createBusiness(data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create business');
      }
      return response.data;
    },
    onSuccess: (newBusiness) => {
      // Update the businesses list
      queryClient.setQueryData(businessKeys.lists(), (old: Business[] = []) => [
        ...old,
        newBusiness,
      ]);
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: businessKeys.lists() });
      
      toast.success('Business created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create business');
    },
  });
}

// Update business mutation
export function useUpdateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateBusinessData }) => {
      const response = await BusinessService.updateBusiness(id, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update business');
      }
      return response.data;
    },
    onSuccess: (updatedBusiness, { id }) => {
      // Update specific business
      queryClient.setQueryData(businessKeys.detail(id), updatedBusiness);
      
      // Update businesses list
      queryClient.setQueryData(businessKeys.lists(), (old: Business[] = []) =>
        old.map(business => 
          business.id === id ? updatedBusiness : business
        )
      );
      
      toast.success('Business updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update business');
    },
  });
}

// Delete business mutation
export function useDeleteBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await BusinessService.deleteBusiness(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete business');
      }
      return id;
    },
    onSuccess: (deletedId) => {
      // Remove from businesses list
      queryClient.setQueryData(businessKeys.lists(), (old: Business[] = []) =>
        old.filter(business => business.id !== deletedId)
      );
      
      // Remove individual business cache
      queryClient.removeQueries({ queryKey: businessKeys.detail(deletedId) });
      
      toast.success('Business deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete business');
    },
  });
}

// Bulk operations
export function useBulkDeleteBusinesses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await BusinessService.bulkDeleteBusinesses(ids);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete businesses');
      }
      return { ids, ...response.data };
    },
    onSuccess: ({ ids, deleted, failed }) => {
      // Remove deleted businesses from cache
      queryClient.setQueryData(businessKeys.lists(), (old: Business[] = []) =>
        old.filter(business => !ids.includes(business.id))
      );
      
      // Remove individual business caches
      ids.forEach(id => {
        queryClient.removeQueries({ queryKey: businessKeys.detail(id) });
      });
      
      if (failed > 0) {
        toast.warning(`${deleted} businesses deleted, ${failed} failed`);
      } else {
        toast.success(`${deleted} businesses deleted successfully`);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete businesses');
    },
  });
}

export function useBulkUpdateBusinessStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, status }: { ids: number[]; status: 'active' | 'inactive' }) => {
      const response = await BusinessService.bulkUpdateBusinessStatus(ids, status);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update business status');
      }
      return { ids, status, ...response.data };
    },
    onSuccess: ({ ids, status, updated, failed }) => {
      // Update businesses in cache
      queryClient.setQueryData(businessKeys.lists(), (old: Business[] = []) =>
        old.map(business => 
          ids.includes(business.id) ? { ...business, status } : business
        )
      );
      
      // Invalidate individual business caches
      ids.forEach(id => {
        queryClient.invalidateQueries({ queryKey: businessKeys.detail(id) });
      });
      
      if (failed > 0) {
        toast.warning(`${updated} businesses updated, ${failed} failed`);
      } else {
        toast.success(`${updated} businesses updated successfully`);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update business status');
    },
  });
}

// WhatsApp configuration hooks
export function useWhatsAppConfig(businessId: number) {
  return useQuery({
    queryKey: businessKeys.whatsapp(businessId),
    queryFn: async () => {
      const response = await BusinessService.getWhatsAppConfig(businessId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch WhatsApp config');
      }
      return response.data;
    },
    enabled: !!businessId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreateWhatsAppConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ businessId, data }: { businessId: number; data: any }) => {
      const response = await BusinessService.createWhatsAppConfig(businessId, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create WhatsApp config');
      }
      return response.data;
    },
    onSuccess: (_, { businessId }) => {
      queryClient.invalidateQueries({ queryKey: businessKeys.whatsapp(businessId) });
      toast.success('WhatsApp configuration created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create WhatsApp configuration');
    },
  });
}

export function useUpdateWhatsAppConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ businessId, data }: { businessId: number; data: any }) => {
      const response = await BusinessService.updateWhatsAppConfig(businessId, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update WhatsApp config');
      }
      return response.data;
    },
    onSuccess: (_, { businessId }) => {
      queryClient.invalidateQueries({ queryKey: businessKeys.whatsapp(businessId) });
      toast.success('WhatsApp configuration updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update WhatsApp configuration');
    },
  });
}

// Business tones hooks
export function useBusinessTones(businessId: number) {
  return useQuery({
    queryKey: businessKeys.tones(businessId),
    queryFn: async () => {
      const response = await BusinessService.getBusinessTones(businessId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch business tones');
      }
      return response.data;
    },
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateBusinessTone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ businessId, data }: { businessId: number; data: any }) => {
      const response = await BusinessService.createBusinessTone(businessId, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create business tone');
      }
      return response.data;
    },
    onSuccess: (_, { businessId }) => {
      queryClient.invalidateQueries({ queryKey: businessKeys.tones(businessId) });
      toast.success('Business tone created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create business tone');
    },
  });
}

export function useUpdateBusinessTone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ toneId, data }: { toneId: number; data: any }) => {
      const response = await BusinessService.updateBusinessTone(toneId, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update business tone');
      }
      return response.data;
    },
    onSuccess: (updatedTone) => {
      // Invalidate tones for the business
      queryClient.invalidateQueries({ 
        queryKey: businessKeys.tones(updatedTone.business_id) 
      });
      toast.success('Business tone updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update business tone');
    },
  });
}

export function useDeleteBusinessTone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (toneId: number) => {
      const response = await BusinessService.deleteBusinessTone(toneId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete business tone');
      }
      return toneId;
    },
    onSuccess: () => {
      // Invalidate all tone queries
      queryClient.invalidateQueries({ 
        queryKey: businessKeys.all,
        predicate: (query) => query.queryKey.includes('tones')
      });
      toast.success('Business tone deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete business tone');
    },
  });
}

// Business stats hook
export function useBusinessStats(businessId: number, params?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: [...businessKeys.stats(businessId), params],
    queryFn: async () => {
      const response = await BusinessService.getBusinessStats(businessId, params);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch business stats');
      }
      return response.data;
    },
    enabled: !!businessId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Conversations hook
export function useConversations(businessId: number, params?: {
  page?: number;
  limit?: number;
  status?: 'active' | 'archived';
}) {
  return useQuery({
    queryKey: [...businessKeys.conversations(businessId), params],
    queryFn: async () => {
      const response = await BusinessService.getConversations(businessId, params);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch conversations');
      }
      return response.data;
    },
    enabled: !!businessId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Custom hook for real-time business health monitoring
export function useBusinessHealth() {
  return useApi(
    () => BusinessService.healthCheck(),
    {
      immediate: true,
      retry: true,
      retryCount: 3,
      retryDelay: 2000,
    }
  );
}
