
import React, { useState, useCallback, useEffect } from 'react';
import { AppState, CritiqueResult, TailoredResumeResult } from './types';
import { analyzeResumeAndJob } from './services/geminiService';
import { revenueCatService } from './services/revenueCatService';
import { usageTrackingService } from './services/usageTrackingService';
import Header from './components/Header';
import Section from './components/Section';
import Button from './components/Button';
import Paywall from './components/Paywall';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.INPUT);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ critique: CritiqueResult; tailored: TailoredResumeResult } | null>(null);
  const [activeTab, setActiveTab] = useState<'critique' | 'tailored'>('critique');
  const [isPro, setIsPro] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [usageDisplay, setUsageDisplay] = useState('');

  // Initialize RevenueCat and check subscription status
  useEffect(() => {
    const init = async () => {
      await revenueCatService.initialize();
      const proStatus = await revenueCatService.checkSubscriptionStatus();
      setIsPro(proStatus);
      updateUsageDisplay(proStatus);
    };
    init();
  }, []);

  const updateUsageDisplay = (proStatus: boolean) => {
    const display = usageTrackingService.getUsageDisplay(proStatus);
    setUsageDisplay(display);
  };

  const handleAnalyze = async () => {
    if (!resumeText || !jobDescription) return;

    // Check usage limits
    const { canUse } = usageTrackingService.checkUsageLimit(isPro);
    if (!canUse) {
      setShowPaywall(true);
      return;
    }

    setLoading(true);
    setState(AppState.ANALYZING);
    try {
      const data = await analyzeResumeAndJob(resumeText, jobDescription);
      setResults(data);
      setState(AppState.RESULTS);

      // Record usage after successful analysis
      usageTrackingService.recordUsage(isPro);
      updateUsageDisplay(isPro);
    } catch (error) {
      console.error(error);
      alert('Failed to analyze. Please try again.');
      setState(AppState.INPUT);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseSuccess = async () => {
    const proStatus = await revenueCatService.checkSubscriptionStatus();
    setIsPro(proStatus);
    updateUsageDisplay(proStatus);
  };

  const handleReset = () => {
    setState(AppState.INPUT);
    setResults(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      // Use FileReader for all file types - works reliably in iOS
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const result = event.target?.result;

          if (file.type === 'application/pdf') {
            // For PDFs, try to extract text using pdf.js
            try {
              const arrayBuffer = result as ArrayBuffer;
              const pdfjsLib = await import('pdfjs-dist');

              // Use local worker instead of CDN for iOS compatibility
              pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

              const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
              let fullText = '';

              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += pageText + '\n\n';
              }

              if (fullText.trim()) {
                setter(fullText.trim());
              } else {
                alert('Could not extract text from PDF. Please try copying and pasting the text instead.');
              }
            } catch (pdfError) {
              console.error('PDF parsing error:', pdfError);
              alert('Could not read PDF. Please copy and paste the text instead.');
            }
          } else if (file.type.startsWith('image/')) {
            // For images, use OCR
            alert('Processing image... This may take 10-20 seconds.');
            const Tesseract = await import('tesseract.js');
            const ocrResult = await Tesseract.recognize(file, 'eng');
            setter(ocrResult.data.text);
          } else {
            // For text files, just use the result as string
            setter(result as string);
          }
        } catch (innerError) {
          console.error('File processing error:', innerError);
          alert('Failed to process file. Please try copying and pasting the text instead.');
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = () => {
        alert('Failed to read file. Please try again or copy/paste the text.');
        setLoading(false);
      };

      // Read file based on type
      if (file.type === 'application/pdf') {
        reader.readAsArrayBuffer(file);
      } else if (file.type.startsWith('image/')) {
        // Images are handled directly by Tesseract, no need to read
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }

    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file. Please try copying and pasting the text instead.');
      setLoading(false);
    }
  };

  const renderInput = () => (
    <div className="max-w-2xl mx-auto py-6 animate-in fade-in duration-500">
      <Section title="Job Description" footer="Paste the full job posting text here.">
        <div className="relative">
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Required skills, responsibilities, etc..."
            className="w-full h-48 p-4 pr-10 text-base resize-none focus:outline-none placeholder:text-gray-400"
          />
          {jobDescription && (
            <button
              onClick={() => setJobDescription('')}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors"
              aria-label="Clear job description"
            >
              ×
            </button>
          )}
        </div>
      </Section>

      <Section title="Your Resume" footer="For best results, convert your resume to .txt format. Also accepts .pdf, .jpg, .png files.">
        <div className="relative">
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Experience, education, skills..."
            className="w-full h-48 p-4 pr-10 text-base resize-none focus:outline-none placeholder:text-gray-400"
          />
          {resumeText && (
            <button
              onClick={() => setResumeText('')}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors"
              aria-label="Clear resume"
            >
              ×
            </button>
          )}
        </div>
        <div className="border-t border-gray-100 p-3 bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-500">Import from file:</span>
          <input
            type="file"
            accept=".txt,.pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileUpload(e, setResumeText)}
            className="text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#007AFF] file:text-white hover:file:bg-blue-600"
          />
        </div>
      </Section>

      <div className="px-4 mt-8 safe-bottom">
        <Button
          onClick={handleAnalyze}
          disabled={!resumeText || !jobDescription}
          loading={loading}
        >
          Analyze & Tailor
        </Button>

        <button
          onClick={() => setState(AppState.TUTORIAL)}
          className="w-full mt-4 text-sm text-blue-600 underline"
        >
          How to Use This App
        </button>
      </div>
    </div>
  );

  const renderAnalyzing = () => (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center animate-pulse">
      <div className="w-16 h-16 bg-[#007AFF] rounded-full flex items-center justify-center mb-6">
        <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-2">Analyzing your fit...</h2>
      <p className="text-gray-500">Gemini is comparing your resume against the job requirements to find the perfect match.</p>
    </div>
  );

  const renderResults = () => {
    if (!results) return null;

    return (
      <div className="max-w-2xl mx-auto py-6 animate-in slide-in-from-bottom duration-500 pb-24">
        {/* Tab Switcher */}
        <div className="px-4 mb-6">
          <div className="flex bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('critique')}
              className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-all ${activeTab === 'critique' ? 'bg-white shadow text-black' : 'text-gray-600'}`}
            >
              Critique
            </button>
            <button
              onClick={() => setActiveTab('tailored')}
              className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-all ${activeTab === 'tailored' ? 'bg-white shadow text-black' : 'text-gray-600'}`}
            >
              Tailored Resume
            </button>
          </div>
        </div>

        {activeTab === 'critique' ? (
          <>
            <Section title="Matching Score">
              <div className="p-6 flex flex-col items-center">
                <div className={`text-5xl font-bold mb-2 ${results.critique.overallScore >= 80 ? 'text-green-500' : results.critique.overallScore >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {results.critique.overallScore}%
                </div>
                <p className="text-sm text-gray-500 font-medium">Job Alignment Score</p>
              </div>
            </Section>

            <Section title="Strengths">
              <ul className="divide-y divide-gray-100">
                {results.critique.strengths.map((s, i) => (
                  <li key={i} className="p-4 text-gray-700 flex items-start gap-3">
                    <span className="text-green-500 mt-1">✓</span> {s}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Gaps & Weaknesses">
              <ul className="divide-y divide-gray-100">
                {results.critique.weaknesses.map((w, i) => (
                  <li key={i} className="p-4 text-gray-700 flex items-start gap-3">
                    <span className="text-red-500 mt-1">!</span> {w}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Actionable Suggestions">
              <ul className="divide-y divide-gray-100">
                {results.critique.actionableSuggestions.map((a, i) => (
                  <li key={i} className="p-4 text-gray-700 flex items-start gap-3">
                    <span className="text-[#007AFF] mt-1">•</span> {a}
                  </li>
                ))}
              </ul>
            </Section>
          </>
        ) : (
          <>
            <Section title="Suggested Headline">
              <div className="p-4 text-lg font-bold text-[#007AFF]">
                {results.tailored.suggestedHeadline}
              </div>
            </Section>

            <Section title="Professional Summary">
              <div className="p-4 text-gray-700 leading-relaxed italic">
                "{results.tailored.professionalSummary}"
              </div>
            </Section>

            <Section title="Tailored Bullets">
              <div className="divide-y divide-gray-100">
                {results.tailored.experienceBullets.map((exp, i) => (
                  <div key={i} className="p-4">
                    <h3 className="font-bold mb-2">{exp.company}</h3>
                    <ul className="space-y-2">
                      {exp.bullets.map((b, bi) => (
                        <li key={bi} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-gray-400">•</span> {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Full Optimized Content">
              <div className="p-4 bg-gray-50 text-xs font-mono whitespace-pre-wrap overflow-x-auto text-gray-600">
                {results.tailored.fullTailoredContent}
              </div>
            </Section>

            <div className="px-4 mt-4">
              <Button onClick={() => {
                navigator.clipboard.writeText(results.tailored.fullTailoredContent);
                alert('Copied to clipboard!');
              }} variant="secondary">
                Copy Content
              </Button>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderInfo = () => (
    <div className="max-w-2xl mx-auto py-6 px-4 pb-24 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold mb-4">How to Use ResumeTailor Pro</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">📋 Quick Workflow</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Find a job posting you want to apply for</li>
            <li>Copy the entire job description</li>
            <li>Paste it into the "Job Description" field</li>
            <li>Paste your resume into the "Your Resume" field</li>
            <li>Tap "Analyze & Tailor"</li>
            <li>Review your match score and tailored suggestions</li>
            <li>Copy the tailored content and paste into your resume</li>
          </ol>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">💡 Pro Tips</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>For best results, convert your resume to .txt format</li>
            <li>Keep ResumeTailor Pro open while job hunting</li>
            <li>Tailor your resume for each application (takes 30 seconds!)</li>
            <li>Copy specific sections you like - keep your design/branding</li>
            <li>Use the "Copy Content" button for easy pasting</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">🎯 What You Get</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Job Alignment Score:</strong> See how well you match (0-100%)</li>
            <li><strong>Strengths:</strong> What makes you a great fit</li>
            <li><strong>Gaps:</strong> Missing keywords and qualifications</li>
            <li><strong>Tailored Resume:</strong> Optimized headline, summary, and content</li>
          </ul>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Free Tier:</strong> 3 analyses (lifetime)<br />
            <strong>Pro Tier:</strong> 1,000 analyses/month for $4.99
          </p>
        </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="max-w-2xl mx-auto py-6 px-4 pb-24 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold mb-4">Analysis History</h2>
      <div className="bg-gray-100 p-8 rounded-lg text-center">
        <p className="text-gray-500">History feature coming soon!</p>
        <p className="text-sm text-gray-400 mt-2">Your past analyses will appear here.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-safe">
      <Header
        title={state === AppState.INPUT ? 'ResumeTailor Pro' : state === AppState.ANALYZING ? 'Processing' : state === AppState.INFO ? 'How to Use' : state === AppState.HISTORY ? 'History' : 'Report'}
        onBack={state !== AppState.INPUT && state !== AppState.INFO && state !== AppState.HISTORY ? handleReset : undefined}
        usageDisplay={usageDisplay}
        isPro={isPro}
        onUpgradeClick={() => setShowPaywall(true)}
      />

      <main className="pt-4">
        {state === AppState.INPUT && renderInput()}
        {state === AppState.ANALYZING && renderAnalyzing()}
        {state === AppState.RESULTS && renderResults()}
        {state === AppState.INFO && renderInfo()}
        {state === AppState.HISTORY && renderHistory()}
      </main>

      {/* Bottom Navigation Bar */}
      {state !== AppState.ANALYZING && state !== AppState.RESULTS && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom">
          <div className="flex justify-around items-center h-16 max-w-2xl mx-auto">
            <button
              onClick={() => setState(AppState.INPUT)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${state === AppState.INPUT ? 'text-blue-600' : 'text-gray-400'
                }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs font-medium">Home</span>
            </button>

            <button
              onClick={() => setState(AppState.HISTORY)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${state === AppState.HISTORY ? 'text-blue-600' : 'text-gray-400'
                }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium">History</span>
            </button>

            <button
              onClick={() => setState(AppState.INFO)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${state === AppState.INFO ? 'text-blue-600' : 'text-gray-400'
                }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium">Info</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Action for Results */}
      {state === AppState.RESULTS && (
        <div className="fixed bottom-0 left-0 right-0 p-4 ios-blur border-t border-gray-200 safe-bottom">
          <div className="max-w-2xl mx-auto">
            <Button onClick={handleReset}>New Analysis</Button>
          </div>
        </div>
      )}

      {/* Paywall Modal */}
      {showPaywall && (
        <Paywall
          onClose={() => setShowPaywall(false)}
          onPurchaseSuccess={handlePurchaseSuccess}
        />
      )}
    </div>
  );
};

export default App;
