import React, { useState, useEffect } from 'react';
import { Star, ChevronRight, MessageSquare, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReviewCard } from './ReviewCard';
import { UserReview, ReviewStats } from '@/types/Review';
import { reviewService } from '@/services/reviewService';
import { useTranslation } from '@/contexts/TranslationContext';

interface FeaturedReviewsProps {
  onViewAllReviews?: () => void;
  className?: string;
}

export const FeaturedReviews: React.FC<FeaturedReviewsProps> = ({
  onViewAllReviews,
  className = ''
}) => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeaturedReviews();
  }, []);

  const loadFeaturedReviews = async () => {
    setIsLoading(true);
    try {
      const result = await reviewService.getFeaturedReviews(3);
      if (result.success) {
        setReviews(result.reviews || []);
        setStats(result.stats || null);
      } else {
        console.error('Failed to load featured reviews:', result.error);
      }
    } catch (error) {
      console.error('Error loading featured reviews:', error);
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="animate-pulse">
          <CardContent className="p-8">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Stats */}
      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary-dark mb-2">
            {t('homepage.testimonials.title')}
          </CardTitle>
          <p className="text-secondary-dark mb-4">
            {t('homepage.testimonials.subtitle')}
          </p>
          
          {stats && (
            <div className="flex items-center justify-center gap-8 mt-4">
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center mb-1">
                  {renderRatingStars(stats.averageRating)}
                </div>
                <p className="text-2xl font-bold text-warning">
                  {stats.averageRating.toFixed(1)}
                </p>
                <p className="text-xs text-secondary-dark">{t('reviews.averageRating')}</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center mb-1">
                  <Users className="w-4 h-4 text-success" />
                </div>
                <p className="text-2xl font-bold text-success">
                  {stats.totalReviews.toLocaleString()}
                </p>
                <p className="text-xs text-secondary-dark">{t('reviews.happyUsers')}</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center mb-1">
                  <MessageSquare className="w-4 h-4 text-info" />
                </div>
                <p className="text-2xl font-bold text-info">
                  {Math.round((stats.ratingDistribution[4] + stats.ratingDistribution[5]) / stats.totalReviews * 100)}%
                </p>
                <p className="text-xs text-secondary-dark">{t('reviews.recommend')}</p>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Featured Reviews */}
      {reviews.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                compact={true}
                showActions={false}
              />
            ))}
          </div>

          {/* View All Reviews Button */}
          <div className="text-center">
            <Button
              onClick={onViewAllReviews}
              variant="outline"
              className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white font-medium px-8 py-3 shadow-professional-sm hover:shadow-professional-md transition-all duration-300"
            >
              {t('reviews.viewAllReviews')}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </>
      )}

      {/* Empty State */}
      {reviews.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-muted-dark mx-auto mb-4" />
            <h3 className="text-lg font-medium text-primary-dark mb-2">
              {t('reviews.noReviewsYet')}
            </h3>
            <p className="text-secondary-dark">
              {t('reviews.beFirstToReview')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};