
import React, { useState } from 'react';
import { EmailCampaign, ImageSize } from '../types';
import { generateCampaignImage } from '../services/geminiService';

interface CampaignViewerProps {
  campaign: EmailCampaign;
}

const CampaignViewer: React.FC<CampaignViewerProps> = ({ campaign }) => {
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<ImageSize>(ImageSize.SIZE_1K);
  const [generatingImage, setGeneratingImage] = useState(false);

  const handleGenerateImage = async () => {
    setGeneratingImage(true);
    try {
      const url = await generateCampaignImage(campaign.imagePrompt, imageSize);
      setGeneratedImageUrl(url);
    } catch (error) {
      console.error("Image generation failed", error);
      alert("Image generation failed. Ensure your API key is correctly configured for Gemini 3 Pro.");
    } finally {
      setGeneratingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{campaign.title}</h2>
            <p className="text-sm text-slate-500">Generated on {new Date(campaign.createdAt).toLocaleDateString()}</p>
          </div>
          <button className="text-slate-400 hover:text-slate-600">
             <i className="fa-solid fa-ellipsis-vertical text-xl"></i>
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Header Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <i className="fa-solid fa-envelope-open text-blue-500"></i> Subject Lines
              </h3>
              <div className="space-y-2">
                {campaign.subjectLines.map((line, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm italic group flex justify-between">
                    <span>"{line}"</span>
                    <button onClick={() => navigator.clipboard.writeText(line)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <i className="fa-regular fa-copy text-slate-400 hover:text-blue-500"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <i className="fa-solid fa-magnifying-glass text-blue-500"></i> Preview Text
              </h3>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm">
                {campaign.previewText}
              </div>
            </div>
          </div>

          {/* Visual Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <i className="fa-solid fa-image text-blue-500"></i> Campaign Visual
            </h3>
            
            <div className="relative group min-h-[300px] bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-200">
              {generatedImageUrl ? (
                <img src={generatedImageUrl} alt="Campaign Visual" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-8">
                  <i className="fa-solid fa-mountain-sun text-4xl text-slate-300 mb-4"></i>
                  <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                    {campaign.imagePrompt}
                  </p>
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-2 p-1 bg-white rounded-lg shadow-sm">
                      {[ImageSize.SIZE_1K, ImageSize.SIZE_2K, ImageSize.SIZE_4K].map((size) => (
                        <button
                          key={size}
                          onClick={() => setImageSize(size)}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                            imageSize === size ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleGenerateImage}
                      disabled={generatingImage}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold flex items-center gap-2 shadow-lg active:scale-95 transition-all"
                    >
                      {generatingImage ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-bolt"></i>}
                      Generate with Nano Banana Pro
                    </button>
                  </div>
                </div>
              )}
              
              {generatedImageUrl && (
                 <div className="absolute top-4 right-4 flex gap-2">
                   <button 
                    onClick={() => setGeneratedImageUrl(null)}
                    className="bg-white/90 hover:bg-white p-2 rounded-lg shadow text-slate-600 transition-all"
                   >
                     <i className="fa-solid fa-rotate-left"></i>
                   </button>
                 </div>
              )}
            </div>
          </div>

          {/* Body Copy Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <i className="fa-solid fa-align-left text-blue-500"></i> Email Content
            </h3>
            <div className="prose prose-slate max-w-none p-8 bg-white border border-slate-200 rounded-2xl shadow-inner min-h-[400px]">
              {campaign.bodyText.split('\n').map((para, i) => (
                <p key={i} className="mb-4 text-slate-700 leading-relaxed">{para}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignViewer;
