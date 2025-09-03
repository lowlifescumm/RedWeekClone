import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import PropertyCard from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Resort } from "@shared/schema";

export default function SearchResults() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const initialQuery = urlParams.get('q') || '';
  
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
