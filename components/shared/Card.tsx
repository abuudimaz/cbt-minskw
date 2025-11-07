
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className, title }) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
        {title && (
             <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            </div>
        )}
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
