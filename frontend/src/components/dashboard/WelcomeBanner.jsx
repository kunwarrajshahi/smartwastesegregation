import React from 'react';
import { Sparkles, Scan, ArrowRight, ShieldCheck, Leaf } from 'lucide-react';
import Button from '../../design-system/Button';
import Badge from '../../design-system/Badge';

/**
 * Dashboard AI Welcome & Sustainability Section
 */
export const WelcomeBanner = ({ onScanClick }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-forest-900 via-forest-800 to-forest-700 text-white p-6 sm:p-8 shadow-card border border-forest-600/50">
      {/* Decorative ambient background blur */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 w-60 h-60 bg-forest-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="forest" size="sm" className="bg-white/15 text-forest-100 border-white/20">
              <Sparkles size={12} className="mr-1 inline text-emerald-300" />
              AI Waste Management v1.0
            </Badge>
            <span className="text-[11px] text-forest-200/90 font-medium">
              Trained on RealWaste Dataset (4,752 images)
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Automated Waste Segregation & Purity Intelligence
          </h2>

          <p className="text-xs sm:text-sm text-forest-100/90 leading-relaxed max-w-xl">
            Leverage fine-tuned deep learning to classify solid municipal waste across 9 distinct recyclable and compostable categories. Reduce landfill contamination and accelerate material recovery with real-time computer vision inference.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-forest-200">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-emerald-400" /> 9 Classification Classes
            </span>
            <span className="flex items-center gap-1.5">
              <Leaf size={15} className="text-emerald-400" /> 72.0% Recyclable Recovery
            </span>
            <span className="text-forest-300/70 text-[11px]">
              • Preview Telemetry Mode
            </span>
          </div>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button
            size="lg"
            variant="success"
            leftIcon={Scan}
            rightIcon={ArrowRight}
            onClick={onScanClick}
            className="shadow-md bg-emerald-500 hover:bg-emerald-600 font-semibold text-forest-950 hover:text-white"
          >
            Scan Waste Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
