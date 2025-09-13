import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useWhatsAppConfig, useCreateWhatsAppConfig, useUpdateWhatsAppConfig } from "@/hooks/use-businesses";

const whatsappConfigSchema = z.object({
  phone_number_id: z.string().min(1, "Phone number ID is required"),
  access_token: z.string().min(1, "Access token is required"),
  verify_token: z.string().optional(),
  webhook_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type WhatsAppConfigFormData = z.infer<typeof whatsappConfigSchema>;

interface WhatsAppConfigFormProps {
  businessId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const WhatsAppConfigForm: React.FC<WhatsAppConfigFormProps> = ({ businessId, onSuccess, onCancel }) => {
  const { data: existingConfig } = useWhatsAppConfig(businessId);
  const createConfig = useCreateWhatsAppConfig();
  const updateConfig = useUpdateWhatsAppConfig();

  const form = useForm<WhatsAppConfigFormData>({
    resolver: zodResolver(whatsappConfigSchema),
    defaultValues: {
      phone_number_id: "",
      access_token: "",
      verify_token: "",
      webhook_url: "",
    },
  });

  useEffect(() => {
    if (isEditing) {
      form.reset({
        phone_number_id: existingConfig.phone_number_id,
        access_token: existingConfig.access_token,
        verify_token: existingConfig.verify_token || "",
        webhook_url: existingConfig.webhook_url || "",
      });
    }
  }, [existingConfig, form]);

  const onSubmit = async (data: WhatsAppConfigFormData) => {
    try {
      if (isEditing) {
        await updateConfig.mutateAsync({
          businessId,
          data: {
            phone_number_id: data.phone_number_id,
            access_token: data.access_token,
            verify_token: data.verify_token || undefined,
            webhook_url: data.webhook_url || undefined,
          },
        });
      } else {
        await createConfig.mutateAsync({
          businessId,
          data: {
            phone_number_id: data.phone_number_id,
            access_token: data.access_token,
            verify_token: data.verify_token || undefined,
            webhook_url: data.webhook_url || undefined,
          },
        });
      }
      onSuccess();
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  const isLoading = createConfig.isPending || updateConfig.isPending;
  // Fix: Check for actual config data, not just truthiness of empty object
  const isEditing = existingConfig && (existingConfig.id || existingConfig.access_token);

  // Debug logging
  console.log("WhatsApp Config Debug:", {
    existingConfig,
    isEditing,
    hasId: existingConfig?.id,
    hasAccessToken: existingConfig?.access_token,
    configKeys: existingConfig ? Object.keys(existingConfig) : "null",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="phone_number_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number ID *</FormLabel>
              <FormControl>
                <Input placeholder="Enter WhatsApp phone number ID" autoComplete="username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="access_token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Access Token *</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter WhatsApp access token"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="verify_token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Verify Token</FormLabel>
              <FormControl>
                <Input placeholder="Enter webhook verify token (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="webhook_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Webhook URL</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://yourdomain.com/webhook" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
