import React, { InputHTMLAttributes, forwardRef } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, leftIcon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 focus-within:-translate-y-0.5 transition-transform duration-200">
        {label && (
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-3.5 bg-slate-50 border-2 rounded-xl outline-none font-semibold text-sm transition-all
              ${error ? 'border-red-400/50 focus:border-red-500 bg-red-50' : 'border-transparent focus:border-cream-warm/50'}
              ${leftIcon ? 'pl-11' : ''}
              ${rightIcon ? 'pr-11' : ''}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {/* Error message slot with stable height to prevent layout shift */}
        <div className="h-4 px-1 flex items-center justify-start overflow-hidden">
          <div className={`transition-all duration-300 transform ${error ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
              {error}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;
