
import React, { useRef } from 'react';
import { UploadIcon, DocumentSearchIcon, RefreshIcon } from './Icons';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  imageUrl: string | null;
  onAnalyze: () => void;
  onReset: () => void;
  isLoading: boolean;
  hasAnalysisStarted: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUpload, imageUrl, onAnalyze, onReset, isLoading, hasAnalysisStarted 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageUpload(event.target.files[0]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      onImageUpload(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-2xl flex flex-col space-y-4 sticky top-24 h-fit">
       <h2 className="text-xl font-semibold text-cyan-300 border-b border-gray-700 pb-2">1. Upload Document</h2>
      {!imageUrl ? (
        <div
          onClick={handleUploadClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-600 rounded-lg p-10 text-center cursor-pointer hover:border-cyan-400 hover:bg-gray-700/50 transition-all duration-300 flex flex-col items-center justify-center h-64"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          <UploadIcon className="h-12 w-12 text-gray-500 mb-4" />
          <p className="text-gray-400">
            <span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF, WEBP</p>
        </div>
      ) : (
        <div className="mt-4 relative">
          <img src={imageUrl} alt="Uploaded document" className="rounded-lg max-h-96 w-full object-contain" />
        </div>
      )}
      
      {imageUrl && (
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              onClick={onAnalyze}
              disabled={isLoading || hasAnalysisStarted}
              className="flex-grow inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              <DocumentSearchIcon className="h-5 w-5 mr-2" />
              {isLoading ? 'Analyzing...' : 'Analyze Document'}
            </button>
            <button
              onClick={onReset}
              className="inline-flex items-center justify-center px-4 py-3 border border-gray-600 text-base font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              <RefreshIcon className="h-5 w-5" />
            </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
