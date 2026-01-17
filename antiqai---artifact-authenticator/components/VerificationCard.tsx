
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
