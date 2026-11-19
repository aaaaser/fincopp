import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Gift, HandCoins, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useFincopStore, type QuickAddAction } from '../../hooks/useFincopStore';

const QUICK_OPTIONS: Array<{
  id: QuickAddAction;
  label: string;
  icon: typeof ArrowDownLeft;
}> = [
  { id: 'income', label: 'Tambah Pemasukan', icon: ArrowDownLeft },
  { id: 'expense', label: 'Tambah Pengeluaran', icon: ArrowUpRight },
  { id: 'transfer', label: 'Transfer Antar-Dompet', icon: ArrowLeftRight },
  { id: 'donation', label: 'Input Donasi Live Stream', icon: Gift },
  { id: 'debt', label: 'Catat Utang / Piutang', icon: HandCoins },
];

export function QuickAddMenu() {
  const { setQuickAddType } = useFincopStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    window.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      window.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-7 items-center gap-1.5 rounded-[2px] bg-[#E87932] px-2.5 text-[12px] font-medium text-white transition-colors hover:bg-[#d66b27] whitespace-nowrap shrink-0"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Quick Add</span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-1.5 w-56 rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] py-1 dark:border-[#343434] dark:bg-[#202020]"
        >
          <p className="px-3 py-1 text-[11px] font-medium text-[#787774] dark:text-[#9B9B9B]">
            Catat Cepat (Simulasi)
          </p>
          {QUICK_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  setQuickAddType(opt.id);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-[#252525] transition-colors hover:bg-[#F5F5F4] dark:text-[#E6E6E6] dark:hover:bg-[#252525]"
              >
                <Icon className="h-3.5 w-3.5 text-[#E87932]" aria-hidden="true" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
