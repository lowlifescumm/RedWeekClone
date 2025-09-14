import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { User, Calendar, Heart, Settings, Home } from "lucide-react";
import { PropertySubmissionForm } from "@/components/property-submission-form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      username: user?.username || "",
      email: user?.email || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return apiRequest('PATCH', `/api/users/${user?.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated Successfully!",
        description: "Your profile information has been updated.",
      });
      setIsProfileModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const onSubmitProfile = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/auth");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground" data-testid="dashboard-title">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your timeshare bookings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Profile Card */}
          <Card data-testid="profile-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>
                Your account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
              </div>
              <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="mt-4 w-full" data-testid="edit-profile-button">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Edit Profile
                    </DialogTitle>
                    <DialogDescription>
                      Update your personal information below.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitProfile)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-first-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-last-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-username" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsProfileModalOpen(false)}
                          className="flex-1"
                          data-testid="button-cancel"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                          className="flex-1"
                          data-testid="button-save-profile"
                        >
                          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Bookings Card */}
          <Card data-testid="bookings-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                My Bookings
              </CardTitle>
              <CardDescription>
                Your upcoming reservations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No bookings yet
              </div>
              <Button className="w-full" data-testid="browse-resorts-button">
                Browse Resorts
              </Button>
            </CardContent>
          </Card>

          {/* Favorites Card */}
          <Card data-testid="favorites-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Favorites
              </CardTitle>
              <CardDescription>
                Your saved resorts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No favorites yet
              </div>
              <Button variant="outline" className="w-full" data-testid="explore-resorts-button">
                Explore Resorts
              </Button>
            </CardContent>
          </Card>

          {/* My Property Card */}
          <Card data-testid="property-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                My Property
              </CardTitle>
              <CardDescription>
                Sell or rent your timeshare
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 text-muted-foreground">
                <p className="mb-4">Ready to sell or rent your timeshare?</p>
                <p className="text-sm mb-6">Submit your property details and our team will contact you within 24 hours.</p>
              </div>
              <Dialog open={isPropertyModalOpen} onOpenChange={setIsPropertyModalOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" data-testid="sell-rent-property-button">
                    <Home className="h-4 w-4 mr-2" />
                    Sell or Rent My Property
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      Submit Your Property
                    </DialogTitle>
                    <DialogDescription>
                      Fill out the form below and our team will contact you within 24 hours to discuss selling or renting your timeshare.
                    </DialogDescription>
                  </DialogHeader>
                  <PropertySubmissionForm 
                    onSuccess={() => setIsPropertyModalOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-24 flex flex-col gap-2" data-testid="search-rentals-button">
              <Calendar className="h-6 w-6" />
              Search Rentals
            </Button>
            <Button variant="outline" className="h-24 flex flex-col gap-2" data-testid="browse-resorts-quick-button">
              <User className="h-6 w-6" />
              Browse Resorts
            </Button>
            <Button variant="outline" className="h-24 flex flex-col gap-2" data-testid="saved-searches-button">
              <Heart className="h-6 w-6" />
              Saved Searches
            </Button>
            <Button variant="outline" className="h-24 flex flex-col gap-2" data-testid="account-settings-button">
              <Settings className="h-6 w-6" />
              Account Settings
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}