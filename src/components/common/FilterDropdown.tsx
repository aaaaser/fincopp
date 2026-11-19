import type { SelectOption } from '../ui/Select';

interface FilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  ariaLabel?: string;
  className?: string;
}

export function FilterDropdown({
  value,
  onChange,
  options,
  ariaLabel = 'Filter data',
  className = '',
}: FilterDropdownProps) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-8 rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] px-2.5 text-[13px] text-[#252525] focus:border-[#E87932] focus:outline-none dark:border-[#343434] dark:bg-[#202020] dark:text-[#E6E6E6] ${className}`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
