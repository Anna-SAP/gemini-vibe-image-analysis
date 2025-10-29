
import React, { useState, useCallback, useRef } from 'react';
import { analyzeImage } from './services/geminiService';

const UploadIcon = () => (
  <svg className="w-12 h-12 mx-auto text-slate-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400"></div>
    <span className="ml-4 text-slate-300">Analyzing, please wait...</span>
  </div>
);

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const App: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          setError('Please upload a valid image file.');
          setImageFile(null);
          setPreviewUrl(null);
          return;
        }
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setAnalysis('');
        setError('');
      }
    }, []);

    const handleAnalyze = useCallback(async () => {
      if (!imageFile) {
        setError('Please upload an image first.');
        return;
      }
      setIsLoading(true);
      setError('');
      setAnalysis('');

      try {
        const result = await analyzeImage(imageFile);
        setAnalysis(result);
      } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    }, [imageFile]);

    const handleUploadAreaClick = () => {
        fileInputRef.current?.click();
    };

    const handleCopy = useCallback(() => {
        if (!analysis || isCopied) return;
        navigator.clipboard.writeText(analysis).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            setError('Failed to copy text to clipboard.');
        });
    }, [analysis, isCopied]);

    return (
      <div className="bg-slate-900 text-white min-h-screen font-sans antialiased">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <header className="text-center mb-10 md:mb-16">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-500 pb-2">
              Gemini Image Analyzer
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto mt-2 text-lg">
              Upload any photo and let Gemini provide a comprehensive interpretation.
            </p>
          </header>

          <main className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left Panel: Image Upload */}
            <div className="bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700 flex flex-col items-center space-y-6">
              <h2 className="text-2xl font-semibold text-slate-100 self-start">1. Upload Your Image</h2>
              <div 
                className="w-full aspect-video rounded-lg border-2 border-dashed border-slate-600 flex flex-col justify-center items-center text-center cursor-pointer hover:border-cyan-400 hover:bg-slate-800 transition-all duration-300"
                onClick={handleUploadAreaClick}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                {previewUrl ? (
                  <img src={previewUrl} alt="Image preview" className="w-full h-full object-contain rounded-lg p-1" />
                ) : (
                  <div className="p-6">
                    <UploadIcon />
                    <p className="mt-2 text-slate-400">
                      <span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
              </div>
              <button
                onClick={handleAnalyze}
                disabled={!imageFile || isLoading}
                className="w-full py-3 px-6 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold rounded-lg shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 transition-transform duration-200"
              >
                {isLoading ? 'Analyzing...' : '✨ Analyze Image'}
              </button>
            </div>

            {/* Right Panel: Analysis Result */}
            <div className="bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700 min-h-[300px] lg:min-h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-semibold text-slate-100">2. Gemini's Analysis</h2>
                 {analysis && !isLoading && (
                    <button
                        onClick={handleCopy}
                        disabled={isCopied}
                        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-1 px-3 rounded-md text-sm transition-all duration-200 disabled:bg-emerald-500 disabled:text-white"
                        aria-label="Copy analysis to clipboard"
                    >
                        {isCopied ? <CheckIcon /> : <CopyIcon />}
                        <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                    </button>
                 )}
              </div>
              <div className="flex-grow bg-slate-900 rounded-lg p-4 prose prose-invert max-w-none prose-p:text-slate-300 prose-headings:text-slate-100">
                {isLoading && <Spinner />}
                {error && <p className="text-red-400">{error}</p>}
                {analysis ? (
                   <p className="whitespace-pre-wrap">{analysis}</p>
                ) : (
                    !isLoading && !error && <p className="text-slate-500">The analysis of your image will appear here.</p>
                )}
              </div>
            </div>
          </main>
          
          <footer className="text-center mt-12 text-slate-500 text-sm">
            <p>Powered by Google Gemini. Built with React & Tailwind CSS.</p>
          </footer>
        </div>
      </div>
    );
};

export default App;
