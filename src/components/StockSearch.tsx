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
    const years = ['2020', '2021', '2022', '2023', '2024'];
    const baseRevenue = Math.floor(Math.random() * 50000) + 10000;
    
    return years.map((year, index) => {
      const revenue = baseRevenue + (index * Math.floor(Math.random() * 5000) + 1000);
      const eps = Math.floor(Math.random() * 100) + 50 + (index * 10);
      const prevEps = index > 0 ? (baseRevenue/1000 + ((index-1) * 10) + 50) : eps;
      const epsGrowth = index > 0 ? Math.round(((eps - prevEps) / prevEps) * 100 * 100) / 100 : 0;
      
      return {
        year,
        revenue,
        operatingProfit: Math.floor(revenue * (0.15 + Math.random() * 0.15)),
        opm: Math.floor(Math.random() * 20) + 10,
        pbt: Math.floor(revenue * (0.12 + Math.random() * 0.08)),
        pat: Math.floor(revenue * (0.08 + Math.random() * 0.07)),
        eps,
        epsGrowth,
        pegRatio: (Math.random() * 2 + 0.5).toFixed(1),
        roe: Math.floor(Math.random() * 25) + 10,
        roce: Math.floor(Math.random() * 20) + 8,
        netWorth: Math.floor(revenue * (0.4 + Math.random() * 0.3)),
        totalAssets: Math.floor(revenue * (0.8 + Math.random() * 0.4))
      };
    });
  };

  const getAIInsights = async (stockName: string, financialData: any[]) => {
    try {
      console.log('Calling DeepSeek API for insights...');
      
      const revenueInsights = await getInsightForSection(stockName, financialData, 'revenue');
      const profitabilityInsights = await getInsightForSection(stockName, financialData, 'profitability');
      const epsInsights = await getInsightForSection(stockName, financialData, 'eps');
      const sentimentInsights = await getInsightForSection(stockName, financialData, 'sentiment');
      
      return {
        revenue: revenueInsights,
        profitability: profitabilityInsights,
        eps: epsInsights,
        sentiment: sentimentInsights
      };
    } catch (error) {
      console.error('AI API Error:', error);
      return generateFallbackInsights(stockName, financialData);
    }
  };

  const getInsightForSection = async (stockName: string, financialData: any[], section: string) => {
    const prompts = {
      revenue: `Analyze ${stockName}'s Revenue & Operating Performance over 5 years (2020-2024):\n${JSON.stringify(financialData, null, 2)}\n\nProvide comprehensive insights on:\n• Revenue CAGR calculation with year-over-year growth rates\n• Operating margin (OPM) evolution, efficiency trends, and operational leverage\n• Revenue consistency, volatility analysis, and growth quality assessment\n• Operational scalability, cost management effectiveness\n• Market share dynamics and competitive positioning\n• Seasonal patterns and cyclical trends if any\n• Impact of external factors on revenue performance\n• Future revenue sustainability and growth prospects`,
      
      profitability: `Analyze ${stockName}'s Profitability Metrics over 5 years (2020-2024):\n${JSON.stringify(financialData, null, 2)}\n\nProvide comprehensive insights on:\n• PAT vs PBT trends, tax efficiency, and effective tax rate analysis\n• Profit margin evolution (gross, operating, net) and sustainability\n• Bottom-line growth quality, earnings consistency, and volatility\n• One-time impacts, exceptional items, and core earnings analysis\n• Working capital management and cash conversion efficiency\n• Financial leverage impact on profitability\n• Return ratios (ROE, ROCE, ROIC) trends and peer comparison\n• Profit reinvestment patterns and dividend policy impact\n• Margin expansion/contraction drivers and future outlook`,
      
      eps: `Analyze ${stockName}'s EPS Performance & Valuation over 5 years (2020-2024):\n${JSON.stringify(financialData, null, 2)}\n\nProvide comprehensive insights on:\n• EPS CAGR calculation and year-over-year growth trajectory\n• EPS volatility analysis, earnings quality, and sustainability\n• Share buyback impact, dilution effects, and share count changes\n• PEG ratio valuation assessment and peer comparison\n• Earnings predictability and guidance accuracy\n• Book value per share trends and tangible book value\n• Dividend per share evolution and payout ratio analysis\n• Growth vs valuation attractiveness and risk-reward assessment\n• Forward P/E implications and investment recommendation\n• Price target justification based on EPS trends`,
      
      sentiment: `Based on ${stockName}'s 5-year financial performance (2020-2024):\n${JSON.stringify(financialData, null, 2)}\n\nProvide detailed sentiment analysis with:\n\n**POSITIVE FACTORS:**\n• Strong growth indicators and competitive advantages\n• Operational efficiency improvements and margin expansion\n• Financial health strengths and stability factors\n• Market position strengths and growth opportunities\n• Management effectiveness and strategic initiatives\n\n**NEGATIVE FACTORS:**\n• Growth challenges and margin pressure concerns\n• Financial health risks and operational weaknesses\n• Market headwinds and competitive threats\n• Valuation concerns and risk factors\n• Regulatory or industry-specific challenges\n\n**OVERALL SENTIMENT:** Bullish/Neutral/Bearish with detailed reasoning`
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
            content: 'You are a senior equity research analyst with 15+ years experience. Provide detailed, data-driven insights with specific calculations, ratios, and trends. Use bullet points, emojis, and be comprehensive yet easy to understand. Always include specific numbers from the data.'
          },
          {
            role: 'user',
            content: prompts[section as keyof typeof prompts]
          }
        ],
        temperature: 0.2,
        max_tokens: 1200,
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
      eps: generateSectionFallback('eps', financialData),
      sentiment: generateSectionFallback('sentiment', financialData)
    };
  };

  const generateSectionFallback = (section: string, data: any[]) => {
    const templates = {
      revenue: `**📈 Revenue Growth Analysis (5 Years):**\n• Revenue CAGR: Strong ${((Math.pow(data[data.length-1].revenue / data[0].revenue, 1/4) - 1) * 100).toFixed(1)}% compound growth\n• Revenue Evolution: From ₹${data[0].revenue.toLocaleString()}Cr (2020) to ₹${data[data.length-1].revenue.toLocaleString()}Cr (2024)\n• Operating Efficiency: OPM trend from ${data[0].opm}% to ${data[data.length-1].opm}%\n• Growth Quality: ${data.every((d, i) => i === 0 || d.revenue >= data[i-1].revenue) ? 'Consistent' : 'Volatile'} revenue trajectory\n• Market Position: Strong operational performance with sustainable competitive advantages`,
      
      profitability: `**💰 Profitability Deep Dive (5 Years):**\n• Profit Growth: PAT increased from ₹${data[0].pat.toLocaleString()}Cr to ₹${data[data.length-1].pat.toLocaleString()}Cr\n• Tax Efficiency: Current PBT to PAT conversion shows ${((data[data.length-1].pat / data[data.length-1].pbt) * 100).toFixed(1)}% efficiency\n• Margin Trends: ${data[data.length-1].pat > data[0].pat ? 'Expanding' : 'Contracting'} bottom-line margins over 5-year period\n• Earnings Quality: ${data.filter((d, i) => i > 0 && d.pat > data[i-1].pat).length >= data.length/2 ? 'Strong' : 'Mixed'} earnings consistency\n• Return Metrics: ROE averaging ${(data.reduce((sum, d) => sum + d.roe, 0) / data.length).toFixed(1)}%, ROCE averaging ${(data.reduce((sum, d) => sum + d.roce, 0) / data.length).toFixed(1)}%`,
      
      eps: `**📊 EPS & Valuation Analysis (5 Years):**\n• EPS Trajectory: Grew from ₹${data[0].eps} (2020) to ₹${data[data.length-1].eps} (2024)\n• EPS CAGR: ${((Math.pow(data[data.length-1].eps / data[0].eps, 1/4) - 1) * 100).toFixed(1)}% compound growth\n• Growth Consistency: ${data.filter((d, i) => i > 0 && d.epsGrowth > 0).length}/${data.length-1} years showed positive EPS growth\n• Valuation Assessment: Current PEG ratio of ${data[data.length-1].pegRatio} suggests ${parseFloat(data[data.length-1].pegRatio) < 1 ? 'undervalued' : parseFloat(data[data.length-1].pegRatio) < 1.5 ? 'fairly valued' : 'expensive'} stock\n• Investment Merit: ${parseFloat(data[data.length-1].pegRatio) < 1.2 ? 'Attractive' : 'Cautious'} risk-reward profile based on growth-valuation matrix`,
      
      sentiment: `**🎯 Sentiment Analysis:**\n\n**POSITIVE FACTORS:**\n• Revenue CAGR of ${((Math.pow(data[data.length-1].revenue / data[0].revenue, 1/4) - 1) * 100).toFixed(1)}% shows strong growth momentum\n• Consistent operational efficiency with stable margins\n• Strong return ratios indicating effective capital allocation\n• Robust financial health with growing profitability\n\n**NEGATIVE FACTORS:**\n• Some volatility in year-over-year performance\n• Valuation concerns at current PEG levels\n• Market dependency and cyclical risks\n• Competitive pressure in the industry\n\n**OVERALL SENTIMENT:** ${parseFloat(data[data.length-1].pegRatio) < 1.2 && data[data.length-1].roe > 15 ? 'BULLISH' : parseFloat(data[data.length-1].pegRatio) > 2 ? 'BEARISH' : 'NEUTRAL'} - Based on growth metrics and valuation parameters`
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
        description: "5-year financial data analyzed with AI-powered insights"
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
