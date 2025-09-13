import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateBusiness, useUpdateBusiness } from "@/hooks/use-businesses";
import type { Business } from "@/lib/services/business-service";

const businessSchema = z.object({
  name: z.string().min(1, "Business name is required").max(100, "Business name cannot exceed 100 characters"),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

type BusinessFormData = z.infer<typeof businessSchema>;

interface BusinessFormProps {
  business?: Business | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const BusinessForm: React.FC<BusinessFormProps> = ({ business, onSuccess, onCancel }) => {
  const isEditing = !!business;
  const createBusiness = useCreateBusiness();
  const updateBusiness = useUpdateBusiness();

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: business?.name || "",
      description: business?.description || "",
      status: business?.status || "active",
    },
  });

  const onSubmit = async (data: BusinessFormData) => {
    try {
      if (isEditing && business) {
        await updateBusiness.mutateAsync({
          id: business.id,
          data: {
            name: data.name,
            description: data.description,
            status: data.status,
          },
        });
      } else {
        await createBusiness.mutateAsync({
          name: data.name,
          description: data.description,
          status: data.status,
        });
      }
      onSuccess();
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  const isLoading = createBusiness.isPending || updateBusiness.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter business name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter business description (optional)" className="min-h-[80px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
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
