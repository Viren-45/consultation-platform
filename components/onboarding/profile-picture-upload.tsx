// components/onboarding/profile-picture-upload.tsx
"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-easy-crop';
import { Camera, Upload, X, Check, RotateCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';

interface ProfilePictureUploadProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage?: string | null;
  onImageSelect: (file: File, previewUrl: string) => void;
  onImageRemove: () => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ProfilePictureUpload = ({
  isOpen,
  onClose,
  currentImage,
  onImageSelect,
  onImageRemove
}: ProfilePictureUploadProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [step, setStep] = useState<'upload' | 'crop'>('upload');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setOriginalFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setStep('crop');
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false
  });

  const onCropComplete = useCallback((croppedArea: CropArea, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async (): Promise<{ file: File; url: string } | null> => {
    if (!selectedImage || !croppedAreaPixels || !originalFile) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();

    return new Promise((resolve) => {
      image.onload = () => {
        const { width, height, x, y } = croppedAreaPixels;
        
        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(image, x, y, width, height, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const croppedFile = new File([blob], originalFile.name, {
              type: originalFile.type,
            });
            const url = URL.createObjectURL(blob);
            resolve({ file: croppedFile, url });
          } else {
            resolve(null);
          }
        }, originalFile.type);
      };
      image.src = selectedImage;
    });
  };

  const handleConfirm = async () => {
    if (step === 'crop') {
      const result = await createCroppedImage();
      if (result) {
        onImageSelect(result.file, result.url);
        handleClose();
      }
    }
  };

  const handleRemove = () => {
    onImageRemove();
    handleClose();
  };

  const handleClose = () => {
    setSelectedImage(null);
    setOriginalFile(null);
    setStep('upload');
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    onClose();
  };

  const goBackToUpload = () => {
    setSelectedImage(null);
    setOriginalFile(null);
    setStep('upload');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center space-x-2 text-gray-900">
            <Camera className="w-5 h-5 text-blue-600" />
            <span>{step === 'upload' ? 'Upload Profile Picture' : 'Crop Your Photo'}</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {step === 'upload' 
              ? 'Upload a professional photo. Max 5MB, JPEG/PNG/WebP formats.'
              : 'Adjust the crop area and zoom to get the perfect profile picture.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {step === 'upload' ? (
            // Upload Step
            <div
              {...getRootProps()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {isDragActive ? 'Drop your photo here' : 'Drop your photo here'}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    or click to browse files
                  </p>
                  
                  <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Camera className="w-4 h-4 mr-2" />
                    Choose Photo
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Crop Step
            <div className="space-y-4">
              <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                <Cropper
                  image={selectedImage!}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  cropShape="rect"
                  showGrid={false}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Zoom</label>
                <Slider
                  value={[zoom]}
                  onValueChange={(value) => setZoom(value[0])}
                  min={1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <div>
              {currentImage && step === 'upload' && (
                <Button
                  onClick={handleRemove}
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Current
                </Button>
              )}
              
              {step === 'crop' && (
                <Button
                  onClick={goBackToUpload}
                  variant="outline"
                  className="text-gray-600 hover:text-gray-800"
                >
                  <RotateCw className="w-4 h-4 mr-2" />
                  Choose Different
                </Button>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleClose}
                variant="ghost"
                className="text-gray-600 hover:text-gray-800"
              >
                Cancel
              </Button>
              
              {step === 'crop' && (
                <Button
                  onClick={handleConfirm}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Use This Photo
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePictureUpload;