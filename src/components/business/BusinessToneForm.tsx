import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateBusinessTone, useUpdateBusinessTone, useBusinessTone } from "@/hooks/useBusinesses";

const businessToneSchema = z.object({
  name: z.string().min(1, "Tone name is required").max(50, "Tone name cannot exceed 50 characters"),
  description: z.string().max(200, "Description cannot exceed 200 characters").optional(),
  tone_instructions: z
    .string()
    .min(1, "Tone instructions are required")
    .max(1000, "Tone instructions cannot exceed 1000 characters"),
});

type BusinessToneFormData = z.infer<typeof businessToneSchema>;

interface BusinessToneFormProps {
  businessId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const BusinessToneForm: React.FC<BusinessToneFormProps> = ({ businessId, onSuccess, onCancel }) => {
  const createTone = useCreateBusinessTone();
  const updateTone = useUpdateBusinessTone();
  const { data: existingTone } = useBusinessTone(businessId);

  const form = useForm<BusinessToneFormData>({
    resolver: zodResolver(businessToneSchema),
    defaultValues: {
      name: "",
      description: "",
      tone_instructions: "",
    },
  });

  // Load existing tone data when available
  useEffect(() => {
    if (existingTone) {
      form.reset({
        name: existingTone.name,
        description: existingTone.description || "",
        tone_instructions: existingTone.tone_instructions,
      });
    }
  }, [existingTone, form]);

  const onSubmit = async (data: BusinessToneFormData) => {
    try {
      if (existingTone) {
        // Update existing tone
        await updateTone.mutateAsync({
          id: existingTone.id,
          data: {
            name: data.name,
            description: data.description || undefined,
            tone_instructions: data.tone_instructions,
            business_id: businessId,
          },
        });
      } else {
        // Create new tone
        await createTone.mutateAsync({
          businessId,
          data: {
            name: data.name,
            description: data.description || undefined,
            tone_instructions: data.tone_instructions,
          },
        });
      }
      onSuccess();
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  const isLoading = createTone.isPending || updateTone.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter tone description" {...field} rows={3} />
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
                <Textarea placeholder="Enter tone instructions" {...field} rows={4} />
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
            {isLoading ? "Saving..." : existingTone ? "Update Tone" : "Create Tone"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
