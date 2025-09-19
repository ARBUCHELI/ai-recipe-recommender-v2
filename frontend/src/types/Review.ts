// Review system type definitions
export interface UserReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5 stars
  title: string;
  comment: string;
  date: string; // ISO date string
  isVerified: boolean;
  helpfulVotes: number;
  reportedCount: number;
  status: 'active' | 'pending' | 'hidden';
  version?: string; // App version when review was written
  platform?: 'web' | 'mobile' | 'desktop';
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ReviewFilters {
  rating?: number;
  sortBy: 'newest' | 'oldest' | 'highest' | 'lowest' | 'most_helpful';
  limit?: number;
  offset?: number;
}

export interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
}

export interface ReviewResponse {
  success: boolean;
  review?: UserReview;
  reviews?: UserReview[];
  stats?: ReviewStats;
  message?: string;
  error?: string;
}