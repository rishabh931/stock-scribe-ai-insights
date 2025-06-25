
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ComposedChart, Bar } from 'recharts';

interface EPSChartProps {
  data: any[];
}

export const EPSChart = ({ data }: EPSChartProps) => {
  // Calculate EPS growth rate
  const dataWithGrowth = data.map((item, index) => {
    if (index === 0) {
      return { ...item, epsGrowth: 0 };
    }
    const prevEps = data[index - 1].eps;
    const currentEps = item.eps;
    const growthRate = ((currentEps - prevEps) / prevEps) * 100;
    return { ...item, epsGrowth: Math.round(growthRate * 100) / 100 };
  });

  const formatTooltip = (value: any, name: string) => {
    if (name === 'EPS Growth %') {
      return [`${value}%`, name];
    }
    return [`₹${value}`, name];
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={dataWithGrowth} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="epsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
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
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="eps"
            stroke="#8b5cf6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#epsGradient)"
            name="EPS"
          />
          <Bar yAxisId="right" dataKey="epsGrowth" fill="#10b981" name="EPS Growth %" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
