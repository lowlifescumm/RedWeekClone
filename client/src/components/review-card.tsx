import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface ReviewCardProps {
  rating: number;
  content: string;
  author: string;
  memberSince?: string;
  timeAgo?: string;
}

export default function ReviewCard({ rating, content, author, memberSince, timeAgo }: ReviewCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="h-full" data-testid={`review-card-${author.replace(/\s+/g, '-').toLowerCase()}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground" data-testid="review-rating">
            {rating} stars
          </span>
        </div>
        
        <blockquote className="text-foreground mb-4" data-testid="review-content">
          "{content}"
        </blockquote>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
            {getInitials(author)}
          </div>
          <div>
            <div className="font-medium" data-testid="review-author">
              {author}
            </div>
            <div className="text-sm text-muted-foreground" data-testid="review-date">
              {memberSince ? `Members since ${memberSince}` : timeAgo}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
