import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Users, Wifi, Car, Utensils } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Resort, Review } from "@shared/schema";

export default function ResortDetail() {
  const { id } = useParams<{ id: string }>();
  
  const { data: resort, isLoading: isLoadingResort } = useQuery<Resort>({
    queryKey: ["/api/resorts", id],
  });

  const { data: reviews, isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: ["/api/resorts", id, "reviews"],
  });

  const renderStars = (rating: string) => {
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${
              i < fullStars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const amenityIcons = {
    "Beach Access": MapPin,
    "Pool": Users,
    "Wifi": Wifi,
    "Parking": Car,
    "Restaurant": Utensils,
    "Spa": Star,
    "Golf": MapPin,
    "Fitness Center": Users,
    "Kids Club": Users,
    "Tennis": Users,
  };

  if (isLoadingResort) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-64 w-full rounded-lg mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!resort) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Resort not found</h1>
            <p className="text-gray-600 mt-2">The resort you're looking for doesn't exist.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Image */}
        <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-8">
          <img 
            src={resort.imageUrl} 
            alt={resort.name}
            className="w-full h-full object-cover"
            data-testid="resort-hero-image"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30" />
          <div className="absolute bottom-6 left-6 text-white">
            <h1 className="text-4xl font-bold mb-2" data-testid="resort-name">
              {resort.name}
            </h1>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span className="text-xl" data-testid="resort-location">{resort.location}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rating and Reviews */}
            <div className="flex items-center gap-4">
              {renderStars(resort.rating)}
              <span className="text-lg font-semibold" data-testid="resort-rating">
                {resort.rating}
              </span>
              <span className="text-muted-foreground" data-testid="resort-review-count">
                ({resort.reviewCount} reviews)
              </span>
            </div>

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">About this resort</h2>
                <p className="text-muted-foreground" data-testid="resort-description">
                  {resort.description}
                </p>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {resort.amenities.map((amenity, index) => {
                    const IconComponent = amenityIcons[amenity as keyof typeof amenityIcons] || Star;
                    return (
                      <div 
                        key={index} 
                        className="flex items-center gap-2"
                        data-testid={`amenity-${index}`}
                      >
                        <IconComponent className="h-4 w-4 text-primary" />
                        <span className="text-sm">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Reviews</h2>
                {isLoadingReviews ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ))}
                  </div>
                ) : reviews && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review, index) => (
                      <div key={review.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-medium" data-testid={`review-title-${index}`}>
                            {review.title}
                          </span>
                        </div>
                        <p className="text-muted-foreground" data-testid={`review-content-${index}`}>
                          {review.content}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No reviews yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-primary" data-testid="resort-price-range">
                    ${resort.priceMin} - ${resort.priceMax}
                  </div>
                  <div className="text-muted-foreground">per night</div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Available rentals:</span>
                    <span className="font-semibold" data-testid="available-rentals">
                      {resort.availableRentals}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Destination:</span>
                    <span className="font-semibold" data-testid="resort-destination">
                      {resort.destination}
                    </span>
                  </div>
                </div>

                {resort.isNewAvailability && (
                  <Badge className="w-full justify-center mb-4 bg-primary text-primary-foreground">
                    New Availability!
                  </Badge>
                )}

                <Button 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  data-testid="book-now-button"
                >
                  Book Now
                </Button>
                
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Free cancellation • Secure booking
                </p>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Need Help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our travel experts are here to help you find the perfect vacation rental.
                </p>
                <Link href="/contact">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    data-testid="contact-button"
                  >
                    Contact Support
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
