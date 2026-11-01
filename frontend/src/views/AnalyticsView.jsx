import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Button from '../design-system/Button';
import { useToast } from '../design-system/Toast';
import RecyclableVersusNonRecyclable from '../components/analytics/RecyclableVersusNonRecyclable';
import CategoryVolumeBarChart from '../components/analytics/CategoryVolumeBarChart';
import DailyScanTrendsChart from '../components/analytics/DailyScanTrendsChart';
import ModelPerformanceOverview from '../components/analytics/ModelPerformanceOverview';
import EnvironmentalImpactCard from '../components/analytics/EnvironmentalImpactCard';
import { downloadCsvExport } from '../services/analyticsService';
import { Download, Calendar, Sparkles } from 'lucide-react';

export const AnalyticsView = ({ modelInfo }) => {
  const toast = useToast();
  const [timeRange, setTimeRange] = useState('7d');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadCsvExport();
      toast.success('Analytics Exported', 'Downloaded persistent database telemetry and metrics to CSV.');
    } catch (err) {
      toast.error('Export Failed', err.message || 'Could not export database records.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Waste Segregation Analytics"
        subtitle="In-depth material stream distribution, recyclable vs non-recyclable ratios, and ResNet18 model performance metrics."
        breadcrumbs={['EcoSort AI', 'Reporting', 'Analytics']}
        actions={
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
              {['24h', '7d', '30d', 'All'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    timeRange === range
                      ? 'bg-white text-forest-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={Download}
              onClick={handleExport}
            >
              Export Report
            </Button>
          </div>
        }
      />

      {/* 1. Recyclable vs Non-Recyclable Macro Distribution */}
      <RecyclableVersusNonRecyclable />

      {/* 2. Charts Grid: Category-wise Bar Chart & Daily Scan Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryVolumeBarChart />
        <DailyScanTrendsChart timeRange={timeRange} />
      </div>

      {/* 3. Documented Environmental Impact & Landfill Diversion */}
      <EnvironmentalImpactCard />

      {/* 4. ResNet18 Model Performance Overview */}
      <ModelPerformanceOverview modelInfo={modelInfo} />
    </div>
  );
};

export default AnalyticsView;
