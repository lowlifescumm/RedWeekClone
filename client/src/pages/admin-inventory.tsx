import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Download, RefreshCw, Eye, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SyncFilters {
  destination?: string;
  priceMin?: number;
  priceMax?: number;
  limit?: number;
}

interface SyncResult {
  provider: string;
  timestamp: string;
  total: number;
  imported: number;
  updated: number;
  errors: Array<{
    listingId: string;
    error: string;
    data?: any;
  }>;
  preview?: boolean;
  message?: string;
}

const syncFiltersSchema = z.object({
  destination: z.string().optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  limit: z.coerce.number().min(1).max(100).optional()
});

type SyncFiltersForm = z.infer<typeof syncFiltersSchema>;

export default function AdminInventory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [previewResults, setPreviewResults] = useState<SyncResult | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    window.location.href = '/auth';
    return null;
  }

  // Form for sync filters
  const filtersForm = useForm<SyncFiltersForm>({
    resolver: zodResolver(syncFiltersSchema),
    defaultValues: {
      destination: '',
      priceMin: undefined,
      priceMax: undefined,
      limit: 10
    }
  });

  // Fetch available providers
  const { data: providersData, isLoading: providersLoading } = useQuery({
    queryKey: ['/api/inventory/providers'],
    enabled: !!user && user.role === 'admin'
  });

  // Fetch sync history
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['/api/inventory/history'],
    enabled: !!user && user.role === 'admin'
  });

  // Preview inventory mutation
  const previewMutation = useMutation({
    mutationFn: async (data: { provider: string; filters: SyncFiltersForm }): Promise<SyncResult> => {
      const response = await apiRequest(`/api/inventory/preview/${data.provider}`, 'POST', { filters: data.filters });
      return response as SyncResult;
    },
    onSuccess: (result: SyncResult) => {
      setPreviewResults(result);
      setShowPreviewDialog(true);
      toast({
        title: "Preview Generated",
        description: `Found ${result.total} listings from ${result.provider}`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Preview Failed",
        description: error.message || "Failed to preview inventory",
      });
    }
  });

  // Sync inventory mutation
  const syncMutation = useMutation({
    mutationFn: async (data: { provider: string; filters: SyncFiltersForm }): Promise<SyncResult> => {
      const response = await apiRequest(`/api/inventory/sync/${data.provider}`, 'POST', { filters: data.filters });
      return response as SyncResult;
    },
    onSuccess: (result: SyncResult) => {
      queryClient.invalidateQueries({ queryKey: ['/api/resorts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/history'] });
      
      toast({
        title: "Sync Completed",
        description: `Imported ${result.imported} out of ${result.total} listings`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: error.message || "Failed to sync inventory",
      });
    }
  });

  const handlePreview = (data: SyncFiltersForm) => {
    if (!selectedProvider) {
      toast({
        variant: "destructive",
        title: "No Provider Selected",
        description: "Please select a provider first",
      });
      return;
    }

    previewMutation.mutate({
      provider: selectedProvider,
      filters: data
    });
  };

  const handleSync = (data: SyncFiltersForm) => {
    if (!selectedProvider) {
      toast({
        variant: "destructive",
        title: "No Provider Selected",
        description: "Please select a provider first",
      });
      return;
    }

    syncMutation.mutate({
      provider: selectedProvider,
      filters: data
    });
  };

  const getSyncStatusIcon = (result: SyncResult) => {
    if (result.errors.length > 0) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
    if (result.imported > 0) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Sync external inventory from various providers
        </p>
      </div>

      <Tabs defaultValue="sync" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sync" data-testid="tab-sync">Sync Inventory</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">Sync History</TabsTrigger>
        </TabsList>

        <TabsContent value="sync" className="space-y-6">
          {/* Provider Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Provider</CardTitle>
              <CardDescription>Choose an external inventory provider to sync from</CardDescription>
            </CardHeader>
            <CardContent>
              {providersLoading ? (
                <p>Loading providers...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(providersData as any)?.providers?.map((provider: string) => (
                    <Card 
                      key={provider}
                      className={`cursor-pointer transition-colors ${
                        selectedProvider === provider 
                          ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setSelectedProvider(provider)}
                      data-testid={`provider-${provider.toLowerCase()}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-medium">{provider}</h3>
                            <p className="text-sm text-gray-500">External inventory source</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sync Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Sync Configuration</CardTitle>
              <CardDescription>Configure filters and settings for inventory sync</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...filtersForm}>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={filtersForm.control}
                      name="destination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Destination Filter</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., Hawaii, Florida"
                              data-testid="filter-destination"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={filtersForm.control}
                      name="limit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Limit Results</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="1"
                              max="100"
                              data-testid="filter-limit"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={filtersForm.control}
                      name="priceMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Price ($)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              data-testid="filter-price-min"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={filtersForm.control}
                      name="priceMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Price ($)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              data-testid="filter-price-max"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={filtersForm.handleSubmit(handlePreview)}
                      disabled={!selectedProvider || previewMutation.isPending}
                      data-testid="button-preview"
                    >
                      {previewMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Eye className="h-4 w-4 mr-2" />
                      )}
                      Preview
                    </Button>
                    <Button
                      type="button"
                      onClick={filtersForm.handleSubmit(handleSync)}
                      disabled={!selectedProvider || syncMutation.isPending}
                      data-testid="button-sync"
                    >
                      {syncMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Sync Now
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>View previous inventory synchronization results</CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <p>Loading history...</p>
              ) : (historyData as any)?.history?.length > 0 ? (
                <div className="space-y-4">
                  {((historyData as any).history || []).map((result: SyncResult, index: number) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 space-y-2"
                      data-testid={`history-item-${index}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getSyncStatusIcon(result)}
                          <span className="font-medium">{result.provider}</span>
                          <Badge variant="outline">
                            {formatDistanceToNow(new Date(result.timestamp), { addSuffix: true })}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          {result.imported}/{result.total} imported
                        </div>
                      </div>
                      
                      {result.errors.length > 0 && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Sync Issues</AlertTitle>
                          <AlertDescription>
                            {result.errors.length} error(s) occurred during sync
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No sync history available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Results Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inventory Preview</DialogTitle>
            <DialogDescription>
              Preview of listings from {previewResults?.provider}
            </DialogDescription>
          </DialogHeader>
          
          {previewResults && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{previewResults.total}</div>
                    <div className="text-sm text-gray-500">Total Found</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">{previewResults.imported}</div>
                    <div className="text-sm text-gray-500">Ready to Import</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-red-600">{previewResults.errors.length}</div>
                    <div className="text-sm text-gray-500">Errors</div>
                  </CardContent>
                </Card>
              </div>

              {previewResults.errors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Errors:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {previewResults.errors.map((error, index) => (
                      <Alert key={index} variant="destructive">
                        <AlertDescription>
                          <strong>{error.listingId}:</strong> {error.error}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowPreviewDialog(false);
                    filtersForm.handleSubmit(handleSync)();
                  }}
                  disabled={syncMutation.isPending || previewResults.total === 0}
                  data-testid="button-import-from-preview"
                >
                  Import {previewResults.imported} Listings
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}