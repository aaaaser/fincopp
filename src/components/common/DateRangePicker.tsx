interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5">
        <span className="text-[12px] text-[#787774] dark:text-[#9B9B9B]">Dari</span>
        <input
          type="date"
          aria-label="Tanggal mulai"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="h-8 rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] px-2 text-[13px] text-[#252525] focus:border-[#E87932] focus:outline-none dark:border-[#343434] dark:bg-[#202020] dark:text-[#E6E6E6]"
        />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[12px] text-[#787774] dark:text-[#9B9B9B]">Sampai</span>
        <input
          type="date"
          aria-label="Tanggal akhir"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="h-8 rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] px-2 text-[13px] text-[#252525] focus:border-[#E87932] focus:outline-none dark:border-[#343434] dark:bg-[#202020] dark:text-[#E6E6E6]"
        />
      </div>
    </div>
  );
}
