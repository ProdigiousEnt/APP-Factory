
import React from 'react';

interface KeySelectorProps {
  onKeySelected: () => void;
}

const KeySelector: React.FC<KeySelectorProps> = ({ onKeySelected }) => {
  const handleOpenKeyPicker = async () => {
    try {
      // @ts-ignore - window.aistudio is injected
      await window.aistudio.openSelectKey();
      onKeySelected();
    } catch (error) {
      console.error("Failed to open key picker", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fa-solid fa-key text-2xl"></i>
        </div>
        <h2 className="text-2xl font-bold mb-4">Gemini 3 Pro Access</h2>
        <p className="text-slate-600 mb-8">
          This application uses advanced AI models that require a paid API key for high-quality visuals. 
          Please select your API key from a billing-enabled Google Cloud project.
        </p>
        <button
          onClick={handleOpenKeyPicker}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 mb-4"
        >
          Select API Key
        </button>
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          Learn about billing documentation
        </a>
      </div>
    </div>
  );
};

export default KeySelector;
