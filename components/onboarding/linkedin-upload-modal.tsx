// components/onboarding/linkedin-upload-modal.tsx
"use client";

import { useRef } from 'react';
import { Upload, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LinkedInUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUpload: (file: File) => void;
  uploadedFile: File | null;
  onFileRemove: () => void;
}

const LinkedInUploadModal = ({
  isOpen,
  onClose,
  onFileUpload,
  uploadedFile,
  onFileRemove
}: LinkedInUploadModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file.type === 'application/pdf') {
      onFileUpload(file);
    } else {
      alert('Please upload a PDF file only.');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl bg-white border-0 p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Upload your LinkedIn profile
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Step 1 */}
          <div className="space-y-4">
            <p className="text-gray-700">
              Step 1: if you haven't already, save your LinkedIn profile as a PDF. Here's how:
            </p>
            
            {/* Demo Image */}
            <div className="rounded-lg overflow-hidden bg-gray-50 max-w-lg mx-auto">
              <img
                src="/images/linkedin-demo.png"
                alt="LinkedIn profile save as PDF demo"
                className="w-full h-auto max-h-80 object-contain"
                onError={(e) => {
                  // Fallback if image doesn't exist
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-4">
            <p className="text-gray-700">
              Step 2: come back here to upload it.
            </p>

            {/* Upload Button or File Display */}
            {!uploadedFile ? (
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Upload your saved LinkedIn PDF
              </Button>
            ) : (
              /* Uploaded File Display */
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded">
                      <FileText className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {uploadedFile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {uploadedFile.size > 0 ? formatFileSize(uploadedFile.size) : 'PDF file'}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onFileRemove}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button
              onClick={onClose}
              disabled={!uploadedFile}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:text-gray-900 disabled:cursor-not-allowed cursor-pointer"
            >
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LinkedInUploadModal;