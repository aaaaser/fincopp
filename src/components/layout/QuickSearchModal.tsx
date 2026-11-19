import { ArrowRight, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFincopStore } from '../../hooks/useFincopStore';
import { formatRupiah } from '../../utils/currency';
import { StatusBadge } from '../common/StatusBadge';

export interface QuickSearchNavEntry {
  path: string;
  label: string;
  group: string;
}

interface QuickSearchModalProps {
  open: boolean;
  onClose: () => void;
  navRoutes: QuickSearchNavEntry[];
}

export function QuickSearchModal({ open, onClose, navRoutes }: QuickSearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { wallets, incomes, expenses, sortedActiveQueue, debts } = useFincopStore();

  useEffect(() => {
    if (!open) return;
    setQuery('');
    const timer = window.setTimeout(() => inputRef.current?.focus(), 20);
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEsc);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', onEsc);
    };
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pages = navRoutes.filter(
      (r) => !q || r.label.toLowerCase().includes(q) || r.group.toLowerCase().includes(q)
    );
    const matchedWallets = q
      ? wallets.filter((w) => w.name.toLowerCase().includes(q))
      : [];
    const matchedIncomes = q
      ? incomes.filter(
          (i) => i.title.toLowerCase().includes(q) || i.source.toLowerCase().includes(q)
        )
      : [];
    const matchedExpenses = q
      ? expenses.filter((e) => e.title.toLowerCase().includes(q))
      : [];
    const matchedQueue = q
      ? sortedActiveQueue.filter((item) => item.nickname.toLowerCase().includes(q))
      : [];
    const matchedDebts = q
      ? debts.filter((d) => d.partyName.toLowerCase().includes(q))
      : [];

    return {
      pages,
      matchedWallets,
      matchedIncomes,
      matchedExpenses,
      matchedQueue,
      matchedDebts,
    };
  }, [query, navRoutes, wallets, incomes, expenses, sortedActiveQueue, debts]);

  if (!open) return null;

  const goTo = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 px-4 pt-20"
      role="dialog"
      aria-modal="true"
      aria-label="Quick Search FINCOP"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] dark:border-[#343434] dark:bg-[#202020]">
        <div className="flex items-center gap-2.5 border-b border-[#E9E9E7] px-3.5 py-2.5 dark:border-[#343434]">
          <Search className="h-4 w-4 shrink-0 text-[#787774] dark:text-[#9B9B9B]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik nama halaman, dompet, transaksi, atau nickname mabar..."
            className="w-full bg-transparent text-[14px] text-[#252525] placeholder:text-[#787774] focus:outline-none dark:text-[#E6E6E6] dark:placeholder:text-[#9B9B9B]"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup quick search"
            className="rounded-[2px] p-1 text-[#787774] hover:bg-[#F5F5F4] dark:text-[#9B9B9B] dark:hover:bg-[#252525]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {/* Halaman */}
          {results.pages.length > 0 ? (
            <div className="mb-2">
              <p className="px-2 py-1 text-[11px] font-medium text-[#787774] dark:text-[#9B9B9B]">
                Navigasi Halaman
              </p>
              {results.pages.map((page) => (
                <button
                  key={page.path}
                  type="button"
                  onClick={() => goTo(page.path)}
                  className="flex w-full items-center justify-between rounded-[2px] px-2.5 py-1.5 text-left text-[13px] text-[#252525] hover:bg-[#F5F5F4] dark:text-[#E6E6E6] dark:hover:bg-[#252525]"
                >
                  <span>{page.label}</span>
                  <span className="flex items-center gap-1.5 text-[11px] text-[#787774] dark:text-[#9B9B9B]">
                    {page.group}
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {/* Dompet */}
          {results.matchedWallets.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => goTo('/dompet')}
              className="flex w-full items-center justify-between rounded-[2px] px-2.5 py-1.5 text-left text-[13px] hover:bg-[#F5F5F4] dark:hover:bg-[#252525]"
            >
              <span>Dompet: {w.name}</span>
              <span className="font-mono text-[12px] text-[#448361] tabular-nums">
                {formatRupiah(w.currentBalance)}
              </span>
            </button>
          ))}

          {/* Pemasukan */}
          {results.matchedIncomes.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => goTo('/pemasukan')}
              className="flex w-full items-center justify-between rounded-[2px] px-2.5 py-1.5 text-left text-[13px] hover:bg-[#F5F5F4] dark:hover:bg-[#252525]"
            >
              <span>Pemasukan: {i.title}</span>
              <span className="font-mono text-[12px] text-[#448361] tabular-nums">
                +{formatRupiah(i.amount)}
              </span>
            </button>
          ))}

          {/* Pengeluaran */}
          {results.matchedExpenses.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => goTo('/pengeluaran')}
              className="flex w-full items-center justify-between rounded-[2px] px-2.5 py-1.5 text-left text-[13px] hover:bg-[#F5F5F4] dark:hover:bg-[#252525]"
            >
              <span>Pengeluaran: {e.title}</span>
              <span className="font-mono text-[12px] text-[#D44C47] tabular-nums">
                -{formatRupiah(e.amount)}
              </span>
            </button>
          ))}

          {/* Antrean Mabar */}
          {results.matchedQueue.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo('/antrean-mabar')}
              className="flex w-full items-center justify-between rounded-[2px] px-2.5 py-1.5 text-left text-[13px] hover:bg-[#F5F5F4] dark:hover:bg-[#252525]"
            >
              <span>Mabar: {item.nickname}</span>
              <StatusBadge tone="accent">{item.remainingMatches} match tersisa</StatusBadge>
            </button>
          ))}

          {/* Utang / Piutang */}
          {results.matchedDebts.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => goTo('/utang-piutang')}
              className="flex w-full items-center justify-between rounded-[2px] px-2.5 py-1.5 text-left text-[13px] hover:bg-[#F5F5F4] dark:hover:bg-[#252525]"
            >
              <span>
                {d.kind}: {d.partyName}
              </span>
              <span className="font-mono text-[12px] text-[#787774] tabular-nums">
                Sisa {formatRupiah(d.remainingAmount)}
              </span>
            </button>
          ))}

          {results.pages.length === 0 &&
          results.matchedWallets.length === 0 &&
          results.matchedIncomes.length === 0 &&
          results.matchedExpenses.length === 0 &&
          results.matchedQueue.length === 0 &&
          results.matchedDebts.length === 0 ? (
            <p className="px-3 py-6 text-center text-[13px] text-[#787774] dark:text-[#9B9B9B]">
              Tidak ditemukan hasil untuk "{query}".
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-[#E9E9E7] bg-[#F7F7F5] px-3.5 py-2 text-[11px] text-[#787774] dark:border-[#343434] dark:bg-[#191919] dark:text-[#9B9B9B]">
          <span>Klik item untuk berpindah langsung</span>
          <span className="font-mono">ESC untuk tutup</span>
        </div>
      </div>
    </div>
  );
}
