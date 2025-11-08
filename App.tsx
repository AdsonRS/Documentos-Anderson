
import React, { useState, useCallback } from 'react';
import { transcribeDocument } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import TranscriptionView from './components/TranscriptionView';
import { Paragraph } from './types';
import { fileToBase64 } from './utils/fileUtils';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setParagraphs([]);
    setError(null);
  };
  
  const handleReset = () => {
    setImageFile(null);
    setImageUrl(null);
    setParagraphs([]);
    setError(null);
    setIsLoading(false);
  }

  const handleAnalyze = useCallback(async () => {
    if (!imageFile) {
      setError("Please upload an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const base64Image = await fileToBase64(imageFile);
      const mimeType = imageFile.type;
      
      const transcribedParagraphs = await transcribeDocument(base64Image, mimeType);
      
      const paragraphsWithIds = transcribedParagraphs.map((text, index) => ({
        id: index,
        text: text,
      }));

      setParagraphs(paragraphsWithIds);

    } catch (e: unknown) {
      const error = e as Error;
      console.error("Transcription failed:", error);
      setError(`Failed to analyze document. ${error.message || 'Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-cyan-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Document Organizer
          </h1>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ImageUploader 
            onImageUpload={handleImageUpload}
            imageUrl={imageUrl}
            onAnalyze={handleAnalyze}
            onReset={handleReset}
            isLoading={isLoading}
            hasAnalysisStarted={paragraphs.length > 0 || isLoading}
          />
          <TranscriptionView 
            paragraphs={paragraphs}
            isLoading={isLoading}
            error={error}
            imageUrl={imageUrl}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
