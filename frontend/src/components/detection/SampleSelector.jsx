import React from 'react';
import { SAMPLE_DETECTION_PRESETS } from '../../data/mockData';
import { WASTE_CATEGORIES, normalizeCategoryKey } from '../../design-system/tokens';
import Badge from '../../design-system/Badge';
import { Sparkles } from 'lucide-react';

export const SampleSelector = ({ onSelectSample, disabled = false }) => {
  return (
    <div className="space-y-3 pt-4 border-t border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-forest-700" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Quick Test: 9 RealWaste Category Presets
          </h4>
        </div>
        <span className="text-xs text-slate-400">Click any sample to test</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2.5">
        {SAMPLE_DETECTION_PRESETS.map((sample) => {
          const catKey = normalizeCategoryKey(sample.category);
          const cat = WASTE_CATEGORIES[catKey];

          return (
            <button
              key={sample.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectSample(sample)}
              className="p-2 bg-white rounded-xl border border-slate-200 hover:border-forest-500 hover:shadow-xs transition-all text-left flex flex-col gap-1.5 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="relative rounded-lg overflow-hidden aspect-square bg-slate-100 border border-slate-100">
                <img
                  src={sample.imageUrl}
                  alt={sample.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <span
                  className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full ring-1 ring-white"
                  style={{ backgroundColor: cat.binColor }}
                />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-800 truncate group-hover:text-forest-900 transition-colors">
                  {cat.name}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {Math.round(sample.confidence * 100)}%
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SampleSelector;
