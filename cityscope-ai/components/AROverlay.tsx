
import React from 'react';

interface AROverlayProps {
  features: string[];
}

const AROverlay: React.FC<AROverlayProps> = ({ features }) => {
  // Randomize positions slightly to simulate "anchoring" to features in the photo
  const positions = [
    { top: '30%', left: '25%' },
    { top: '50%', left: '60%' },
    { top: '20%', left: '70%' },
  ];

  return (
    <div className="absolute inset-0 ar-overlay z-10 overflow-hidden">
      {features.map((feature, idx) => (
        <div 
          key={idx}
          className="absolute"
          style={positions[idx % positions.length]}
        >
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full pulse shadow-lg shadow-blue-500/50"></div>
            <div className="mt-2 glass px-3 py-1 rounded-full border border-white/50 shadow-xl scale-90 origin-top">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 whitespace-nowrap">
                {feature}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AROverlay;
