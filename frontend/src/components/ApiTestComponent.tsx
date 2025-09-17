import React from 'react';
import { Button } from '@/components/ui/button';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const ApiTestComponent: React.FC = () => {
  const testHealthEndpoint = async () => {
    try {
      console.log('🧪 Testing health endpoint...');
      console.log('📡 API URL:', API_BASE_URL);
      
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Health check success:', data);
      alert('Health check successful! Check console for details.');
    } catch (error) {
      console.error('❌ Health check failed:', error);
      alert(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testRegistration = async () => {
    try {
      console.log('🧪 Testing registration endpoint...');
      
      const testData = {
        name: 'Debug User',
        email: `debug-${Date.now()}@test.com`,
        password: 'password123'
      };

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Registration success:', data);
      alert('Registration test successful! Check console for details.');
    } catch (error) {
      console.error('❌ Registration test failed:', error);
      alert(`Registration test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <Button 
        onClick={testHealthEndpoint}
        variant="outline"
        size="sm"
        className="bg-blue-100 hover:bg-blue-200"
      >
        🧪 Test Health API
      </Button>
      <Button 
        onClick={testRegistration}
        variant="outline"
        size="sm"
        className="bg-green-100 hover:bg-green-200"
      >
        🧪 Test Registration API
      </Button>
      <div className="text-xs text-muted-foreground">
        API: {API_BASE_URL}
      </div>
    </div>
  );
};