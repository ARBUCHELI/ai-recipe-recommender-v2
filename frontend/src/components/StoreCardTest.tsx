import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StoreCard } from './StoreCard';
import { NearbyStore } from '@/services/overpassService';

/**
 * Test component to verify StoreCard improvements:
 * 1. Call button functionality with various phone number formats
 * 2. Distance badge visibility with different background colors
 */
export const StoreCardTest: React.FC = () => {
  // Test stores with different scenarios
  const testStores: NearbyStore[] = [
    {
      id: '1',
      name: 'Test Store with Phone',
      storeType: 'supermarket',
      latitude: 40.7128,
      longitude: -74.0060,
      distance: 1200,
      address: '123 Test St, Test City, TC 12345',
      phone: '+1 (555) 123-4567', // Formatted phone number
      website: 'https://example.com'
    },
    {
      id: '2',
      name: 'Store with Unformatted Phone',
      storeType: 'convenience',
      latitude: 40.7128,
      longitude: -74.0060,
      distance: 800,
      address: '456 Another St, Test City, TC 12345',
      phone: '555.987.6543', // Different format
    },
    {
      id: '3',
      name: 'Store with International Phone',
      storeType: 'organic',
      latitude: 40.7128,
      longitude: -74.0060,
      distance: 2100,
      address: '789 International Ave, Test City, TC 12345',
      phone: '+44 20 7123 4567', // International format
    },
    {
      id: '4',
      name: 'Store No Phone',
      storeType: 'grocery',
      latitude: 40.7128,
      longitude: -74.0060,
      distance: 1500,
      address: '321 No Phone St, Test City, TC 12345',
      // No phone number
    },
    {
      id: '5',
      name: 'Walmart Supercenter', // This will have Walmart blue background
      storeType: 'hypermarket',
      latitude: 40.7128,
      longitude: -74.0060,
      distance: 3400, // Longer distance to test visibility
      address: '999 Walmart Way, Test City, TC 12345',
      phone: '1-800-WALMART',
    },
    {
      id: '6',
      name: 'Target Store', // This will have Target red background
      storeType: 'supermarket',
      latitude: 40.7128,
      longitude: -74.0060,
      distance: 950, // Short distance
      address: '555 Target Circle, Test City, TC 12345',
      phone: '1-800-TARGET1',
    }
  ];

  const userLocation = {
    latitude: 40.7128,
    longitude: -74.0060,
    accuracy: 10
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          📞 Store Card Testing
        </CardTitle>
        <p className="text-center text-secondary-dark">
          Testing call functionality and distance badge visibility improvements
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {testStores.map((store) => (
            <div key={store.id}>
              <h3 className="text-sm font-semibold text-secondary-dark mb-2 px-2">
                Test Case: {store.phone ? 'Has Phone' : 'No Phone'} - {store.name}
              </h3>
              <StoreCard
                store={store}
                userLocation={userLocation}
                onGetDirections={(store) => console.log('🧭 Directions to:', store.name)}
              />
            </div>
          ))}
        </div>
        
        {/* Testing Instructions */}
        <div className="mt-8 p-6 bg-neutral-50 rounded-lg border border-neutral">
          <h3 className="text-lg font-semibold mb-4 text-primary-dark">🧪 Testing Instructions</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-secondary-dark mb-2">📞 Call Button Testing:</h4>
              <ul className="text-sm text-secondary-dark space-y-1 ml-4">
                <li>• <strong>With Phone:</strong> Should open phone app or dialer</li>
                <li>• <strong>Different Formats:</strong> Should clean and format phone numbers</li>
                <li>• <strong>International:</strong> Should handle international numbers</li>
                <li>• <strong>No Phone:</strong> Should show error message</li>
                <li>• <strong>Fallback:</strong> Should copy to clipboard if calling fails</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-secondary-dark mb-2">👁️ Distance Badge Visibility:</h4>
              <ul className="text-sm text-secondary-dark space-y-1 ml-4">
                <li>• <strong>Contrast:</strong> Text should be readable on all backgrounds</li>
                <li>• <strong>Border:</strong> White border should separate badge from image</li>
                <li>• <strong>Size:</strong> Slightly larger badge for better visibility</li>
                <li>• <strong>Colors:</strong> Different brand colors should all work</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-info/10 rounded border border-info/20">
            <p className="text-sm text-info-dark">
              <strong>💡 Tip:</strong> Open browser console to see detailed logging of call attempts
            </p>
          </div>
        </div>
        
        {/* Expected Improvements */}
        <div className="mt-6 p-6 bg-success/5 rounded-lg border border-success/20">
          <h3 className="text-lg font-semibold mb-3 text-success-dark">✅ Improvements Made</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-success-dark mb-2">Call Button Fixes:</h4>
              <ul className="text-sm text-success-dark space-y-1">
                <li>✓ Enhanced phone number cleaning</li>
                <li>✓ Multiple fallback methods</li>
                <li>✓ Toast notifications for user feedback</li>
                <li>✓ Clipboard fallback for failed calls</li>
                <li>✓ Better error handling</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-success-dark mb-2">Distance Badge Fixes:</h4>
              <ul className="text-sm text-success-dark space-y-1">
                <li>✓ Dynamic contrast color calculation</li>
                <li>✓ White border for separation</li>
                <li>✓ Increased size (w-7 h-7)</li>
                <li>✓ Enhanced shadow for depth</li>
                <li>✓ Works with all brand colors</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};