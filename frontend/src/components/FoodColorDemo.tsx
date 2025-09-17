import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NearbyStore } from '@/services/overpassService';
import { getStoreImageUrl, getStoreTheme } from '@/services/storeImageService';

/**
 * Demo component to showcase the new food-inspired color palette
 */
export const FoodColorDemo: React.FC = () => {
  // Sample stores showcasing the new delicious food colors
  const demoStores: NearbyStore[] = [
    {
      id: '1',
      name: 'Walmart Supercenter',
      storeType: 'hypermarket',
      latitude: 0,
      longitude: 0,
      distance: 1200,
      address: '123 Main St'
    },
    {
      id: '2',
      name: 'Target',
      storeType: 'supermarket',
      latitude: 0,
      longitude: 0,
      distance: 850,
      address: '456 Shopping Blvd'
    },
    {
      id: '3',
      name: 'Whole Foods Market',
      storeType: 'organic',
      latitude: 0,
      longitude: 0,
      distance: 2100,
      address: '789 Organic Ave'
    },
    {
      id: '4',
      name: 'Fresh Market',
      storeType: 'grocery',
      latitude: 0,
      longitude: 0,
      distance: 1500,
      address: '321 Fresh St'
    },
    {
      id: '5',
      name: '7-Eleven',
      storeType: 'convenience',
      latitude: 0,
      longitude: 0,
      distance: 300,
      address: '654 Quick Stop Rd'
    },
    {
      id: '6',
      name: 'ALDI',
      storeType: 'supermarket',
      latitude: 0,
      longitude: 0,
      distance: 1800,
      address: '987 Discount Way'
    }
  ];

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          🍯 New Food-Inspired Color Palette
        </CardTitle>
        <p className="text-center text-secondary-dark">
          Beautiful, delicious colors that match your app's warm, food-inspired theme
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* Color Philosophy */}
        <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
          <h3 className="text-lg font-semibold text-amber-800 mb-3">🎨 Color Philosophy</h3>
          <p className="text-amber-700 mb-4">
            We've replaced the harsh blues and reds with warm, appetizing colors inspired by fresh, delicious foods:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-amber-800 mb-2">Before (Cold Colors):</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>❌ Harsh electric blue</li>
                <li>❌ Aggressive bright red</li>
                <li>❌ Cold purple colors</li>
                <li>❌ Corporate, sterile colors</li>
                <li>❌ No connection to food</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-amber-800 mb-2">After (Natural Food Colors):</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>✅ Warm honey & caramel</li>
                <li>✅ Fresh herb greens</li>
                <li>✅ Rich chocolate browns</li>
                <li>✅ Warm cinnamon spices</li>
                <li>✅ Natural, appetizing colors</li>
              </ul>
            </div>
          </div>
        </div>

        {/* New Color Swatches */}
        <div>
          <h3 className="text-lg font-semibold mb-4">🌈 New Food-Inspired Colors</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'Honey Amber', color: '#d97706', food: 'Golden honey' },
              { name: 'Carrot Orange', color: '#ea580c', food: 'Fresh carrots' },
              { name: 'Spinach Green', color: '#16a34a', food: 'Fresh spinach' },
              { name: 'Lime Green', color: '#84cc16', food: 'Lime zest' },
              { name: 'Chocolate Brown', color: '#92400e', food: 'Rich chocolate' },
              { name: 'Caramel Brown', color: '#a16207', food: 'Golden caramel' },
              { name: 'Cinnamon Spice', color: '#c2410c', food: 'Warm cinnamon' },
              { name: 'Pumpkin Orange', color: '#f97316', food: 'Pumpkin spice' },
              { name: 'Olive Green', color: '#65a30d', food: 'Green olives' },
              { name: 'Sage Green', color: '#15803d', food: 'Fresh sage' },
              { name: 'Seafoam Teal', color: '#0891b2', food: 'Ocean herbs' },
              { name: 'Forest Green', color: '#059669', food: 'Fresh herbs' }
            ].map((swatch, index) => (
              <div key={index} className="text-center">
                <div 
                  className="w-16 h-16 rounded-xl mx-auto mb-2 shadow-lg border border-white"
                  style={{ backgroundColor: swatch.color }}
                />
                <p className="text-xs font-semibold text-gray-800">{swatch.name}</p>
                <p className="text-xs text-gray-600">{swatch.food}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Store Icons Showcase */}
        <div>
          <h3 className="text-lg font-semibold mb-4">🏪 Store Icons with New Colors</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {demoStores.map((store) => {
              const imageUrl = getStoreImageUrl(store, 80);
              const theme = getStoreTheme(store);
              
              return (
                <div key={store.id} className="text-center">
                  <div className="relative">
                    <img 
                      src={imageUrl}
                      alt={`${store.name} icon`}
                      className="w-20 h-20 mx-auto rounded-xl shadow-lg"
                      style={{ backgroundColor: theme.backgroundColor }}
                    />
                    {/* New Grey Distance Badge */}
                    <div 
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2"
                      style={{ 
                        backgroundColor: '#374151', // Dark grey
                        color: '#ffffff', // White text
                        borderColor: '#6b7280' // Medium grey border
                      }}
                    >
                      {(store.distance / 1000).toFixed(1)}
                    </div>
                  </div>
                  <p className="text-sm font-semibold mt-2 text-gray-800">{store.name}</p>
                  <Badge 
                    className="text-xs mt-1"
                    style={{ 
                      backgroundColor: theme.backgroundColor,
                      color: theme.color,
                      borderColor: theme.color
                    }}
                  >
                    {store.storeType}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distance Badge Showcase */}
        <div className="p-6 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">📍 New Subtle Distance Badge</h3>
          <div className="flex items-center justify-center space-x-6">
            <div className="text-center">
              <h4 className="font-medium text-gray-800 mb-2">Before: Bright Red</h4>
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg border-2 border-white mx-auto"
                style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
              >
                1.2
              </div>
              <p className="text-xs text-gray-600 mt-2">Too aggressive</p>
            </div>
            
            <div className="text-4xl text-gray-400">→</div>
            
            <div className="text-center">
              <h4 className="font-medium text-gray-800 mb-2">After: Subtle Grey</h4>
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg border-2 mx-auto"
                style={{ 
                  backgroundColor: '#374151',
                  color: '#ffffff',
                  borderColor: '#6b7280'
                }}
              >
                1.2
              </div>
              <p className="text-xs text-gray-600 mt-2">Professional & subtle</p>
            </div>
          </div>
        </div>

        {/* Benefits Summary */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-3">✅ What's Improved</h4>
            <ul className="text-sm text-green-700 space-y-2">
              <li>🍯 <strong>Natural food colors:</strong> Honey, herbs, chocolate, caramel</li>
              <li>🎨 <strong>Warmer palette:</strong> Matches your app's cozy, food theme</li>
              <li>👁️ <strong>Better readability:</strong> Improved contrast and visibility</li>
              <li>🎯 <strong>Subtle distance badges:</strong> Less distracting, more professional</li>
              <li>✨ <strong>Consistent theming:</strong> Harmonizes with your brand orange</li>
            </ul>
          </div>
          
          <div className="p-6 bg-amber-50 rounded-lg border border-amber-200">
            <h4 className="font-semibold text-amber-800 mb-3">🍳 Food Color Inspiration</h4>
            <ul className="text-sm text-amber-700 space-y-2">
              <li>🍯 <strong>Amber:</strong> Golden honey and caramel</li>
              <li>🥕 <strong>Orange:</strong> Fresh carrots and pumpkins</li>
              <li>🥬 <strong>Green:</strong> Spinach, herbs, sage, and limes</li>
              <li>🍫 <strong>Brown:</strong> Rich chocolate and coffee</li>
              <li>🌿 <strong>Teal:</strong> Ocean herbs and seafoam</li>
              <li>🥨 <strong>Cinnamon:</strong> Warm baking spices</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};