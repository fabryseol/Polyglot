import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  description?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, title, description, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {(title || description) && (
        <div className="px-6 py-4 border-b border-gray-100">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {description && <div className="text-sm text-gray-500 mt-1">{description}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};