
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProfitabilityChartProps {
  data: any[];
}

export const ProfitabilityChart = ({ data }: ProfitabilityChartProps) => {
  const formatTooltip = (value: any, name: string) => {
    return [`₹${value.toLocaleString()}Cr`, name];
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="year" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip 
            formatter={formatTooltip}
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }} 
          />
          <Bar dataKey="pbt" stackId="profit" fill="#f59e0b" name="PBT" radius={[0, 0, 0, 0]} />
          <Bar dataKey="pat" stackId="profit" fill="#3b82f6" name="PAT" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
