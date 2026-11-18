import type { SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export function Select({
  label,
  options,
  error,
  id,
  className = '',
  ...props
}: SelectProps) {
  const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label
          htmlFor={selectId}
          className="text-[12px] font-medium text-[#787774] dark:text-[#9B9B9B]"
        >
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        className={`h-9 w-full rounded-[2px] border bg-[#FFFFFF] px-2.5 text-[13px] text-[#252525] transition-colors focus:border-[#E87932] focus:outline-none disabled:cursor-not-allowed disabled:bg-[#F5F5F4] dark:bg-[#191919] dark:text-[#E6E6E6] dark:disabled:bg-[#252525] ${
          error ? 'border-[#D44C47]' : 'border-[#E9E9E7] dark:border-[#343434]'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-[12px] text-[#D44C47]">{error}</p> : null}
    </div>
  );
}
