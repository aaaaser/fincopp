import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { SearchInput } from '../common/SearchInput';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  render: (row: T) => ReactNode;
  widthClass?: string;
}

interface DataTableProps<T> {
  rows: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T) => string | number;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filterControls?: ReactNode;
  pageSize?: number;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  searchPlaceholder = 'Cari data...',
  searchValue,
  onSearchChange,
  filterControls,
  pageSize = 10,
  emptyMessage = 'Tidak ada data yang tersedia.',
  onRowClick,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState<number>(1);

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col || !col.sortable) return rows;

    const getVal =
      col.sortValue ?? ((r: T) => String((r as Record<string, unknown>)[col.key] ?? ''));
    return [...rows].sort((a, b) => {
      const va = getVal(a);
      const vb = getVal(b);
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      const cmp = String(va).localeCompare(String(vb), 'id');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [rows, columns, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, safePage, pageSize]);

  const handleToggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  return (
    <div className="rounded-none border border-[#E9E9E7] bg-[#FFFFFF] dark:border-[#343434] dark:bg-[#191919]">
      {onSearchChange || filterControls ? (
        <div className="flex flex-col justify-between gap-2.5 border-b border-[#E9E9E7] px-3.5 py-2.5 dark:border-[#343434] sm:flex-row sm:items-center">
          {onSearchChange ? (
            <SearchInput
              value={searchValue ?? ''}
              onChange={(val) => {
                onSearchChange(val);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full sm:w-64"
            />
          ) : (
            <div />
          )}
          {filterControls ? (
            <div className="flex flex-wrap items-center gap-2">{filterControls}</div>
          ) : null}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-[#E9E9E7] bg-[#F7F7F5] text-[12px] font-medium text-[#787774] dark:border-[#343434] dark:bg-[#202020] dark:text-[#9B9B9B]">
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    className={`px-3.5 py-2.5 font-medium whitespace-nowrap ${
                      col.align === 'right' ? 'text-right' : 'text-left'
                    } ${col.widthClass ?? ''}`}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleToggleSort(col.key)}
                        className="inline-flex items-center gap-1 hover:text-[#252525] dark:hover:text-[#E6E6E6]"
                      >
                        <span>{col.header}</span>
                        {isSorted ? (
                          sortDir === 'asc' ? (
                            <ArrowUp className="h-3 w-3 text-[#E87932]" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-[#E87932]" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E9E9E7] dark:divide-[#343434]">
            {paginatedRows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`transition-colors hover:bg-[#F5F5F4] dark:hover:bg-[#252525] ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-3.5 py-2.5 text-[#252525] dark:text-[#E6E6E6] ${
                      col.align === 'right' ? 'text-right tabular-nums' : 'text-left'
                    }`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
            {paginatedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-[13px] text-[#787774] dark:text-[#9B9B9B]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {sortedRows.length > 0 ? (
        <div className="flex items-center justify-between border-t border-[#E9E9E7] px-3.5 py-2 text-[12px] text-[#787774] dark:border-[#343434] dark:text-[#9B9B9B]">
          <span className="tabular-nums">
            Menampilkan {paginatedRows.length} dari {sortedRows.length} data
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Halaman sebelumnya"
              className="inline-flex h-7 w-7 items-center justify-center rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] text-[#252525] transition-colors hover:bg-[#F5F5F4] disabled:opacity-40 dark:border-[#343434] dark:bg-[#202020] dark:text-[#E6E6E6] dark:hover:bg-[#252525]"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 tabular-nums">
              {safePage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Halaman berikutnya"
              className="inline-flex h-7 w-7 items-center justify-center rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] text-[#252525] transition-colors hover:bg-[#F5F5F4] disabled:opacity-40 dark:border-[#343434] dark:bg-[#202020] dark:text-[#E6E6E6] dark:hover:bg-[#252525]"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
