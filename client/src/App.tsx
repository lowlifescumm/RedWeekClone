import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import Home from "@/pages/home";
import ResortDetail from "@/pages/resort-detail";
import SearchResults from "@/pages/search-results";
import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";
import AdminUsers from "@/pages/admin-users";
import AdminResorts from "@/pages/admin-resorts";
import AdminInventory from "@/pages/admin-inventory";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/resort/:id" component={ResortDetail} />
      <Route path="/search" component={SearchResults} />
      <Route path="/auth" component={Auth} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/resorts" component={AdminResorts} />
      <Route path="/admin/inventory" component={AdminInventory} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
