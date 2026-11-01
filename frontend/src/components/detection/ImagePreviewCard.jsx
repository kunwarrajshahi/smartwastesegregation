import React from 'react';
import { Trash2, Sparkles, Check, FileText, Scale } from 'lucide-react';
import Button from '../../design-system/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../design-system/Card';

export const ImagePreviewCard = ({
  imageData,
  weightKg = 0.05,
  onWeightChange,
  isAnalyzing,
  onAnalyze,
  onRemove,
}) => {
  if (!imageData) return null;

  return (
    <Card className="overflow-hidden border-forest-200">
      <CardHeader
        action={
          <Button
            size="xs"
            variant="danger"
            leftIcon={Trash2}
            onClick={onRemove}
            disabled={isAnalyzing}
          >
            Remove Image
          </Button>
        }
      >
        <CardTitle className="text-sm sm:text-base">Selected Image Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Viewport Frame with Laser Scanning Line when analyzing */}
        <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-[4/3] sm:aspect-video flex items-center justify-center border border-slate-200">
          <img
            src={imageData.previewUrl}
            alt={imageData.name}
            className={`w-full h-full object-contain transition-all duration-300 ${
              isAnalyzing ? 'scale-105 brightness-75' : ''
            }`}
          />

          {/* Scanning Animation */}
          {isAnalyzing && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10B981] animate-bounce" />
              <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[0.5px]" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-forest-900/90 text-white text-xs font-mono border border-emerald-500/40 shadow-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                ResNet18 Feature Extraction...
              </div>
            </div>
          )}

          {/* Grid overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>

        {/* File Metadata & Actions */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-white rounded-lg border border-slate-200 text-forest-700 shrink-0">
              <FileText size={16} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 truncate max-w-xs">{imageData.name}</p>
              <p className="text-[11px] text-slate-400 font-mono">
                {imageData.size} • {imageData.type}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {/* Weight Input (Hardware / Manual) */}
            <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <Scale size={14} className="text-slate-400 shrink-0" />
              <label className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">Weight:</label>
              <input
                type="number"
                min="0.001"
                max="100"
                step="0.01"
                value={weightKg}
                onChange={(e) => onWeightChange && onWeightChange(parseFloat(e.target.value) || 0)}
                className="w-16 px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono font-medium focus:outline-none focus:border-forest-600 text-right"
                disabled={isAnalyzing}
              />
              <span className="text-[11px] text-slate-500 font-medium">kg</span>
            </div>

            <Button
              size="md"
              variant="primary"
              leftIcon={Sparkles}
              isLoading={isAnalyzing}
              onClick={onAnalyze}
              className="w-full sm:w-auto shrink-0 shadow-sm"
            >
              {isAnalyzing ? 'Classifying Waste...' : 'Analyze Waste'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImagePreviewCard;
