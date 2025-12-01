import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import adminService from '../../services/adminService';
import { defaultUploadOptions } from '../../config/cloudinary';
import { CloudinaryUploadResponse, CloudinaryUploadError, CloudinaryUploadSignatureRequest } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface CloudinaryImageUploaderProps {
  onUpload: (urls: string[]) => void;
  onError?: (error: string) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
  disabled?: boolean;
  existingImages?: string[];
  onRemove?: (index: number) => void;
  uploadOptions?: {
    folder?: string;
    transformation?: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string;
    };
  };
}

export default function CloudinaryImageUploader({
  onUpload,
  onError,
  maxFiles = 5,
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  className = '',
  disabled = false,
  existingImages = [],
  onRemove,
  uploadOptions = {}
}: CloudinaryImageUploaderProps) {
  const { t } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return t('banners.invalidFileType');
    }
    if (file.size > maxSize * 1024 * 1024) {
      return t('banners.fileTooLarge');
    }
    return null;
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    try {
      // Get upload signature from backend
      const signatureRequest: CloudinaryUploadSignatureRequest = {
        folder: uploadOptions.folder || defaultUploadOptions.folder,
        transformation: uploadOptions.transformation || defaultUploadOptions.transformation
      };

      const signatureData = await adminService.getCloudinaryUploadSignature(signatureRequest);

      // Prepare form data with signature - use the exact format from backend
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signatureData.signature);
      formData.append('timestamp', signatureData.timestamp.toString());
      formData.append('api_key', signatureData.apiKey);
      formData.append('folder', signatureData.folder);

      // Use the transformation exactly as provided by backend
      if (signatureData.transformation) {
        const transformation = [
          `w_${signatureData.transformation.width}`,
          `h_${signatureData.transformation.height}`,
          `c_${signatureData.transformation.crop}`,
          `q_${signatureData.transformation.quality}`,
          `f_${signatureData.transformation.fetch_format || 'auto'}`
        ].join(',');

        formData.append('transformation', transformation);
      }

      // Upload to Cloudinary
      const uploadUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`;

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error: CloudinaryUploadError = await response.json();
        console.error('Cloudinary Upload Error:', error);
        throw new Error(error.error.message);
      }

      const result: CloudinaryUploadResponse = await response.json();
      return result.secure_url;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;

    const fileArray = Array.from(files);
    const totalFiles = existingImages.length + fileArray.length;

    if (totalFiles > maxFiles) {
      onError?.(t('banners.maxFilesExceeded').replace('{{max}}', maxFiles.toString()));
      return;
    }

    setIsUploading(true);
    setUploadErrors({});

    const uploadPromises = fileArray.map(async (file, index) => {
      const fileId = `${file.name}-${index}`;

      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setUploadErrors(prev => ({ ...prev, [fileId]: validationError }));
        return null;
      }

      try {
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

        // Simulate progress (Cloudinary doesn't provide real-time progress)
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: Math.min(prev[fileId] + 10, 90)
          }));
        }, 100);

        const url = await uploadToCloudinary(file);

        clearInterval(progressInterval);
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));

        return url;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : t('banners.uploadError');
        setUploadErrors(prev => ({ ...prev, [fileId]: errorMessage }));
        return null;
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((url): url is string => url !== null);

      if (successfulUploads.length > 0) {
        onUpload([...existingImages, ...successfulUploads]);
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : t('banners.uploadError'));
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  }, [disabled]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleRemoveImage = (index: number) => {
    if (onRemove) {
      onRemove(index);
    }
  };

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary-400'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        <div className="space-y-2">
          <Upload className={`mx-auto h-12 w-12 ${dragActive ? 'text-primary-500' : 'text-gray-400'}`} />
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isUploading ? t('banners.uploading') : t('banners.dragDrop')}
            </p>
            <p className="text-sm text-gray-500">
              {t('banners.supportedFormats')}: JPEG, PNG, WebP, GIF
            </p>
            <p className="text-sm text-gray-500">
              {t('banners.maxSize')}: {maxSize}MB
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{fileId.split('-')[0]}</span>
                <span className="text-gray-500">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {uploadErrors[fileId] && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {uploadErrors[fileId]}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image Gallery */}
      {existingImages.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">{t('banners.uploadedImages')}</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {existingImages.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={disabled}
                >
                  <X size={14} />
                </button>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Status */}
      {isUploading && (
        <div className="flex items-center justify-center gap-2 text-primary-600">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent" />
          <span className="text-sm">{t('banners.uploading')}</span>
        </div>
      )}
    </div>
  );
}
