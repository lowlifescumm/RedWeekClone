import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Building, Calendar, Settings, TrendingUp, AlertTriangle } from "lucide-react";

export default function Admin() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Check if user is admin
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  // Fetch admin data
  const { data: resorts } = useQuery({
    queryKey: ['/api/resorts'],
    enabled: !!user && user.role === 'admin'
  });

  const { data: users } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: !!user && user.role === 'admin'
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">Loading admin panel...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const totalResorts = Array.isArray(resorts) ? resorts.length : 0;
  const totalUsers = Array.isArray(users) ? users.length : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-foreground" data-testid="admin-title">
              Admin Dashboard
            </h1>
            <Badge variant="secondary" className="bg-primary text-primary-foreground">
              Administrator
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Manage your timeshare marketplace platform
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card data-testid="stats-users">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Registered accounts
              </p>
            </CardContent>
          </Card>

          <Card data-testid="stats-resorts">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Resorts</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalResorts}</div>
              <p className="text-xs text-muted-foreground">
                Active listings
              </p>
            </CardContent>
          </Card>

          <Card data-testid="stats-bookings">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Total reservations
              </p>
            </CardContent>
          </Card>

          <Card data-testid="stats-revenue">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* User Management */}
          <Card data-testid="user-management">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Active Users</span>
                  <span className="font-medium">{totalUsers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Admin Users</span>
                  <span className="font-medium">{Array.isArray(users) ? users.filter((u: any) => u.role === 'admin').length : 0}</span>
                </div>
              </div>
              <Button variant="outline" className="w-full" data-testid="manage-users-button">
                View All Users
              </Button>
            </CardContent>
          </Card>

          {/* Resort Management */}
          <Card data-testid="resort-management">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Resort Management
              </CardTitle>
              <CardDescription>
                Add, edit, and manage resort listings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Resorts</span>
                  <span className="font-medium">{totalResorts}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Active Listings</span>
                  <span className="font-medium">{totalResorts}</span>
                </div>
              </div>
              <Button variant="outline" className="w-full" data-testid="manage-resorts-button">
                Manage Resorts
              </Button>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card data-testid="system-settings">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Settings
              </CardTitle>
              <CardDescription>
                Configure platform settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>System Status</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Online
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Database</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Connected
                  </Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full" data-testid="system-settings-button">
                System Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-24 flex flex-col gap-2" data-testid="add-resort-button">
              <Building className="h-6 w-6" />
              Add New Resort
            </Button>
            <Button variant="outline" className="h-24 flex flex-col gap-2" data-testid="view-reports-button">
              <TrendingUp className="h-6 w-6" />
              View Reports
            </Button>
            <Button variant="outline" className="h-24 flex flex-col gap-2" data-testid="manage-bookings-button">
              <Calendar className="h-6 w-6" />
              Manage Bookings
            </Button>
            <Button variant="outline" className="h-24 flex flex-col gap-2" data-testid="system-alerts-button">
              <AlertTriangle className="h-6 w-6" />
              System Alerts
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <Card data-testid="recent-activity">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest actions and events on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              No recent activity to display
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}