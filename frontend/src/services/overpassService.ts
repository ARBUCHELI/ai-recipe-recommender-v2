// Overpass API Service for finding nearby supermarkets
// Uses OpenStreetMap data via the free Overpass API

export interface NearbyStore {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distance: number; // in meters
  storeType: 'supermarket' | 'grocery' | 'convenience' | 'organic' | 'hypermarket';
  address?: string;
  phone?: string;
  website?: string;
  openingHours?: string;
  amenities?: string[]; // parking, pharmacy, bakery, etc.
  brand?: string; // Walmart, Kroger, etc.
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

export interface OverpassResponse {
  version: number;
  generator: string;
  elements: OverpassElement[];
}

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: { [key: string]: string };
}

class OverpassService {
  private readonly BASE_URLS = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.openstreetmap.ru/api/interpreter'
  ];

  private currentUrlIndex = 0;

  /**
   * Get nearby stores using Overpass API
   */
  async getNearbyStores(
    userLocation: UserLocation, 
    radiusMeters: number = 5000
  ): Promise<{ success: boolean; stores?: NearbyStore[]; message?: string }> {
    try {
      console.log('🏪 Fetching nearby stores...', { userLocation, radiusMeters });
      
      const query = this.buildOverpassQuery(userLocation.lat, userLocation.lng, radiusMeters);
      const response = await this.makeOverpassRequest(query);
      
      if (!response.success) {
        return { success: false, message: response.message };
      }

      const stores = this.parseOverpassResponse(response.data!, userLocation);
      
      console.log(`✅ Found ${stores.length} nearby stores`);
      return { success: true, stores };
      
    } catch (error) {
      console.error('❌ Error fetching nearby stores:', error);
      return {
        success: false,
        message: 'Failed to fetch nearby stores. Please try again.'
      };
    }
  }

  /**
   * Build Overpass QL query for nearby stores
   */
  private buildOverpassQuery(lat: number, lng: number, radius: number): string {
    return `
      [out:json][timeout:25];
      (
        node["shop"~"^(supermarket|convenience|grocery|hypermarket)$"](around:${radius},${lat},${lng});
        way["shop"~"^(supermarket|convenience|grocery|hypermarket)$"](around:${radius},${lat},${lng});
        relation["shop"~"^(supermarket|convenience|grocery|hypermarket)$"](around:${radius},${lat},${lng});
      );
      out center meta;
    `;
  }

  /**
   * Make request to Overpass API with fallback servers
   */
  private async makeOverpassRequest(query: string): Promise<{
    success: boolean;
    data?: OverpassResponse;
    message?: string;
  }> {
    for (let attempt = 0; attempt < this.BASE_URLS.length; attempt++) {
      try {
        const url = this.BASE_URLS[this.currentUrlIndex];
        console.log(`📡 Trying Overpass server: ${url}`);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `data=${encodeURIComponent(query)}`,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: OverpassResponse = await response.json();
        return { success: true, data };
        
      } catch (error) {
        console.warn(`⚠️ Overpass server ${this.currentUrlIndex + 1} failed:`, error);
        
        // Try next server
        this.currentUrlIndex = (this.currentUrlIndex + 1) % this.BASE_URLS.length;
        
        // If this was the last attempt, return error
        if (attempt === this.BASE_URLS.length - 1) {
          return {
            success: false,
            message: 'All Overpass servers are currently unavailable. Please try again later.'
          };
        }
      }
    }

    return { success: false, message: 'Unexpected error occurred.' };
  }

  /**
   * Parse Overpass API response into NearbyStore objects
   */
  private parseOverpassResponse(data: OverpassResponse, userLocation: UserLocation): NearbyStore[] {
    return data.elements
      .map(element => this.parseStoreElement(element, userLocation))
      .filter((store): store is NearbyStore => store !== null)
      .sort((a, b) => a.distance - b.distance) // Sort by distance
      .slice(0, 20); // Limit to 20 closest stores
  }

  /**
   * Parse individual store element from Overpass response
   */
  private parseStoreElement(element: OverpassElement, userLocation: UserLocation): NearbyStore | null {
    const tags = element.tags;
    if (!tags) return null;

    // Get coordinates
    let lat: number, lng: number;
    if (element.lat && element.lon) {
      lat = element.lat;
      lng = element.lon;
    } else if (element.center) {
      lat = element.center.lat;
      lng = element.center.lon;
    } else {
      return null; // Skip if no coordinates
    }

    // Calculate distance
    const distance = this.calculateDistance(userLocation.lat, userLocation.lng, lat, lng);

    // Determine store type
    const shopValue = tags.shop;
    let storeType: NearbyStore['storeType'] = 'grocery';
    switch (shopValue) {
      case 'supermarket':
        storeType = 'supermarket';
        break;
      case 'hypermarket':
        storeType = 'hypermarket';
        break;
      case 'convenience':
        storeType = 'convenience';
        break;
      case 'grocery':
        storeType = 'grocery';
        break;
      default:
        if (tags.organic === 'yes' || tags['organic'] === 'only') {
          storeType = 'organic';
        }
    }

    // Extract amenities
    const amenities: string[] = [];
    if (tags.pharmacy === 'yes') amenities.push('Pharmacy');
    if (tags.bakery === 'yes') amenities.push('Bakery');
    if (tags.parking === 'yes') amenities.push('Parking');
    if (tags.wheelchair === 'yes') amenities.push('Wheelchair Accessible');
    if (tags.atm === 'yes') amenities.push('ATM');

    // Build address
    const addressParts = [
      tags['addr:housenumber'],
      tags['addr:street'],
      tags['addr:city'],
      tags['addr:state'],
      tags['addr:postcode']
    ].filter(Boolean);

    return {
      id: `${element.type}_${element.id}`,
      name: tags.name || tags.brand || 'Unnamed Store',
      lat,
      lng,
      distance: Math.round(distance),
      storeType,
      address: addressParts.length > 0 ? addressParts.join(', ') : undefined,
      phone: tags.phone || tags['contact:phone'],
      website: tags.website || tags['contact:website'],
      openingHours: tags.opening_hours,
      amenities: amenities.length > 0 ? amenities : undefined,
      brand: tags.brand
    };
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Format distance for display
   */
  static formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${meters}m`;
    } else if (meters < 10000) {
      return `${(meters / 1000).toFixed(1)}km`;
    } else {
      return `${Math.round(meters / 1000)}km`;
    }
  }

  /**
   * Get store type display name
   */
  static getStoreTypeDisplay(storeType: NearbyStore['storeType']): string {
    const displayNames = {
      supermarket: 'Supermarket',
      hypermarket: 'Hypermarket', 
      grocery: 'Grocery Store',
      convenience: 'Convenience Store',
      organic: 'Organic Store'
    };
    return displayNames[storeType] || 'Store';
  }

  /**
   * Get appropriate map URL for directions
   */
  static getDirectionsUrl(store: NearbyStore, userLocation: UserLocation): string {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
      // Use Apple Maps on iOS
      return `maps://?daddr=${store.lat},${store.lng}&saddr=${userLocation.lat},${userLocation.lng}`;
    } else if (isAndroid) {
      // Use Google Maps on Android
      return `google.navigation:q=${store.lat},${store.lng}`;
    } else {
      // Use Google Maps web on desktop
      return `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${store.lat},${store.lng}`;
    }
  }
}

// Export singleton instance
export const overpassService = new OverpassService();

// Export types and utilities
export { OverpassService };
export type { OverpassResponse, OverpassElement };