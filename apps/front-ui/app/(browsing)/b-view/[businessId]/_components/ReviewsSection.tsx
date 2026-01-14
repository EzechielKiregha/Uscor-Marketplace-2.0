// app/business/[id]/_components/ReviewsSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  Star,
  Search,
  Filter,
  MessageSquare,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReviewsSectionProps {
  reviews: any[];
  loading: boolean;
  business: any;
}

export default function ReviewsSection({
  reviews,
  loading,
  business
}: ReviewsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.client.fullName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating = selectedRating ? review.rating === selectedRating : true;

    return matchesSearch && matchesRating;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortOrder) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  // Count ratings by star
  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(review => review.rating === star).length,
    percentage: reviews.length > 0 ? (reviews.filter(review => review.rating === star).length / reviews.length) * 100 : 0
  }));

  if (loading) {
    return (
      <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No reviews yet</h3>
          <p className="text-muted-foreground mb-6">
            Be the first to review {business.name}!
          </p>

          <Button
            variant="default"
            className="flex items-center gap-2"
          >
            <Star className="h-4 w-4" />
            Write a Review
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-muted border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= Math.round(averageRating) ? 'text-warning fill-warning' : 'text-muted-foreground'}`}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{reviews.length} reviews</p>
              <div className="flex items-center mt-1">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center mr-2">
                    <span className="text-xs">{star}</span>
                    <Star className="h-3 w-3 text-warning ml-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              >
                {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
              </Button>
            </div>

            <Button
              variant="default"
              className="flex items-center gap-2"
            >
              <Star className="h-4 w-4" />
              Write a Review
            </Button>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="p-4 bg-background border-b border-border">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center">
              <div className="w-8 text-right mr-2">{star}</div>
              <Star className="h-4 w-4 text-warning mr-1" />
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-warning"
                  style={{ width: `${ratingCounts.find(r => r.star === star)?.percentage}%` }}
                ></div>
              </div>
              <div className="w-8 ml-2 text-left">
                {ratingCounts.find(r => r.star === star)?.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="divide-y divide-border">
        {sortedReviews.map(review => (
          <div key={review.id} className="p-4 hover:bg-muted/50">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="w-12 h-12 flex-shrink-0">
                {review.client.avatar ? (
                  <img
                    src={review.client.avatar}
                    alt={review.client.fullName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-lg font-bold">
                    {review.client.fullName.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{review.client.fullName}</h3>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${star <= review.rating ? 'text-warning fill-warning' : 'text-muted-foreground'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-success">
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
                  </div>
                </div>

                <p className="mt-3 text-muted-foreground">
                  {review.comment}
                </p>

                {review.response && (
                  <div className="mt-4 p-3 bg-muted rounded-lg border border-orange-400/60 dark:border-orange-500/70">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{business.name} Response</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Business
                      </span>
                    </div>
                    <p className="text-sm">{review.response}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Business Type Specific Information */}
      <div className="p-4 bg-muted border-t border-border">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Star className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold">Customer Feedback</h4>
            {business.businessType === 'HARDWARE' && (
              <p className="text-sm text-muted-foreground mt-1">
                Customers consistently praise {business.name} for their knowledgeable staff and
                quality hardware products. Many reviews highlight the helpful advice provided by
                their technicians when selecting tools and equipment for specific projects.
              </p>
            )}
            {business.businessType === 'TRANSPORTATION' && (
              <p className="text-sm text-muted-foreground mt-1">
                {business.name} receives excellent feedback for their timely deliveries and
                professional drivers. Customers appreciate the real-time tracking and
                communication about delivery status throughout the process.
              </p>
            )}
            {business.businessType === 'ARTISAN' && (
              <p className="text-sm text-muted-foreground mt-1">
                Customers love the unique, handcrafted products from {business.name}. Reviews
                frequently mention the attention to detail, quality craftsmanship, and the
                personal touch that comes with each custom order.
              </p>
            )}
            {(business.businessType !== 'HARDWARE' &&
              business.businessType !== 'TRANSPORTATION' &&
              business.businessType !== 'ARTISAN') && (
                <p className="text-sm text-muted-foreground mt-1">
                  {business.name} maintains a strong reputation for excellent customer service
                  and quality products/services. Their commitment to customer satisfaction is
                  reflected in their positive reviews across the marketplace.
                </p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}