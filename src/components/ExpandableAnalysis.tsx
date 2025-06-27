
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ExpandableAnalysisProps {
  title: string;
  content: string;
  icon?: string;
  defaultExpanded?: boolean;
}

export const ExpandableAnalysis = ({ 
  title, 
  content, 
  icon = "📊", 
  defaultExpanded = false 
}: ExpandableAnalysisProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className="border border-slate-200">
      <div className="p-4">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between p-0 h-auto font-semibold text-slate-700 hover:bg-transparent"
        >
          <span className="flex items-center gap-2">
            {icon} {title}
          </span>
          {isExpanded ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />
          }
        </Button>
        
        {isExpanded && (
          <CardContent className="pt-4 px-0 pb-0">
            <div className="prose prose-sm max-w-none text-slate-600">
              {content.split('\n').map((line, index) => (
                <p key={index} className="mb-2 last:mb-0">
                  {line}
                </p>
              ))}
            </div>
          </CardContent>
        )}
      </div>
    </Card>
  );
};
