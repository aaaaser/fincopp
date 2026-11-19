import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatRupiah } from '../../utils/currency';

export interface CashFlowPoint {
  label: string;
  pemasukan: number;
  pengeluaran: number;
}

interface CashFlowChartProps {
  data: CashFlowPoint[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E9E9E7" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: '#787774' }}
            axisLine={{ stroke: '#E9E9E7' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#787774' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${Math.round(Number(v) / 1000000)}jt`}
          />
          <Tooltip
            formatter={(val) => formatRupiah(Number(val ?? 0))}
            contentStyle={{
              borderRadius: '2px',
              borderColor: '#E9E9E7',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="pemasukan" name="Pemasukan" fill="#448361" radius={[2, 2, 0, 0]} />
          <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#D44C47" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
