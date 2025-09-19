// Review Service - Professional API integration with fallback mock data
import { UserReview, ReviewStats, ReviewFilters, ReviewFormData, ReviewResponse } from '@/types/Review';

class ReviewService {
  private baseUrl = '/api/reviews'; // Backend API endpoint
  private mockMode = true; // Enable mock mode for development
  private storageKey = 'app_reviews'; // LocalStorage key for persistence
  
  // Mock data for development/demo (will be loaded from localStorage if available)
  private mockReviews: UserReview[] = [
    {
      id: 'review-1',
      userId: 'user-1',
      userName: 'Sarah Mitchell',
      userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b8db?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      title: 'Amazing AI Recipe Suggestions!',
      comment: 'This app has completely transformed my meal planning. The AI suggestions are spot-on and the recipes are delicious. I\'ve discovered so many new dishes!',
      date: '2024-01-15T10:30:00Z',
      isVerified: true,
      helpfulVotes: 24,
      reportedCount: 0,
      status: 'active',
      version: '2.1.0',
      platform: 'web'
    },
    {
      id: 'review-2',
      userId: 'user-2',
      userName: 'Michael Chen',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      rating: 4,
      title: 'Great for meal planning',
      comment: 'Love how the app considers my dietary restrictions and generates personalized meal plans. The shopping list feature is super convenient. Would love more international cuisine options.',
      date: '2024-01-14T15:45:00Z',
      isVerified: true,
      helpfulVotes: 18,
      reportedCount: 0,
      status: 'active',
      version: '2.1.0',
      platform: 'web'
    },
    {
      id: 'review-3',
      userId: 'user-3',
      userName: 'Emma Rodriguez',
      userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      title: 'Perfect for busy professionals',
      comment: 'As someone with a hectic schedule, this app is a lifesaver. The AI understands my preferences and the health tracking helps me stay on track with my fitness goals.',
      date: '2024-01-13T09:20:00Z',
      isVerified: true,
      helpfulVotes: 31,
      reportedCount: 0,
      status: 'active',
      version: '2.0.8',
      platform: 'web'
    },
    {
      id: 'review-4',
      userId: 'user-4',
      userName: 'David Thompson',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rating: 4,
      title: 'Impressive AI technology',
      comment: 'The AI recipe generation is really impressive. It takes into account ingredients I have and creates practical recipes. The interface is clean and intuitive.',
      date: '2024-01-12T14:10:00Z',
      isVerified: false,
      helpfulVotes: 12,
      reportedCount: 0,
      status: 'active',
      version: '2.1.0',
      platform: 'web'
    },
    {
      id: 'review-5',
      userId: 'user-5',
      userName: 'Lisa Park',
      userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      title: 'Game changer for healthy eating',
      comment: 'This app has made healthy eating so much easier! The personalized nutrition recommendations and meal timing suggestions have helped me develop better eating habits.',
      date: '2024-01-11T11:35:00Z',
      isVerified: true,
      helpfulVotes: 29,
      reportedCount: 0,
      status: 'active',
      version: '2.0.8',
      platform: 'web'
    },
    {
      id: 'review-6',
      userId: 'user-6',
      userName: 'James Wilson',
      userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      rating: 3,
      title: 'Good but needs improvements',
      comment: 'The concept is great and the AI is helpful, but sometimes the recipes require ingredients that are hard to find. Also, more vegetarian options would be nice.',
      date: '2024-01-10T16:25:00Z',
      isVerified: true,
      helpfulVotes: 8,
      reportedCount: 0,
      status: 'active',
      version: '2.0.8',
      platform: 'web'
    }
  ];

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load reviews from localStorage if available
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsedReviews = JSON.parse(stored);
        if (Array.isArray(parsedReviews) && parsedReviews.length > 0) {
          this.mockReviews = parsedReviews;
          console.log('📚 Loaded', parsedReviews.length, 'reviews from localStorage');
        }
      }
    } catch (error) {
      console.error('❌ Failed to load reviews from localStorage:', error);
    }
  }

  /**
   * Save reviews to localStorage for persistence
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.mockReviews));
      console.log('💾 Saved', this.mockReviews.length, 'reviews to localStorage');
    } catch (error) {
      console.error('❌ Failed to save reviews to localStorage:', error);
    }
  }

  /**
   * Get featured reviews for display on main pages
   */
  async getFeaturedReviews(limit: number = 3): Promise<ReviewResponse> {
    if (this.mockMode) {
      // Return top-rated, most helpful reviews
      const featuredReviews = this.mockReviews
        .filter(review => review.status === 'active')
        .sort((a, b) => {
          // Sort by rating first, then by helpful votes
          if (b.rating !== a.rating) return b.rating - a.rating;
          return b.helpfulVotes - a.helpfulVotes;
        })
        .slice(0, limit);

      return {
        success: true,
        reviews: featuredReviews,
        stats: this.calculateStats()
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/featured?limit=${limit}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch featured reviews:', error);
      return { success: false, error: 'Failed to load reviews' };
    }
  }

  /**
   * Get all reviews with filtering and pagination
   */
  async getAllReviews(filters: ReviewFilters): Promise<ReviewResponse> {
    if (this.mockMode) {
      let filteredReviews = this.mockReviews.filter(review => review.status === 'active');

      // Apply rating filter
      if (filters.rating) {
        filteredReviews = filteredReviews.filter(review => review.rating === filters.rating);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'newest':
          filteredReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          break;
        case 'oldest':
          filteredReviews.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          break;
        case 'highest':
          filteredReviews.sort((a, b) => b.rating - a.rating);
          break;
        case 'lowest':
          filteredReviews.sort((a, b) => a.rating - b.rating);
          break;
        case 'most_helpful':
          filteredReviews.sort((a, b) => b.helpfulVotes - a.helpfulVotes);
          break;
      }

      // Apply pagination
      const offset = filters.offset || 0;
      const limit = filters.limit || 10;
      const paginatedReviews = filteredReviews.slice(offset, offset + limit);

      return {
        success: true,
        reviews: paginatedReviews,
        stats: this.calculateStats()
      };
    }

    try {
      const queryParams = new URLSearchParams({
        sortBy: filters.sortBy,
        limit: (filters.limit || 10).toString(),
        offset: (filters.offset || 0).toString()
      });
      
      if (filters.rating) {
        queryParams.append('rating', filters.rating.toString());
      }

      const response = await fetch(`${this.baseUrl}?${queryParams}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      return { success: false, error: 'Failed to load reviews' };
    }
  }

  /**
   * Submit a new review
   */
  async submitReview(reviewData: ReviewFormData, userId: string, userName: string): Promise<ReviewResponse> {
    if (this.mockMode) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newReview: UserReview = {
        id: `review-${Date.now()}`,
        userId,
        userName,
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment,
        date: new Date().toISOString(),
        isVerified: true, // In production, this would be determined by backend logic
        helpfulVotes: 0,
        reportedCount: 0,
        status: 'active',
        version: '2.1.0',
        platform: 'web'
      };

      // Add to mock data
      this.mockReviews.unshift(newReview);
      this.saveToStorage(); // Persist to localStorage

      return {
        success: true,
        review: newReview,
        message: 'Thank you for your review! It has been published.'
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(reviewData)
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to submit review:', error);
      return { success: false, error: 'Failed to submit review' };
    }
  }

  /**
   * Vote a review as helpful
   */
  async voteHelpful(reviewId: string): Promise<ReviewResponse> {
    if (this.mockMode) {
      const review = this.mockReviews.find(r => r.id === reviewId);
      if (review) {
        review.helpfulVotes += 1;
        this.saveToStorage(); // Persist to localStorage
        return { success: true, message: 'Thank you for your feedback!' };
      }
      return { success: false, error: 'Review not found' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to vote helpful:', error);
      return { success: false, error: 'Failed to submit vote' };
    }
  }

  /**
   * Report a review
   */
  async reportReview(reviewId: string, reason: string): Promise<ReviewResponse> {
    if (this.mockMode) {
      const review = this.mockReviews.find(r => r.id === reviewId);
      if (review) {
        review.reportedCount += 1;
        // Hide review if it gets too many reports
        if (review.reportedCount >= 5) {
          review.status = 'hidden';
        }
        this.saveToStorage(); // Persist to localStorage
        return { success: true, message: 'Report submitted successfully' };
      }
      return { success: false, error: 'Review not found' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/${reviewId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ reason })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to report review:', error);
      return { success: false, error: 'Failed to submit report' };
    }
  }

  /**
   * Get review statistics
   */
  private calculateStats(): ReviewStats {
    const activeReviews = this.mockReviews.filter(review => review.status === 'active');
    const totalReviews = activeReviews.length;
    const averageRating = totalReviews > 0 
      ? activeReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    const ratingDistribution = {
      1: activeReviews.filter(r => r.rating === 1).length,
      2: activeReviews.filter(r => r.rating === 2).length,
      3: activeReviews.filter(r => r.rating === 3).length,
      4: activeReviews.filter(r => r.rating === 4).length,
      5: activeReviews.filter(r => r.rating === 5).length
    };

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution
    };
  }

  /**
   * Get authentication token (implement based on your auth system)
   */
  private getAuthToken(): string {
    // This should integrate with your existing auth system
    return localStorage.getItem('auth_token') || '';
  }

  /**
   * Enable/disable mock mode
   */
  setMockMode(enabled: boolean): void {
    this.mockMode = enabled;
  }
}

// Export singleton instance
export const reviewService = new ReviewService();
export { ReviewService };