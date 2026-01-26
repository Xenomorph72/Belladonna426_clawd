import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-slate-800/50 rounded-xl shadow-lg backdrop-blur-lg overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`p-4 md:p-5 border-b border-slate-200 dark:border-slate-700 ${className}`}>
            {children}
        </div>
    )
}

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`p-4 md:p-5 ${className}`}>
            {children}
        </div>
    )
}

export default Card;
