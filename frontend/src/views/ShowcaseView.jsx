import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Layers,
  ArrowRight,
  Eye,
  Trash2,
  Download,
  Plus,
  Play,
  Recycle,
  Cpu,
  BarChart2,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../design-system/Card';
import Button from '../design-system/Button';
import Badge, { ConfidenceBadge } from '../design-system/Badge';
import StatCard from '../design-system/StatCard';
import { Table } from '../design-system/Table';
import { Modal, ConfirmModal } from '../design-system/Modal';
import { Skeleton, StatCardSkeleton, TableSkeleton, ChartSkeleton } from '../design-system/Skeleton';
import { useToast } from '../design-system/Toast';
import { WASTE_CATEGORIES, STATUS_TYPES, COLORS } from '../design-system/tokens';

export const ShowcaseView = () => {
  const toast = useToast();

  // Interactive showcase state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showGeneralModal, setShowGeneralModal] = useState(false);
  const [showSkeletons, setShowSkeletons] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  // Trigger test button loading
  const triggerLoading = () => {
    setButtonLoading(true);
    setTimeout(() => {
      setButtonLoading(false);
      toast.success('Action Completed', 'Loading state concluded successfully.');
    }, 1500);
  };

  // Sample data for the showcase table
  const sampleTableData = [
    { id: 'REC-01', item: 'PET Bottle', category: 'recyclable', weight: '0.04 kg', status: 'verified', confidence: 0.98 },
    { id: 'REC-02', item: 'Apple Core', category: 'organic', weight: '0.12 kg', status: 'diverted', confidence: 0.99 },
    { id: 'REC-03', item: 'Lithium Battery', category: 'hazardous', weight: '0.08 kg', status: 'flagged', confidence: 0.94 },
    { id: 'REC-04', item: 'Beer Bottle', category: 'glass', weight: '0.45 kg', status: 'verified', confidence: 0.97 },
  ];

  const sampleColumns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'item', label: 'Item Name', sortable: true },
    {
      key: 'category',
      label: 'Category',
      render: (cat) => <Badge category={cat} size="sm" dot>{WASTE_CATEGORIES[cat]?.label || cat}</Badge>,
    },
    { key: 'weight', label: 'Weight' },
    {
      key: 'confidence',
      label: 'Confidence',
      render: (val) => <ConfidenceBadge score={val} size="sm" />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (st) => <Badge status={st} size="sm">{st.toUpperCase()}</Badge>,
    },
  ];

  return (
    <div className="space-y-10 pb-12">
      <PageHeader
        title="Design System Component Catalog"
        subtitle="Live showcase of the 10 core reusable components, tokens, typography, and states for EcoSort AI."
        breadcrumbs={['EcoSort AI', 'Styleguide', 'Design System']}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSkeletons(!showSkeletons)}
            >
              Toggle Skeleton States: {showSkeletons ? 'ON' : 'OFF'}
            </Button>
          </div>
        }
      />

      {/* 1. Color Palette & Typography Tokens */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-forest-700" />
          <h2 className="text-base font-bold text-slate-900">Color System & Design Tokens</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          <div className="p-3 rounded-xl bg-forest-800 text-white shadow-xs">
            <div className="text-xs font-bold">Forest 800</div>
            <div className="text-[10px] opacity-80 font-mono">#154429 (Primary)</div>
          </div>
          <div className="p-3 rounded-xl bg-forest-700 text-white shadow-xs">
            <div className="text-xs font-bold">Forest 700</div>
            <div className="text-[10px] opacity-80 font-mono">#1E5A37</div>
          </div>
          <div className="p-3 rounded-xl bg-forest-500 text-white shadow-xs">
            <div className="text-xs font-bold">Forest 500</div>
            <div className="text-[10px] opacity-80 font-mono">#3D8F5C</div>
          </div>
          <div className="p-3 rounded-xl bg-forest-100 text-forest-900 border border-forest-200">
            <div className="text-xs font-bold">Forest 100</div>
            <div className="text-[10px] opacity-70 font-mono">#DDEFE4</div>
          </div>
          <div className="p-3 rounded-xl bg-forest-50 text-forest-900 border border-forest-200">
            <div className="text-xs font-bold">Forest 50</div>
            <div className="text-[10px] opacity-70 font-mono">#F0F7F3</div>
          </div>
          <div className="p-3 rounded-xl bg-[#F7FAF8] text-slate-800 border border-slate-200">
            <div className="text-xs font-bold">Background</div>
            <div className="text-[10px] opacity-70 font-mono">#F7FAF8</div>
          </div>
        </div>
      </section>

      {/* 2. Stat Cards Showcase (Component #4) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-forest-700" />
            <h2 className="text-base font-bold text-slate-900">4. Stat Cards</h2>
          </div>
          <span className="text-xs text-slate-400">Multiple variants with trend indicators</span>
        </div>

        {showSkeletons ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Daily Waste Processed"
              value="4,820"
              unit="kg"
              change="+18.4%"
              changeType="increase"
              period="vs yesterday"
              icon={Recycle}
              progress={75}
            />
            <StatCard
              variant="forest"
              title="AI Confidence Average"
              value="98.6%"
              unit="avg"
              change="+1.2%"
              changeType="increase"
              period="YOLOv11-seg"
              icon={Cpu}
              progress={98.6}
            />
            <StatCard
              title="Contamination Events"
              value="2"
              unit="cases"
              change="-50.0%"
              changeType="decrease"
              period="vs benchmark"
              icon={AlertTriangle}
              progress={20}
            />
          </div>
        )}
      </section>

      {/* 3. Buttons Showcase (Component #5) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-forest-700" />
            <h2 className="text-base font-bold text-slate-900">5. Buttons</h2>
          </div>
          <Button size="xs" variant="outline" onClick={triggerLoading}>
            Trigger Loading State
          </Button>
        </div>

        <Card className="p-5 sm:p-6 space-y-6">
          {/* Variants Row */}
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
              Variants
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" leftIcon={Sparkles} isLoading={buttonLoading}>
                Primary Solid
              </Button>
              <Button variant="secondary" leftIcon={Layers}>
                Secondary Tint
              </Button>
              <Button variant="outline" leftIcon={Download}>
                Outline Button
              </Button>
              <Button variant="ghost" leftIcon={Eye}>
                Ghost Button
              </Button>
              <Button variant="danger" leftIcon={Trash2}>
                Danger Soft
              </Button>
              <Button variant="danger-solid" leftIcon={Trash2}>
                Danger Solid
              </Button>
              <Button variant="success" leftIcon={CheckCircle2}>
                Success
              </Button>
              <Button variant="primary" disabled>
                Disabled
              </Button>
            </div>
          </div>

          {/* Sizes Row */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
              Sizes
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="xs" variant="primary">
                Extra Small (xs)
              </Button>
              <Button size="sm" variant="primary">
                Small (sm)
              </Button>
              <Button size="md" variant="primary">
                Medium (md - Default)
              </Button>
              <Button size="lg" variant="primary">
                Large (lg)
              </Button>
              <Button size="icon" variant="outline" aria-label="Icon only">
                <Plus size={18} />
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* 4. Status Badges Showcase (Component #6) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-forest-700" />
          <h2 className="text-base font-bold text-slate-900">6. Status Badges</h2>
        </div>

        <Card className="p-5 sm:p-6 space-y-6">
          {/* Waste Categories */}
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
              Waste Category Semantics
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge category="organic" dot>Organic / Compost</Badge>
              <Badge category="recyclable" dot>Recyclables (PET/Cardboard)</Badge>
              <Badge category="glass" dot>Glass Bottles</Badge>
              <Badge category="hazardous" dot>Hazardous Materials</Badge>
              <Badge category="ewaste" dot>E-Waste / Circuitry</Badge>
              <Badge category="landfill" dot>Residual Landfill</Badge>
            </div>
          </div>

          {/* Operational Status Badges */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
              Operational Status Badges
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge status="verified" dot>Verified</Badge>
              <Badge status="flagged" dot>Flagged for Inspection</Badge>
              <Badge status="processing" dot>Processing Stream</Badge>
              <Badge status="diverted" dot>Diverted to Bin</Badge>
            </div>
          </div>

          {/* Model Confidence Chips */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
              AI Confidence Score Chips
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              <ConfidenceBadge score={0.98} size="md" />
              <ConfidenceBadge score={0.84} size="md" />
              <ConfidenceBadge score={0.62} size="md" />
              <ConfidenceBadge score={0.38} size="md" />
            </div>
          </div>
        </Card>
      </section>

      {/* 5. Data Tables Showcase (Component #7) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-forest-700" />
            <h2 className="text-base font-bold text-slate-900">7. Data Tables</h2>
          </div>
          <span className="text-xs text-slate-400">Sorting, filtering & pagination built-in</span>
        </div>

        {showSkeletons ? (
          <TableSkeleton rows={4} cols={5} />
        ) : (
          <Table
            columns={sampleColumns}
            data={sampleTableData}
            pageSize={4}
            searchPlaceholder="Search showcase records..."
          />
        )}
      </section>

      {/* 6. Modal Components Showcase (Component #8) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-forest-700" />
          <h2 className="text-base font-bold text-slate-900">8. Modal Components</h2>
        </div>

        <Card className="p-5 sm:p-6">
          <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
            Accessible, smooth animated dialogs supporting backdrop blur, escape keys, and confirmation presets.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowGeneralModal(true)}
            >
              Open General Modal
            </Button>
            <Button
              variant="danger"
              onClick={() => setShowConfirmModal(true)}
            >
              Open Confirm Modal
            </Button>
          </div>
        </Card>

        {/* General Modal Demonstration */}
        <Modal
          isOpen={showGeneralModal}
          onClose={() => setShowGeneralModal(false)}
          title="Optical Sensor Recalibration"
          subtitle="Conveyor Alpha-1 camera alignment dialog"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setShowGeneralModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setShowGeneralModal(false);
                  toast.success('Recalibration Initialized', 'Optical camera zeroed at 1080p 60fps.');
                }}
              >
                Start Calibration
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-xs sm:text-sm text-slate-600">
            <p>
              This dialog allows technicians to test actuator firing latency, re-align the bounding box ROI, and trigger an automated zero-point calibration routine.
            </p>
            <div className="p-3 bg-forest-50 border border-forest-100 rounded-xl text-forest-800 text-xs">
              Ensure the conveyor belt is clear of debris before continuing calibration.
            </div>
          </div>
        </Modal>

        {/* Confirmation Modal Demonstration */}
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => {
            setShowConfirmModal(false);
            toast.error('Actuator Line Halted', 'Emergency mechanical stop triggered for Chute #3.');
          }}
          title="Emergency Stop Conveyor Line?"
          message="This will immediately cut power to the pneumatic diverter and stop the Alpha-1 feed belt."
          confirmLabel="Halt Line"
          variant="danger"
        />
      </section>

      {/* 7. Toast Notifications Showcase (Component #10) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-forest-700" />
          <h2 className="text-base font-bold text-slate-900">10. Toast Notifications</h2>
        </div>

        <Card className="p-5 sm:p-6">
          <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
            Floating non-intrusive notifications for real-time edge AI feedback, sorting alarms, and operation status.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              leftIcon={CheckCircle2}
              className="text-emerald-700 hover:text-emerald-800"
              onClick={() => toast.success('Classification Confirmed', 'PET Plastic Bottle diverted to Blue Bin.')}
            >
              Trigger Success Toast
            </Button>
            <Button
              variant="outline"
              leftIcon={AlertCircle}
              className="text-rose-700 hover:text-rose-800"
              onClick={() => toast.error('Optical Camera Offline', 'Connection lost to Node Beta-2. Retrying...')}
            >
              Trigger Error Toast
            </Button>
            <Button
              variant="outline"
              leftIcon={AlertTriangle}
              className="text-amber-700 hover:text-amber-800"
              onClick={() => toast.warning('High Contamination', 'Moisture detected in cardboard stream (3.4%).')}
            >
              Trigger Warning Toast
            </Button>
            <Button
              variant="outline"
              leftIcon={Info}
              className="text-blue-700 hover:text-blue-800"
              onClick={() => toast.info('Model Auto-Tuned', 'RealWaste-YOLOv11 weights refreshed with active learning.')}
            >
              Trigger Info Toast
            </Button>
          </div>
        </Card>
      </section>

      {/* 8. Loading Skeletons Showcase (Component #9) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-forest-700" />
            <h2 className="text-base font-bold text-slate-900">9. Loading Skeletons</h2>
          </div>
          <span className="text-xs text-slate-400">Shimmering content placeholders</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton height={220} />
          <TableSkeleton rows={3} cols={4} />
        </div>
      </section>
    </div>
  );
};

export default ShowcaseView;
