import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  fullPage?: boolean;
}

/** Centered loading spinner. Set fullPage for a full-height centered layout. */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 40, className = '', fullPage = false }) => {
  const inner = <Loader2 size={size} className={`animate-spin text-[#102C26]/30 ${className}`} />;

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8F0]">
        {inner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-16">
      {inner}
    </div>
  );
};

export default LoadingSpinner;
