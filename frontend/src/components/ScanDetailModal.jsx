import React, { useState, useEffect } from 'react';
import { Modal } from '../design-system/Modal';
import Badge, { ConfidenceBadge } from '../design-system/Badge';
import Button from '../design-system/Button';
import { WASTE_CATEGORIES, normalizeCategoryKey } from '../design-system/tokens';
import { Check, Leaf, Box, FileText, Info, ShieldCheck, Edit3 } from 'lucide-react';

export const ScanDetailModal = ({
  scan,
  isOpen,
  onClose,
  onVerify,
}) => {
  if (!scan) return null;

  const initialCatKey = normalizeCategoryKey(scan.predictedClass || scan.category);
  const [selectedCategory, setSelectedCategory] = useState(scan.predictedClass || initialCatKey);
  const [notes, setNotes] = useState(scan.notes || '');

  useEffect(() => {
    if (scan) {
      setSelectedCategory(scan.predictedClass || initialCatKey);
      setNotes(scan.notes || '');
    }
  }, [scan]);

  const catKey = normalizeCategoryKey(selectedCategory);
  const cat = WASTE_CATEGORIES[catKey] || WASTE_CATEGORIES.miscellaneous_trash;
  const confidenceScore = scan.confidence || 0.95;

  const handleConfirmVerify = () => {
    if (onVerify) {
      onVerify(scan, selectedCategory, notes);
    }
    onClose();
  };

  const categoryOptions = [
    { key: 'cardboard', label: 'Cardboard' },
    { key: 'food_organics', label: 'Food Organics' },
    { key: 'glass', label: 'Glass' },
    { key: 'metal', label: 'Metal' },
    { key: 'miscellaneous_trash', label: 'Miscellaneous Trash' },
    { key: 'paper', label: 'Paper' },
    { key: 'plastic', label: 'Plastic' },
    { key: 'textile_trash', label: 'Textile Trash' },
    { key: 'vegetation', label: 'Vegetation' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={`Scan Telemetry — ${scan.id}`}
      subtitle={`Captured ${scan.timestamp || scan.timeAgo || 'Recently'} • ${scan.filename || scan.item}`}
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Destination:</span>
            <span className="text-xs font-semibold text-slate-800">{cat.binName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={Check}
              onClick={handleConfirmVerify}
            >
              {scan.isVerified ? 'Update Verification' : 'Verify & Confirm'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Top Split: Image Preview & Classification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200 aspect-video md:aspect-square flex items-center justify-center">
            <img
              src={scan.sampleImage || scan.imageUrl}
              alt={scan.filename || scan.item}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-slate-950/80 text-white text-[10px] px-2 py-0.5 rounded font-mono">
              {scan.filename || scan.item}
            </div>
          </div>

          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Predicted Class
                </span>
                <h4 className="text-xl font-bold text-slate-900 mt-0.5">{cat.name}</h4>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge category={catKey} size="md" dot>
                  {cat.name}
                </Badge>
                <ConfidenceBadge score={confidenceScore} size="md" />
                <Badge variant={cat.recyclabilityType} size="md">
                  {cat.recyclability}
                </Badge>
                {scan.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck size={12} /> Confirmed
                  </span>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Payload Weight</span>
                  <span className="font-mono text-slate-800">
                    {scan.weight_kg !== undefined ? `${scan.weight_kg} kg` : '0.050 kg'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Backbone Model</span>
                  <span className="font-semibold text-slate-800">PyTorch ResNet18</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Audit Status</span>
                  <span className={scan.isVerified ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                    {scan.isVerified ? 'Verified by Operator' : 'Pending Verification'}
                  </span>
                </div>
              </div>
            </div>

            {/* Target Bin Card */}
            <div className={`p-3 rounded-xl border flex items-start gap-3 ${cat.bg} ${cat.border}`}>
              <div
                className="w-3.5 h-3.5 rounded-full mt-0.5 shrink-0"
                style={{ backgroundColor: cat.binColor }}
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900">Destination: </span>
                <span className="font-semibold text-slate-800">{cat.binName}</span>
                <p className="text-[11px] text-slate-600 mt-0.5">{cat.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Operator Audit & Reclassification Controls */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Edit3 size={15} className="text-forest-700" />
            <span>Operator Classification Verification & Notes</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-medium block mb-1">
                Confirmed / Corrected Waste Stream
              </label>
              <select
                value={catKey}
                onChange={(e) => {
                  const match = categoryOptions.find((o) => o.key === e.target.value);
                  setSelectedCategory(match ? match.label : e.target.value);
                }}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-800 font-medium focus:outline-none focus:border-forest-600"
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-600 font-medium block mb-1">
                Audit Observations / Quality Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Clean bottle, residue rinsed..."
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:border-forest-600"
              />
            </div>
          </div>
        </div>

        {/* Actionable Disposal Guidance */}
        <div className="p-3.5 rounded-xl bg-forest-50/70 border border-forest-200/70 text-xs space-y-1">
          <span className="font-bold text-forest-900 flex items-center gap-1.5">
            <Leaf size={14} className="text-forest-700" /> Disposal Advice
          </span>
          <p className="text-forest-800 leading-relaxed">
            {cat.disposalGuide}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ScanDetailModal;
