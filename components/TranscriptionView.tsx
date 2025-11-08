
import React from 'react';
import { Paragraph } from '../types';
import ParagraphCard from './ParagraphCard';

interface TranscriptionViewProps {
  paragraphs: Paragraph[];
  isLoading: boolean;
  error: string | null;
  imageUrl: string | null;
}

const TranscriptionView: React.FC<TranscriptionViewProps> = ({ paragraphs, isLoading, error, imageUrl }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-4 shadow-lg animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-900/50 border border-red-700 text-red-300 rounded-lg p-4 text-center">
          <p className="font-bold">An Error Occurred</p>
          <p>{error}</p>
        </div>
      );
    }
    
    if (paragraphs.length > 0) {
      return (
        <div className="space-y-4">
          {paragraphs.map((p, index) => (
            <ParagraphCard key={p.id} paragraph={p} index={index} />
          ))}
        </div>
      );
    }
    
    if (imageUrl) {
        return (
            <div className="bg-gray-800 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-gray-400 font-semibold">Ready to analyze.</p>
                <p className="text-gray-500">Click "Analyze Document" to begin transcription.</p>
            </div>
        )
    }

    return (
      <div className="bg-gray-800 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 00-2.828 0L6 14" />
        </svg>
        <p className="text-gray-400 font-semibold">Upload a document to start.</p>
        <p className="text-gray-500">Your transcribed paragraphs will appear here.</p>
      </div>
    );
  };
  
  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-2xl">
      <h2 className="text-xl font-semibold text-cyan-300 border-b border-gray-700 pb-2 mb-4">2. Transcribed Content</h2>
      {renderContent()}
    </div>
  );
};

export default TranscriptionView;
