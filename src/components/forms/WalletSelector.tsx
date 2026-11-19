import type { SelectHTMLAttributes } from 'react';
import { useFincopStore } from '../../hooks/useFincopStore';
import { formatRupiah } from '../../utils/currency';

interface WalletSelectorProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  includeInactive?: boolean;
  showBalance?: boolean;
}

export function WalletSelector({
  label = 'Dompet',
  error,
  includeInactive = false,
  showBalance = true,
  id,
  className = '',
  ...props
}: WalletSelectorProps) {
  const { wallets } = useFincopStore();
  const options = includeInactive ? wallets : wallets.filter((w) => w.isActive);
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={selectId}
        className="text-[12px] font-medium text-[#787774] dark:text-[#9B9B9B]"
      >
        {label}
      </label>
      <select
        id={selectId}
        className={`h-9 w-full rounded-[2px] border bg-[#FFFFFF] px-2.5 text-[13px] text-[#252525] focus:border-[#E87932] focus:outline-none dark:bg-[#191919] dark:text-[#E6E6E6] ${
          error ? 'border-[#D44C47]' : 'border-[#E9E9E7] dark:border-[#343434]'
        } ${className}`}
        {...props}
      >
        {options.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
            {showBalance ? ` (${formatRupiah(w.currentBalance)})` : ''}
          </option>
        ))}
      </select>
      {error ? <p className="text-[12px] text-[#D44C47]">{error}</p> : null}
    </div>
  );
}
