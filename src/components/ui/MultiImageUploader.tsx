import React from 'react';
import CloudinaryImageUploader from './CloudinaryImageUploader';

interface MultiImageUploaderProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
  className?: string;
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

export default function MultiImageUploader({
  value = [],
  onChange,
  label = 'Upload Images',
  maxFiles = 5,
  maxSize = 5,
  className,
  uploadOptions = {}
}: MultiImageUploaderProps) {
  const handleUpload = (urls: string[]) => {
    onChange([...value, ...urls]);
  };

  const handleRemove = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <CloudinaryImageUploader
        onUpload={handleUpload}
        maxFiles={maxFiles}
        maxSize={maxSize}
        existingImages={value}
        onRemove={handleRemove}
        className="min-h-[300px]"
        uploadOptions={uploadOptions}
      />
    </div>
  );
}
