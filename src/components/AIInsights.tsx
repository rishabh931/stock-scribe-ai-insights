
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Sparkles } from 'lucide-react';

interface AIInsightsProps {
  insights: string;
  stockName: string;
  sectionTitle?: string;
}

export const AIInsights = ({ insights, stockName, sectionTitle }: AIInsightsProps) => {
  const formatInsights = (text: string) => {
    if (!text) return <p className="text-slate-500">No insights available</p>;
    
    const lines = text.split('\n').filter(line => line.trim());
    
    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
        return (
          <div key={index} className="flex items-start gap-3 mb-3 p-3 bg-slate-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-slate-700 leading-relaxed">{trimmedLine.substring(1).trim()}</p>
          </div>
        );
      } else if (trimmedLine.includes('**') || trimmedLine.includes('#')) {
        return (
          <h4 key={index} className="font-semibold text-lg text-slate-800 mt-6 mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            {trimmedLine.replace(/[*#]/g, '')}
          </h4>
        );
      } else if (trimmedLine) {
        return (
          <p key={index} className="text-slate-700 mb-2 leading-relaxed">
            {trimmedLine}
          </p>
        );
      }
      return null;
    });
  };

  return (
    <Card className="shadow-sm border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 bg-blue-600 rounded-full">
            <Brain className="h-5 w-5 text-white" />
          </div>
          🧠 {sectionTitle ? `${sectionTitle}` : `AI Analysis for ${stockName}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="prose max-w-none">
            {formatInsights(insights)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
