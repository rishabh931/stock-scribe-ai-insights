
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
      console.log('No API key found, using detailed local analysis...');
      return generateLocalInsights(stockName, financialData);
    }

    try {
      console.log('Calling OpenRouter API for concise insights...');
      
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
      console.error('AI API Error, falling back to detailed local analysis:', error);
      return generateLocalInsights(stockName, financialData);
    }
  };

  const getInsightForSection = async (stockName: string, financialData: any[], section: string, apiKey: string, model: string) => {
    const prompts = {
      revenue: `Analyze ${stockName}'s revenue (2021-2025): ${JSON.stringify(financialData, null, 2)}

Provide brief insights:
• Revenue CAGR and growth quality
• Operating margin trends
• Key drivers

Max 100 words.`,
      
      profitability: `Analyze ${stockName}'s profitability (2021-2025): ${JSON.stringify(financialData, null, 2)}

Provide brief insights:
• Profit growth and efficiency
• ROE/ROCE metrics
• Margin evolution

Max 100 words.`,
      
      eps: `Analyze ${stockName}'s EPS (2021-2025): ${JSON.stringify(financialData, null, 2)}

Provide brief insights:
• EPS growth trajectory
• Valuation (PEG analysis)
• Shareholder value

Max 100 words.`,
      
      sentiment: `Investment outlook for ${stockName} (2021-2025): ${JSON.stringify(financialData, null, 2)}

Provide brief analysis:
• Recommendation (BUY/HOLD/AVOID)
• Key strengths/risks
• Investment horizon

Max 120 words.`
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
            content: 'You are a concise equity analyst. Provide brief, actionable insights with specific numbers. Use bullet points and keep responses under word limits.'
          },
          {
            role: 'user',
            content: prompts[section as keyof typeof prompts]
          }
        ],
        temperature: 0.1,
        max_tokens: 300,
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
      // Data generation remains consistent
      const mockData = generateMockData(searchTerm.toUpperCase());
      
      // Only analysis method changes based on API availability
      const insights = await getAIInsights(searchTerm.toUpperCase(), mockData);
      
      onStockSelect(searchTerm.toUpperCase());
      onDataLoad(mockData);
      onInsightsLoad(insights);
      
      const apiKey = getStoredApiKey();
      const analysisType = apiKey ? 'AI-powered' : 'Detailed local';
      
      toast({
        title: `${analysisType} analysis completed for ${searchTerm.toUpperCase()}`,
        description: "5-year financial data analyzed (2021-2025)"
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
      // Same data generation for consistency
      const mockData = generateMockData(searchTerm.toUpperCase());
      // Force local detailed analysis
      const insights = generateLocalInsights(searchTerm.toUpperCase(), mockData);
      
      onStockSelect(searchTerm.toUpperCase());
      onDataLoad(mockData);
      onInsightsLoad(insights);
      
      toast({
        title: `Detailed local analysis for ${searchTerm.toUpperCase()}`,
        description: "Comprehensive local analysis completed instantly"
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
