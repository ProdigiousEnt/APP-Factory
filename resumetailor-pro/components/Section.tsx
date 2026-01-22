
import React from 'react';

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  footer?: string;
}

const Section: React.FC<SectionProps> = ({ title, children, footer }) => {
  return (
    <div className="mb-6 px-4">
      {title && (
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 ml-4">
          {title}
        </h2>
      )}
      <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
        {children}
      </div>
      {footer && (
        <p className="text-xs text-gray-500 mt-2 ml-4">
          {footer}
        </p>
      )}
    </div>
  );
};

export default Section;
