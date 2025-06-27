
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getStoredApiKey, getStoredModel } from './ApiKeyManager';
import { generateLocalInsights } from '@/utils/localAnalysis';

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
    const years = ['2021', '2022', '2023', '2024', '2025'];
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
    const apiKey = getStoredApiKey();
    const model = getStoredModel();
    
    if (!apiKey) {
      return generateLocalInsights(stockName, financialData);
    }

    try {
      console.log('Calling OpenRouter API for insights...');
      
      const revenueInsights = await getInsightForSection(stockName, financialData, 'revenue', apiKey, model);
      const profitabilityInsights = await getInsightForSection(stockName, financialData, 'profitability', apiKey, model);
      const epsInsights = await getInsightForSection(stockName, financialData, 'eps', apiKey, model);
      const sentimentInsights = await getInsightForSection(stockName, financialData, 'sentiment', apiKey, model);
      
      return {
        revenue: revenueInsights,
        profitability: profitabilityInsights,
        eps: epsInsights,
        sentiment: sentimentInsights
      };
    } catch (error) {
      console.error('AI API Error:', error);
      return generateLocalInsights(stockName, financialData);
    }
  };

  const getInsightForSection = async (stockName: string, financialData: any[], section: string, apiKey: string, model: string) => {
    const prompts = {
      revenue: `Analyze ${stockName}'s revenue performance (2021-2025): ${JSON.stringify(financialData, null, 2)}

Provide concise insights:
• Revenue growth trajectory and CAGR
• Operating margin trends and efficiency
• Market position assessment
• Key growth drivers and risks

Keep response under 150 words with bullet points.`,
      
      profitability: `Analyze ${stockName}'s profitability (2021-2025): ${JSON.stringify(financialData, null, 2)}

Provide concise insights:
• Profit growth and margin expansion
• ROE/ROCE efficiency metrics
• Earnings quality assessment
• Cost management effectiveness

Keep response under 150 words with bullet points.`,
      
      eps: `Analyze ${stockName}'s EPS performance (2021-2025): ${JSON.stringify(financialData, null, 2)}

Provide concise insights:
• EPS growth trajectory and consistency
• Valuation metrics (PEG ratio analysis)
• Shareholder value creation
• Forward outlook indicators

Keep response under 150 words with bullet points.`,
      
      sentiment: `Investment sentiment for ${stockName} based on 5-year data (2021-2025): ${JSON.stringify(financialData, null, 2)}

Provide concise analysis:
• Overall investment recommendation (BULLISH/NEUTRAL/BEARISH)
• Key strengths and catalysts
• Main risks and challenges
• Target investor profile

Keep response under 200 words with clear recommendation.`
    };

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://indian-stock-analyzer.lovable.app',
        'X-Title': 'Indian Stock Analyzer',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a concise equity analyst. Provide brief, actionable insights with specific numbers. Use bullet points and keep responses under word limits specified.'
          },
          {
            role: 'user',
            content: prompts[section as keyof typeof prompts]
          }
        ],
        temperature: 0.1,
        max_tokens: 500,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || generateLocalInsights(stockName, financialData)[section as keyof ReturnType<typeof generateLocalInsights>];
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
        description: "5-year financial data analyzed with AI insights (2021-2025)"
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

  const handleQuickAnalysis = async () => {
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
      const insights = generateLocalInsights(searchTerm.toUpperCase(), mockData);
      
      onStockSelect(searchTerm.toUpperCase());
      onDataLoad(mockData);
      onInsightsLoad(insights);
      
      toast({
        title: `Quick analysis for ${searchTerm.toUpperCase()}`,
        description: "Local analysis completed instantly"
      });
    } catch (error) {
      console.error('Quick analysis error:', error);
      toast({
        title: "Error in quick analysis",
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
          className="px-6 py-6 bg-blue-600 hover:bg-blue-700"
          title="AI-powered analysis (requires API key)"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </Button>
        <Button 
          onClick={handleQuickAnalysis}
          disabled={isLoading}
          variant="outline"
          className="px-6 py-6 border-2 hover:bg-green-50"
          title="Quick local analysis (no API required)"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Zap className="h-5 w-5" />
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
      
      <div className="text-xs text-slate-500 flex items-center gap-4">
        <span className="flex items-center gap-1">
          <Search className="h-3 w-3" />
          AI Analysis (API required)
        </span>
        <span className="flex items-center gap-1">
          <Zap className="h-3 w-3" />
          Quick Analysis (Local)
        </span>
      </div>
    </div>
  );
};
