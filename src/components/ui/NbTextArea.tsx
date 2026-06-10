import React, { forwardRef } from "react";

interface NbTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  requiredMark?: boolean;
}

const NbTextArea = forwardRef<HTMLTextAreaElement, NbTextAreaProps>(
  ({ label, error, requiredMark = false, className = "", ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        <label className="block text-black font-black text-sm md:text-base uppercase tracking-wider">
          {label} {requiredMark && <span className="text-pink">💖</span>}
        </label>
        <textarea
          ref={ref}
          className={`nb-input min-h-[100px] resize-none ${
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

NbTextArea.displayName = "NbTextArea";

export default NbTextArea;
