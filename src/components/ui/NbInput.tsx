import React, { forwardRef } from "react";

interface NbInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  requiredMark?: boolean;
}

const NbInput = forwardRef<HTMLInputElement, NbInputProps>(
  ({ label, error, requiredMark = false, className = "", ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        <label className="block text-black font-black text-sm md:text-base uppercase tracking-wider">
          {label} {requiredMark && <span className="text-pink">💖</span>}
        </label>
        <input
          ref={ref}
          className={`nb-input ${
            error ? "border-pink" : "border-black"
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs md:text-sm font-black text-pink uppercase mt-1">
            ⚠️ {error}
          </span>
        )}
      </div>
    );
  }
);

NbInput.displayName = "NbInput";

export default NbInput;
