import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertListingSchema, type InsertListing } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractUploader } from "@/components/ContractUploader";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ArrowLeft, Upload, Shield, DollarSign } from "lucide-react";
import { Link } from "wouter";
import type { UploadResult } from "@uppy/core";

export default function CreateListing() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [contractUploaded, setContractUploaded] = useState(false);
  const [uploadedContractUrl, setUploadedContractUrl] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<"details" | "contract" | "escrow">("details");

  const form = useForm<InsertListing>({
    resolver: zodResolver(insertListingSchema),
    defaultValues: {
      title: "",
      description: "",
      pricePerNight: 0,
      maxGuests: 1,
      salePrice: undefined,
      isForSale: false,
    },
  });

  const { data: resorts, isLoading: resortsLoading } = useQuery({
    queryKey: ["/api/resorts"],
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: InsertListing) => {
      return apiRequest("/api/listings", "POST", data);
    },
    onSuccess: (listing: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      
      if (uploadedContractUrl && listing?.id) {
        // Upload contract if provided
        contractUploadMutation.mutate({
          listingId: listing.id,
          contractUrl: uploadedContractUrl,
        });
        toast({
          title: "Listing Created Successfully!",
          description: "Your listing and ownership contract have been submitted for verification.",
        });
      } else {
        // Listing created without contract - team will follow up
        toast({
          title: "Listing Created Successfully!",
          description: "Your listing has been submitted. Our team will contact you about contract verification for listing approval.",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    },
  });

  const contractUploadMutation = useMutation({
    mutationFn: async ({ listingId, contractUrl }: { listingId: string; contractUrl: string }) => {
      return apiRequest(`/api/listings/${listingId}/contract`, "POST", {
        contractDocumentUrl: contractUrl,
      });
    },
    onSuccess: () => {
      toast({
        title: "Contract Uploaded",
        description: "Your ownership contract has been uploaded for verification.",
      });
      setCurrentStep("escrow");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload contract. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    try {
      const response: any = await apiRequest("/api/contracts/upload", "POST");
      return {
        method: "PUT" as const,
        url: response.uploadURL,
      };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get upload URL. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleContractUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful[0]) {
      setUploadedContractUrl(result.successful[0].uploadURL || "");
      setContractUploaded(true);
      toast({
        title: "Contract Ready",
        description: "Contract file uploaded successfully. Submit your listing to continue.",
      });
    }
  };

  const onSubmit = (data: InsertListing) => {
    // Add dummy user ID for now - in real app this would come from auth
    const listingData = {
      ...data,
      ownerId: "test-user-1", // This should come from authenticated user
      contractDocumentUrl: uploadedContractUrl,
    };
    createListingMutation.mutate(listingData);
  };

  if (resortsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading resorts...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/dashboard">
              <Button variant="ghost" className="mb-4" data-testid="button-back-dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">List Your Timeshare</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Create a listing to rent or sell your timeshare with secure contract verification and escrow services.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex items-center ${currentStep === "details" ? "text-blue-600 dark:text-blue-400" : currentStep === "contract" || currentStep === "escrow" ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${currentStep === "details" ? "bg-blue-100 dark:bg-blue-900" : currentStep === "contract" || currentStep === "escrow" ? "bg-green-100 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-800"}`}>
                  1
                </div>
                <span className="font-medium">Listing Details</span>
              </div>
              <div className={`flex items-center ${currentStep === "contract" ? "text-blue-600 dark:text-blue-400" : currentStep === "escrow" ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${currentStep === "contract" ? "bg-blue-100 dark:bg-blue-900" : currentStep === "escrow" ? "bg-green-100 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-800"}`}>
                  2
                </div>
                <span className="font-medium">Contract Upload</span>
              </div>
              <div className={`flex items-center ${currentStep === "escrow" ? "text-blue-600 dark:text-blue-400" : "text-gray-400"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${currentStep === "escrow" ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-gray-800"}`}>
                  3
                </div>
                <span className="font-medium">Escrow Setup</span>
              </div>
            </div>
          </div>

          {currentStep === "details" && (
            <Card>
              <CardHeader>
                <CardTitle>Listing Information</CardTitle>
                <CardDescription>
                  Provide details about your timeshare listing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="resortId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resort</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} data-testid="select-resort">
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a resort" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(resorts as any[])?.map((resort: any) => (
                                <SelectItem key={resort.id} value={resort.id}>
                                  {resort.name} - {resort.location}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Listing Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Beautiful beachfront timeshare..." {...field} data-testid="input-title" />
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
                            <Textarea 
                              placeholder="Describe your timeshare, amenities, and what makes it special..."
                              className="min-h-[120px]"
                              {...field}
                              data-testid="textarea-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="pricePerNight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price per Night ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="200" 
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                data-testid="input-price-per-night"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maxGuests"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Guests</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="4" 
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                data-testid="input-max-guests"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="availableFrom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Available From</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                {...field}
                                value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                onChange={(e) => field.onChange(new Date(e.target.value))}
                                data-testid="input-available-from"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="availableTo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Available To</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                {...field}
                                value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                onChange={(e) => field.onChange(new Date(e.target.value))}
                                data-testid="input-available-to"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">Optional: Sell Your Timeshare</h3>
                      <FormField
                        control={form.control}
                        name="isForSale"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input 
                                type="checkbox" 
                                checked={field.value}
                                onChange={field.onChange}
                                data-testid="checkbox-for-sale"
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              I also want to sell this timeshare
                            </FormLabel>
                          </FormItem>
                        )}
                      />

                      {form.watch("isForSale") && (
                        <FormField
                          control={form.control}
                          name="salePrice"
                          render={({ field }) => (
                            <FormItem className="mt-4">
                              <FormLabel>Sale Price ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="25000" 
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                  data-testid="input-sale-price"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">Contract Upload</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Upload your ownership contract to verify your timeshare ownership. <strong>Note: Contract verification is required before your listing can be published.</strong> Our team will review your submission.
                      </p>
                      
                      <ContractUploader
                        onGetUploadParameters={handleGetUploadParameters}
                        onComplete={handleContractUploadComplete}
                        buttonClassName={contractUploaded ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {contractUploaded ? "Ownership Contract Uploaded ✓" : "Upload Ownership Contract"}
                      </ContractUploader>
                      
                      {contractUploaded && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                          ✓ Ownership contract uploaded successfully. Your ownership will be verified by our team before listing approval.
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={createListingMutation.isPending}
                        data-testid="button-create-listing"
                      >
                        {createListingMutation.isPending ? "Creating..." : "Create Listing"}
                      </Button>
                      {!contractUploaded && (
                        <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 text-center">
                          <strong>Note:</strong> Contract upload will be required for listing approval
                        </p>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {currentStep === "contract" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Contract Verification
                </CardTitle>
                <CardDescription>
                  Upload your ownership contract to verify your legal right to list this timeshare property. Contract verification is required for listing approval.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Why upload a contract?</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Verifies your legal ownership of the timeshare</li>
                      <li>• Prevents unauthorized listings and protects renters</li>
                      <li>• Required for escrow services when selling</li>
                      <li>• Builds trust and increases booking rates</li>
                    </ul>
                  </div>

                  <ContractUploader
                    onGetUploadParameters={handleGetUploadParameters}
                    onComplete={handleContractUploadComplete}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Ownership Contract
                  </ContractUploader>

                  <div className="flex justify-between">
                    <div className="text-sm text-amber-600 dark:text-amber-400">
                      <strong>Note:</strong> Contract verification required for listing approval
                    </div>
                    <Button onClick={() => setCurrentStep("escrow")}>
                      Continue
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === "escrow" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Escrow Services
                </CardTitle>
                <CardDescription>
                  Set up secure escrow services powered by concordtitle.net for safe transactions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Secure Transactions</h4>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Our partnership with concordtitle.net ensures all transactions are handled securely with professional escrow services, protecting both buyers and sellers.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Available Services:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <h5 className="font-medium mb-2">Rental Protection</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Secure rental payments and protect against cancellations with our rental protection service.
                        </p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h5 className="font-medium mb-2">Sale Escrow</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Full escrow services for timeshare sales including title transfer and fund protection.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Next Steps</h4>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Your listing has been created! Our team will review your contract (if uploaded) and activate escrow services as needed. You'll receive an email confirmation shortly.
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <Link href="/dashboard">
                      <Button variant="outline" data-testid="button-view-dashboard">
                        View Dashboard
                      </Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button data-testid="button-finish">
                        Finish
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}