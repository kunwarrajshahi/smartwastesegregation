import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, AlertCircle } from 'lucide-react';
import Button from '../../design-system/Button';

export const ImageDropzone = ({ onImageSelected, onError }) => {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSizeBytes = 10 * 1024 * 1024; // 10 MB

  const validateAndProcessFile = (file) => {
    if (!file) return;

    // Type validation
    if (!acceptedTypes.includes(file.type.toLowerCase())) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
        if (onError) onError('Invalid File Format. Please upload a JPG, JPEG, PNG, or WEBP image.');
        return;
      }
    }

    // Size validation
    if (file.size > maxSizeBytes) {
      if (onError) onError(`File exceeds 10 MB size limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please select a smaller image.`);
      return;
    }

    // Generate local preview URL
    const previewUrl = URL.createObjectURL(file);
    onImageSelected({
      file,
      name: file.name,
      size: formatFileSize(file.size),
      sizeBytes: file.size,
      type: file.type || 'image/jpeg',
      previewUrl,
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
        isDragOver
          ? 'border-forest-600 bg-forest-50/70 scale-[1.01]'
          : 'border-slate-300 hover:border-forest-500 hover:bg-slate-50/80 bg-white shadow-2xs'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        aria-label="Upload waste image"
      />

      <div className="w-16 h-16 rounded-2xl bg-forest-50 text-forest-700 flex items-center justify-center mb-4 border border-forest-100 shadow-xs">
        <UploadCloud size={30} className={isDragOver ? 'animate-bounce' : ''} />
      </div>

      <h4 className="text-base font-bold text-slate-800 mb-1">
        Drag and drop your waste image here
      </h4>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-4 leading-relaxed">
        Upload photos of bottles, cardboard boxes, organic scraps, cans, or packaging for automated AI classification.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
          JPG / JPEG
        </span>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
          PNG
        </span>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
          WEBP
        </span>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-forest-50 text-forest-800 border border-forest-200">
          Max 10 MB
        </span>
      </div>

      <Button
        type="button"
        variant="primary"
        size="sm"
        leftIcon={ImageIcon}
        onClick={(e) => {
          e.stopPropagation();
          fileInputRef.current?.click();
        }}
      >
        Browse Image File
      </Button>
    </div>
  );
};

export default ImageDropzone;
