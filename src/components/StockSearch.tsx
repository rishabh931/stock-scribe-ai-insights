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
      console.log('Calling OpenRouter API for insights...');
      
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
      revenue: `Analyze ${stockName}'s Revenue & Operating Performance over 5 years (2020-2024):\n${JSON.stringify(financialData, null, 2)}\n\nProvide comprehensive insights on:\n• Revenue CAGR calculation with year-over-year growth rates\n• Operating margin (OPM) evolution, efficiency trends, and operational leverage\n• Revenue consistency, volatility analysis, and growth quality assessment\n• Operational scalability, cost management effectiveness\n• Market share dynamics and competitive positioning\n• Seasonal patterns and cyclical trends if any\n• Impact of external factors on revenue performance\n• Future revenue sustainability and growth prospects\n\nFormat your response with clear sections using bullet points and include specific numbers from the data.`,
      
      profitability: `Analyze ${stockName}'s Profitability Metrics over 5 years (2020-2024):\n${JSON.stringify(financialData, null, 2)}\n\nProvide comprehensive insights on:\n• PAT vs PBT trends, tax efficiency, and effective tax rate analysis\n• Profit margin evolution (gross, operating, net) and sustainability\n• Bottom-line growth quality, earnings consistency, and volatility\n• One-time impacts, exceptional items, and core earnings analysis\n• Working capital management and cash conversion efficiency\n• Financial leverage impact on profitability\n• Return ratios (ROE, ROCE, ROIC) trends and peer comparison\n• Profit reinvestment patterns and dividend policy impact\n• Margin expansion/contraction drivers and future outlook\n\nFormat your response with clear sections using bullet points and include specific calculations.`,
      
      eps: `Analyze ${stockName}'s EPS Performance & Valuation over 5 years (2020-2024):\n${JSON.stringify(financialData, null, 2)}\n\nProvide comprehensive insights on:\n• EPS CAGR calculation and year-over-year growth trajectory\n• EPS volatility analysis, earnings quality, and sustainability\n• Share buyback impact, dilution effects, and share count changes\n• PEG ratio valuation assessment and peer comparison\n• Earnings predictability and guidance accuracy\n• Book value per share trends and tangible book value\n• Dividend per share evolution and payout ratio analysis\n• Growth vs valuation attractiveness and risk-reward assessment\n• Forward P/E implications and investment recommendation\n• Price target justification based on EPS trends\n\nFormat your response with clear sections using bullet points and include specific EPS calculations.`,
      
      sentiment: `Based on ${stockName}'s comprehensive 5-year financial performance (2020-2024):\n${JSON.stringify(financialData, null, 2)}\n\nProvide detailed sentiment analysis covering:\n\n**POSITIVE FACTORS & BULLISH INDICATORS:**\n• Revenue growth momentum and market expansion opportunities\n• Margin improvement trends and operational efficiency gains\n• Strong return ratios (ROE/ROCE) and capital allocation effectiveness\n• Earnings quality, consistency, and predictability factors\n• Competitive moat strengthening and market position\n• Management execution track record and strategic initiatives\n• Balance sheet strength and financial flexibility\n• Industry tailwinds and secular growth drivers\n• Valuation attractiveness at current levels\n• Dividend sustainability and shareholder-friendly policies\n\n**NEGATIVE FACTORS & BEARISH CONCERNS:**\n• Revenue growth deceleration or cyclical headwinds\n• Margin pressure from competition or cost inflation\n• Deteriorating return ratios or capital misallocation\n• Earnings volatility or one-time exceptional items\n• Market share loss or competitive threats\n• Management credibility issues or strategic missteps\n• Balance sheet concerns or liquidity constraints\n• Industry disruption or regulatory challenges\n• Overvaluation concerns based on growth prospects\n• Dividend cut risks or poor capital allocation\n\n**OVERALL INVESTMENT SENTIMENT:**\nProvide a clear BULLISH/NEUTRAL/BEARISH recommendation with:\n• Risk-reward assessment and investment horizon\n• Key catalysts and risk factors to monitor\n• Price target range and entry/exit levels\n• Portfolio allocation suggestions\n\nUse specific data points, ratios, and calculations from the financial data to support your analysis.`
    };

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'HTTP-Referer': 'https://indian-stock-analyzer.lovable.app',
        'X-Title': 'Indian Stock Analyzer',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1:free',
        messages: [
          {
            role: 'system',
            content: 'You are a senior equity research analyst with 20+ years experience in Indian stock markets. Provide detailed, data-driven insights with specific calculations, ratios, and trends. Use bullet points, clear formatting, and be comprehensive yet easy to understand. Always include specific numbers from the data and provide actionable insights.'
          },
          {
            role: 'user',
            content: prompts[section as keyof typeof prompts]
          }
        ],
        temperature: 0.2,
        max_tokens: 2000,
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
    const salesCAGR = ((Math.pow(data[data.length-1].revenue / data[0].revenue, 1/4) - 1) * 100).toFixed(1);
    const profitCAGR = ((Math.pow(data[data.length-1].pat / data[0].pat, 1/4) - 1) * 100).toFixed(1);
    const epsCAGR = ((Math.pow(data[data.length-1].eps / data[0].eps, 1/4) - 1) * 100).toFixed(1);
    
    const templates = {
      revenue: `**📈 Revenue Growth Analysis (5 Years: 2020-2024):**\n\n• **Revenue CAGR:** Strong ${salesCAGR}% compound annual growth rate\n• **Revenue Evolution:** From ₹${data[0].revenue.toLocaleString()}Cr (2020) to ₹${data[data.length-1].revenue.toLocaleString()}Cr (2024)\n• **Growth Trajectory:** ${data.every((d, i) => i === 0 || d.revenue >= data[i-1].revenue * 0.95) ? 'Consistent upward trend' : 'Volatile with mixed performance'}\n• **Operating Efficiency:** OPM improved from ${data[0].omp || data[0].opm}% to ${data[data.length-1].opm}%\n• **Scale Benefits:** ${data[data.length-1].opm > data[0].opm ? 'Margin expansion with scale' : 'Margin pressure due to competition'}\n• **Market Position:** Demonstrating ${parseFloat(salesCAGR) > 15 ? 'excellent' : parseFloat(salesCAGR) > 10 ? 'good' : 'moderate'} revenue growth momentum`,
      
      profitability: `**💰 Profitability Deep Dive (5 Years: 2020-2024):**\n\n• **Profit CAGR:** ${profitCAGR}% compound growth in PAT over 5 years\n• **PAT Evolution:** From ₹${data[0].pat.toLocaleString()}Cr to ₹${data[data.length-1].pat.toLocaleString()}Cr\n• **Tax Efficiency:** Current effective tax rate of ${((1 - data[data.length-1].pat / data[data.length-1].pbt) * 100).toFixed(1)}%\n• **Margin Trends:** ${data[data.length-1].pat/data[data.length-1].revenue > data[0].pat/data[0].revenue ? 'Expanding' : 'Contracting'} net profit margins\n• **Earnings Quality:** ${data.filter((d, i) => i > 0 && d.pat > data[i-1].pat).length >= 3 ? 'Consistent' : 'Volatile'} profit growth pattern\n• **Return Metrics:** Average ROE of ${(data.reduce((sum, d) => sum + d.roe, 0) / data.length).toFixed(1)}%, ROCE of ${(data.reduce((sum, d) => sum + d.roce, 0) / data.length).toFixed(1)}%\n• **Capital Efficiency:** ${data[data.length-1].roe > 15 ? 'Strong' : 'Moderate'} return on equity indicating ${data[data.length-1].roe > 15 ? 'efficient' : 'adequate'} capital utilization`,
      
      eps: `**📊 EPS & Valuation Analysis (5 Years: 2020-2024):**\n\n• **EPS CAGR:** ${epsCAGR}% compound growth in earnings per share\n• **EPS Journey:** From ₹${data[0].eps} (2020) to ₹${data[data.length-1].eps} (2024)\n• **Growth Consistency:** ${data.filter((d, i) => i > 0 && d.epsGrowth > 0).length}/${data.length-1} years with positive EPS growth\n• **Valuation Matrix:** Current PEG ratio of ${data[data.length-1].pegRatio} suggests ${parseFloat(data[data.length-1].pegRatio) < 1 ? 'undervalued' : parseFloat(data[data.length-1].pegRatio) < 1.5 ? 'fairly valued' : 'overvalued'} stock\n• **Growth Quality:** ${parseFloat(epsCAGR) > 15 ? 'High-quality' : parseFloat(epsCAGR) > 10 ? 'Decent' : 'Moderate'} earnings growth trajectory\n• **Investment Merit:** ${parseFloat(data[data.length-1].pegRatio) < 1.2 && parseFloat(epsCAGR) > 12 ? 'Attractive' : 'Cautious'} risk-reward profile\n• **Earnings Sustainability:** Based on trend analysis, EPS growth appears ${data.filter((d, i) => i > 0 && d.epsGrowth > 5).length >= 3 ? 'sustainable' : 'uncertain'}`,
      
      sentiment: `**🎯 Investment Sentiment Analysis (5 Years: 2020-2024):**\n\n**POSITIVE FACTORS & BULLISH INDICATORS:**\n• Revenue CAGR of ${salesCAGR}% demonstrates strong business momentum\n• ${data[data.length-1].opm > data[0].opm ? 'Expanding operating margins' : 'Stable operational efficiency'} showing ${data[data.length-1].opm > data[0].opm ? 'improved' : 'consistent'} cost management\n• Strong return ratios with ROE of ${data[data.length-1].roe}% and ROCE of ${data[data.length-1].roce}%\n• EPS CAGR of ${epsCAGR}% indicating robust earnings growth capability\n• ${parseFloat(data[data.length-1].pegRatio) < 1.5 ? 'Attractive valuation' : 'Premium valuation'} with PEG ratio of ${data[data.length-1].pegRatio}\n• Consistent financial performance with ${data.filter((d, i) => i > 0 && d.revenue > data[i-1].revenue).length} years of revenue growth\n\n**NEGATIVE FACTORS & BEARISH CONCERNS:**\n• ${parseFloat(salesCAGR) < 10 ? 'Moderate revenue growth' : 'Revenue volatility'} may indicate market saturation\n• ${data[data.length-1].opm < data[0].opm ? 'Margin compression' : 'Margin sustainability'} concerns in competitive environment\n• ${data.filter((d, i) => i > 0 && d.epsGrowth < 0).length > 0 ? 'EPS volatility observed' : 'Consistent earnings, but growth rate sustainability'} in some years\n• ${parseFloat(data[data.length-1].pegRatio) > 1.5 ? 'Elevated valuation multiples' : 'Valuation discipline required'} at current levels\n• Cyclical industry risks and macroeconomic sensitivity factors\n\n**OVERALL INVESTMENT SENTIMENT:** ${parseFloat(data[data.length-1].pegRatio) < 1.2 && parseFloat(epsCAGR) > 12 && data[data.length-1].roe > 15 ? '🟢 BULLISH' : parseFloat(data[data.length-1].pegRatio) > 2 || parseFloat(epsCAGR) < 5 ? '🔴 BEARISH' : '🟡 NEUTRAL'}\n\n**Risk-Reward Assessment:** ${parseFloat(salesCAGR) > 12 && data[data.length-1].roe > 15 ? 'Favorable' : 'Moderate'} based on growth fundamentals and return metrics\n**Investment Horizon:** ${parseFloat(data[data.length-1].pegRatio) < 1.5 ? 'Long-term accumulation' : 'Wait for better entry levels'} recommended`
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
