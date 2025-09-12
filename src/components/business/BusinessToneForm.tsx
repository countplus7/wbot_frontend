import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateBusinessTone, useUpdateBusinessTone } from "@/hooks/use-businesses";
import type { BusinessTone } from "@/lib/services/business-service";

const businessToneSchema = z.object({
  tone_name: z.string().min(1, "Tone name is required").max(50, "Tone name cannot exceed 50 characters"),
  tone_instructions: z
    .string()
    .min(1, "Tone instructions are required")
    .max(1000, "Tone instructions cannot exceed 1000 characters"),
  is_default: z.boolean().optional(),
});

type BusinessToneFormData = z.infer<typeof businessToneSchema>;

interface BusinessToneFormProps {
  businessId: number;
  onSuccess: () => void;
  onCancel: () => void;
  editingTone?: BusinessTone | null;
}

export const BusinessToneForm: React.FC<BusinessToneFormProps> = ({ 
  businessId, 
  onSuccess, 
  onCancel, 
  editingTone 
}) => {
  const createTone = useCreateBusinessTone();
  const updateTone = useUpdateBusinessTone();

  const form = useForm<BusinessToneFormData>({
    resolver: zodResolver(businessToneSchema),
    defaultValues: {
      tone_name: "",
      tone_instructions: "",
      is_default: false,
    },
  });

  // Load existing tone data when editing
  useEffect(() => {
    if (editingTone) {
      form.reset({
        tone_name: editingTone.tone_name,
        tone_instructions: editingTone.tone_instructions,
        is_default: editingTone.is_default,
      });
    } else {
      form.reset({
        tone_name: "",
        tone_instructions: "",
        is_default: false,
      });
    }
  }, [editingTone, form]);

  const onSubmit = async (data: BusinessToneFormData) => {
    try {
      if (editingTone) {
        // Update existing tone
        await updateTone.mutateAsync({
          toneId: editingTone.id,
          data: {
            tone_name: data.tone_name,
            tone_instructions: data.tone_instructions,
            is_default: data.is_default,
          },
        });
      } else {
        // Create new tone
        await createTone.mutateAsync({
          businessId,
          data: {
            tone_name: data.tone_name,
            tone_instructions: data.tone_instructions,
            is_default: data.is_default,
          },
        });
      }
      onSuccess();
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error("Error submitting business tone:", error);
    }
  };

  const isLoading = createTone.isPending || updateTone.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="tone_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tone Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter tone name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tone_instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tone Instructions *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter detailed tone instructions for the AI assistant" 
                  {...field} 
                  rows={6} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_default"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value || false}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Set as default tone</FormLabel>
                <p className="text-sm text-muted-foreground">
                  This tone will be used by default for new conversations
                </p>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : editingTone ? "Update Tone" : "Create Tone"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
