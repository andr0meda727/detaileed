import React from 'react';
import { Zap } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  fullPage?: boolean;
}

/** Centered loading spinner. Set fullPage for a full-height centered layout. */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream mesh-bg">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-deep rounded-xl flex items-center justify-center mx-auto mb-6 shadow-[0_20px_50px_rgba(26,46,30,0.25)]">
            <Zap size={36} className="text-cream-warm" strokeWidth={2.5} />
          </div>
          <div className="flex gap-1.5 justify-center">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-green-deep/40"
                style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-5">
        <div className="w-14 h-14 bg-green-deep rounded-2xl flex items-center justify-center shadow-xl">
          <Zap size={26} className="text-cream-warm" strokeWidth={2.5} />
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-green-deep/40"
              style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
