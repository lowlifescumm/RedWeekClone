import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Calendar, Heart, Settings, Home } from "lucide-react";
import { PropertySubmissionForm } from "@/components/property-submission-form";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);

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
              <Button variant="outline" className="mt-4 w-full" data-testid="edit-profile-button">
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
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