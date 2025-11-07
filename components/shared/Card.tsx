import React from 'react';

interface CardProps {
    children: React.ReactNode;
    title?: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, title, className = '' }) => {
    return (
        <div className={`bg-white shadow-lg rounded-lg overflow-hidden ${className}`}>
            {title && (
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                    <h3 className="text-lg font-semibold text-gray-800 text-center">{title}</h3>
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
        </div>
    );
};

export default Card;