import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NearbyStore } from '@/services/overpassService';
import { getStoreImageUrl, getStoreTheme, STORE_BRANDS } from '@/services/storeImageService';

/**
 * Demo component to showcase store images for different types and brands
 * This can be used for development/testing purposes
 */
export const StoreImageDemo: React.FC = () => {
  // Sample stores for demonstration
  const demoStores: NearbyStore[] = [
    {
      id: '1',
      name: 'Walmart Supercenter',
      storeType: 'hypermarket',
      latitude: 0,
      longitude: 0,
      distance: 1200,
      address: '123 Main St, Anytown, USA'
    },
    {
      id: '2', 
      name: 'Target',
      storeType: 'supermarket',
      latitude: 0,
      longitude: 0,
      distance: 850,
      address: '456 Shopping Blvd, Anytown, USA'
    },
    {
      id: '3',
      name: 'Whole Foods Market',
      storeType: 'organic',
      latitude: 0,
      longitude: 0,
      distance: 2100,
      address: '789 Organic Ave, Anytown, USA'
    },
    {
      id: '4',
      name: '7-Eleven',
      storeType: 'convenience',
      latitude: 0,
      longitude: 0,
      distance: 300,
      address: '321 Quick Stop Rd, Anytown, USA'
    },
    {
      id: '5',
      name: 'Fresh Market',
      storeType: 'grocery',
      latitude: 0,
      longitude: 0,
      distance: 1800,
      address: '654 Fresh Foods Way, Anytown, USA'
    },
    {
      id: '6',
      name: 'Costco Wholesale',
      storeType: 'hypermarket',
      latitude: 0,
      longitude: 0,
      distance: 3200,
      address: '987 Wholesale Dr, Anytown, USA'
    }
  ];

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          🏪 Store Image Showcase
        </CardTitle>
        <p className="text-center text-secondary-dark">
          Beautiful vector images for different store types and brands
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {demoStores.map((store) => {
            const imageUrl = getStoreImageUrl(store, 80);
            const theme = getStoreTheme(store);
            
            return (
              <div 
                key={store.id}
                className="flex flex-col items-center space-y-3 p-4 rounded-lg border border-neutral/20 hover:shadow-professional-md transition-all duration-300"
                style={{ backgroundColor: theme.backgroundColor }}
              >
                <img 
                  src={imageUrl}
                  alt={`${store.name} icon`}
                  className="w-20 h-20 rounded-xl shadow-professional-sm"
                />
                <div className="text-center">
                  <h4 className="font-semibold text-primary-dark text-sm truncate max-w-full">
                    {store.name}
                  </h4>
                  <p 
                    className="text-xs font-medium mt-1"
                    style={{ color: theme.color }}
                  >
                    {store.storeType}
                  </p>
                  <p className="text-xs text-secondary-dark mt-1">
                    {(store.distance / 1000).toFixed(1)} km
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Brand Colors Reference */}
        <div className="mt-8 pt-6 border-t border-neutral">
          <h3 className="text-lg font-semibold mb-4 text-center">Brand Color Palette</h3>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {STORE_BRANDS.slice(0, 12).map((brand, index) => (
              <div key={index} className="text-center">
                <div 
                  className="w-12 h-12 rounded-lg mx-auto mb-2 shadow-professional-sm"
                  style={{ backgroundColor: brand.color }}
                />
                <p className="text-xs font-medium text-secondary-dark">
                  {brand.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-6 p-4 bg-neutral-50 rounded-lg border border-neutral">
          <h4 className="font-semibold text-primary-dark mb-2">✨ Features</h4>
          <ul className="text-sm text-secondary-dark space-y-1">
            <li>• <strong>Dynamic SVG Generation:</strong> Beautiful vector images generated on-demand</li>
            <li>• <strong>Brand Recognition:</strong> Automatic detection of major store chains</li>
            <li>• <strong>Consistent Theming:</strong> Colors match brand identity or store type</li>
            <li>• <strong>Scalable Icons:</strong> Perfect at any size (16px to 512px+)</li>
            <li>• <strong>Lightweight:</strong> Base64-encoded SVGs for fast loading</li>
            <li>• <strong>Fallback Support:</strong> Generic icons for unknown stores</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};