
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StockSearchProps {
  onStockSelect: (stock: string) => void;
  onDataLoad: (data: any) => void;
  onInsightsLoad: (insights: any) => void;
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
      pegRatio: (Math.random() * 2 + 0.5).toFixed(1),
      roe: Math.floor(Math.random() * 25) + 10,
      roce: Math.floor(Math.random() * 20) + 8,
      netWorth: Math.floor(baseRevenue * (0.4 + Math.random() * 0.3)),
      totalAssets: Math.floor(baseRevenue * (0.8 + Math.random() * 0.4))
    }));
  };

  const getAIInsights = async (stockName: string, financialData: any[]) => {
    try {
      console.log('Calling DeepSeek API for insights...');
      
      const revenueInsights = await getInsightForSection(stockName, financialData, 'revenue');
      const profitabilityInsights = await getInsightForSection(stockName, financialData, 'profitability');
      const epsInsights = await getInsightForSection(stockName, financialData, 'eps');
      
      return {
        revenue: revenueInsights,
        profitability: profitabilityInsights,
        eps: epsInsights
      };
    } catch (error) {
      console.error('AI API Error:', error);
      return generateFallbackInsights(stockName, financialData);
    }
  };

  const getInsightForSection = async (stockName: string, financialData: any[], section: string) => {
    const prompts = {
      revenue: `Analyze ${stockName}'s Revenue & Operating Performance over 4 years:\n${JSON.stringify(financialData, null, 2)}\n\nProvide detailed insights on:\n• Revenue CAGR calculation and trend analysis\n• Operating margin (OPM) evolution and efficiency\n• Revenue consistency and growth quality\n• Operational leverage and scalability\n• Competitive positioning based on growth`,
      profitability: `Analyze ${stockName}'s Profitability Metrics over 4 years:\n${JSON.stringify(financialData, null, 2)}\n\nProvide detailed insights on:\n• PAT vs PBT trends and tax efficiency\n• Profit margin evolution and sustainability\n• Bottom-line growth quality\n• Earnings consistency and one-time impacts\n• Financial management effectiveness`,
      eps: `Analyze ${stockName}'s EPS Performance & Valuation over 4 years:\n${JSON.stringify(financialData, null, 2)}\n\nProvide detailed insights on:\n• EPS CAGR and growth trajectory\n• EPS volatility and earnings quality\n• PEG ratio valuation assessment\n• Growth vs valuation attractiveness\n• Investment recommendation based on EPS trends`
    };

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
            content: 'You are a senior financial analyst. Provide detailed, data-driven insights with specific calculations. Use bullet points and emojis. Be comprehensive yet easy to understand.'
          },
          {
            role: 'user',
            content: prompts[section as keyof typeof prompts]
          }
        ],
        temperature: 0.3,
        max_tokens: 800,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || generateSectionFallback(section, financialData);
  };

  const generateFallbackInsights = (stockName: string, financialData: any[]) => {
    return {
      revenue: generateSectionFallback('revenue', financialData),
      profitability: generateSectionFallback('profitability', financialData),
      eps: generateSectionFallback('eps', financialData)
    };
  };

  const generateSectionFallback = (section: string, data: any[]) => {
    const templates = {
      revenue: `
**📈 Revenue Growth Analysis:**
• Revenue CAGR: Strong ${((Math.pow(data[data.length-1].revenue / data[0].revenue, 1/3) - 1) * 100).toFixed(1)}% compound growth
• Revenue Evolution: From ₹${data[0].revenue.toLocaleString()}Cr to ₹${data[data.length-1].revenue.toLocaleString()}Cr
• Operating Efficiency: OPM improved from ${data[0].opm}% to ${data[data.length-1].opm}%
• Growth Quality: ${data.every((d, i) => i === 0 || d.revenue >= data[i-1].revenue) ? 'Consistent' : 'Volatile'} revenue trajectory
• Market Position: Strong operational performance with sustainable margins`,
      profitability: `
**💰 Profitability Deep Dive:**
• Profit Growth: PAT increased from ₹${data[0].pat.toLocaleString()}Cr to ₹${data[data.length-1].pat.toLocaleString()}Cr
• Tax Efficiency: PBT to PAT conversion shows ${((data[data.length-1].pat / data[data.length-1].pbt) * 100).toFixed(1)}% efficiency
• Margin Trends: ${data[data.length-1].pat > data[0].pat ? 'Expanding' : 'Contracting'} bottom-line margins
• Earnings Quality: ${data.filter((d, i) => i > 0 && d.pat > data[i-1].pat).length >= data.length/2 ? 'Strong' : 'Mixed'} earnings consistency
• Financial Health: Robust profitability with sustainable business model`,
      eps: `
**📊 EPS & Valuation Analysis:**
• EPS Trajectory: Grew from ₹${data[0].eps} to ₹${data[data.length-1].eps}
• EPS CAGR: ${((Math.pow(data[data.length-1].eps / data[0].eps, 1/3) - 1) * 100).toFixed(1)}% compound growth
• Valuation Assessment: PEG ratio of ${data[data.length-1].pegRatio} suggests ${parseFloat(data[data.length-1].pegRatio) < 1 ? 'undervalued' : parseFloat(data[data.length-1].pegRatio) < 1.5 ? 'fairly valued' : 'expensive'} stock
• Investment Merit: ${parseFloat(data[data.length-1].pegRatio) < 1.2 ? 'Attractive' : 'Cautious'} risk-reward profile
• Growth Quality: ${data.every((d, i) => i === 0 || d.eps >= data[i-1].eps) ? 'Consistent' : 'Volatile'} earnings per share`
    };
    
    return templates[section as keyof typeof templates];
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
      const mockData = generateMockData(searchTerm.toUpperCase());
      const insights = await getAIInsights(searchTerm.toUpperCase(), mockData);
      
      onStockSelect(searchTerm.toUpperCase());
      onDataLoad(mockData);
      onInsightsLoad(insights);
      
      toast({
        title: `Analysis completed for ${searchTerm.toUpperCase()}`,
        description: "Financial data analyzed with AI-powered insights"
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error loading stock analysis",
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
