// Location Service for handling user geolocation
// Provides secure, privacy-conscious location access

import { UserLocation } from './overpassService';

export interface LocationPermissionStatus {
  permission: 'granted' | 'denied' | 'prompt';
  canRequest: boolean;
  message: string;
}

export interface LocationResult {
  success: boolean;
  location?: UserLocation;
  error?: string;
  permission?: LocationPermissionStatus;
}

class LocationService {
  private cachedLocation: UserLocation | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  /**
   * Get user's current location with caching
   */
  async getCurrentLocation(): Promise<LocationResult> {
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        return {
          success: false,
          error: 'Geolocation is not supported by this browser. Please enter your location manually.'
        };
      }

      // Check cached location
      if (this.cachedLocation && Date.now() < this.cacheExpiry) {
        console.log('📍 Using cached location');
        return { success: true, location: this.cachedLocation };
      }

      // Check permission status first
      const permissionStatus = await this.checkPermissionStatus();
      if (permissionStatus.permission === 'denied') {
        return {
          success: false,
          error: 'Location access denied. Please enable location services and refresh the page.',
          permission: permissionStatus
        };
      }

      // Get fresh location
      console.log('🌍 Requesting fresh location...');
      const location = await this.requestLocation();
      
      // Cache the location
      this.cachedLocation = location;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;
      
      return { success: true, location };
      
    } catch (error) {
      console.error('❌ Location error:', error);
      
      let errorMessage = 'Failed to get your location.';
      
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please allow location access and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please check your connection.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
        }
      }
      
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Request location with proper options
   */
  private async requestLocation(): Promise<UserLocation> {
    return new Promise((resolve, reject) => {
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 15000, // 15 seconds
        maximumAge: 5 * 60 * 1000 // Accept 5-minute old cached position
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: UserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          
          console.log('✅ Location acquired:', {
            lat: location.lat.toFixed(6),
            lng: location.lng.toFixed(6),
            accuracy: `${Math.round(location.accuracy)}m`
          });
          
          resolve(location);
        },
        (error) => {
          reject(error);
        },
        options
      );
    });
  }

  /**
   * Check permission status for geolocation
   */
  private async checkPermissionStatus(): Promise<LocationPermissionStatus> {
    try {
      // Modern browsers support permissions API
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        
        return {
          permission: permission.state as 'granted' | 'denied' | 'prompt',
          canRequest: permission.state === 'prompt' || permission.state === 'granted',
          message: this.getPermissionMessage(permission.state as any)
        };
      }
      
      // Fallback for older browsers
      return {
        permission: 'prompt',
        canRequest: true,
        message: 'Location permission status unknown. Will request when needed.'
      };
      
    } catch (error) {
      console.warn('⚠️ Could not check permission status:', error);
      return {
        permission: 'prompt',
        canRequest: true,
        message: 'Location permission status unknown.'
      };
    }
  }

  /**
   * Get human-readable permission message
   */
  private getPermissionMessage(permission: 'granted' | 'denied' | 'prompt'): string {
    switch (permission) {
      case 'granted':
        return 'Location access granted. You can find nearby stores.';
      case 'denied':
        return 'Location access denied. Please enable location services to find nearby stores.';
      case 'prompt':
        return 'Location permission will be requested when you search for nearby stores.';
      default:
        return 'Location permission status unknown.';
    }
  }

  /**
   * Clear cached location (force fresh request)
   */
  clearCache(): void {
    this.cachedLocation = null;
    this.cacheExpiry = 0;
    console.log('🧹 Location cache cleared');
  }

  /**
   * Get cached location if available and not expired
   */
  getCachedLocation(): UserLocation | null {
    if (this.cachedLocation && Date.now() < this.cacheExpiry) {
      return this.cachedLocation;
    }
    return null;
  }

  /**
   * Convert address to coordinates (geocoding)
   * Uses a free geocoding service
   */
  async geocodeAddress(address: string): Promise<LocationResult> {
    try {
      // Using Nominatim (OpenStreetMap's geocoding service)
      const encodedAddress = encodeURIComponent(address);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AI-Recipe-Recommender/1.0' // Required by Nominatim
        }
      });
      
      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        return {
          success: false,
          error: 'Address not found. Please try a more specific address.'
        };
      }
      
      const result = data[0];
      const location: UserLocation = {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        accuracy: 1000, // Estimated accuracy for geocoded addresses
        timestamp: Date.now()
      };
      
      console.log('📍 Address geocoded:', { address, location });
      return { success: true, location };
      
    } catch (error) {
      console.error('❌ Geocoding error:', error);
      return {
        success: false,
        error: 'Failed to find location for the provided address.'
      };
    }
  }

  /**
   * Format coordinates for display
   */
  static formatCoordinates(location: UserLocation): string {
    return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
  }

  /**
   * Get location accuracy description
   */
  static getAccuracyDescription(accuracy: number): string {
    if (accuracy < 10) return 'Very precise';
    if (accuracy < 50) return 'Precise';
    if (accuracy < 100) return 'Good';
    if (accuracy < 500) return 'Approximate';
    return 'Rough estimate';
  }

  /**
   * Check if two locations are significantly different
   */
  static isLocationSignificantlyDifferent(
    location1: UserLocation,
    location2: UserLocation,
    thresholdMeters: number = 100
  ): boolean {
    const distance = this.calculateDistance(
      location1.lat, location1.lng,
      location2.lat, location2.lng
    );
    return distance > thresholdMeters;
  }

  /**
   * Calculate distance between two points (same as in overpassService)
   */
  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

// Export singleton instance
export const locationService = new LocationService();

// Export class and types
export { LocationService };
export type { GeolocationPositionError };