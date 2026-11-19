import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Cari data...',
  className = '',
}: SearchInputProps) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search
        className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-[#787774] dark:text-[#9B9B9B]"
        aria-hidden="true"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 w-full rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] pl-8 pr-7 text-[13px] text-[#252525] placeholder:text-[#787774]/70 focus:border-[#E87932] focus:outline-none dark:border-[#343434] dark:bg-[#202020] dark:text-[#E6E6E6] dark:placeholder:text-[#9B9B9B]/60"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Hapus pencarian"
          className="absolute right-1.5 rounded-[2px] p-0.5 text-[#787774] hover:bg-[#F5F5F4] hover:text-[#252525] dark:text-[#9B9B9B] dark:hover:bg-[#252525] dark:hover:text-[#E6E6E6]"
        >
          <X className="h-3 w-3" />
        </button>
      ) : null}
    </div>
  );
}
