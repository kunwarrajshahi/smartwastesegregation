import React, { useState, useEffect } from 'react';
import {
  Recycle,
  Cpu,
  Layers,
  FileImage,
  Sparkles,
  RefreshCw,
  Download,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../design-system/StatCard';
import Button from '../design-system/Button';
import { useToast } from '../design-system/Toast';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import SupportedCategoriesGrid from '../components/dashboard/SupportedCategoriesGrid';
import WeeklyActivityChart from '../components/dashboard/WeeklyActivityChart';
import CategoryDistributionChart from '../components/dashboard/CategoryDistributionChart';
import RecentPredictionsList from '../components/dashboard/RecentPredictionsList';
import { DATASET_METRICS } from '../../src/data/mockData';
import { getOverview, downloadCsvExport } from '../services/analyticsService';

export const DashboardView = ({
  predictions = [],
  onSelectScan,
  onNavigate,
  modelInfo,
  isBackendOnline,
  onRefreshScans,
}) => {
  const toast = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [overview, setOverview] = useState(null);

  const fetchMetrics = async () => {
    try {
      const data = await getOverview();
      if (data) {
        setOverview(data);
      }
    } catch (err) {
      console.warn('Could not fetch dashboard overview:', err);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchMetrics(),
        onRefreshScans ? onRefreshScans() : Promise.resolve(),
      ]);
      toast.success(
        'Telemetry Refreshed',
        'Updated dataset metrics and live classification streams from the database.'
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = async () => {
    try {
      await downloadCsvExport();
      toast.success(
        'Report Exported',
        'Waste segregation summary exported to CSV format.'
      );
    } catch (err) {
      toast.error('Export Error', err.message || 'Could not export report.');
    }
  };

  const totalClassified = overview?.total_scans
    ? (4752 + overview.total_scans).toLocaleString()
    : DATASET_METRICS.totalImagesClassified.value;

  const accuracyVal = modelInfo?.saved_validation_accuracy
    ? `${modelInfo.saved_validation_accuracy.toFixed(1)}%`
    : DATASET_METRICS.modelAccuracy.value;

  const totalRecyclableVal = overview?.diverted_weight_kg
    ? `${overview.diverted_weight_kg} kg`
    : DATASET_METRICS.totalRecyclableWaste.value;

  const diversionSubtext = overview?.landfill_diversion_rate
    ? `${overview.landfill_diversion_rate}% diversion rate`
    : DATASET_METRICS.totalRecyclableWaste.change;

  const supportedClassesCount = modelInfo?.total_classes
    ? String(modelInfo.total_classes)
    : DATASET_METRICS.supportedCategoriesCount.value;

  return (
    <div className="space-y-7">
      {/* 1. Page Header */}
      <PageHeader
        title="Municipal Waste Segregation Dashboard"
        subtitle="Real-time computer vision classification, material diversion metrics, and edge sorter telemetry."
        badge={
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              isBackendOnline === true
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : isBackendOnline === false
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-forest-50 border-forest-200 text-forest-800'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isBackendOnline === true
                  ? 'bg-emerald-500 animate-pulse'
                  : isBackendOnline === false
                  ? 'bg-rose-500'
                  : 'bg-slate-400'
              }`}
            />
            {isBackendOnline === true
              ? `FastAPI Backend Online • ${modelInfo?.model_architecture || 'ResNet18'} Active`
              : isBackendOnline === false
              ? 'FastAPI Server Offline (port 8000)'
              : 'Checking Backend API...'}
          </div>
        }
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              leftIcon={RefreshCw}
              isLoading={isRefreshing}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={Download}
              onClick={handleExport}
            >
              Export Metrics
            </Button>
          </>
        }
      />

      {/* 2. Welcome Section with AI-Powered Message & Quick Scan Action */}
      <WelcomeBanner onScanClick={() => onNavigate('detection')} />

      {/* 3. Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title={DATASET_METRICS.totalImagesClassified.title}
          value={totalClassified}
          unit={DATASET_METRICS.totalImagesClassified.unit}
          change={overview?.total_scans ? `+${overview.total_scans} in DB` : DATASET_METRICS.totalImagesClassified.change}
          changeType={DATASET_METRICS.totalImagesClassified.changeType}
          period={overview?.total_scans ? 'Live DB + Benchmark' : DATASET_METRICS.totalImagesClassified.period}
          icon={FileImage}
          progress={DATASET_METRICS.totalImagesClassified.progress}
        />

        <StatCard
          variant="forest"
          title={DATASET_METRICS.modelAccuracy.title}
          value={accuracyVal}
          unit={DATASET_METRICS.modelAccuracy.unit}
          change={DATASET_METRICS.modelAccuracy.change}
          changeType={DATASET_METRICS.modelAccuracy.changeType}
          period={DATASET_METRICS.modelAccuracy.period}
          icon={Cpu}
          progress={DATASET_METRICS.modelAccuracy.progress}
          tooltip={`${modelInfo?.model_architecture || 'ResNet18'} / 9 classes`}
        />

        <StatCard
          title={DATASET_METRICS.totalRecyclableWaste.title}
          value={totalRecyclableVal}
          unit={overview?.diverted_weight_kg ? '' : DATASET_METRICS.totalRecyclableWaste.unit}
          change={diversionSubtext}
          changeType={DATASET_METRICS.totalRecyclableWaste.changeType}
          period={DATASET_METRICS.totalRecyclableWaste.period}
          icon={Recycle}
          progress={DATASET_METRICS.totalRecyclableWaste.progress}
        />

        <StatCard
          title={DATASET_METRICS.supportedCategoriesCount.title}
          value={supportedClassesCount}
          unit={DATASET_METRICS.supportedCategoriesCount.unit}
          change={DATASET_METRICS.supportedCategoriesCount.change}
          changeType={DATASET_METRICS.supportedCategoriesCount.changeType}
          period={DATASET_METRICS.supportedCategoriesCount.period}
          icon={Layers}
          progress={DATASET_METRICS.supportedCategoriesCount.progress}
        />
      </div>

      {/* 4. Supported Waste Categories Showcase (All 9 Categories) */}
      <SupportedCategoriesGrid onCategoryClick={() => onNavigate('detection')} />

      {/* 5. Charts Grid: Weekly Activity + Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <WeeklyActivityChart />
        </div>
        <div className="lg:col-span-5">
          <CategoryDistributionChart />
        </div>
      </div>

      {/* 6. Recent Prediction History Table */}
      <RecentPredictionsList
        predictions={predictions}
        onSelectScan={onSelectScan}
        onViewAllClick={() => onNavigate('history')}
        isBackendOnline={isBackendOnline}
        onRefreshScans={onRefreshScans}
      />
    </div>
  );
};

export default DashboardView;
