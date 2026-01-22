
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setter(text);
    };
    reader.readAsText(file);
  };

  const renderInput = () => (
    <div className="max-w-2xl mx-auto py-6 animate-in fade-in duration-500">
      <Section title="Job Description" footer="Paste the full job posting text here.">
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Required skills, responsibilities, etc..."
          className="w-full h-48 p-4 text-base resize-none focus:outline-none placeholder:text-gray-400"
        />
      </Section>

      <Section title="Your Resume" footer="Paste your current resume or upload a .txt file.">
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Experience, education, skills..."
          className="w-full h-48 p-4 text-base resize-none focus:outline-none placeholder:text-gray-400"
        />
        <div className="border-t border-gray-100 p-3 bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-500">Import from file:</span>
          <input
            type="file"
            accept=".txt"
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

  return (
    <div className="min-h-screen pb-safe">
      <Header
        title={state === AppState.INPUT ? 'ResumeTailor Pro' : state === AppState.ANALYZING ? 'Processing' : 'Report'}
        onBack={state !== AppState.INPUT ? handleReset : undefined}
        usageDisplay={usageDisplay}
        isPro={isPro}
        onUpgradeClick={() => setShowPaywall(true)}
      />

      <main>
        {state === AppState.INPUT && renderInput()}
        {state === AppState.ANALYZING && renderAnalyzing()}
        {state === AppState.RESULTS && renderResults()}
      </main>

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
