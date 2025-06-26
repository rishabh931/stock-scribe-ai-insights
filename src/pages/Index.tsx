
import { useState } from 'react';
import { StockSearch } from '@/components/StockSearch';
import { FinancialDashboard } from '@/components/FinancialDashboard';
import { ApiKeyManager } from '@/components/ApiKeyManager';
import { Card } from '@/components/ui/card';
import { TrendingUp, BarChart3, DollarSign } from 'lucide-react';

const Index = () => {
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [financialData, setFinancialData] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Indian Stock Analyzer
            </h1>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Get AI-powered insights and comprehensive financial analysis for Indian stocks
          </p>
        </div>

        {/* API Key Manager */}
        <ApiKeyManager />

        {/* Search Section */}
        <Card className="mb-8 p-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <StockSearch 
            onStockSelect={setSelectedStock}
            onDataLoad={setFinancialData}
            onInsightsLoad={setAiInsights}
            onLoadingChange={setIsLoading}
          />
        </Card>

        {/* Features Overview */}
        {!selectedStock && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow border-0 bg-white/70 backdrop-blur-sm">
              <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">📊 Revenue Analysis</h3>
              <p className="text-slate-600">Track revenue growth, operating profit margins, and business performance trends</p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-lg transition-shadow border-0 bg-white/70 backdrop-blur-sm">
              <div className="p-4 bg-green-100 rounded-full w-fit mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">💰 Profitability</h3>
              <p className="text-slate-600">Analyze PAT, PBT, EPS trends and understand profit generation efficiency</p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-lg transition-shadow border-0 bg-white/70 backdrop-blur-sm">
              <div className="p-4 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">📈 AI Insights</h3>
              <p className="text-slate-600">Get intelligent analysis powered by DeepSeek AI for investment decisions</p>
            </Card>
          </div>
        )}

        {/* Dashboard */}
        {selectedStock && (
          <FinancialDashboard 
            stockName={selectedStock}
            financialData={financialData}
            aiInsights={aiInsights}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
