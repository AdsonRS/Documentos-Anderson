
import React, { useState, useCallback, useRef } from 'react';
import { Paragraph, GroundingSource } from '../types';
import { analyzeParagraph, getTextToSpeech, searchContext } from '../services/geminiService';
import { playAudio } from '../utils/audioUtils';
import { VolumeUpIcon, SparklesIcon, SearchCircleIcon, ClipboardCopyIcon, CheckIcon } from './Icons';

interface ParagraphCardProps {
  paragraph: Paragraph;
  index: number;
}

type AnalysisType = 'summarize' | 'search';

const ParagraphCard: React.FC<ParagraphCardProps> = ({ paragraph, index }) => {
  const [text, setText] = useState(paragraph.text);
  const [isLoading, setIsLoading] = useState(false);
  const [isTtsLoading, setIsTtsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisType | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const handleTTS = useCallback(async () => {
    setIsTtsLoading(true);
    setError(null);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const base64Audio = await getTextToSpeech(text);
      await playAudio(base64Audio, audioContextRef.current);
    } catch (e) {
      console.error("TTS failed:", e);
      setError("Failed to generate audio.");
    } finally {
      setIsTtsLoading(false);
    }
  }, [text]);

  const handleAnalysis = useCallback(async (type: AnalysisType) => {
    setActiveAnalysis(type);
    setIsLoading(true);
    setAnalysisResult(null);
    setSources([]);
    setError(null);
    
    try {
      if (type === 'summarize') {
        const result = await analyzeParagraph(text);
        setAnalysisResult(result);
      } else if (type === 'search') {
        const { text: result, sources: resultSources } = await searchContext(text);
        setAnalysisResult(result);
        setSources(resultSources);
      }
    } catch (e) {
        console.error(`${type} failed:`, e);
        setError(`Failed to perform analysis. Please try again.`);
    } finally {
        setIsLoading(false);
    }
  }, [text]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const AnalysisResultDisplay = () => {
    if(isLoading) return <div className="p-4 text-center text-gray-400">Thinking...</div>;
    if(error) return <div className="p-4 text-red-400">{error}</div>;
    if(!analysisResult) return null;
    
    return (
      <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
        <p className="whitespace-pre-wrap text-gray-300">{analysisResult}</p>
        {sources.length > 0 && (
          <div className="mt-4 border-t border-gray-700 pt-2">
            <h4 className="text-sm font-semibold text-cyan-400 mb-2">Sources:</h4>
            <ul className="list-disc list-inside space-y-1">
              {sources.map((source, i) => source.web && (
                 <li key={i} className="text-xs">
                    <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">
                      {source.web.title || source.web.uri}
                    </a>
                  </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-800/70 rounded-xl p-4 shadow-lg transition-all duration-300">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg text-cyan-400">Paragraph {index + 1}</h3>
        <button onClick={handleCopyToClipboard} className="text-gray-400 hover:text-white transition-colors p-1">
            {isCopied ? <CheckIcon className="h-5 w-5 text-green-400" /> : <ClipboardCopyIcon className="h-5 w-5" />}
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full bg-gray-900/50 p-3 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow text-gray-200 resize-y min-h-[100px]"
        rows={4}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={handleTTS} disabled={isTtsLoading} className="flex items-center text-sm bg-gray-700 text-white py-1 px-3 rounded-full hover:bg-gray-600 transition disabled:opacity-50">
          {isTtsLoading ? <div className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin mr-2"></div> : <VolumeUpIcon className="h-4 w-4 mr-2" />}
          Read Aloud
        </button>
        <button onClick={() => handleAnalysis('summarize')} disabled={isLoading} className="flex items-center text-sm bg-gray-700 text-white py-1 px-3 rounded-full hover:bg-gray-600 transition disabled:opacity-50">
          <SparklesIcon className="h-4 w-4 mr-2" />
          Summarize
        </button>
         <button onClick={() => handleAnalysis('search')} disabled={isLoading} className="flex items-center text-sm bg-gray-700 text-white py-1 px-3 rounded-full hover:bg-gray-600 transition disabled:opacity-50">
          <SearchCircleIcon className="h-4 w-4 mr-2" />
          Search Context
        </button>
      </div>
      {activeAnalysis && <AnalysisResultDisplay />}
    </div>
  );
};

export default ParagraphCard;
