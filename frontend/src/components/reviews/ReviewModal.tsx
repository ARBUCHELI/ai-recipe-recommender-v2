import React, { useState } from 'react';
import { Star, Send, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ReviewFormData } from '@/types/Review';
import { reviewService } from '@/services/reviewService';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted?: (review: any) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onReviewSubmitted
}) => {
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 0,
    title: '',
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const handleStarClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleStarHover = (rating: number) => {
    setHoveredStar(rating);
  };

  const handleStarLeave = () => {
    setHoveredStar(0);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit a review.",
        variant: "destructive"
      });
      return;
    }

    if (formData.rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.title.trim() || !formData.comment.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a title and comment.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await reviewService.submitReview(
        formData,
        user.id,
        user.name || 'Anonymous User'
      );

      if (result.success) {
        toast({
          title: "Review Submitted! 🎉",
          description: result.message || "Thank you for your feedback!"
        });

        // Reset form
        setFormData({
          rating: 0,
          title: '',
          comment: ''
        });

        // Notify parent component
        if (onReviewSubmitted && result.review) {
          onReviewSubmitted(result.review);
        }

        // Close modal
        onClose();
      } else {
        toast({
          title: "Submission Failed",
          description: result.error || "Failed to submit review",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Review submission error:', error);
      toast({
        title: "Submission Failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;
      const isActive = starNumber <= (hoveredStar || formData.rating);
      
      return (
        <button
          key={index}
          type="button"
          onClick={() => handleStarClick(starNumber)}
          onMouseEnter={() => handleStarHover(starNumber)}
          onMouseLeave={handleStarLeave}
          className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50 rounded"
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              isActive
                ? 'fill-warning text-warning'
                : 'text-gray-300 hover:text-warning'
            }`}
          />
        </button>
      );
    });
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Select a rating';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-primary-dark flex items-center gap-2">
            <Star className="w-5 h-5 text-warning" />
            Share Your Experience
          </DialogTitle>
          <p className="text-sm text-secondary-dark">
            Help other users by sharing your thoughts about our app
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              How would you rate your experience?
            </Label>
            <div className="flex items-center gap-1">
              {renderStars()}
            </div>
            <p className="text-sm text-secondary-dark">
              {getRatingText(hoveredStar || formData.rating)}
            </p>
          </div>

          {/* Review Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Review Title *
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Summarize your experience..."
              maxLength={100}
              className="border-neutral focus:border-brand-primary"
              required
            />
            <p className="text-xs text-muted-dark text-right">
              {formData.title.length}/100
            </p>
          </div>

          {/* Review Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-medium">
              Your Review *
            </Label>
            <Textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              placeholder="Tell us about your experience with the app. What did you like? What could be improved?"
              rows={4}
              maxLength={500}
              className="border-neutral focus:border-brand-primary resize-none"
              required
            />
            <p className="text-xs text-muted-dark text-right">
              {formData.comment.length}/500
            </p>
          </div>

          {/* Guidelines */}
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-800">
              <strong>Review Guidelines:</strong> Please keep your review helpful, respectful, and relevant to your experience with the app. Avoid personal information and inappropriate content.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-primary flex-1"
              disabled={isSubmitting || formData.rating === 0 || !formData.title.trim() || !formData.comment.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1" />
                  Submit Review
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};