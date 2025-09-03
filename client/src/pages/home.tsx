import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import PropertyCard from "@/components/property-card";
import DestinationCard from "@/components/destination-card";
import ReviewCard from "@/components/review-card";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Resort } from "@shared/schema";

export default function Home() {
  const { data: newAvailability, isLoading: isLoadingNew } = useQuery<Resort[]>({
    queryKey: ["/api/resorts/new-availability"],
  });

  const { data: topResorts, isLoading: isLoadingTop } = useQuery<Resort[]>({
    queryKey: ["/api/resorts/top"],
  });

  const destinations = [
    { name: "Florida", imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&w=800&h=800", searchQuery: "Florida" },
    { name: "California", imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&w=800&h=800", searchQuery: "California" },
    { name: "South Carolina", imageUrl: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&w=800&h=800", searchQuery: "South Carolina" },
    { name: "Hawaii", imageUrl: "https://images.unsplash.com/photo-1542259009477-d625272157b7?ixlib=rb-4.0.3&w=800&h=800", searchQuery: "Hawaii" },
    { name: "Mexico", imageUrl: "https://images.unsplash.com/photo-1512813195386-6cf811ad3542?ixlib=rb-4.0.3&w=800&h=800", searchQuery: "Mexico" },
    { name: "Aruba", imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&w=800&h=800", searchQuery: "Aruba" },
  ];

  const sampleReviews = [
    {
      rating: 5,
      content: "LOVE RedWeek. We have rented units and also placed our units on RedWeek for rent. Each time every sale went through smoothly. RedWeek has helped improve our vacation experiences tremendously.",
      author: "Esther W. & family",
      memberSince: "2012"
    },
    {
      rating: 5,
      content: "Efficient and effective customer service. Highly recommend. RedWeek handled every aspect of the rental, they made me very comfortable.",
      author: "JNP",
      timeAgo: "3 days ago"
    },
    {
      rating: 5,
      content: "Very easy to set up! Everyone was very helpful and answered my questions in a timely manner. Great communication from Redweek!",
      author: "Paul Partington",
      timeAgo: "3 days ago"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      
      {/* Trust Indicators */}
      <section className="bg-muted py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                </div>
                <span className="font-semibold" data-testid="trust-rating-text">Excellent</span>
              </div>
              <p className="text-muted-foreground" data-testid="trust-review-count">
                4.6 out of 5 based on <strong>6,808 reviews</strong>
              </p>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary" data-testid="trust-subscribers">2.1M+</div>
                <div className="text-sm text-muted-foreground">Subscribers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary" data-testid="trust-bbb-rating">A+</div>
                <div className="text-sm text-muted-foreground">BBB Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary" data-testid="trust-years">25+</div>
                <div className="text-sm text-muted-foreground">Years</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Availability */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4" data-testid="new-availability-title">New Availability!</h2>
            <p className="text-muted-foreground text-lg">Fresh listings from top resorts</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingNew ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : (
              newAvailability?.map((property) => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  showNewBadge={true}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Top Resorts */}
      <section className="py-12 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4" data-testid="top-resorts-title">Top Resorts</h2>
            <p className="text-muted-foreground text-lg">Most popular destinations from our community</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoadingTop ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-40 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : (
              topResorts?.slice(0, 8).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            )}
          </div>
          
          <div className="text-center mt-8">
            <Link href="/search" data-testid="view-all-resorts-button">
              <Button className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors font-medium">
                View All Resorts
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4" data-testid="destinations-title">Our Community's Favorite Destinations</h2>
            <p className="text-muted-foreground text-lg">Explore the most sought-after vacation spots</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {destinations.map((destination) => (
              <DestinationCard
                key={destination.name}
                name={destination.name}
                imageUrl={destination.imageUrl}
                searchQuery={destination.searchQuery}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-12 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4" data-testid="reviews-title">What Our Community Says</h2>
            <p className="text-muted-foreground text-lg">Real reviews from real travelers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleReviews.map((review, index) => (
              <ReviewCard
                key={index}
                rating={review.rating}
                content={review.content}
                author={review.author}
                memberSince={review.memberSince}
                timeAgo={review.timeAgo}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-4" data-testid="cta-title">
            Join the most trusted Timeshare community
          </h2>
          <p className="text-xl mb-8 text-red-100" data-testid="cta-subtitle">
            Over 2.1 million subscribers trust RedWeek for their vacation rental needs
          </p>
          <Link href="/auth?mode=register" data-testid="cta-register-button">
            <Button className="bg-white text-primary px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg">
              Register for free!
            </Button>
          </Link>
          <p className="text-sm mt-4 text-red-100" data-testid="cta-disclaimer">
            No credit card required • Instant access • Cancel anytime
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
