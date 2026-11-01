import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { ToastProvider, useToast } from './design-system/Toast';
import { AuthProvider } from './context/AuthContext';
import AuthModal from './components/auth/AuthModal';
import DashboardView from './views/DashboardView';
import WasteDetectionView from './views/WasteDetectionView';
import AnalyticsView from './views/AnalyticsView';
import ScanHistoryView from './views/ScanHistoryView';
import SettingsView from './views/SettingsView';
import ShowcaseView from './views/ShowcaseView';
import ScanDetailModal from './components/ScanDetailModal';
import QuickScanModal from './components/QuickScanModal';
import { INITIAL_PREDICTION_HISTORY } from './data/mockData';
import { usePrediction } from './hooks/usePrediction';
import scanService from './services/scanService';
import { API_BASE_URL } from './services/api';
import { normalizeCategoryKey } from './design-system/tokens';
import { resolveImageUrl, formatTimeAgo } from './utils/formatters';

function AppContent() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedScanDetail, setSelectedScanDetail] = useState(null);
  const [isQuickScanOpen, setIsQuickScanOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Centralized hook managing backend health and model metadata
  const { isBackendOnline, modelInfo, checkBackendHealth } = usePrediction({
    autoCheckHealth: true,
  });

  // Shared prediction history state
  const [scansHistory, setScansHistory] = useState(INITIAL_PREDICTION_HISTORY);

  // Sync persistent scans from backend database
  const loadScans = React.useCallback(async () => {
    try {
      const response = await scanService.getScans({ page: 1, limit: 50 });
      if (response?.items && response.items.length > 0) {
        const dbScans = response.items.map((item) => {
          const rawCat = normalizeCategoryKey(item.predicted_class || 'plastic');
          const fullImg = resolveImageUrl(item.image_url);
          return {
            id: `SCN-${item.id.slice(0, 8)}`,
            scan_id: item.id,
            filename: item.filename,
            item: item.filename,
            predictedClass: item.predicted_class,
            category: rawCat,
            confidence: item.confidence,
            confidence_percentage: item.confidence_percentage,
            topPredictions: item.top_predictions || [],
            fileSize: item.weight_kg ? `${item.weight_kg} kg` : 'Standard Image',
            timestamp: item.created_at ? item.created_at.replace('T', ' ').substring(0, 16) : 'Recently',
            created_at: item.created_at,
            timeAgo: formatTimeAgo(item.created_at),
            destinationBin: item.destination_bin || 'Recycling Bin',
            imageUrl: fullImg,
            sampleImage: fullImg,
            isVerified: item.is_verified,
            verifiedBy: item.verified_by,
            notes: item.notes,
            weight_kg: item.weight_kg,
          };
        });
        setScansHistory(dbScans);
      }
    } catch (err) {
      console.warn('Unable to load persistent scans from DB, falling back to local history:', err);
    }
  }, []);

  React.useEffect(() => {
    loadScans();
  }, [loadScans, isBackendOnline]);

  // When a new image is analyzed on the Waste Detection page, prepend to history
  const handleNewPrediction = (newScan) => {
    setScansHistory((prev) => [newScan, ...prev]);
  };

  // Bulk delete from history and database
  const handleDeleteScans = async (idsToDelete) => {
    const idSet = new Set(idsToDelete);
    const toDeleteObjects = scansHistory.filter((s) => idSet.has(s.id));
    setScansHistory((prev) => prev.filter((s) => !idSet.has(s.id)));

    for (const scan of toDeleteObjects) {
      const rawId = scan.scan_id || (typeof scan.id === 'string' && scan.id.startsWith('SCN-') ? scan.id.replace('SCN-', '') : scan.id);
      if (rawId) {
        try {
          await scanService.deleteScan(rawId);
        } catch (e) {
          console.warn(`Could not delete scan ${rawId} from DB:`, e);
        }
      }
    }
  };

  // Bulk verification
  const handleVerifyScans = async (idsToVerify) => {
    const idSet = new Set(idsToVerify);
    const toVerifyObjects = scansHistory.filter((s) => idSet.has(s.id));

    setScansHistory((prev) =>
      prev.map((s) => (idSet.has(s.id) ? { ...s, isVerified: true } : s))
    );

    for (const scan of toVerifyObjects) {
      const rawId = scan.scan_id || (typeof scan.id === 'string' && scan.id.startsWith('SCN-') ? scan.id.replace('SCN-', '') : scan.id);
      if (rawId) {
        try {
          await scanService.verifyScan(rawId, {
            verified_class: scan.predictedClass || scan.category,
          });
        } catch (e) {
          console.warn(`Could not verify scan ${rawId} in DB:`, e);
        }
      }
    }
  };

  // Single scan verification from modal
  const handleVerifyScan = async (scan, verifiedClass, notes) => {
    const rawId = scan.scan_id || (typeof scan.id === 'string' && scan.id.startsWith('SCN-') ? scan.id.replace('SCN-', '') : scan.id);

    if (rawId) {
      try {
        await scanService.verifyScan(rawId, {
          verified_class: verifiedClass || scan.predictedClass || scan.category,
          notes: notes || '',
        });
      } catch (e) {
        console.warn('Backend verify call error:', e);
      }
    }

    setScansHistory((prev) =>
      prev.map((s) =>
        s.id === scan.id
          ? {
              ...s,
              isVerified: true,
              predictedClass: verifiedClass || s.predictedClass,
              category: normalizeCategoryKey(verifiedClass || s.predictedClass),
              notes: notes || s.notes,
            }
          : s
      )
    );

    toast.success(
      'Scan Verified',
      `${scan.filename || scan.item} classification confirmed in database.`
    );
  };

  return (
    <div className="min-h-screen bg-[#F7FAF8] text-slate-800 flex">
      {/* 1. Sidebar (Desktop static & Mobile drawer) */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        historyCount={scansHistory.length}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* 2. Top Navigation Bar */}
        <Topbar
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onOpenQuickScan={() => setIsQuickScanOpen(true)}
          onOpenSettings={() => setActiveTab('settings')}
          onNavigate={(tab) => setActiveTab(tab)}
          onSearch={(term) => {
            setGlobalSearch(term);
            setActiveTab('history');
          }}
          isBackendOnline={isBackendOnline}
        />

        {/* 3. Primary Page Switcher */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* PAGE 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <DashboardView
              predictions={scansHistory}
              onSelectScan={(scan) => setSelectedScanDetail(scan)}
              onNavigate={(tab) => setActiveTab(tab)}
              modelInfo={modelInfo}
              isBackendOnline={isBackendOnline}
              onRefreshScans={loadScans}
            />
          )}

          {/* PAGE 2: WASTE DETECTION */}
          {activeTab === 'detection' && (
            <WasteDetectionView onNewPrediction={handleNewPrediction} />
          )}

          {/* PAGE 3: ANALYTICS */}
          {activeTab === 'analytics' && <AnalyticsView modelInfo={modelInfo} />}

          {/* PAGE 4: SCAN HISTORY */}
          {activeTab === 'history' && (
            <ScanHistoryView
              scans={scansHistory}
              onDeleteScans={handleDeleteScans}
              onSelectScan={(scan) => setSelectedScanDetail(scan)}
              onVerifyScans={handleVerifyScans}
              initialSearch={globalSearch}
            />
          )}

          {/* System Settings & Design System Living Catalog */}
          {activeTab === 'settings' && <SettingsView />}
          {activeTab === 'showcase' && <ShowcaseView />}
        </main>
      </div>

      {/* Global Modals */}
      <ScanDetailModal
        scan={selectedScanDetail}
        isOpen={Boolean(selectedScanDetail)}
        onClose={() => setSelectedScanDetail(null)}
        onVerify={handleVerifyScan}
      />

      <QuickScanModal
        isOpen={isQuickScanOpen}
        onClose={() => setIsQuickScanOpen(false)}
        onScanComplete={handleNewPrediction}
      />

      <AuthModal />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
