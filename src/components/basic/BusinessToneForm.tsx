import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateBusinessTone, useUpdateBusinessTone, useBusinessTones } from "@/hooks/use-businesses";
import type { BusinessTone } from "@/lib/services/business-service";

const businessToneSchema = z.object({
  tone_name: z.string().min(1, "Tone name is required").max(50, "Tone name cannot exceed 50 characters"),
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
  editingTone?: BusinessTone | null;
}

export const BusinessToneForm: React.FC<BusinessToneFormProps> = ({ businessId, onSuccess, onCancel, editingTone }) => {
  // Move the hook here
  const { data: existingTones = [], isLoading: tonesLoading } = useBusinessTones(businessId);

  // Use existingTones[0] as editingTone if not provided
  const actualEditingTone = editingTone || existingTones[0] || null;

  const createTone = useCreateBusinessTone();
  const updateTone = useUpdateBusinessTone();

  // Add debug logging
  console.log("BusinessToneForm props:", { businessId, editingTone });

  const form = useForm<BusinessToneFormData>({
    resolver: zodResolver(businessToneSchema),
    defaultValues: {
      tone_name: "",
      description: "",
      tone_instructions: "",
    },
  });

  // Enhanced loading states
  const isSubmitting = createTone.isPending || updateTone.isPending;
  const isFormLoading = tonesLoading; // Show loading when tones are being fetched from API

  // Load existing tone data when editing
  useEffect(() => {
    console.log("useEffect triggered with editingTone:", editingTone);

    if (actualEditingTone) {
      console.log("Resetting form with existing tone data:", {
        tone_name: actualEditingTone.name,
        description: actualEditingTone.description,
        tone_instructions: actualEditingTone.tone_instructions,
      });

      setTimeout(() => {
        form.reset({
          tone_name: actualEditingTone.name,
          description: actualEditingTone.description || "",
          tone_instructions: actualEditingTone.tone_instructions,
        });
        console.log("Form reset completed");
      }, 100);
    } else if (editingTone === null) {
      // Only reset to empty when we know there's no tone (not when still loading)
      console.log("Resetting form with empty data");
      form.reset({
        tone_name: "",
        description: "",
        tone_instructions: "",
      });
    }
  }, [editingTone, form, actualEditingTone]);

  const onSubmit = async (data: BusinessToneFormData) => {
    try {
      console.log("Form data being submitted:", data); // Debug log

      if (actualEditingTone) {
        const updateData = {
          tone_name: data.tone_name,
          description: data.description,
          tone_instructions: data.tone_instructions,
        };
        console.log("Update data:", updateData); // Debug log

        await updateTone.mutateAsync({
          toneId: actualEditingTone.id,
          data: updateData,
        });
      } else {
        const createData = {
          tone_name: data.tone_name,
          description: data.description,
          tone_instructions: data.tone_instructions,
        };
        console.log("Create data:", createData); // Debug log

        await createTone.mutateAsync({
          businessId,
          data: createData,
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
        <fieldset disabled={isSubmitting}>
          <FormField
            control={form.control}
            name="tone_name"
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Enter tone description (optional)" {...field} disabled={isSubmitting} />
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
                {actualEditingTone ? "Updating..." : "Creating..."}
              </>
            ) : actualEditingTone ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
