
import React from 'react';

const LoadingSpinner: React.FC<{ text?: string }> = ({ text = "Memuat..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
