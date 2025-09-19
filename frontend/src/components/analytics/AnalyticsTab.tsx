import React, { useState } from 'react';
import { BarChart3, Target, FileText, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ProgressTracker } from './ProgressTracker';
import { NutritionReports } from './NutritionReports';
import { NutritionEntryModal } from './NutritionEntryModal';
import { useTranslation } from '@/contexts/TranslationContext';

export const AnalyticsTab: React.FC = () => {
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary-dark">{t('analytics.title')}</h1>
        <p className="text-secondary-dark mt-1">
          {t('analytics.subtitle')}
        </p>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 lg:w-[500px] bg-white shadow-sm border">
          <TabsTrigger 
            value="dashboard" 
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">{t('analytics.dashboard')}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="progress" 
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">{t('analytics.progress')}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="reports" 
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">{t('analytics.reports')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <AnalyticsDashboard key={`dashboard-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary-dark mb-2">{t('analytics.progressTracking')}</h2>
            <p className="text-secondary-dark">
              {t('analytics.progressSubtitle')}
            </p>
          </div>
          <ProgressTracker key={`progress-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <NutritionReports key={`reports-${refreshKey}`} />
        </TabsContent>
      </Tabs>

      {/* Nutrition Entry Modal */}
      <NutritionEntryModal
        isOpen={showEntryModal}
        onClose={() => setShowEntryModal(false)}
        onEntryAdded={async (entry) => {
          console.log('Entry added in AnalyticsTab, refreshing all components...', entry);
          setShowEntryModal(false);
          // Force all components to refresh by updating the key
          setRefreshKey(prev => prev + 1);
        }}
      />
    </div>
  );
};