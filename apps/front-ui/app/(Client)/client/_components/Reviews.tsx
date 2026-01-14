// app/client/_components/Reviews.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_CLIENT_REVIEWS,
  SUBMIT_REVIEW
} from '@/graphql/client-panel.gql';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Star,
  MessageSquare,
  Loader2,
  X,
  Camera,
  MapPin,
  ShoppingCart
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { useMe } from '@/lib/useMe';

interface ReviewsProps {
  client: any;
}

export default function Reviews({ client }: ReviewsProps) {
  const { user } = useMe();
  const { showToast } = useToast();
  const [reviewsData, setReviewsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeBusiness, setActiveBusiness] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    businessId: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    data: queryData,
    loading: queryLoading,
    error: queryError,
    refetch
  } = useQuery(GET_CLIENT_REVIEWS, {
    variables: { clientId: client.id }
  });

  const [submitReview] = useMutation(SUBMIT_REVIEW);

  useEffect(() => {
    if (!queryLoading) {
      setLoading(false);
      if (queryError) {
        setError(queryError.message);
      } else {
        setReviewsData(queryData);
      }
    }
  }, [queryData, queryLoading, queryError]);

  const reviews = reviewsData?.clientReviews?.items || [];
  const totalReviews = reviewsData?.clientReviews?.total || 0;

  const handleRatingClick = (rating: number) => {
    setReviewForm(prev => ({ ...prev, rating }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        showToast('error', 'Invalid File Type', 'Please upload JPG, PNG, or WebP images only');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'File Too Large', 'Please upload images smaller than 5MB');
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleOpenReviewModal = (businessId: string) => {
    setReviewForm({
      rating: 5,
      comment: '',
      businessId
    });
    setImageFile(null);
    setImagePreview(null);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await submitReview({
        variables: {
          input: {
            clientId: client.id,
            businessId: reviewForm.businessId,
            rating: reviewForm.rating,
            comment: reviewForm.comment
            // In a real app, we'd handle image upload here
          }
        }
      });

      showToast('success', 'Success', 'Review submitted successfully!');
      setShowReviewModal(false);
      refetch();
    } catch (error: any) {
      showToast('error', 'Submission Failed', error.message || 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-6">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">Error Loading Reviews</h3>
          <p className="text-muted-foreground mb-6">
            {error}
          </p>

          <Button
            variant="outline"
            onClick={() => refetch()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-muted border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Reviews</h1>
          <p className="text-muted-foreground mt-1">
            Manage your reviews and see business responses
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative w-full sm:w-64">
            <Input
              type="text"
              placeholder="Search reviews..."
            // In a real app, this would filter reviews
            />
            <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <select
            value={activeBusiness || ''}
            onChange={(e) => setActiveBusiness(e.target.value || null)}
            className="w-full sm:w-48 p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Businesses</option>
            {/* In a real app, this would be populated with businesses the client has reviewed */}
            <option value="business1">Bookstore Central</option>
            <option value="business2">Cafe Delight</option>
            <option value="business3">Hardware Plus</option>
          </select>
        </div>
      </div>

      <div className="p-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No reviews yet</h3>
            <p className="text-muted-foreground mb-6">
              You haven't left any reviews yet. Share your experience with businesses you've purchased from!
            </p>

            <Button
              variant="default"
              className="flex items-center gap-2"
              onClick={() => window.location.href = '/marketplace'}
            >
              <ShoppingCart className="h-4 w-4" />
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review: any) => (
              <div key={review.id} className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="w-12 h-12 shrink-0">
                    {review.business.avatar ? (
                      <img
                        src={review.business.avatar}
                        alt={review.business.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-lg font-bold">
                        {review.business.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{review.business.name}</h3>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${star <= review.rating
                                  ? 'text-warning fill-warning'
                                  : 'text-muted-foreground'
                                  }`}
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
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="mt-3 text-muted-foreground">
                      {review.comment}
                    </p>

                    {/* Business Response */}
                    {review.response && (
                      <div className="mt-4 p-3 bg-muted rounded-lg border border-orange-400/60 dark:border-orange-500/70">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{review.business.name} Response</span>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Business
                          </span>
                        </div>
                        <p className="text-sm">{review.response.comment}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(review.response.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Write a Review Button */}
        {reviews.length > 0 && (
          <div className="mt-6 flex justify-center">
            <Button
              variant="default"
              className="flex items-center gap-2"
              onClick={() => {
                // In a real app, this would open a modal with businesses to review
                const businesses = client.orders?.reduce((acc: any[], order: any) => {
                  const business = order.business;
                  if (!acc.some(b => b.id === business.id)) {
                    acc.push(business);
                  }
                  return acc;
                }, []) || [];

                if (businesses.length > 0) {
                  handleOpenReviewModal(businesses[0].id);
                } else {
                  showToast('info', 'No Businesses', 'You need to make a purchase before leaving a review');
                }
              }}
            >
              <Star className="h-4 w-4" />
              Write a Review
            </Button>
          </div>
        )}
      </div>

      {/* Write Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold">Write a Review</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Share your experience with this business
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowReviewModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium mb-2">Your Rating</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingClick(star)}
                        className={`h-6 w-6 rounded-full flex items-center justify-center ${star <= reviewForm.rating
                          ? 'bg-warning text-warning-foreground'
                          : 'bg-border'
                          }`}
                      >
                        <Star className="h-3 w-3 fill-current" />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {reviewForm.rating} out of 5 stars
                  </p>
                </div>

                {/* Comment */}
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium mb-1">
                    Your Review
                  </label>
                  <Textarea
                    id="comment"
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Share your experience with this business..."
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Be specific about what you liked or didn't like
                  </p>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Add Photos (Optional)</label>

                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Review preview"
                          className="w-full h-32 object-cover rounded-lg mx-auto"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 bg-destructive/10 text-destructive p-1 rounded-full hover:bg-destructive/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center text-primary">
                          <Camera className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-medium mt-3">Upload photos</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Show your purchase or experience
                          </p>
                        </div>
                        <div className="mt-3">
                          <label className="inline-flex items-center px-4 py-2 bg-primary hover:bg-accent text-primary-foreground rounded-md cursor-pointer">
                            <span>Select Files</span>
                            <input
                              type="file"
                              className="hidden"
                              accept=".jpg,.jpeg,.png,.webp"
                              onChange={handleFileChange}
                            />
                          </label>
                        </div>
                      </>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG, or WebP (max 5MB)
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowReviewModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-accent text-primary-foreground"
                  >
                    Submit Review
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Business Type Specific Information */}
      {reviews.length > 0 && (
        <div className="mt-6 p-4 bg-muted rounded-lg border border-orange-400/60 dark:border-orange-500/70">
          <div className="flex items-start gap-3">
            <Star className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold">Review Tips by Business Type</h3>

              {activeBusiness === 'business1' && (
                <p className="text-sm text-muted-foreground mt-1">
                  For bookstore reviews, mention specific books you purchased and how helpful
                  the staff was in finding what you needed. Teachers and students should note
                  if educational materials met their requirements.
                </p>
              )}

              {activeBusiness === 'business2' && (
                <p className="text-sm text-muted-foreground mt-1">
                  When reviewing cafes, mention the quality of coffee, service speed, and
                  atmosphere. Note if they accommodated special requests like "no sugar"
                  or specific brewing methods.
                </p>
              )}

              {activeBusiness === 'business3' && (
                <p className="text-sm text-muted-foreground mt-1">
                  For hardware stores, review the knowledge of staff, quality of tools, and
                  availability of specific items. Mention if they helped with project planning
                  or provided expert advice.
                </p>
              )}

              {!activeBusiness && (
                <p className="text-sm text-muted-foreground mt-1">
                  Your reviews help other customers make informed decisions. Be specific about
                  what you liked and any areas for improvement. Businesses value your feedback
                  and often respond to reviews.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}