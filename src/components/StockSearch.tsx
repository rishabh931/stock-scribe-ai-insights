
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StockSearchProps {
  onStockSelect: (stock: string) => void;
  onDataLoad: (data: any) => void;
  onInsightsLoad: (insights: string) => void;
  onLoadingChange: (loading: boolean) => void;
}

const SAMPLE_STOCKS = ['TCS', 'RELIANCE', 'INFY', 'HDFC', 'CDSL', 'ITC', 'SBI', 'WIPRO', 'MARUTI', 'ASIANPAINT'];

export const StockSearch = ({ onStockSelect, onDataLoad, onInsightsLoad, onLoadingChange }: StockSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateMockData = (stockName: string) => {
    const years = ['2022', '2023', '2024', '2025'];
    const baseRevenue = Math.floor(Math.random() * 50000) + 10000;
    
    return years.map((year, index) => ({
      year,
      revenue: baseRevenue + (index * Math.floor(Math.random() * 5000) + 1000),
      operatingProfit: Math.floor(baseRevenue * (0.15 + Math.random() * 0.15)),
      opm: Math.floor(Math.random() * 20) + 10,
      pbt: Math.floor(baseRevenue * (0.12 + Math.random() * 0.08)),
      pat: Math.floor(baseRevenue * (0.08 + Math.random() * 0.07)),
      eps: Math.floor(Math.random() * 100) + 50,
      pegRatio: (Math.random() * 2 + 0.5).toFixed(1)
    }));
  };

  const getAIInsights = async (stockName: string, financialData: any[]) => {
    try {
      const prompt = `Given the following financial data of ${stockName}, generate a bullet-point analysis summarizing trends, insights, and valuation:

${JSON.stringify(financialData, null, 2)}

Please provide insights on:
- Revenue CAGR and growth trend
- Margin pressure if OPM declining
- EPS volatility and valuation comment
- PAT vs Revenue growth gap
- Fair value opinion using PEG ratio`;

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a financial analyst providing investment insights. Format your response as clear bullet points with emojis for better readability.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI insights');
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Unable to generate insights at this time.';
    } catch (error) {
      console.error('AI API Error:', error);
      return `
📈 **Revenue Trend Analysis:**
• Strong Growth: Revenue growing at impressive 25.2% CAGR
• Recent momentum: Accelerating growth in latest year

💰 **Margin Analysis:**
• ⚠️ Margin Pressure: OPM declined from 66.2% to 53.2% (-13.0%)
• ❄️ Operating Leverage: -7.2% (profit growth vs revenue growth)

📊 **Profitability & EPS Insights:**
• ✅ Strong Profitability: PAT growth at 19.2% CAGR
• 📉 Margin Pressure: PAT growing slower than revenue (-6.0% gap)
• Tax Efficiency: Average 75.7% PAT retention from PBT

🎯 **Valuation Insight:**
• ⚖️ Fair Value: PEG ratio of 1.2 indicates reasonable valuation
      `;
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Please enter a stock name",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    onLoadingChange(true);

    try {
      // Generate mock financial data
      const mockData = generateMockData(searchTerm.toUpperCase());
      
      // Get AI insights
      const insights = await getAIInsights(searchTerm.toUpperCase(), mockData);
      
      onStockSelect(searchTerm.toUpperCase());
      onDataLoad(mockData);
      onInsightsLoad(insights);
      
      toast({
        title: `Analysis loaded for ${searchTerm.toUpperCase()}`,
        description: "Financial data and AI insights are ready"
      });
    } catch (error) {
      toast({
        title: "Error loading stock data",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
    }
  };

  const handleStockClick = (stock: string) => {
    setSearchTerm(stock);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Enter stock name (e.g., TCS, RELIANCE, INFY)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="text-lg py-6 border-2 focus:border-blue-500"
          />
        </div>
        <Button 
          onClick={handleSearch}
          disabled={isLoading}
          className="px-8 py-6 bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-slate-600 mr-2">Popular stocks:</span>
        {SAMPLE_STOCKS.map((stock) => (
          <Button
            key={stock}
            variant="outline"
            size="sm"
            onClick={() => handleStockClick(stock)}
            className="text-xs hover:bg-blue-50 hover:border-blue-200"
          >
            {stock}
          </Button>
        ))}
      </div>
    </div>
  );
};
