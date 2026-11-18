import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
}

export function Input({
  label,
  helperText,
  error,
  leftIcon,
  id,
  className = '',
  ...props
}: InputProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label
          htmlFor={inputId}
          className="text-[12px] font-medium text-[#787774] dark:text-[#9B9B9B]"
        >
          {label}
        </label>
      ) : null}
      <div className="relative flex items-center">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-2.5 text-[#787774] dark:text-[#9B9B9B]">
            {leftIcon}
          </span>
        ) : null}
        <input
          id={inputId}
          className={`h-9 w-full rounded-[2px] border bg-[#FFFFFF] text-[13px] text-[#252525] placeholder:text-[#787774]/70 transition-colors focus:border-[#E87932] focus:outline-none disabled:cursor-not-allowed disabled:bg-[#F5F5F4] dark:bg-[#191919] dark:text-[#E6E6E6] dark:placeholder:text-[#9B9B9B]/60 dark:disabled:bg-[#252525] ${
            error
              ? 'border-[#D44C47]'
              : 'border-[#E9E9E7] dark:border-[#343434]'
          } ${leftIcon ? 'pl-8 pr-3' : 'px-3'} ${className}`}
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
