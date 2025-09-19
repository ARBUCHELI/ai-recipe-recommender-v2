import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Info } from 'lucide-react';

interface ConfigItem {
  name: string;
  value: string | undefined;
  required: boolean;
  description: string;
}

export const DevConfigHelper: React.FC = () => {
  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  const configs: ConfigItem[] = [
    {
      name: 'API Base URL',
      value: import.meta.env.VITE_API_BASE_URL,
      required: true,
      description: 'Backend API endpoint'
    },
    {
      name: 'Google Client ID',
      value: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      required: false,
      description: 'Google OAuth Client ID for Google Sign-In'
    }
  ];

  const hasIssues = configs.some(config => config.required && !config.value);

  return (
    <div className="fixed bottom-4 right-4 max-w-sm z-50">
      <Card className="border-orange-200 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="h-4 w-4" />
            Dev Configuration Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {configs.map((config) => (
            <div key={config.name} className="flex items-center gap-2 text-xs">
              {config.value ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className={`h-3 w-3 ${config.required ? 'text-red-500' : 'text-yellow-500'}`} />
              )}
              <span className="font-medium">{config.name}:</span>
              <span className={config.value ? 'text-green-600' : 'text-gray-500'}>
                {config.value ? '✓' : 'Not set'}
              </span>
            </div>
          ))}
          
          {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <Alert className="mt-2">
              <AlertDescription className="text-xs">
                <strong>Google Sign-In disabled:</strong> Add VITE_GOOGLE_CLIENT_ID to .env to enable Google OAuth.
                <br />
                <a 
                  href="https://console.cloud.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Get Google Client ID →
                </a>
              </AlertDescription>
            </Alert>
          )}
          
          {import.meta.env.VITE_GOOGLE_CLIENT_ID === 'demo-client-id.apps.googleusercontent.com' && (
            <Alert className="mt-2 border-blue-200 bg-blue-50">
              <AlertDescription className="text-xs text-blue-800">
                <strong>🎭 Demo Mode:</strong> Google Sign-In is in demo mode. 
                You can test the UI flow, but it won't connect to real Google services.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};