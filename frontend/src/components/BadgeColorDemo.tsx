import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BADGE_COLOR_SCHEMES, getBadgeStyles, getDistanceBasedBadgeScheme } from '@/utils/badgeColorSchemes';
import { getStoreImageUrl, getStoreTheme } from '@/services/storeImageService';
import { NearbyStore } from '@/services/overpassService';

/**
 * Demo component to showcase different distance badge color schemes
 */
export const BadgeColorDemo: React.FC = () => {
  const [selectedScheme, setSelectedScheme] = useState(0);
  
  // Sample store for demonstration
  const demoStore: NearbyStore = {
    id: '1',
    name: 'Sample Supermarket',
    storeType: 'supermarket',
    latitude: 0,
    longitude: 0,
    distance: 1200,
    address: '123 Demo St, Test City'
  };

  const storeImageUrl = getStoreImageUrl(demoStore, 80);
  const storeTheme = getStoreTheme(demoStore);

  // Different background scenarios to test visibility
  const backgroundScenarios = [
    { name: 'Light', color: '#f8fafc', description: 'Light gray background' },
    { name: 'Medium', color: '#64748b', description: 'Medium gray background' },
    { name: 'Dark', color: '#1e293b', description: 'Dark background' },
    { name: 'Blue', color: '#3b82f6', description: 'Blue background (like Walmart)' },
    { name: 'Red', color: '#ef4444', description: 'Red background (like Target)' },
    { name: 'Green', color: '#10b981', description: 'Green background (like Whole Foods)' },
  ];

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          🎨 Distance Badge Color Schemes
        </CardTitle>
        <p className="text-center text-secondary-dark">
          Choose the perfect color for maximum visibility on your store cards
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* Color Scheme Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Available Color Schemes:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {BADGE_COLOR_SCHEMES.map((scheme, index) => (
              <Button
                key={index}
                onClick={() => setSelectedScheme(index)}
                variant={selectedScheme === index ? "default" : "outline"}
                className="flex items-center gap-2 h-auto p-3"
              >
                <div 
                  className="w-4 h-4 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: scheme.backgroundColor }}
                />
                <span className="text-sm font-medium">{scheme.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Selected Scheme Details */}
        <div className="p-4 bg-neutral-50 rounded-lg border">
          <h4 className="font-semibold text-primary-dark mb-2">
            Selected: {BADGE_COLOR_SCHEMES[selectedScheme].name}
          </h4>
          <p className="text-sm text-secondary-dark mb-3">
            {BADGE_COLOR_SCHEMES[selectedScheme].description}
          </p>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span>Background: {BADGE_COLOR_SCHEMES[selectedScheme].backgroundColor}</span>
            <span>Text: {BADGE_COLOR_SCHEMES[selectedScheme].textColor}</span>
            <span>Border: {BADGE_COLOR_SCHEMES[selectedScheme].borderColor}</span>
          </div>
        </div>

        {/* Visibility Test */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Visibility Test on Different Backgrounds:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {backgroundScenarios.map((bg, index) => (
              <div key={index} className="text-center">
                <div 
                  className="relative w-24 h-24 mx-auto rounded-xl border border-neutral/20"
                  style={{ backgroundColor: bg.color }}
                >
                  <img 
                    src={storeImageUrl}
                    alt="Store icon"
                    className="w-full h-full rounded-xl opacity-60"
                  />
                  <div 
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2"
                    style={getBadgeStyles(BADGE_COLOR_SCHEMES[selectedScheme])}
                  >
                    1.2
                  </div>
                </div>
                <p className="text-xs text-secondary-dark mt-2 font-medium">{bg.name}</p>
                <p className="text-xs text-muted-foreground">{bg.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Distance-Based Color Demo */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Distance-Based Colors (Optional Feature):</h3>
          <p className="text-sm text-secondary-dark mb-4">
            Automatically change badge color based on distance - closer stores get different colors to indicate proximity
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { distance: 300, label: 'Very Close (≤500m)' },
              { distance: 800, label: 'Close (≤1km)' },
              { distance: 1500, label: 'Medium (≤2km)' },
              { distance: 3000, label: 'Far (>2km)' }
            ].map((demo, index) => {
              const scheme = getDistanceBasedBadgeScheme(demo.distance);
              return (
                <div key={index} className="text-center">
                  <div className="relative w-20 h-20 mx-auto bg-neutral-100 rounded-xl border">
                    <img 
                      src={storeImageUrl}
                      alt="Store icon"
                      className="w-full h-full rounded-xl opacity-70"
                    />
                    <div 
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2"
                      style={getBadgeStyles(scheme)}
                    >
                      {(demo.distance / 1000).toFixed(1)}
                    </div>
                  </div>
                  <p className="text-xs font-medium mt-2">{demo.label}</p>
                  <Badge 
                    className="text-xs mt-1" 
                    style={{ 
                      backgroundColor: scheme.backgroundColor,
                      color: scheme.textColor
                    }}
                  >
                    {scheme.name}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Implementation Code */}
        <div className="p-4 bg-neutral-900 text-neutral-100 rounded-lg text-sm font-mono overflow-x-auto">
          <h4 className="text-neutral-300 mb-3 font-sans font-semibold">Current Implementation:</h4>
          <pre>{`// Current: Fixed Bright Red
<div 
  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full..."
  style={{
    backgroundColor: '${BADGE_COLOR_SCHEMES[selectedScheme].backgroundColor}',
    color: '${BADGE_COLOR_SCHEMES[selectedScheme].textColor}',
    borderColor: '${BADGE_COLOR_SCHEMES[selectedScheme].borderColor}'
  }}
>
  {distance}
</div>`}</pre>
        </div>

        {/* Recommendations */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-success/5 rounded-lg border border-success/20">
            <h4 className="font-semibold text-success-dark mb-2">✅ Recommended</h4>
            <ul className="text-sm text-success-dark space-y-1">
              <li>• <strong>Bright Red:</strong> Maximum visibility, works everywhere</li>
              <li>• <strong>Electric Blue:</strong> Professional, complements most brands</li>
              <li>• <strong>Semi-Transparent Dark:</strong> Adapts to any background</li>
            </ul>
          </div>
          
          <div className="p-4 bg-info/5 rounded-lg border border-info/20">
            <h4 className="font-semibold text-info-dark mb-2">💡 Pro Tips</h4>
            <ul className="text-sm text-info-dark space-y-1">
              <li>• Test on your actual store images</li>
              <li>• Consider your app's brand colors</li>
              <li>• Distance-based colors add visual hierarchy</li>
              <li>• White borders ensure separation</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};