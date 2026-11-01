import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../design-system/Card';
import Button from '../../design-system/Button';
import Badge from '../../design-system/Badge';
import { Modal } from '../../design-system/Modal';
import { useToast } from '../../design-system/Toast';
import { getRecyclingRules } from '../../services/analyticsService';
import { updateRecyclingRule } from '../../services/settingsService';
import { Recycle, CheckCircle2, AlertCircle, XCircle, RefreshCw, Edit2, Save, X, Sparkles } from 'lucide-react';

export const RecyclingRulesCard = () => {
  const toast = useToast();
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit modal state
  const [editingRule, setEditingRule] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchRules = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getRecyclingRules();
      if (Array.isArray(data) && data.length > 0) {
        setRules(data);
      }
    } catch (err) {
      setError(err.message || 'Unable to load recycling rules from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleOpenEdit = (rule) => {
    setEditingRule(rule);
    setEditFormData({
      bin_name: rule.bin_name || '',
      bin_color: rule.bin_color || '#2563EB',
      preparation_guide: rule.preparation_guide || '',
      co2_emission_factor: rule.co2_emission_factor !== undefined ? rule.co2_emission_factor : 1.0,
      landfill_diversion_factor: rule.landfill_diversion_factor !== undefined ? rule.landfill_diversion_factor : 1.0,
      is_active: rule.is_active !== undefined ? rule.is_active : true,
    });
  };

  const handleCloseEdit = () => {
    setEditingRule(null);
    setEditFormData({});
  };

  const handleSaveRule = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!editingRule) return;

    setIsSaving(true);
    try {
      const updated = await updateRecyclingRule(editingRule.category_key, editFormData);
      setRules((prev) =>
        prev.map((r) => (r.category_key === editingRule.category_key ? { ...r, ...updated } : r))
      );
      toast.success(
        'Recycling Rule Updated',
        `Successfully updated parameters for ${editingRule.display_name}.`
      );
      handleCloseEdit();
    } catch (err) {
      toast.error('Update Failed', err.message || 'Could not update rule in database.');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'recyclable') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={12} /> Recyclable
        </span>
      );
    }
    if (s === 'compostable') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-200">
          <Sparkles size={12} /> Compostable
        </span>
      );
    }
    if (s === 'special' || s === 'conditionally_recyclable') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
          <AlertCircle size={12} /> Special Reclaim
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <XCircle size={12} /> Residual / Landfill
      </span>
    );
  };

  return (
    <>
      <Card>
        <CardHeader
          action={
            <Button
              size="xs"
              variant="outline"
              leftIcon={RefreshCw}
              isLoading={isLoading}
              onClick={fetchRules}
            >
              Refresh Rules
            </Button>
          }
        >
          <CardTitle className="flex items-center gap-2">
            <Recycle size={18} className="text-forest-700" />
            Configurable Recycling Rules & Stream Management
          </CardTitle>
          <CardDescription>
            Backend-governed classification mapping, destination bin assignments, and EPA carbon avoidance factors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
              <span>{error}</span>
              <Button size="xs" variant="outline" onClick={fetchRules}>
                Retry
              </Button>
            </div>
          )}

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Waste Category</th>
                  <th className="px-4 py-3">Recyclability Status</th>
                  <th className="px-4 py-3">Assigned Destination Bin</th>
                  <th className="px-4 py-3">Avoidance Factor</th>
                  <th className="px-4 py-3">Disposal Instruction</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {rules.map((rule) => (
                  <tr key={rule.category_key} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: rule.bin_color || '#64748B' }}
                        />
                        <span>{rule.display_name || rule.category_key}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(rule.recyclability_type)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {rule.bin_name}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {rule.co2_emission_factor} kg CO₂e/kg
                    </td>
                    <td
                      className="px-4 py-3 text-slate-500 max-w-xs truncate"
                      title={rule.preparation_guide}
                    >
                      {rule.preparation_guide}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="xs"
                        variant="ghost"
                        leftIcon={Edit2}
                        onClick={() => handleOpenEdit(rule)}
                        className="text-forest-700 hover:text-forest-900"
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Rule Modal */}
      {editingRule && (
        <Modal
          isOpen={Boolean(editingRule)}
          onClose={handleCloseEdit}
          title={`Edit Rule — ${editingRule.display_name}`}
          subtitle="Configure optical diversion destination bin, EPA emission avoidance factor, and preparation guide"
          size="md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="outline" size="sm" onClick={handleCloseEdit}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={Save}
                isLoading={isSaving}
                onClick={handleSaveRule}
              >
                Save Changes
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Destination Bin Name
              </label>
              <input
                type="text"
                value={editFormData.bin_name}
                onChange={(e) => setEditFormData({ ...editFormData, bin_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-forest-600 font-medium text-slate-800"
                placeholder="e.g. Blue Recycling Bin"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Bin Identifier Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={editFormData.bin_color}
                    onChange={(e) => setEditFormData({ ...editFormData, bin_color: e.target.value })}
                    className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={editFormData.bin_color}
                    onChange={(e) => setEditFormData({ ...editFormData, bin_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-forest-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  CO₂e Avoidance Factor (kg/kg)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  value={editFormData.co2_emission_factor}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      co2_emission_factor: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-forest-600 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Landfill Diversion Ratio (0.0 to 1.0)
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1.0"
                value={editFormData.landfill_diversion_factor}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    landfill_diversion_factor: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-forest-600 font-mono"
                required
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                1.00 indicates 100% diversion from municipal landfills upon processing.
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Preparation & Disposal Instructions
              </label>
              <textarea
                rows={3}
                value={editFormData.preparation_guide}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, preparation_guide: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-forest-600 text-xs leading-relaxed"
                placeholder="Disposal guidance displayed on detection cards..."
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default RecyclingRulesCard;
