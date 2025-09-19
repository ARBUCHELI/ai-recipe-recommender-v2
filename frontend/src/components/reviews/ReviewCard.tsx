import React, { useState } from 'react';
import { Star, ThumbsUp, Flag, CheckCircle, User } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { UserReview } from '@/types/Review';
import { reviewService } from '@/services/reviewService';

interface ReviewCardProps {
  review: UserReview;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  showActions = true,
  compact = false,
  className = ''
}) => {
  const [hasVoted, setHasVoted] = useState(false);
  const [helpfulVotes, setHelpfulVotes] = useState(review.helpfulVotes);
  const [isReporting, setIsReporting] = useState(false);
  const { toast } = useToast();

  const handleHelpfulVote = async () => {
    if (hasVoted) return;

    try {
      const result = await reviewService.voteHelpful(review.id);
      if (result.success) {
        setHasVoted(true);
        setHelpfulVotes(prev => prev + 1);
        toast({
          title: "Thank you!",
          description: "Your feedback helps other users."
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to submit vote",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit vote",
        variant: "destructive"
      });
    }
  };

  const handleReport = async () => {
    if (isReporting) return;

    setIsReporting(true);
    try {
      const result = await reviewService.reportReview(review.id, 'inappropriate');
      if (result.success) {
        toast({
          title: "Report Submitted",
          description: "Thank you for helping us maintain quality reviews."
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to submit report",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive"
      });
    } finally {
      setIsReporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? 'fill-warning text-warning'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card className={`shadow-professional-sm hover:shadow-professional-md transition-all duration-300 ${className}`}>
      <CardHeader className={compact ? 'p-4 pb-2' : 'p-6 pb-4'}>
        <div className="flex items-start gap-4">
          {/* User Avatar */}
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={review.userAvatar} alt={review.userName} />
            <AvatarFallback className="bg-brand-primary text-white">
              {review.userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Review Header */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-primary-dark truncate">
                {review.userName}
              </h4>
              {review.isVerified && (
                <Badge variant="outline" className="text-xs border-success text-success">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex gap-1">
                {renderStars(review.rating)}
              </div>
              <span className="text-sm text-secondary-dark">
                {formatDate(review.date)}
              </span>
            </div>

            {/* Review Title */}
            <h5 className="font-medium text-primary-dark mb-1">
              {review.title}
            </h5>
          </div>
        </div>
      </CardHeader>

      <CardContent className={compact ? 'p-4 pt-0' : 'p-6 pt-0'}>
        {/* Review Comment */}
        <p className={`text-secondary-dark leading-relaxed ${
          compact ? 'text-sm line-clamp-3' : ''
        }`}>
          {review.comment}
        </p>

        {/* Review Actions */}
        {showActions && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHelpfulVote}
                disabled={hasVoted}
                className={`text-xs ${hasVoted ? 'text-success' : 'text-secondary-dark hover:text-success'}`}
              >
                <ThumbsUp className={`w-4 h-4 mr-1 ${hasVoted ? 'fill-success' : ''}`} />
                Helpful ({helpfulVotes})
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleReport}
                disabled={isReporting}
                className="text-xs text-secondary-dark hover:text-error"
              >
                <Flag className="w-4 h-4 mr-1" />
                Report
              </Button>
            </div>

            {/* Platform Badge */}
            {review.version && (
              <div className="text-xs text-muted-dark">
                v{review.version}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};