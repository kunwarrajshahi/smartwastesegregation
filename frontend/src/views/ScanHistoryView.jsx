import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Trash2,
  CheckCircle,
  Eye,
  Filter,
  Info,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Table } from '../design-system/Table';
import Button from '../design-system/Button';
import Badge, { ConfidenceBadge } from '../design-system/Badge';
import { ConfirmModal } from '../design-system/Modal';
import { useToast } from '../design-system/Toast';
import { WASTE_CATEGORIES, normalizeCategoryKey } from '../design-system/tokens';
import { downloadCsvExport } from '../services/analyticsService';

export const ScanHistoryView = ({
  scans = [],
  onDeleteScans,
  onSelectScan,
  onVerifyScans,
  initialSearch = '',
}) => {
  const toast = useToast();
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleSelectRow = (row, isChecked) => {
    setSelectedRowIds((prev) =>
      isChecked ? [...prev, row.id] : prev.filter((id) => id !== row.id)
    );
  };

  const handleSelectAll = (isChecked, currentRows) => {
    if (isChecked) {
      const idsToAdd = currentRows.map((r) => r.id);
      setSelectedRowIds((prev) => Array.from(new Set([...prev, ...idsToAdd])));
    } else {
      const idsToRemove = new Set(currentRows.map((r) => r.id));
      setSelectedRowIds((prev) => prev.filter((id) => !idsToRemove.has(id)));
    }
  };

  const handleBulkVerify = async () => {
    if (onVerifyScans) {
      await onVerifyScans(selectedRowIds);
    }
    toast.success(
      'Records Verified',
      `${selectedRowIds.length} classification records confirmed and verified in the database.`
    );
    setSelectedRowIds([]);
  };

  const handleBulkDelete = () => {
    if (onDeleteScans) {
      onDeleteScans(selectedRowIds);
    }
    toast.info('Records Deleted', `${selectedRowIds.length} scan records removed from history.`);
    setSelectedRowIds([]);
    setIsDeleteModalOpen(false);
  };

  const handleExportCSV = async () => {
    try {
      await downloadCsvExport();
      toast.success('CSV Exported', 'Exported database classification logs to CSV.');
    } catch {
      // Fallback to client-side table export
      const headers = ['ID', 'Filename', 'Predicted Category', 'Confidence', 'Date Time', 'Destination Bin'];
      const rows = scans.map((s) => [
        s.id,
        s.filename || s.item,
        s.predictedClass || s.category,
        `${Math.round(s.confidence * 100)}%`,
        s.timestamp,
        s.destinationBin || 'Bin',
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `waste_scan_history_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('CSV Exported', `Exported ${scans.length} classification logs.`);
    }
  };

  const columns = [
    {
      key: 'filename',
      label: 'Uploaded Filename / Item',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.sampleImage || row.imageUrl}
            alt={val || row.item}
            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
          />
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 truncate max-w-[200px]">
              {val || row.item}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {row.id} • {row.fileSize || 'Standard Image'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Predicted Category',
      sortable: true,
      render: (val, row) => {
        const catKey = normalizeCategoryKey(row.predictedClass || val);
        const cat = WASTE_CATEGORIES[catKey] || WASTE_CATEGORIES.miscellaneous_trash;
        return (
          <Badge category={catKey} size="sm" dot>
            {cat.name}
          </Badge>
        );
      },
    },
    {
      key: 'confidence',
      label: 'Confidence Score',
      sortable: true,
      render: (val) => <ConfidenceBadge score={val} size="sm" />,
    },
    {
      key: 'destinationBin',
      label: 'Assigned Destination',
      render: (val, row) => {
        const catKey = normalizeCategoryKey(row.predictedClass || row.category);
        const cat = WASTE_CATEGORIES[catKey];
        return (
          <span className="text-xs text-slate-700 font-medium truncate block max-w-[150px]">
            {val || cat?.binName || 'General Bin'}
          </span>
        );
      },
    },
    {
      key: 'timestamp',
      label: 'Date & Time',
      sortable: true,
      render: (val, row) => (
        <span className="text-xs text-slate-500 font-mono">
          {val || row.timeAgo}
        </span>
      ),
    },
    {
      key: 'isVerified',
      label: 'Audit Status',
      sortable: true,
      render: (val) =>
        val ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle size={12} /> Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Pending
          </span>
        ),
    },
    {
      key: 'actions',
      label: 'Action',
      align: 'right',
      render: (_, row) => (
        <Button
          size="xs"
          variant="outline"
          leftIcon={Eye}
          onClick={(e) => {
            e.stopPropagation();
            onSelectScan && onSelectScan(row);
          }}
        >
          Inspect
        </Button>
      ),
    },
  ];

  // Category filter dropdown covering all 9 classes
  const filterCategories = [
    { value: 'cardboard', label: 'Cardboard' },
    { value: 'food_organics', label: 'Food Organics' },
    { value: 'glass', label: 'Glass' },
    { value: 'metal', label: 'Metal' },
    { value: 'miscellaneous_trash', label: 'Miscellaneous Trash' },
    { value: 'paper', label: 'Paper' },
    { value: 'plastic', label: 'Plastic' },
    { value: 'textile_trash', label: 'Textile Trash' },
    { value: 'vegetation', label: 'Vegetation' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prediction History & Audit Log"
        subtitle="Search, filter, and inspect optical classification history across all 9 waste streams with confidence scores and timestamps."
        breadcrumbs={['EcoSort AI', 'Database', 'Scan History']}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={FileSpreadsheet}
              onClick={handleExportCSV}
            >
              Export to CSV
            </Button>
          </div>
        }
      />

      {/* Notice Banner */}
      <div className="p-3.5 bg-forest-50/70 border border-forest-200/80 rounded-2xl flex items-center justify-between text-xs text-forest-800">
        <div className="flex items-center gap-2">
          <Info size={16} className="text-forest-700 shrink-0" />
          <span>
            Demonstration preview records are seeded until persistent database storage is connected. Any newly analyzed images in the <strong>Waste Detection</strong> page are dynamically added below.
          </span>
        </div>
        <span className="font-mono text-[11px] font-semibold text-forest-700 shrink-0 hidden sm:inline">
          {scans.length} Total Logs
        </span>
      </div>

      {/* Bulk Action Bar (when rows are selected) */}
      {selectedRowIds.length > 0 && (
        <div className="p-3.5 bg-forest-50 border border-forest-200 rounded-2xl flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-xs font-semibold text-forest-900">
            <span className="w-2 h-2 rounded-full bg-forest-700" />
            <span>{selectedRowIds.length} records selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="xs"
              variant="primary"
              leftIcon={CheckCircle}
              onClick={handleBulkVerify}
            >
              Verify Selected
            </Button>
            <Button
              size="xs"
              variant="danger"
              leftIcon={Trash2}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete Records
            </Button>
          </div>
        </div>
      )}

      {/* Main Data Table */}
      <Table
        columns={columns}
        data={scans}
        keyField="id"
        pageSize={6}
        initialSearchTerm={initialSearch}
        searchPlaceholder="Search by filename, category, or scan ID..."
        searchKeys={['id', 'filename', 'item', 'category', 'predictedClass', 'destinationBin']}
        filterableCategories={filterCategories}
        selectable
        selectedRows={selectedRowIds}
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
        onRowClick={(row) => onSelectScan && onSelectScan(row)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selectedRowIds.length} Selected Records?`}
        message="This will remove the selected prediction records from your local session view."
        confirmLabel="Confirm Delete"
        variant="danger"
      />
    </div>
  );
};

export default ScanHistoryView;
