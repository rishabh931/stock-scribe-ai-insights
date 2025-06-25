
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';

interface RevenueChartProps {
  data: any[];
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
  const formatTooltip = (value: any, name: string) => {
    if (name === 'OPM%') {
      return [`${value}%`, name];
    }
    return [`₹${value.toLocaleString()}Cr`, name];
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="year" stroke="#666" />
          <YAxis yAxisId="left" stroke="#666" />
          <YAxis yAxisId="right" orientation="right" stroke="#666" />
          <Tooltip 
            formatter={formatTooltip}
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }} 
          />
          <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Revenue" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="left" dataKey="operatingProfit" fill="#10b981" name="Operating Profit" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="opm" stroke="#ef4444" strokeWidth={3} name="OPM%" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
