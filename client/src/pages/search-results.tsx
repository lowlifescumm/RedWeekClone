import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "@/components/header";
import Footer from "@/components/footer";
import PropertyCard from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Search, Filter, Home, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Resort } from "@shared/schema";

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

export default function SearchResults() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const initialQuery = urlParams.get('q') || '';
  const searchType = urlParams.get('type') || '';
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState("price-low");
  const [priceRange, setPriceRange] = useState("all");
  
  const { data: allResorts, isLoading } = useQuery<Resort[]>({
    queryKey: ["/api/resorts"],
  });

  const { data: searchResults, isLoading: isSearching } = useQuery<Resort[]>({
    queryKey: ["/api/resorts/search", { q: initialQuery }],
    enabled: !!initialQuery,
  });

  // Use search results if we have a query, otherwise show all resorts
  const resorts = initialQuery ? searchResults : allResorts;

  // Filter and sort resorts
  const filteredAndSortedResorts = resorts
    ?.filter(resort => {
      if (priceRange === "all") return true;
      if (priceRange === "budget") return resort.priceMin < 100;
      if (priceRange === "mid") return resort.priceMin >= 100 && resort.priceMin < 300;
      if (priceRange === "luxury") return resort.priceMin >= 300;
      return true;
    })
    ?.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.priceMin - b.priceMin;
        case "price-high":
          return b.priceMin - a.priceMin;
        case "rating":
          return parseFloat(b.rating) - parseFloat(a.rating);
        case "reviews":
          return b.reviewCount - a.reviewCount;
        default:
          return 0;
      }
    }) || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.history.pushState({}, '', `/search?q=${encodeURIComponent(searchQuery.trim())}`);
      window.location.reload();
    }
  };

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

  // If type=sell, show the property submission form
  if (searchType === 'sell') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Home className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold" data-testid="sell-title">
                Sell Your Timeshare
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Submit your property information and our team will contact you within 24 hours to discuss selling your timeshare.
            </p>
          </div>

          {!user ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <DollarSign className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Login Required</h2>
                  <p className="text-muted-foreground">
                    Please log in to submit your property for sale.
                  </p>
                </div>
                <Button asChild>
                  <a href="/auth" data-testid="login-button">
                    Log In to Continue
                  </a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8">
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

                    <div className="flex justify-end">
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
              </CardContent>
            </Card>
          )}
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4" data-testid="search-title">
            {initialQuery ? `Search Results for "${initialQuery}"` : "All Resorts"}
          </h1>
          
          {/* Search Form */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <form onSubmit={handleSearch} className="flex gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search by location, resort name, or brand"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="search-input-page"
                  />
                </div>
                <Button type="submit" data-testid="search-button-page">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filters:</span>
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48" data-testid="sort-select">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-48" data-testid="price-filter-select">
                <SelectValue placeholder="Price range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="budget">Under $100</SelectItem>
                <SelectItem value="mid">$100 - $300</SelectItem>
                <SelectItem value="luxury">$300+</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="text-sm text-muted-foreground" data-testid="results-count">
              {filteredAndSortedResorts.length} results found
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading || isSearching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : filteredAndSortedResorts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedResorts.map((resort) => (
              <PropertyCard key={resort.id} property={resort} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4" data-testid="no-results-title">
              No resorts found
            </h2>
            <p className="text-gray-600 mb-6" data-testid="no-results-message">
              {initialQuery 
                ? `We couldn't find any resorts matching "${initialQuery}". Try adjusting your search terms.`
                : "No resorts are available at the moment."
              }
            </p>
            <Button 
              onClick={() => {
                setSearchQuery("");
                setPriceRange("all");
                window.history.pushState({}, '', '/search');
                window.location.reload();
              }}
              data-testid="clear-search-button"
            >
              Clear Search
            </Button>
          </div>
        )}

        {/* Load More */}
        {filteredAndSortedResorts.length > 12 && (
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              className="px-8 py-3"
              data-testid="load-more-button"
            >
              Load More Results
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
