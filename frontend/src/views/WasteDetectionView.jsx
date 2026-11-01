import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import ImageDropzone from '../components/detection/ImageDropzone';
import ImagePreviewCard from '../components/detection/ImagePreviewCard';
import PredictionResultCard from '../components/detection/PredictionResultCard';
import SampleSelector from '../components/detection/SampleSelector';
import Button from '../design-system/Button';
import { useToast } from '../design-system/Toast';
import { usePrediction } from '../hooks/usePrediction';
import { API_BASE_URL } from '../services/api';
import { WASTE_CATEGORIES, normalizeCategoryKey } from '../design-system/tokens';
import { AlertTriangle, Server, RefreshCw, CheckCircle2 } from 'lucide-react';

export const WasteDetectionView = ({ onNewPrediction }) => {
  const toast = useToast();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileMeta, setFileMeta] = useState(null);
  const [weightKg, setWeightKg] = useState(0.05);

  // Centralized hook consuming actual FastAPI backend
  const {
    predict,
    prediction,
    isLoading,
    error,
    isBackendOnline,
    checkBackendHealth,
    reset,
    clearError,
  } = usePrediction();

  // Handle image selected from drag-and-drop or browse
  const handleImageSelected = (imageData) => {
    setSelectedFile(imageData.file);
    setPreviewUrl(imageData.previewUrl);
    setFileMeta({
      name: imageData.name,
      size: imageData.size,
      type: imageData.type,
    });
    reset();
    toast.info('Image Selected', `${imageData.name} (${imageData.size}) ready for classification.`);
  };

  // Handle sample preset selection: converts image URL to actual File object so it runs against real model!
  const handleSampleSelected = async (sample) => {
    try {
      toast.info('Loading Sample', `Fetching ${sample.name}...`);
      const response = await fetch(sample.imageUrl);
      const blob = await response.blob();
      const file = new File([blob], sample.filename, {
        type: blob.type || 'image/jpeg',
      });

      setSelectedFile(file);
      setPreviewUrl(sample.imageUrl);
      setFileMeta({
        name: sample.filename,
        size: sample.fileSize,
        type: 'image/jpeg',
      });
      reset();
    } catch (err) {
      toast.error('Sample Error', 'Unable to fetch preset image for classification.');
    }
  };

  // Run Real AI Classification via POST /predict
  const handleAnalyze = async () => {
    if (!selectedFile) return;

    try {
      // Calls actual backend endpoint POST /predict with multipart FormData & weight
      const response = await predict(selectedFile, fileMeta?.name, weightKg);

      const catKey = normalizeCategoryKey(response.predicted_class);
      const catMeta = WASTE_CATEGORIES[catKey];
      const savedImageUrl = response.image_url
        ? (response.image_url.startsWith('http') ? response.image_url : `${API_BASE_URL}${response.image_url}`)
        : previewUrl;

      // Formulate history record from genuine backend response
      const historyRecord = {
        id: response.scan_id ? `SCN-${response.scan_id}` : `SCN-${Math.floor(1000 + Math.random() * 9000)}`,
        scan_id: response.scan_id,
        filename: response.filename || fileMeta?.name || 'waste_image.jpg',
        predictedClass: response.predicted_class,
        category: catKey,
        confidence: response.confidence,
        confidence_percentage: response.confidence_percentage,
        top_predictions: response.top_predictions,
        fileSize: fileMeta?.size || 'Image File',
        imageUrl: savedImageUrl,
        sampleImage: savedImageUrl,
        weight_kg: weightKg,
        destinationBin: response.disposal_recommendation || catMeta?.binName || 'General Waste Bin',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        timeAgo: 'Just now',
        isSample: false,
      };

      if (onNewPrediction) {
        onNewPrediction(historyRecord);
      }

      toast.success(
        'Inference Successful',
        `${response.filename}: ${response.predicted_class} (${response.confidence_percentage}%)`
      );
    } catch (err) {
      toast.error('Prediction Failed', err.message || 'Could not complete inference.');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileMeta(null);
    reset();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Waste Detection & Classification"
        subtitle="Upload or browse waste imagery to classify in real-time using our FastAPI PyTorch ResNet18 service."
        breadcrumbs={['EcoSort AI', 'Inference', 'Waste Detection']}
        actions={
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${
                isBackendOnline === true
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : isBackendOnline === false
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isBackendOnline === true
                    ? 'bg-emerald-500'
                    : isBackendOnline === false
                    ? 'bg-rose-500'
                    : 'bg-slate-400 animate-pulse'
                }`}
              />
              {isBackendOnline === true
                ? 'FastAPI Backend Online'
                : isBackendOnline === false
                ? 'Backend Offline (port 8000)'
                : 'Connecting to Backend...'}
            </span>
          </div>
        }
      />

      {/* Backend Connection Warning if Offline */}
      {isBackendOnline === false && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <Server size={18} />
            </div>
            <div>
              <p className="font-bold">FastAPI Server Not Detected at http://127.0.0.1:8000</p>
              <p className="text-amber-700 mt-0.5">
                Ensure the backend is running via <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono font-bold">uvicorn app.main:app --host 127.0.0.1 --port 8000</code>.
              </p>
            </div>
          </div>
          <Button
            size="xs"
            variant="outline"
            leftIcon={RefreshCw}
            onClick={() => checkBackendHealth()}
          >
            Check Again
          </Button>
        </div>
      )}

      {/* Error Alert Display */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-3 text-xs text-rose-900">
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Inference Error: </span>
              <span>{error}</span>
            </div>
          </div>
          <button
            onClick={clearError}
            className="text-rose-600 hover:text-rose-800 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Upload / Detection Studio */}
      {!prediction ? (
        <div className="space-y-6">
          {!selectedFile ? (
            <ImageDropzone
              onImageSelected={handleImageSelected}
              onError={(msg) => toast.error('Upload Error', msg)}
            />
          ) : (
            <ImagePreviewCard
              imageData={{
                ...fileMeta,
                previewUrl,
              }}
              weightKg={weightKg}
              onWeightChange={setWeightKg}
              isAnalyzing={isLoading}
              onAnalyze={handleAnalyze}
              onRemove={handleReset}
            />
          )}

          {/* Quick Test Preset Selector */}
          <SampleSelector
            onSelectSample={handleSampleSelected}
            disabled={isLoading}
          />
        </div>
      ) : (
        /* Actual Backend Prediction Result View */
        <PredictionResultCard
          result={prediction}
          imageUrl={previewUrl}
          onReset={handleReset}
        />
      )}
    </div>
  );
};

export default WasteDetectionView;
