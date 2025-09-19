// Central Store Service - Provides consistent store data across the application
// This ensures that the "Find Nearby Stores" and health dashboard sections show the same stores

export interface CentralStore {
  id: string;
  name: string;
  brand: string;
  distance: string;
  features: string;
  rating: number;
  storeType: 'supermarket' | 'hypermarket' | 'grocery' | 'convenience' | 'organic';
  description?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

// Mock store data that represents commonly available stores
// In a real app, this would come from a database or API
const CENTRAL_STORES: CentralStore[] = [
  {
    id: 'whole-foods-1',
    name: 'Whole Foods Market',
    brand: 'Whole Foods',
    distance: '0.8 km',
    features: 'Organic produce, prepared foods, bakery',
    rating: 4.8,
    storeType: 'supermarket',
    description: 'Premium organic and natural foods',
    location: { lat: 40.7614, lng: -73.9776 }
  },
  {
    id: 'safeway-1',
    name: 'Safeway',
    brand: 'Safeway',
    distance: '1.2 km', 
    features: 'Full-service grocery, pharmacy, deli',
    rating: 4.5,
    storeType: 'supermarket',
    description: 'Full-service grocery store with fresh produce',
    location: { lat: 40.7505, lng: -73.9934 }
  },
  {
    id: 'trader-joes-1',
    name: "Trader Joe's",
    brand: "Trader Joe's",
    distance: '1.5 km',
    features: 'Unique products, affordable prices, wine',
    rating: 4.6,
    storeType: 'grocery',
    description: 'Specialty grocery with unique and affordable products',
    location: { lat: 40.7282, lng: -73.9942 }
  },
  {
    id: 'kroger-1',
    name: 'Kroger',
    brand: 'Kroger',
    distance: '2.1 km',
    features: 'Large selection, pharmacy, fuel rewards',
    rating: 4.3,
    storeType: 'supermarket',
    description: 'America\'s largest supermarket chain',
    location: { lat: 40.7399, lng: -74.0027 }
  },
  {
    id: 'target-1',
    name: 'Target Grocery',
    brand: 'Target',
    distance: '2.3 km',
    features: 'Fresh groceries, household items, pharmacy',
    rating: 4.4,
    storeType: 'hypermarket',
    description: 'One-stop shop for groceries and general merchandise',
    location: { lat: 40.7549, lng: -73.9840 }
  },
  {
    id: 'cvs-1',
    name: 'CVS Pharmacy with HealthHub',
    brand: 'CVS',
    distance: '0.6 km',
    features: 'Pharmacy, health products, convenience items',
    rating: 4.1,
    storeType: 'convenience',
    description: 'Pharmacy and convenience store with health focus',
    location: { lat: 40.7580, lng: -73.9855 }
  }
];

class CentralStoreService {
  /**
   * Get all available stores
   */
  getAllStores(): CentralStore[] {
    return CENTRAL_STORES;
  }

  /**
   * Get stores by type
   */
  getStoresByType(storeType: CentralStore['storeType']): CentralStore[] {
    return CENTRAL_STORES.filter(store => store.storeType === storeType);
  }

  /**
   * Get featured stores (top 3 by rating)
   */
  getFeaturedStores(): CentralStore[] {
    return CENTRAL_STORES
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
  }

  /**
   * Get stores within distance
   */
  getStoresWithinDistance(maxDistanceKm: number): CentralStore[] {
    return CENTRAL_STORES.filter(store => {
      const distance = parseFloat(store.distance.replace(' km', ''));
      return distance <= maxDistanceKm;
    });
  }

  /**
   * Search stores by name or brand
   */
  searchStores(query: string): CentralStore[] {
    const lowercaseQuery = query.toLowerCase();
    return CENTRAL_STORES.filter(store => 
      store.name.toLowerCase().includes(lowercaseQuery) ||
      store.brand.toLowerCase().includes(lowercaseQuery) ||
      store.features.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Get store by ID
   */
  getStoreById(id: string): CentralStore | undefined {
    return CENTRAL_STORES.find(store => store.id === id);
  }

  /**
   * Get store theme colors for consistent styling
   */
  getStoreTheme(store: CentralStore): { backgroundColor: string; color: string } {
    const themes: Record<string, { backgroundColor: string; color: string }> = {
      'whole-foods': { backgroundColor: '#00674b', color: '#ffffff' },
      'safeway': { backgroundColor: '#e31837', color: '#ffffff' },
      'trader-joes': { backgroundColor: '#d5282c', color: '#ffffff' },
      'kroger': { backgroundColor: '#004c97', color: '#ffffff' },
      'target': { backgroundColor: '#cc0000', color: '#ffffff' },
      'cvs': { backgroundColor: '#cc0000', color: '#ffffff' }
    };

    const storeKey = store.brand.toLowerCase().replace(/[^a-z]/g, '-');
    return themes[storeKey] || { backgroundColor: '#6b7280', color: '#ffffff' };
  }

  /**
   * Get appropriate store type color
   */
  getStoreTypeColor(storeType: CentralStore['storeType']): string {
    const colors = {
      supermarket: '#f59e0b', // amber
      hypermarket: '#3b82f6', // blue  
      grocery: '#10b981', // emerald
      convenience: '#f97316', // orange
      organic: '#22c55e' // green
    };
    return colors[storeType] || '#6b7280';
  }

  /**
   * Format store type for display
   */
  getStoreTypeDisplay(storeType: CentralStore['storeType']): string {
    const displayNames = {
      supermarket: 'Supermarket',
      hypermarket: 'Hypermarket',
      grocery: 'Grocery Store', 
      convenience: 'Convenience',
      organic: 'Organic Store'
    };
    return displayNames[storeType] || 'Store';
  }
}

// Export singleton instance
export const centralStoreService = new CentralStoreService();

// Helper function to generate stable synthetic rating based on store ID
// NOTE: These are NOT real Google Reviews ratings - they are computed ratings
// for demonstration purposes to provide consistent store ranking
const generateStableRating = (storeId: string): number => {
  // Create a simple hash from the store ID
  let hash = 0;
  for (let i = 0; i < storeId.length; i++) {
    const char = storeId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert hash to a rating between 4.0 and 5.0
  const normalizedHash = Math.abs(hash) / 2147483647; // Max 32-bit int
  return Math.round((4.0 + normalizedHash * 1.0) * 10) / 10; // Round to 1 decimal place
};

// Store adapter to convert NearbyStore to CentralStore format
export const convertNearbyStoreToCentralStore = (nearbyStore: any): CentralStore => {
  return {
    id: nearbyStore.id,
    name: nearbyStore.name,
    brand: nearbyStore.brand || nearbyStore.name,
    distance: nearbyStore.distance < 1000 
      ? `${nearbyStore.distance}m` 
      : `${(nearbyStore.distance / 1000).toFixed(1)}km`,
    features: [
      nearbyStore.amenities?.join(', ') || '',
      nearbyStore.openingHours ? `Hours: ${nearbyStore.openingHours}` : ''
    ].filter(Boolean).join(' • ') || 'Local grocery store',
    rating: generateStableRating(nearbyStore.id), // Synthetic community rating (NOT Google Reviews)
    storeType: nearbyStore.storeType,
    description: `${nearbyStore.storeType === 'supermarket' ? 'Full-service grocery store' : 
                   nearbyStore.storeType === 'convenience' ? 'Quick shopping convenience store' :
                   nearbyStore.storeType === 'organic' ? 'Organic and natural foods' :
                   'Local grocery store'} located ${nearbyStore.distance < 1000 ? 'nearby' : 'in your area'}`,
    location: nearbyStore.lat && nearbyStore.lng ? {
      lat: nearbyStore.lat,
      lng: nearbyStore.lng
    } : undefined
  };
};

// Export types
export type { CentralStore };
export { CentralStoreService };
