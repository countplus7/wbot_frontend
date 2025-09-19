import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateBusinessTone, useUpdateBusinessTone, useBusinessTone } from "@/hooks/use-businesses";
import type { BusinessTone } from "@/lib/services/business-service";

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
  // Use the single tone hook instead of tones array
  const { data: existingTone, isLoading: toneLoading } = useBusinessTone(businessId);

  const createTone = useCreateBusinessTone();
  const updateTone = useUpdateBusinessTone();

  const form = useForm<BusinessToneFormData>({
    resolver: zodResolver(businessToneSchema),
    defaultValues: {
      name: "",
      description: "",
      tone_instructions: "",
    },
  });

  // Enhanced loading states
  const isSubmitting = createTone.isPending || updateTone.isPending;
  const isFormLoading = toneLoading;

  // Load existing tone data when editing
  useEffect(() => {
    if (existingTone) {
      form.reset({
        name: existingTone.name,
        description: existingTone.description || "",
        tone_instructions: existingTone.tone_instructions,
      });
    } else {
      // Reset to empty when no tone exists
      form.reset({
        name: "",
        description: "",
        tone_instructions: "",
      });
    }
  }, [existingTone, form]);

  const onSubmit = async (data: BusinessToneFormData) => {
    try {
      if (existingTone) {
        // Update existing tone
        await updateTone.mutateAsync({
          businessId,
          toneId: existingTone.id,
          data: {
            name: data.name,
            description: data.description,
            tone_instructions: data.tone_instructions,
          },
        });
      } else {
        // Create new tone
        await createTone.mutateAsync({
          businessId,
          data: {
            name: data.name,
            description: data.description,
            tone_instructions: data.tone_instructions,
          },
        });
      }
      onSuccess();
    } catch (error) {
      console.error("Error submitting business tone:", error);
    }
  };

  // Show loading state when form is loading
  if (isFormLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tone configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Disable all form fields when submitting */}
        <fieldset disabled={isSubmitting} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tone Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter tone name" {...field} disabled={isSubmitting} />
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
                <FormLabel>Description (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter tone description" {...field} disabled={isSubmitting} />
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
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {existingTone ? "Updating..." : "Creating..."}
              </>
            ) : existingTone ? (
              "Update Tone"
            ) : (
              "Create Tone"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
