
import React from 'react';
import { ArtifactAnalysis } from '../types';

interface Props {
  analysis: ArtifactAnalysis;
  image: string;
}

export const VerificationCard: React.FC<Props> = ({ analysis, image }) => {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
          <img src={image} alt="Target artifact" className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">
              {analysis.category}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{analysis.name}</h2>
            <p className="text-sm text-gray-500 font-medium">Estimated Period: {analysis.estimatedPeriod}</p>
          </div>

          <p className="text-gray-700 leading-relaxed mb-6">
            {analysis.description}
          </p>

          {/* Historical Context */}
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <h4 className="font-bold text-blue-900 text-sm uppercase">Historical Context</h4>
            </div>
            <p className="text-sm text-blue-800 leading-relaxed">{analysis.historicalContext}</p>
          </div>

          {/* Inspection Guide */}
          <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              <h4 className="font-bold text-purple-900 text-sm uppercase">How to Inspect</h4>
            </div>
            <p className="text-sm text-purple-800 leading-relaxed whitespace-pre-line">{analysis.inspectionGuide}</p>
          </div>

          {/* Market Value Factors */}
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              <h4 className="font-bold text-amber-900 text-sm uppercase">Value Factors</h4>
            </div>
            <p className="text-sm text-amber-800 leading-relaxed whitespace-pre-line">{analysis.marketValueFactors}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Authenticity Markers */}
            <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-green-500 rounded-full">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="font-bold text-green-900 text-sm uppercase">Signs of Authenticity</h4>
              </div>
              <ul className="space-y-2">
                {analysis.authenticityMarkers.map((item, idx) => (
                  <li key={idx} className="text-sm text-green-800 flex gap-2">
                    <span className="text-green-400">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Counterfeit Signs */}
            <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-red-500 rounded-full">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h4 className="font-bold text-red-900 text-sm uppercase">Potential Red Flags</h4>
              </div>
              <ul className="space-y-2">
                {analysis.counterfeitSigns.map((item, idx) => (
                  <li key={idx} className="text-sm text-red-800 flex gap-2">
                    <span className="text-red-400">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Next Steps & Expertise
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Recommended Experts</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.suggestedExperts.map((expert, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {expert}
                </span>
              ))}
            </div>
          </div>

          {analysis.sources && analysis.sources.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Verification Sources</h4>
              <div className="space-y-2">
                {analysis.sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
                  >
                    <span className="text-sm font-medium text-blue-700 truncate mr-2">{source.title}</span>
                    <svg className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100 italic text-[10px] text-gray-400 text-center leading-tight">
          Disclaimer: This AI-generated report is for educational purposes only. Always consult a professional appraiser for legal or insurance valuations.
        </div>
      </div>
    </div>
  );
};
