import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import type { Resort } from "@shared/schema";

interface PropertyCardProps {
  property: Resort;
  showNewBadge?: boolean;
}

export default function PropertyCard({ property, showNewBadge = false }: PropertyCardProps) {
  const renderStars = (rating: string) => {
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < fullStars) {
            return (
              <Star
                key={i}
                className="h-4 w-4 fill-yellow-400 text-yellow-400"
              />
            );
          } else if (i === fullStars && hasHalfStar) {
            return (
              <div key={i} className="relative h-4 w-4">
                <Star className="absolute h-4 w-4 text-gray-300" />
                <Star 
                  className="absolute h-4 w-4 fill-yellow-400 text-yellow-400"
                  style={{ clipPath: 'inset(0 50% 0 0)' }}
                />
              </div>
            );
          } else {
            return (
              <Star
                key={i}
                className="h-4 w-4 text-gray-300"
              />
            );
          }
        })}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`property-card-${property.id}`}>
      <Link href={`/resort/${property.id}`}>
        <a>
          <div className="relative">
            <img 
              src={property.imageUrl} 
              alt={property.name}
              className="w-full h-48 object-cover"
              data-testid={`property-image-${property.id}`}
            />
            {(showNewBadge && property.isNewAvailability) && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-primary text-primary-foreground" data-testid="new-availability-badge">
                  New Availability!
                </Badge>
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-1" data-testid={`property-name-${property.id}`}>
              {property.name}
            </h3>
            <p className="text-muted-foreground mb-3" data-testid={`property-location-${property.id}`}>
              {property.location}
            </p>
            
            <div className="flex items-center gap-2 mb-2">
              {renderStars(property.rating)}
              <span className="text-sm text-muted-foreground" data-testid={`property-reviews-${property.id}`}>
                {property.reviewCount} reviews
              </span>
            </div>
            
            <div className="text-sm text-muted-foreground mb-2" data-testid={`property-rentals-${property.id}`}>
              {property.availableRentals} timeshare rentals available
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-muted-foreground">Starting at</span>
                <div className="text-xl font-bold text-primary" data-testid={`property-price-${property.id}`}>
                  ${property.priceMin} - ${property.priceMax} /night
                </div>
              </div>
              <span className="text-primary hover:underline" data-testid={`property-view-details-${property.id}`}>
                View Details →
              </span>
            </div>
          </CardContent>
        </a>
      </Link>
    </Card>
  );
}
