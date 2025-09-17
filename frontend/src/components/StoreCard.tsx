import React from 'react';
import { MapPin, Phone, Clock, ExternalLink, Navigation, Star } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NearbyStore, UserLocation } from '@/services/overpassService';
import { OverpassService } from '@/services/overpassService';
import { getStoreImageUrl, getStoreTheme } from '@/services/storeImageService';
import { useToast } from '@/hooks/use-toast';

interface StoreCardProps {
  store: NearbyStore;
  userLocation?: UserLocation;
  onGetDirections?: (store: NearbyStore) => void;
  className?: string;
}

export const StoreCard: React.FC<StoreCardProps> = ({
  store,
  userLocation,
  onGetDirections,
  className = ''
}) => {
  const { toast } = useToast();
  const storeImageUrl = getStoreImageUrl(store, 64);
  const storeTheme = getStoreTheme(store);
  
  // Function to get contrasting text color for better readability
  const getContrastColor = (hexColor: string): string => {
    // Remove # if present
    const color = hexColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    
    // Calculate luminance using relative luminance formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for light colors, white for dark colors
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };
  const handleGetDirections = () => {
    if (userLocation) {
      const directionsUrl = OverpassService.getDirectionsUrl(store, userLocation);
      window.open(directionsUrl, '_blank');
    }
    onGetDirections?.(store);
  };

  const handleCall = () => {
    if (store.phone) {
      // Clean the phone number for better compatibility
      const cleanPhone = store.phone.replace(/[^+\d]/g, '');
      console.log('📞 Attempting to call:', store.name, cleanPhone);
      
      // Show immediate feedback
      toast({
        title: "Opening Phone App",
        description: `Calling ${store.name}...`
      });
      
      // Try different methods for better compatibility
      try {
        // Primary method: tel: protocol
        window.location.href = `tel:${cleanPhone}`;
      } catch (error) {
        console.error('❌ Tel protocol failed, trying window.open:', error);
        try {
          window.open(`tel:${cleanPhone}`, '_self');
        } catch (fallbackError) {
          console.error('❌ Call failed:', fallbackError);
          // Fallback: copy to clipboard and notify user
          navigator.clipboard?.writeText(cleanPhone).then(() => {
            toast({
              title: "Phone Number Copied",
              description: `${store.phone} copied to clipboard`
            });
          }).catch(() => {
            toast({
              title: "Call Store",
              description: `Please call: ${store.phone}`,
              variant: "destructive"
            });
          });
        }
      }
    } else {
      toast({
        title: "No Phone Number",
        description: "This store doesn't have a phone number available.",
        variant: "destructive"
      });
    }
  };

  const handleWebsite = () => {
    if (store.website) {
      window.open(store.website, '_blank');
    }
  };

  const getStoreTypeColor = (storeType: NearbyStore['storeType']) => {
    const colors = {
      supermarket: 'bg-brand-primary',
      hypermarket: 'bg-info',
      grocery: 'bg-success', 
      convenience: 'bg-warning',
      organic: 'bg-success'
    };
    return colors[storeType] || 'bg-neutral-500';
  };

  const formatOpeningHours = (hours?: string) => {
    if (!hours) return null;
    
    // Simple formatting for common patterns
    if (hours.includes('24/7')) return '24/7';
    if (hours.includes('Mo-Su')) return hours.replace('Mo-Su', 'Daily');
    if (hours.includes('Mo-Fr')) return hours.replace('Mo-Fr', 'Mon-Fri');
    if (hours.includes('Sa-Su')) return hours.replace('Sa-Su', 'Weekends');
    
    return hours.length > 30 ? hours.substring(0, 30) + '...' : hours;
  };

  return (
    <Card className={`hover:shadow-professional-lg transition-all duration-300 border-neutral hover:border-brand-primary/30 hover:scale-[1.01] ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          {/* Store Image */}
          <div className="flex-shrink-0">
            <div className="relative">
              <img 
                src={storeImageUrl}
                alt={`${store.name} icon`}
                className="w-16 h-16 rounded-xl shadow-professional-sm"
                style={{ backgroundColor: storeTheme.backgroundColor }}
              />
              <div 
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2"
                style={{ 
                  backgroundColor: '#374151', // Dark grey background (neutral-700)
                  color: '#ffffff', // White text
                  borderColor: '#6b7280' // Medium grey border (neutral-500)
                }}
              >
                {OverpassService.formatDistance(store.distance).split(' ')[0]}
              </div>
            </div>
          </div>
          
          {/* Store Information */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-primary-dark truncate mb-2">
              {store.name}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                className="text-xs font-medium border-0"
                variant="secondary"
                style={{ 
                  backgroundColor: storeTheme.backgroundColor,
                  color: storeTheme.color
                }}
              >
                {OverpassService.getStoreTypeDisplay(store.storeType)}
              </Badge>
              {store.brand && (
                <Badge variant="outline" className="text-xs border-neutral text-secondary-dark">
                  {store.brand}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" style={{ color: storeTheme.color }} />
              <span className="text-sm font-medium text-secondary-dark">
                {OverpassService.formatDistance(store.distance)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Address */}
        {store.address && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: storeTheme.color }} />
            <p className="text-sm text-secondary-dark leading-relaxed">
              {store.address}
            </p>
          </div>
        )}

        {/* Opening Hours */}
        {store.openingHours && (
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: storeTheme.color }} />
            <p className="text-sm text-secondary-dark">
              {formatOpeningHours(store.openingHours)}
            </p>
          </div>
        )}

        {/* Amenities */}
        {store.amenities && store.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {store.amenities.slice(0, 4).map((amenity, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs border-0"
                style={{
                  backgroundColor: `${storeTheme.color}10`,
                  color: storeTheme.color,
                  borderColor: `${storeTheme.color}30`
                }}
              >
                {amenity}
              </Badge>
            ))}
            {store.amenities.length > 4 && (
              <Badge
                variant="outline"
                className="text-xs border-neutral text-secondary-dark"
              >
                +{store.amenities.length - 4} more
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral">
          <Button
            onClick={handleGetDirections}
            className="btn-primary flex-1 min-w-0 text-sm font-medium"
            size="sm"
          >
            <Navigation className="h-4 w-4 mr-1" />
            Directions
          </Button>
          
          {store.phone && (
            <Button
              onClick={handleCall}
              variant="outline"
              size="sm"
              className="border-neutral text-secondary-dark hover:bg-neutral-50 text-sm"
            >
              <Phone className="h-4 w-4 mr-1" />
              Call
            </Button>
          )}
          
          {store.website && (
            <Button
              onClick={handleWebsite}
              variant="outline"
              size="sm"
              className="border-neutral text-secondary-dark hover:bg-neutral-50 text-sm"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Visit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};