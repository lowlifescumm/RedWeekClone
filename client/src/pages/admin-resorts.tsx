import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Building, ChevronLeft, Edit2, Trash2, Plus, Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertResortSchema, type InsertResort, type Resort } from "@shared/schema";
import { z } from "zod";

const editResortSchema = insertResortSchema;
type EditResortData = z.infer<typeof editResortSchema>;

export default function AdminResorts() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [editingResort, setEditingResort] = useState<Resort | null>(null);
  const [deletingResort, setDeletingResort] = useState<Resort | null>(null);
  const [isAddingResort, setIsAddingResort] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  // Fetch resorts
  const { data: resorts, isLoading: resortsLoading } = useQuery({
    queryKey: ['/api/resorts'],
    enabled: !!user && user.role === 'admin'
  });

  // Edit resort form
  const editForm = useForm<EditResortData>({
    resolver: zodResolver(editResortSchema),
    defaultValues: {
      name: '',
      location: '',
      destination: '',
      description: '',
      imageUrl: '',
      amenities: [],
      priceMin: 0,
      priceMax: 0,
      rating: '0',
      availableRentals: 0,
      isNewAvailability: false
    }
  });

  // Add resort form  
  const addForm = useForm<InsertResort>({
    resolver: zodResolver(insertResortSchema),
    defaultValues: {
      name: '',
      location: '',
      destination: '',
      description: '',
      imageUrl: '',
      amenities: [],
      priceMin: 0,
      priceMax: 0,
      rating: '0',
      availableRentals: 0,
      isNewAvailability: false
    }
  });

  // Update resort mutation
  const updateResortMutation = useMutation({
    mutationFn: async (data: { id: string; resortData: EditResortData }) => {
      return apiRequest('PATCH', `/api/admin/resorts/${data.id}`, data.resortData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resorts'] });
      setEditingResort(null);
      editForm.reset();
      toast({
        title: "Resort updated",
        description: "Resort information has been updated successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update resort. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete resort mutation
  const deleteResortMutation = useMutation({
    mutationFn: async (resortId: string) => {
      return apiRequest('DELETE', `/api/admin/resorts/${resortId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resorts'] });
      setDeletingResort(null);
      toast({
        title: "Resort deleted",
        description: "Resort has been deleted successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete resort. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Add resort mutation
  const addResortMutation = useMutation({
    mutationFn: async (resortData: InsertResort) => {
      return apiRequest('POST', '/api/admin/resorts', resortData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resorts'] });
      setIsAddingResort(false);
      addForm.reset();
      toast({
        title: "Resort added",
        description: "New resort has been created successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create resort. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleEditResort = (resortData: Resort) => {
    setEditingResort(resortData);
    editForm.reset({
      name: resortData.name,
      location: resortData.location,
      destination: resortData.destination,
      description: resortData.description,
      imageUrl: resortData.imageUrl,
      amenities: resortData.amenities,
      priceMin: resortData.priceMin,
      priceMax: resortData.priceMax,
      rating: resortData.rating,
      availableRentals: resortData.availableRentals,
      isNewAvailability: resortData.isNewAvailability
    });
  };

  const handleDeleteResort = (resortData: Resort) => {
    setDeletingResort(resortData);
  };

  const onEditSubmit = (data: EditResortData) => {
    if (editingResort) {
      updateResortMutation.mutate({ id: editingResort.id, resortData: data });
    }
  };

  const onAddSubmit = (data: InsertResort) => {
    addResortMutation.mutate(data);
  };

  const confirmDelete = () => {
    if (deletingResort) {
      deleteResortMutation.mutate(deletingResort.id);
    }
  };

  if (isLoading || resortsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">Loading resort management...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const safeResorts = Array.isArray(resorts) ? resorts : [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setLocation("/admin")}
              data-testid="back-to-admin"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-foreground" data-testid="resorts-title">
                Resort Management
              </h1>
              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                {safeResorts.length} Resorts
              </Badge>
            </div>
          </div>
          <p className="text-muted-foreground">
            Manage resort listings, amenities, and pricing
          </p>
        </div>

        {/* Actions */}
        <div className="mb-6">
          <Button onClick={() => setIsAddingResort(true)} data-testid="add-resort-button">
            <Plus className="h-4 w-4 mr-2" />
            Add New Resort
          </Button>
        </div>

        {/* Resorts Table */}
        <Card data-testid="resorts-table">
          <CardHeader>
            <CardTitle>All Resorts</CardTitle>
            <CardDescription>
              View and manage all resort listings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resort</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Price/Night</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeResorts.map((resort) => (
                  <TableRow key={resort.id} data-testid={`resort-row-${resort.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{resort.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {resort.amenities.slice(0, 2).join(', ')}
                            {resort.amenities.length > 2 && '...'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{resort.destination}</TableCell>
                    <TableCell>{formatPrice(resort.priceMin)} - {formatPrice(resort.priceMax)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{parseFloat(resort.rating).toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">
                          ({resort.reviewCount})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {resort.isNewAvailability && (
                          <Badge variant="outline" className="text-xs">New</Badge>
                        )}
                        {resort.availableRentals > 0 && (
                          <Badge variant="outline" className="text-xs">{resort.availableRentals} Available</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditResort(resort)}
                          data-testid={`edit-resort-${resort.id}`}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteResort(resort)}
                          data-testid={`delete-resort-${resort.id}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Resort Dialog */}
        <Dialog open={!!editingResort} onOpenChange={() => setEditingResort(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="edit-resort-dialog">
            <DialogHeader>
              <DialogTitle>Edit Resort</DialogTitle>
              <DialogDescription>
                Update resort information and amenities
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resort Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="edit-resort-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="edit-resort-location" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={editForm.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="edit-resort-destination" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} data-testid="edit-resort-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="edit-resort-image" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-4 gap-4">
                  <FormField
                    control={editForm.control}
                    name="priceMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Price</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            data-testid="edit-resort-price-min" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="priceMax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Price</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            data-testid="edit-resort-price-max" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.1"
                            min="0"
                            max="5"
                            onChange={(e) => field.onChange(e.target.value)}
                            data-testid="edit-resort-rating" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="availableRentals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available Rentals</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            data-testid="edit-resort-available" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={editForm.control}
                  name="amenities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amenities (comma separated)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                          onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                          data-testid="edit-resort-amenities" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setEditingResort(null)}
                    data-testid="cancel-edit"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateResortMutation.isPending}
                    data-testid="save-resort"
                  >
                    {updateResortMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Add Resort Dialog */}
        <Dialog open={isAddingResort} onOpenChange={setIsAddingResort}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="add-resort-dialog">
            <DialogHeader>
              <DialogTitle>Add New Resort</DialogTitle>
              <DialogDescription>
                Create a new resort listing
              </DialogDescription>
            </DialogHeader>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resort Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="add-resort-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="add-resort-location" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={addForm.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="add-resort-destination" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} data-testid="add-resort-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="add-resort-image" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-4 gap-4">
                  <FormField
                    control={addForm.control}
                    name="priceMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Price</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            data-testid="add-resort-price-min" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="priceMax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Price</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            data-testid="add-resort-price-max" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.1"
                            min="0"
                            max="5"
                            onChange={(e) => field.onChange(e.target.value)}
                            data-testid="add-resort-rating" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="availableRentals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available Rentals</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            data-testid="add-resort-available" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={addForm.control}
                  name="amenities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amenities (comma separated)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                          onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                          data-testid="add-resort-amenities" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddingResort(false)}
                    data-testid="cancel-add"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addResortMutation.isPending}
                    data-testid="create-resort"
                  >
                    {addResortMutation.isPending ? "Creating..." : "Create Resort"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deletingResort} onOpenChange={() => setDeletingResort(null)}>
          <DialogContent data-testid="delete-resort-dialog">
            <DialogHeader>
              <DialogTitle>Delete Resort</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {deletingResort?.name}? 
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setDeletingResort(null)}
                data-testid="cancel-delete"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete}
                disabled={deleteResortMutation.isPending}
                data-testid="confirm-delete"
              >
                {deleteResortMutation.isPending ? "Deleting..." : "Delete Resort"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </div>
  );
}