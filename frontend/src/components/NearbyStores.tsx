import React, { useState, useEffect } from 'react';
import { MapPin, Loader2, AlertCircle, RefreshCw, Search, Sliders, Navigation as NavigationIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import CompactStoreCard from './CompactStoreCard';
import { StoreCard } from './StoreCard';
import { NearbyStore, UserLocation, overpassService } from '@/services/overpassService';
import { locationService, LocationResult } from '@/services/locationService';
import { CentralStore, centralStoreService, convertNearbyStoreToCentralStore } from '@/services/centralStoreService';
import { useTranslation } from '@/contexts/TranslationContext';

interface NearbyStoresProps {
  className?: string;
  onStoresFound?: (stores: NearbyStore[]) => void; // Add callback for sharing store data
}

type LoadingState = 'idle' | 'requesting-location' | 'loading-stores' | 'error';

export const NearbyStores: React.FC<NearbyStoresProps> = ({ 
  className = '', 
  onStoresFound 
}) => {
  const [stores, setStores] = useState<NearbyStore[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string>('');
  const [searchRadius, setSearchRadius] = useState<number>(5000); // 5km default
  const [storeTypeFilter, setStoreTypeFilter] = useState<string>('all');
  const [manualAddress, setManualAddress] = useState<string>('');
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    // Check if we have a cached location on mount
    const cached = locationService.getCachedLocation();
    if (cached) {
      setUserLocation(cached);
      fetchNearbyStores(cached);
    }
  }, []);

  const requestLocationAndFetchStores = async () => {
    setLoadingState('requesting-location');
    setError('');
    setLocationPermissionDenied(false);

    try {
      console.log('🌍 Requesting user location...');
      const locationResult: LocationResult = await locationService.getCurrentLocation();

      if (!locationResult.success) {
        if (locationResult.error?.includes('denied') || locationResult.error?.includes('access')) {
          setLocationPermissionDenied(true);
        }
        setError(locationResult.error || 'Failed to get location');
        setLoadingState('error');
        return;
      }

      if (locationResult.location) {
        setUserLocation(locationResult.location);
        await fetchNearbyStores(locationResult.location);
      }
    } catch (error) {
      console.error('❌ Location request error:', error);
      setError('Failed to access location services');
      setLoadingState('error');
    }
  };

  const fetchNearbyStores = async (location: UserLocation) => {
    setLoadingState('loading-stores');
    setError('');

    try {
      console.log('🏪 Fetching nearby stores...');
      const result = await overpassService.getNearbyStores(location, searchRadius);

      if (!result.success) {
        setError(result.message || 'Failed to fetch nearby stores');
        setLoadingState('error');
        return;
      }

      let fetchedStores = result.stores || [];
      
      // Apply store type filter
      if (storeTypeFilter !== 'all') {
        fetchedStores = fetchedStores.filter(store => store.storeType === storeTypeFilter);
      }

      setStores(fetchedStores);
      setLoadingState('idle');
      
      // Share store data with parent component (for health section)
      onStoresFound?.(fetchedStores);

      toast({
        title: "Stores Found",
        description: `Found ${fetchedStores.length} nearby stores within ${searchRadius/1000}km.`
      });
    } catch (error) {
      console.error('❌ Error fetching stores:', error);
      setError('Failed to fetch nearby stores');
      setLoadingState('error');
    }
  };

  const handleManualAddressSubmit = async () => {
    if (!manualAddress.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter an address to search for nearby stores.",
        variant: "destructive"
      });
      return;
    }

    setLoadingState('requesting-location');
    setError('');

    try {
      const locationResult = await locationService.geocodeAddress(manualAddress);
      
      if (!locationResult.success) {
        setError(locationResult.error || 'Failed to find location for this address');
        setLoadingState('error');
        return;
      }

      if (locationResult.location) {
        setUserLocation(locationResult.location);
        setLocationPermissionDenied(false);
        await fetchNearbyStores(locationResult.location);
      }
    } catch (error) {
      console.error('❌ Geocoding error:', error);
      setError('Failed to find location for this address');
      setLoadingState('error');
    }
  };

  const handleRefresh = () => {
    if (userLocation) {
      fetchNearbyStores(userLocation);
    } else {
      requestLocationAndFetchStores();
    }
  };

  const handleStoreDirections = (store: NearbyStore) => {
    console.log('🧭 Getting directions to:', store.name);
    // Direction handling is managed in StoreCard component
  };

  const isLoading = loadingState === 'requesting-location' || loadingState === 'loading-stores';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="bg-gradient-to-br from-brand-primary/5 to-success/5 border-brand-primary/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary-dark flex items-center gap-2">
            <MapPin className="h-6 w-6 text-brand-primary" />
            {t('nearbyStores.nearby')}
          </CardTitle>
          <p className="text-secondary-dark">
            {t('nearbyStores.description')}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!userLocation && !locationPermissionDenied && (
            <div className="text-center py-4">
              <Button 
                onClick={requestLocationAndFetchStores}
                disabled={isLoading}
                className="btn-primary shadow-professional-md hover:shadow-professional-lg font-medium"
                size="lg"
              >
                {loadingState === 'requesting-location' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <NavigationIcon className="h-4 w-4 mr-2" />
                )}
                {t('nearbyStores.findStoresButton')}
              </Button>
              <p className="text-sm text-secondary-dark mt-2">
                {t('nearbyStores.locationPermissionPrompt')}
              </p>
            </div>
          )}

          {/* Manual Address Input (shown when location is denied) */}
          {locationPermissionDenied && (
            <div className="space-y-3 p-4 bg-neutral-50 rounded-lg border border-neutral">
              <Label htmlFor="manual-address" className="text-secondary-dark font-medium">
                Enter your address to find nearby stores:
              </Label>
              <div className="flex gap-2">
                <Input
                  id="manual-address"
                  placeholder="e.g., 123 Main St, City, State"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualAddressSubmit()}
                  className="flex-1 border-neutral focus:border-brand-primary"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleManualAddressSubmit}
                  disabled={isLoading || !manualAddress.trim()}
                  className="btn-primary font-medium"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Search Options */}
          {userLocation && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-neutral-50 rounded-lg border border-neutral">
              <div className="space-y-2">
                <Label className="text-secondary-dark font-medium">Search Radius</Label>
                <Select
                  value={searchRadius.toString()}
                  onValueChange={(value) => setSearchRadius(parseInt(value))}
                >
                  <SelectTrigger className="border-neutral focus:border-brand-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1000">1 km</SelectItem>
                    <SelectItem value="2000">2 km</SelectItem>
                    <SelectItem value="5000">5 km</SelectItem>
                    <SelectItem value="10000">10 km</SelectItem>
                    <SelectItem value="20000">20 km</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-secondary-dark font-medium">Store Type</Label>
                <Select value={storeTypeFilter} onValueChange={setStoreTypeFilter}>
                  <SelectTrigger className="border-neutral focus:border-brand-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stores</SelectItem>
                    <SelectItem value="supermarket">Supermarkets</SelectItem>
                    <SelectItem value="hypermarket">Hypermarkets</SelectItem>
                    <SelectItem value="grocery">Grocery Stores</SelectItem>
                    <SelectItem value="convenience">Convenience Stores</SelectItem>
                    <SelectItem value="organic">Organic Stores</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Refresh and Actions */}
          {userLocation && (
            <div className="flex justify-between items-center">
              <div className="text-sm text-secondary-dark">
                📍 Location accuracy: ±{Math.round(userLocation.accuracy)}m
              </div>
              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="border-neutral text-secondary-dark hover:bg-neutral-50"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error State */}
      {loadingState === 'error' && error && (
        <Card className="border-error/20 bg-error/5">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-primary-dark mb-2">
              Unable to Find Stores
            </h3>
            <p className="text-secondary-dark mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={requestLocationAndFetchStores}
                className="btn-primary font-medium"
              >
                Try Again
              </Button>
              {!locationPermissionDenied && (
                <Button 
                  onClick={() => setLocationPermissionDenied(true)}
                  variant="outline"
                  className="border-neutral text-secondary-dark hover:bg-neutral-50"
                >
                  Enter Address Manually
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-12 w-12 text-brand-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-primary-dark mb-2">
              {loadingState === 'requesting-location' ? 'Getting Your Location...' : 'Finding Nearby Stores...'}
            </h3>
            <p className="text-secondary-dark">
              {loadingState === 'requesting-location' 
                ? 'Please allow location access when prompted.'
                : 'Searching for supermarkets and grocery stores near you.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stores List */}
      {stores.length > 0 && !isLoading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-primary-dark">
              Found {stores.length} stores within {searchRadius/1000}km
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {stores.map((store) => (
              <CompactStoreCard
                key={store.id}
                store={convertNearbyStoreToCentralStore(store)}
                onGetDirections={(centralStore) => {
                  // Find original store for directions
                  const originalStore = stores.find(s => s.id === centralStore.id);
                  if (originalStore) {
                    handleStoreDirections(originalStore);
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Stores Found */}
      {stores.length === 0 && userLocation && !isLoading && loadingState !== 'error' && (
        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="p-8 text-center">
            <MapPin className="h-12 w-12 text-warning mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-primary-dark mb-2">
              No Stores Found
            </h3>
            <p className="text-secondary-dark mb-4">
              No grocery stores found within {searchRadius/1000}km of your location.
            </p>
            <Button 
              onClick={() => {
                setSearchRadius(20000); // Expand to 20km
                fetchNearbyStores(userLocation);
              }}
              className="btn-primary font-medium"
            >
              Search Wider Area (20km)
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};