import type { InputHTMLAttributes } from 'react';

interface CurrencyInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function CurrencyInput({
  label = 'Nominal (IDR)',
  error,
  helperText,
  id,
  className = '',
  ...props
}: CurrencyInputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-[12px] font-medium text-[#787774] dark:text-[#9B9B9B]"
      >
        {label}
      </label>
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-2.5 font-mono text-[12px] font-medium text-[#787774] dark:text-[#9B9B9B]">
          Rp
        </span>
        <input
          id={inputId}
          type="number"
          step="1"
          min="0"
          className={`h-9 w-full rounded-[2px] border bg-[#FFFFFF] pl-8 pr-3 font-mono text-[13px] text-[#252525] tabular-nums placeholder:text-[#787774]/70 focus:border-[#E87932] focus:outline-none dark:bg-[#191919] dark:text-[#E6E6E6] ${
            error ? 'border-[#D44C47]' : 'border-[#E9E9E7] dark:border-[#343434]'
          } ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-[12px] text-[#D44C47]">{error}</p>
      ) : helperText ? (
        <p className="text-[12px] text-[#787774] dark:text-[#9B9B9B]">{helperText}</p>
      ) : null}
    </div>
  );
}
