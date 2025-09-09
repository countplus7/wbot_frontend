import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import { businessService } from '../lib/services/businessService';
import type { Business, BusinessWithConfigAndTones, WhatsAppConfig, BusinessTone } from '../lib/api';
import { toast } from 'sonner';

// Create proper interfaces for mutation data
interface CreateBusinessData {
  name: string;
  description?: string;
  status?: 'active' | 'inactive';
}

interface UpdateBusinessData {
  name: string;
  description?: string;
  status?: 'active' | 'inactive';
}

interface CreateWhatsAppConfigData {
  phone_number_id: string;
  access_token: string;
  verify_token?: string;
  webhook_url?: string;
}

interface UpdateWhatsAppConfigData {
  phone_number_id: string;
  access_token: string;
  verify_token?: string;
  webhook_url?: string;
}

interface CreateBusinessToneData {
  name: string;
  description?: string;
  tone_instructions: string;
}

// Query keys
export const businessKeys = {
  all: ['businesses'] as const,
  lists: () => [...businessKeys.all, 'list'] as const,
  list: (filters: string) => [...businessKeys.lists(), { filters }] as const,
  details: () => [...businessKeys.all, 'detail'] as const,
  detail: (id: number) => [...businessKeys.details(), id] as const,
  whatsappConfig: (businessId: number) => [...businessKeys.detail(businessId), 'whatsapp-config'] as const,
  tone: (businessId: number) => [...businessKeys.detail(businessId), 'tone'] as const, // Changed from 'tones'
};

// Get all businesses
export const useBusinesses = () => {
  return useQuery({
    queryKey: businessKeys.lists(),
    queryFn: () => businessService.getBusinesses(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single business
export const useBusiness = (id: number) => {
  return useQuery({
    queryKey: businessKeys.detail(id),
    queryFn: () => businessService.getBusiness(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get WhatsApp config for business
export const useWhatsAppConfig = (businessId: number) => {
  return useQuery({
    queryKey: businessKeys.whatsappConfig(businessId),
    queryFn: () => businessService.getWhatsAppConfig(businessId),
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get business tone (single tone per business)
export const useBusinessTone = (businessId: number) => {
  return useQuery({
    queryKey: businessKeys.tone(businessId),
    queryFn: () => businessService.getBusinessTone(businessId),
    enabled: !!businessId,
    staleTime: 0, // Always refetch when invalidated
  });
};

// Get all tones for all businesses
export const useAllBusinessTones = () => {
  const { data: businesses = [], isLoading: businessesLoading } = useBusinesses();
  
  return useQueries({
    queries: businesses.map(business => ({
      queryKey: businessKeys.tone(business.id),
      queryFn: () => businessService.getBusinessTone(business.id),
      enabled: !!business.id && !businessesLoading, // Added !businessesLoading condition
      staleTime: 0, // Always refetch when invalidated
    }))
  });
};

// Create business mutation
export const useCreateBusiness = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBusinessData) => businessService.createBusiness(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessKeys.lists() });
      toast.success('Business created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create business: ${error.message}`);
    },
  });
};

// Update business mutation
export const useUpdateBusiness = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBusinessData }) =>
      businessService.updateBusiness(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: businessKeys.lists() });
      queryClient.invalidateQueries({ queryKey: businessKeys.detail(id) });
      toast.success('Business updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update business: ${error.message}`);
    },
  });
};

// Delete business mutation
export const useDeleteBusiness = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => businessService.deleteBusiness(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessKeys.lists() });
      toast.success('Business deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete business: ${error.message}`);
    },
  });
};

// Create WhatsApp config mutation
export const useCreateWhatsAppConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ businessId, data }: { businessId: number; data: CreateWhatsAppConfigData }) =>
      businessService.createWhatsAppConfig(businessId, data),
    onSuccess: (_, { businessId }) => {
      queryClient.invalidateQueries({ queryKey: businessKeys.whatsappConfig(businessId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.detail(businessId) });
      toast.success('WhatsApp configuration created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create WhatsApp configuration: ${error.message}`);
    },
  });
};

// Update WhatsApp config mutation
export const useUpdateWhatsAppConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateWhatsAppConfigData }) =>
      businessService.updateWhatsAppConfig(id, data),
    onSuccess: (config) => {
      queryClient.invalidateQueries({ queryKey: businessKeys.whatsappConfig(config.business_id) });
      queryClient.invalidateQueries({ queryKey: businessKeys.detail(config.business_id) });
      toast.success('WhatsApp configuration updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update WhatsApp configuration: ${error.message}`);
    },
  });
};

// Delete WhatsApp config mutation
export const useDeleteWhatsAppConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => businessService.deleteWhatsAppConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessKeys.all });
      toast.success('WhatsApp configuration deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete WhatsApp configuration: ${error.message}`);
    },
  });
};

// Update useCreateBusinessTone to handle both create and update
export const useCreateBusinessTone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ businessId, data }: { businessId: number; data: CreateBusinessToneData }) =>
      businessService.createBusinessTone(businessId, data),
    onSuccess: (_, { businessId }) => {
      // Invalidate the specific business tone query
      queryClient.invalidateQueries({ queryKey: businessKeys.tone(businessId) });
      
      // Also invalidate the business detail query
      queryClient.invalidateQueries({ queryKey: businessKeys.detail(businessId) });
      
      toast.success('Business tone saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save business tone: ${error.message}`);
    },
  });
};

// Update business tone mutation
export const useUpdateBusinessTone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; description?: string; tone_instructions: string; business_id: number } }) =>
      businessService.updateBusinessTone(id, data),
    onSuccess: (_, { data }) => {
      // Invalidate the specific business tone query
      queryClient.invalidateQueries({ queryKey: businessKeys.tone(data.business_id) });
      
      // Also invalidate the business detail query
      queryClient.invalidateQueries({ queryKey: businessKeys.detail(data.business_id) });
      
      toast.success('Business tone updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update business tone: ${error.message}`);
    },
  });
};

// Delete business tone mutation
export const useDeleteBusinessTone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => businessService.deleteBusinessTone(id),
    onSuccess: (tone) => {
      queryClient.invalidateQueries({ queryKey: businessKeys.tone(tone.business_id) });
      queryClient.invalidateQueries({ queryKey: businessKeys.detail(tone.business_id) });
      toast.success('Business tone deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete business tone: ${error.message}`);
    },
  });
};

// Chat History Query Keys
export const chatKeys = {
  all: ['chat'] as const,
  conversations: (businessId: number) => [...chatKeys.all, 'conversations', businessId] as const,
  messages: (conversationId: number) => [...chatKeys.all, 'messages', conversationId] as const,
};

// Get business conversations
export const useBusinessConversations = (businessId: number) => {
  return useQuery({
    queryKey: chatKeys.conversations(businessId),
    queryFn: () => businessService.getBusinessConversations(businessId),
    enabled: !!businessId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Get conversation messages
export const useConversationMessages = (
  conversationId: number, 
  limit: number = 50, 
  offset: number = 0
) => {
  return useQuery({
    queryKey: [...chatKeys.messages(conversationId), { limit, offset }],
    queryFn: () => businessService.getConversationMessages(conversationId, limit, offset),
    enabled: !!conversationId,
    staleTime: 10 * 1000, // 10 seconds
  });
};

// Delete conversation mutation
export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: number) => businessService.deleteConversation(conversationId),
    onSuccess: (deletedConversation) => {
      // Invalidate conversations list for the business
      queryClient.invalidateQueries({ 
        queryKey: chatKeys.conversations(deletedConversation.business_id) 
      });
      toast.success('Conversation deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete conversation: ${error.message}`);
    },
  });
};