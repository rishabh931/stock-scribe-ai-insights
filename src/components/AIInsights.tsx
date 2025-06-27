
import { ExpandableAnalysis } from './ExpandableAnalysis';

interface AIInsightsProps {
  insights: string;
  stockName: string;
  sectionTitle: string;
}

export const AIInsights = ({ insights, stockName, sectionTitle }: AIInsightsProps) => {
  if (!insights) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>Analysis will appear here after processing {stockName} data</p>
      </div>
    );
  }

  const getIcon = (title: string) => {
    if (title.includes('Revenue')) return '📈';
    if (title.includes('Profitability')) return '💰';
    if (title.includes('EPS')) return '📊';
    if (title.includes('Sentiment') || title.includes('Investment')) return '🎯';
    return '📋';
  };

  return (
    <div className="space-y-4">
      <ExpandableAnalysis
        title={sectionTitle}
        content={insights}
        icon={getIcon(sectionTitle)}
        defaultExpanded={false}
      />
    </div>
  );
};
