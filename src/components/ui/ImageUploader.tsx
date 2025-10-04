import React from 'react';
import CloudinaryImageUploader from './CloudinaryImageUploader';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  maxSize?: number; // in MB
  className?: string;
}

export default function ImageUploader({
  value,
  onChange,
  label = 'Upload Image',
  maxSize = 5,
  className,
}: ImageUploaderProps) {
  const handleUpload = (urls: string[]) => {
    if (urls.length > 0) {
      onChange(urls[0]); // Take the first uploaded image
    }
  };

  const handleRemove = (index: number) => {
    onChange(''); // Clear the single image
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
        maxFiles={1}
        maxSize={maxSize}
        existingImages={value ? [value] : []}
        onRemove={handleRemove}
        className="min-h-[200px]"
      />
    </div>
  );
}

