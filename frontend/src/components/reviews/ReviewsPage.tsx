import React, { useState, useEffect } from 'react';
import { Star, Filter, ChevronDown, Plus, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReviewCard } from './ReviewCard';
import { ReviewModal } from './ReviewModal';
import { UserReview, ReviewStats, ReviewFilters } from '@/types/Review';
import { reviewService } from '@/services/reviewService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ReviewsPageProps {
  onBack?: () => void;
  className?: string;
}

export const ReviewsPage: React.FC<ReviewsPageProps> = ({
  onBack,
  className = ''
}) => {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<ReviewFilters>({
    sortBy: 'newest',
    limit: 10
  });

  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadReviews(true);
  }, [filters.rating, filters.sortBy]);

  const loadReviews = async (reset: boolean = false) => {
    const isFirstLoad = reset || currentPage === 0;
    setIsLoading(isFirstLoad);
    setIsLoadingMore(!isFirstLoad);

    try {
      const currentFilters = {
        ...filters,
        offset: reset ? 0 : currentPage * (filters.limit || 10)
      };

      const result = await reviewService.getAllReviews(currentFilters);
      
      if (result.success) {
        const newReviews = result.reviews || [];
        
        if (reset) {
          setReviews(newReviews);
          setCurrentPage(0);
        } else {
          setReviews(prev => [...prev, ...newReviews]);
        }
        
        setStats(result.stats || null);
        setHasMore(newReviews.length === (filters.limit || 10));
        
        if (!reset) {
          setCurrentPage(prev => prev + 1);
        }
      } else {
        console.error('Failed to load reviews:', result.error);
        toast({
          title: "Error",
          description: "Failed to load reviews",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast({
        title: "Error", 
        description: "An error occurred while loading reviews",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadReviews(false);
    }
  };

  const handleFilterChange = (key: keyof ReviewFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(0);
    setHasMore(true);
  };

  const handleReviewSubmitted = (newReview: UserReview) => {
    setReviews(prev => [newReview, ...prev]);
    if (stats) {
      setStats(prev => prev ? {
        ...prev,
        totalReviews: prev.totalReviews + 1,
        averageRating: ((prev.averageRating * prev.totalReviews) + newReview.rating) / (prev.totalReviews + 1),
        ratingDistribution: {
          ...prev.ratingDistribution,
          [newReview.rating as keyof typeof prev.ratingDistribution]: prev.ratingDistribution[newReview.rating as keyof typeof prev.ratingDistribution] + 1
        }
      } : null);
    }
  };

  const renderRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? 'fill-warning text-warning'
            : index < rating
            ? 'fill-warning/50 text-warning'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const renderRatingDistribution = () => {
    if (!stats) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map(rating => {
          const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center gap-3">
              <span className="text-sm w-4">{rating}</span>
              <Star className="w-3 h-3 fill-warning text-warning" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-warning h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-secondary-dark w-8">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Loading skeleton */}
        <Card className="animate-pulse">
          <CardContent className="p-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {onBack && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    className="hover:bg-orange-100"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}
                <CardTitle className="text-2xl font-bold text-primary-dark">
                  User Reviews
                </CardTitle>
              </div>
              <p className="text-secondary-dark">
                Real feedback from our community of recipe enthusiasts
              </p>
            </div>
            
            <Button
              onClick={() => setShowReviewModal(true)}
              className="btn-primary shadow-professional-md hover:shadow-professional-lg"
            >
              <Plus className="w-4 h-4 mr-1" />
              Write Review
            </Button>
          </div>

          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 p-4 bg-white rounded-lg border border-orange-200">
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center mb-2">
                  {renderRatingStars(stats.averageRating)}
                </div>
                <p className="text-3xl font-bold text-warning">
                  {stats.averageRating.toFixed(1)}
                </p>
                <p className="text-sm text-secondary-dark">
                  Based on {stats.totalReviews.toLocaleString()} reviews
                </p>
              </div>
              
              <div className="md:col-span-2">
                <h4 className="font-semibold text-primary-dark mb-3">Rating Distribution</h4>
                {renderRatingDistribution()}
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-secondary-dark" />
              <span className="text-sm font-medium text-secondary-dark">Filter by:</span>
            </div>

            <Select
              value={filters.rating?.toString() || 'all'}
              onValueChange={(value) => handleFilterChange('rating', value === 'all' ? undefined : parseInt(value))}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleFilterChange('sortBy', value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Rating</SelectItem>
                <SelectItem value="lowest">Lowest Rating</SelectItem>
                <SelectItem value="most_helpful">Most Helpful</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Grid */}
      {reviews.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                showActions={true}
                compact={false}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center">
              <Button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                variant="outline"
                className="px-8 py-3 shadow-professional-sm hover:shadow-professional-md"
              >
                {isLoadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Load More Reviews
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <Card>
          <CardContent className="p-12 text-center">
            <Star className="w-12 h-12 text-muted-dark mx-auto mb-4" />
            <h3 className="text-lg font-medium text-primary-dark mb-2">
              No Reviews Found
            </h3>
            <p className="text-secondary-dark mb-6">
              {filters.rating ? 
                `No reviews found with ${filters.rating} star${filters.rating > 1 ? 's' : ''}.` :
                'Be the first to share your experience with our community!'
              }
            </p>
            <Button
              onClick={() => setShowReviewModal(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-1" />
              Write the First Review
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
};