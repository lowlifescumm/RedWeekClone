import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Property submission form schema
const propertySubmissionSchema = z.object({
  propertyName: z.string().min(1, "Property name is required"),
  resortName: z.string().min(1, "Resort name is required"),
  location: z.string().min(1, "Location is required"),
  unit: z.string().min(1, "Unit details are required"),
  ownership: z.string().min(1, "Ownership details are required"),
  weekDetails: z.string().min(1, "Week/season details are required"),
  askingPrice: z.string().min(1, "Asking price is required"),
  contactPhone: z.string().min(1, "Phone number is required"),
  additionalDetails: z.string().optional(),
});

type PropertySubmissionData = z.infer<typeof propertySubmissionSchema>;

interface PropertySubmissionFormProps {
  onSuccess?: () => void;
}

export function PropertySubmissionForm({ onSuccess }: PropertySubmissionFormProps) {
  const { toast } = useToast();

  // Property submission form
  const form = useForm<PropertySubmissionData>({
    resolver: zodResolver(propertySubmissionSchema),
    defaultValues: {
      propertyName: "",
      resortName: "",
      location: "",
      unit: "",
      ownership: "",
      weekDetails: "",
      askingPrice: "",
      contactPhone: "",
      additionalDetails: "",
    },
  });

  const submitPropertyMutation = useMutation({
    mutationFn: async (data: PropertySubmissionData) => {
      return apiRequest('/api/property-submissions', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Property Submitted Successfully!",
        description: "Your property information has been sent to our team. We'll contact you within 24 hours.",
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PropertySubmissionData) => {
    submitPropertyMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="propertyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., My Disney Vacation Club" {...field} data-testid="input-property-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="resortName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resort Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Disney's Riviera Resort" {...field} data-testid="input-resort-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Orlando, Florida" {...field} data-testid="input-location" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Details</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 2BR Villa, Sleeps 8" {...field} data-testid="input-unit" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ownership"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ownership Type</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Deeded, Points, Weeks" {...field} data-testid="input-ownership" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weekDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Week/Season Details</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Week 52, Spring Break" {...field} data-testid="input-week-details" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="askingPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asking Price</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., $15,000" {...field} data-testid="input-asking-price" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="(555) 123-4567" {...field} data-testid="input-phone" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="additionalDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Details (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional information about your property, maintenance fees, restrictions, etc." 
                  {...field} 
                  data-testid="textarea-additional-details"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button 
            type="submit" 
            disabled={submitPropertyMutation.isPending}
            data-testid="submit-property-button"
          >
            {submitPropertyMutation.isPending ? "Submitting..." : "Submit Property"}
          </Button>
        </div>
      </form>
    </Form>
  );
}