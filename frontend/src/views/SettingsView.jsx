import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Cpu,
  Bell,
  Shield,
  Save,
  RotateCcw,
  Sparkles,
  Server,
  Layers,
  Check,
  Recycle,
  CheckCircle2,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../design-system/Card';
import Button from '../design-system/Button';
import Badge from '../design-system/Badge';
import { useToast } from '../design-system/Toast';
import RecyclingRulesCard from '../components/settings/RecyclingRulesCard';
import {
  getSettings,
  updateSettings,
  resetSettings,
  DEFAULT_SETTINGS,
} from '../services/settingsService';

export const SettingsView = () => {
  const toast = useToast();
  const [modelType, setModelType] = useState('yolov11n-seg');
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [actuatorDelay, setActuatorDelay] = useState(140);
  const [enablePneumaticDiversion, setEnablePneumaticDiversion] = useState(true);
  const [hazardAlertSound, setHazardAlertSound] = useState(true);
  const [autoSaveTelemetry, setAutoSaveTelemetry] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const s = await getSettings();
        if (s) {
          if (s.model_type) setModelType(s.model_type);
          if (s.confidence_threshold !== undefined) setConfidenceThreshold(s.confidence_threshold);
          if (s.actuator_delay_ms !== undefined) setActuatorDelay(s.actuator_delay_ms);
          if (s.enable_pneumatic_diversion !== undefined)
            setEnablePneumaticDiversion(s.enable_pneumatic_diversion);
          if (s.hazard_alert_sound !== undefined) setHazardAlertSound(s.hazard_alert_sound);
          if (s.auto_save_telemetry !== undefined) setAutoSaveTelemetry(s.auto_save_telemetry);
        }
      } catch (err) {
        console.warn('Could not load settings:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const payload = {
        model_type: modelType,
        confidence_threshold: confidenceThreshold,
        actuator_delay_ms: actuatorDelay,
        enable_pneumatic_diversion: enablePneumaticDiversion,
        hazard_alert_sound: hazardAlertSound,
        auto_save_telemetry: autoSaveTelemetry,
      };
      await updateSettings(payload);
      toast.success(
        'Configuration Saved',
        `Threshold set to ${confidenceThreshold}%, actuator delay ${actuatorDelay}ms saved to database.`
      );
    } catch (err) {
      toast.error('Save Failed', err.message || 'Unable to persist configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    try {
      await resetSettings();
      setModelType(DEFAULT_SETTINGS.model_type);
      setConfidenceThreshold(DEFAULT_SETTINGS.confidence_threshold);
      setActuatorDelay(DEFAULT_SETTINGS.actuator_delay_ms);
      setEnablePneumaticDiversion(DEFAULT_SETTINGS.enable_pneumatic_diversion);
      setHazardAlertSound(DEFAULT_SETTINGS.hazard_alert_sound);
      setAutoSaveTelemetry(DEFAULT_SETTINGS.auto_save_telemetry);
      toast.info('Settings Reset', 'Default calibration parameters restored and saved.');
    } catch (err) {
      toast.error('Reset Failed', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Configuration"
        subtitle="Manage edge AI inference weights, pneumatic actuator timing, safety interlocks, and stream guidelines."
        breadcrumbs={['EcoSort AI', 'Administration', 'Settings']}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={RotateCcw}
              onClick={handleResetDefaults}
            >
              Reset Defaults
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={Save}
              isLoading={isSaving}
              onClick={handleSaveSettings}
            >
              Save Configuration
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: AI Model and Actuator Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Inference Card */}
          <Card>
            <CardHeader
              action={
                <Badge variant="forest" size="sm">
                  Active Runtime
                </Badge>
              }
            >
              <CardTitle className="flex items-center gap-2">
                <Cpu size={18} className="text-forest-700" />
                AI Model & Inference Engine
              </CardTitle>
              <CardDescription>
                Select neural architecture and minimum confidence gates for automatic sorting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Model Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  Active Model Architecture
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setModelType('yolov11n-seg')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      modelType === 'yolov11n-seg'
                        ? 'border-forest-700 bg-forest-50/50 ring-1 ring-forest-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">ResNet18 Fine-Tuned (Active)</span>
                      {modelType === 'yolov11n-seg' && <Check size={14} className="text-forest-700" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Trained on RealWaste dataset (74.3% accuracy, 9 classes, 24ms inference).
                    </p>
                  </div>

                  <div
                    onClick={() => setModelType('yolov11s-seg')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      modelType === 'yolov11s-seg'
                        ? 'border-forest-700 bg-forest-50/50 ring-1 ring-forest-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">YOLOv11-Nano (Edge Stream)</span>
                      {modelType === 'yolov11s-seg' && <Check size={14} className="text-forest-700" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Ultra-low latency (18ms). Optimized for high-throughput conveyor cams.
                    </p>
                  </div>
                </div>
              </div>

              {/* Confidence Threshold Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-700">
                    Minimum Auto-Diversion Confidence
                  </label>
                  <span className="font-mono font-bold text-forest-700 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
                    {confidenceThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="99"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                  className="w-full accent-forest-700 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">
                  Detections below this threshold will be flagged for human verification or routed to the residual bin.
                </p>
              </div>

              {/* Actuator Delay Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-700">
                    Conveyor Actuator Timing Delay
                  </label>
                  <span className="font-mono font-bold text-forest-700 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
                    {actuatorDelay} ms
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="300"
                  value={actuatorDelay}
                  onChange={(e) => setActuatorDelay(Number(e.target.value))}
                  className="w-full accent-forest-700 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">
                  Calibrates the travel time between optical camera detection and pneumatic flipper arm actuation.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Hardware & Safety Interlocks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={18} className="text-forest-700" />
                Safety & Pneumatics
              </CardTitle>
              <CardDescription>Configure physical hardware fail-safes and sensor switches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-slate-800">
                    Pneumatic Actuator Physical Diversion
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Enable high-speed air-blast and mechanical deflector paddles
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enablePneumaticDiversion}
                  onChange={(e) => setEnablePneumaticDiversion(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-forest-700 focus:ring-forest-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-slate-800">
                    Hazardous Material Audible Alarm
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Sound facility siren upon detecting lithium batteries or chemical canisters
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={hazardAlertSound}
                  onChange={(e) => setHazardAlertSound(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-forest-700 focus:ring-forest-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-slate-800">
                    High-Resolution Telemetry Logging
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Save cropped bounding box images to database for continuous retraining
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoSaveTelemetry}
                  onChange={(e) => setAutoSaveTelemetry(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-forest-700 focus:ring-forest-600 cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Facility & Edge Node Diagnostics */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server size={18} className="text-forest-700" />
                Edge Node Cluster
              </CardTitle>
              <CardDescription>Facility deployment summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Facility Location</span>
                <span className="font-semibold text-slate-800">Alpha Plant — Bay 4</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Cluster Status</span>
                <Badge variant="success" size="sm" dot>
                  12/12 Online
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Optical Framerate</span>
                <span className="font-mono font-semibold text-slate-800">60 FPS Sync</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Pneumatic Pressure</span>
                <span className="font-mono font-semibold text-slate-800">8.2 Bar (Nominal)</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500">Database Engine</span>
                <span className="font-mono text-slate-700">SQLite (smart_waste.db)</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Support / Version Info */}
          <Card className="bg-forest-50/60 border-forest-200/70">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-forest-900">
                <Sparkles size={16} className="text-forest-700" />
                EcoSort Design System v1.0
              </div>
              <p className="text-[11px] text-forest-800/80 leading-relaxed">
                Adheres strictly to the Forest Green light-mode palette (#F7FAF8 background, white cards, subtle borders, and professional typography).
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Embedded Database-Governed Recycling Rules Management */}
      <RecyclingRulesCard />
    </div>
  );
};

export default SettingsView;
