import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import adminService from '../../services/adminService';

interface ImageUploadProps {
    images: string[];
    onChange: (images: string[]) => void;
    multiple?: boolean;
    maxImages?: number;
    folder?: string;
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

export default function ImageUpload({
    images,
    onChange,
    multiple = false,
    maxImages = 5,
    folder = 'products',
    uploadOptions
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const uploadToCloudinary = async (file: File): Promise<string> => {
        try {
            // Use uploadOptions if provided, otherwise use folder prop
            const requestOptions = uploadOptions || { folder };
            
            // Get upload signature from backend
            const signature = await adminService.getCloudinaryUploadSignature(requestOptions);

            // Create form data for Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', signature.apiKey);
            formData.append('timestamp', signature.timestamp.toString());
            formData.append('signature', signature.signature);
            formData.append('folder', signature.folder);

            // Add transformation if provided by backend
            if (signature.transformation) {
                const transformation = [
                    `w_${signature.transformation.width}`,
                    `h_${signature.transformation.height}`,
                    `c_${signature.transformation.crop}`,
                    `q_${signature.transformation.quality}`
                ].join(',');
                formData.append('transformation', transformation);
            }

            // Upload to Cloudinary
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    };

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);
        const remainingSlots = maxImages - images.length;

        if (!multiple && images.length > 0) {
            alert('Only one image is allowed');
            return;
        }

        if (fileArray.length > remainingSlots) {
            alert(`You can only upload ${remainingSlots} more image(s)`);
            return;
        }

        setUploading(true);

        try {
            const uploadPromises = fileArray.map(file => uploadToCloudinary(file));
            const urls = await Promise.all(uploadPromises);

            if (multiple) {
                onChange([...images, ...urls]);
            } else {
                onChange(urls);
            }
        } catch (error) {
            alert('Failed to upload images. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
    }, [images]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    }, []);

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        onChange(newImages);
    };

    const moveImage = (fromIndex: number, toIndex: number) => {
        const newImages = [...images];
        const [movedImage] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, movedImage);
        onChange(newImages);
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-gray-400'
                    } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
                <input
                    type="file"
                    id="image-upload"
                    className="hidden"
                    accept="image/*"
                    multiple={multiple}
                    onChange={(e) => handleFiles(e.target.files)}
                    disabled={uploading || (!multiple && images.length > 0)}
                />

                <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                >
                    <Upload className="w-12 h-12 text-gray-400" />
                    <div>
                        <p className="text-sm font-medium text-gray-700">
                            {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, GIF up to 10MB
                            {multiple && ` (Max ${maxImages} images)`}
                        </p>
                    </div>
                </label>
            </div>

            {/* Image Preview */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((url, index) => (
                        <div
                            key={index}
                            className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200"
                        >
                            <img
                                src={url}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-full object-cover"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                >
                                    <X size={16} />
                                </button>

                                {multiple && index > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => moveImage(index, index - 1)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100"
                                    >
                                        ←
                                    </button>
                                )}

                                {multiple && index < images.length - 1 && (
                                    <button
                                        type="button"
                                        onClick={() => moveImage(index, index + 1)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100"
                                    >
                                        →
                                    </button>
                                )}
                            </div>

                            {/* Primary Badge */}
                            {index === 0 && multiple && (
                                <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded">
                                    Primary
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
