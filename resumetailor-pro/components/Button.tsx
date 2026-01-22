
import React from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ onClick, children, disabled, variant = 'primary', loading }) => {
  const baseStyles = "w-full py-4 rounded-xl font-semibold text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-[#007AFF] text-white disabled:bg-gray-300",
    secondary: "bg-gray-100 text-[#007AFF] disabled:text-gray-400",
    danger: "bg-red-500 text-white disabled:bg-red-200"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]}`}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : children}
    </button>
  );
};

export default Button;
