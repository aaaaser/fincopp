import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatRupiah } from '../../utils/currency';

export interface CategoryAmountPoint {
  category: string;
  total: number;
}

interface CategoryExpenseChartProps {
  data: CategoryAmountPoint[];
  barColor?: string;
}

export function CategoryExpenseChart({
  data,
  barColor = '#E87932',
}: CategoryExpenseChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 16, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E9E9E7" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#787774' }}
            axisLine={{ stroke: '#E9E9E7' }}
            tickLine={false}
            tickFormatter={(v) => `${Math.round(Number(v) / 1000)}rb`}
          />
          <YAxis
            type="category"
            dataKey="category"
            width={110}
            tick={{ fontSize: 12, fill: '#787774' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(val) => formatRupiah(Number(val ?? 0))}
            contentStyle={{
              borderRadius: '2px',
              borderColor: '#E9E9E7',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="total" name="Total" fill={barColor} radius={[0, 2, 2, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
