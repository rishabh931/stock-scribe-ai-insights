
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface RawDataTableProps {
  data: any[];
  columns: string[];
  title: string;
}

export const RawDataTable = ({ data, columns, title }: RawDataTableProps) => {
  const formatValue = (key: string, value: any) => {
    if (key === 'year') return value;
    if (key === 'opm' || key === 'roe' || key === 'roce' || key === 'epsGrowth') return `${value}%`;
    if (key === 'pegRatio') return value;
    if (key === 'eps') return `₹${value}`;
    return `₹${value.toLocaleString()}Cr`;
  };

  const getColumnHeader = (column: string) => {
    const headers: { [key: string]: string } = {
      year: 'Year',
      revenue: 'Revenue (Cr)',
      operatingProfit: 'Operating Profit (Cr)',
      opm: 'OPM %',
      pbt: 'PBT (Cr)',
      pat: 'PAT (Cr)',
      eps: 'EPS',
      epsGrowth: 'EPS Growth %',
      pegRatio: 'PEG Ratio',
      roe: 'ROE %',
      roce: 'ROCE %'
    };
    return headers[column] || column;
  };

  return (
    <Card className="bg-slate-50 border border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-slate-700">📋 {title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-300">
                {columns.map((column) => (
                  <th key={column} className="text-left p-2 font-semibold text-slate-600">
                    {getColumnHeader(column)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="border-b border-slate-200 hover:bg-slate-100">
                  {columns.map((column) => (
                    <td key={column} className="p-2 text-slate-700">
                      {formatValue(column, row[column])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
