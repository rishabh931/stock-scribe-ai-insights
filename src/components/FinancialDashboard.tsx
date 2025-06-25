
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RevenueChart } from '@/components/RevenueChart';
import { ProfitabilityChart } from '@/components/ProfitabilityChart';
import { EPSChart } from '@/components/EPSChart';
import { AIInsights } from '@/components/AIInsights';
import { Download, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FinancialDashboardProps {
  stockName: string;
  financialData: any[];
  aiInsights: string;
  isLoading: boolean;
}

export const FinancialDashboard = ({ stockName, financialData, aiInsights, isLoading }: FinancialDashboardProps) => {
  const handleDownloadReport = () => {
    toast({
      title: "Report Download",
      description: "PDF report generation feature coming soon!"
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-slate-600">Analyzing {stockName}...</p>
          <p className="text-sm text-slate-500">Fetching financial data and generating AI insights</p>
        </div>
      </div>
    );
  }

  if (!financialData) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">{stockName} Analysis</h2>
          <p className="text-slate-600">Comprehensive financial analysis with AI insights</p>
        </div>
        <Button onClick={handleDownloadReport} className="bg-green-600 hover:bg-green-700">
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
      </div>

      {/* Financial Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {financialData && financialData.length > 0 && (
          <>
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-700">
                  ₹{financialData[financialData.length - 1]?.revenue?.toLocaleString()}Cr
                </div>
                <div className="text-sm text-blue-600">Latest Revenue</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-700">
                  {financialData[financialData.length - 1]?.opm}%
                </div>
                <div className="text-sm text-green-600">Operating Margin</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-700">
                  ₹{financialData[financialData.length - 1]?.eps}
                </div>
                <div className="text-sm text-purple-600">Latest EPS</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-700">
                  {financialData[financialData.length - 1]?.pegRatio}
                </div>
                <div className="text-sm text-orange-600">PEG Ratio</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Revenue & Operating Profit Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={financialData} />
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💰 Profitability Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProfitabilityChart data={financialData} />
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📈 EPS Performance Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EPSChart data={financialData} />
        </CardContent>
      </Card>

      {/* AI Insights */}
      <AIInsights insights={aiInsights} stockName={stockName} />
    </div>
  );
};
