import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`w-full px-4 py-2 rounded-lg border ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'
          } focus:outline-none focus:ring-2 transition-all duration-200 ${icon ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {icon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none flex items-center">
            {icon}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};