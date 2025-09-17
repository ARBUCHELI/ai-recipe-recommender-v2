import React, { useState } from 'react';
import { MapPin, Phone, Navigation, Star, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CentralStore, centralStoreService } from '@/services/centralStoreService';

interface CompactStoreCardProps {
  store: CentralStore;
  onGetDirections?: (store: CentralStore) => void;
  className?: string;
}

export const CompactStoreCard: React.FC<CompactStoreCardProps> = ({
  store,
  onGetDirections,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const storeTheme = centralStoreService.getStoreTheme(store);
  const storeTypeColor = centralStoreService.getStoreTypeColor(store.storeType);

  const handleGetDirections = () => {
    if (store.location) {
      const directionsUrl = `https://www.google.com/maps/dir//${store.location.lat},${store.location.lng}`;
      window.open(directionsUrl, '_blank');
    }
    onGetDirections?.(store);
  };

  return (
    <Card className={`shadow-professional-md hover:shadow-professional-lg transition-all duration-300 border-neutral ${className}`}>
      <CardHeader className="p-4" style={{ backgroundColor: `${storeTheme.backgroundColor}15` }}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold leading-tight text-primary-dark">
              {store.name}
            </CardTitle>
            {store.description && (
              <p className="text-secondary-dark mt-1 text-sm line-clamp-1">
                {store.description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {/* Store Metadata */}
        <div className="flex flex-wrap gap-2 mb-4 text-xs">
          <Badge 
            className="text-xs font-medium"
            style={{ 
              backgroundColor: storeTheme.backgroundColor,
              color: storeTheme.color
            }}
          >
            {store.brand}
          </Badge>
          <Badge 
            variant="outline" 
            className="text-xs"
            style={{
              borderColor: storeTypeColor,
              color: storeTypeColor
            }}
          >
            {centralStoreService.getStoreTypeDisplay(store.storeType)}
          </Badge>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-brand-primary" />
            <span className="text-secondary-dark font-medium">{store.distance}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4 p-2 bg-neutral-50 rounded-lg">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="text-sm font-bold text-warning">{store.rating}</span>
          </div>
          <div className="text-xs text-secondary-dark">Google Rating</div>
        </div>

        {/* Features Preview */}
        <div className="mb-4">
          <h4 className="font-semibold mb-2 text-sm text-primary-dark">Features</h4>
          <div className="text-xs text-secondary-dark">
            {isExpanded ? (
              <p className="leading-relaxed">{store.features}</p>
            ) : (
              <p className="line-clamp-2">{store.features}</p>
            )}
          </div>
        </div>

        {/* Expand/Collapse Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-xs h-8 mb-4"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Show More
            </>
          )}
        </Button>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleGetDirections}
            className="btn-primary flex-1 text-xs h-8"
            size="sm"
          >
            <Navigation className="h-3 w-3 mr-1" />
            Directions
          </Button>
          
          {store.location && (
            <Button
              onClick={() => {
                const url = `https://www.google.com/maps/search/${encodeURIComponent(store.name)}/@${store.location!.lat},${store.location!.lng},15z`;
                window.open(url, '_blank');
              }}
              variant="outline"
              size="sm"
              className="border-neutral text-secondary-dark hover:bg-neutral-50 text-xs h-8"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View
            </Button>
          )}
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-neutral">
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-secondary-dark">Store Type:</span>
                <span className="font-medium text-primary-dark">
                  {centralStoreService.getStoreTypeDisplay(store.storeType)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-dark">Distance:</span>
                <span className="font-medium text-primary-dark">{store.distance}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-dark">Rating:</span>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-warning text-warning" />
                  <span className="font-medium text-primary-dark">{store.rating}/5</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompactStoreCard;