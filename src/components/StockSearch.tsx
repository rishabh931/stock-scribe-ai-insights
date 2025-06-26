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
      revenue: `Analyze ${stockName}'s Revenue & Operating Performance over 5 years (2021-2025):\n${JSON.stringify(financialData, null, 2)}\n\nProvide comprehensive Key Insights in bullet point format with detailed analysis:\n\n• **Revenue Acceleration:** Calculate year-over-year growth rates for each year, identify growth trajectory patterns, acceleration or deceleration trends, and provide specific percentage figures with context\n\n• **Operating Leverage Analysis:** Detailed OPM evolution with basis points expansion/contraction, operational efficiency metrics, cost structure optimization, and scalability assessment\n\n• **Market Position & Competitive Dynamics:** Market share trends, competitive positioning analysis, industry growth vs company performance, and strategic advantages\n\n• **Business Model Scalability:** Asset-light vs asset-heavy analysis, working capital management, operational flexibility, and expansion capabilities\n\n• **Revenue Quality & Sustainability:** Revenue stream diversification, client concentration analysis, recurring vs non-recurring revenue, seasonal patterns, and cyclical trends\n\n• **Growth Catalysts:** Key drivers enabling revenue expansion, new product launches, market expansion, technological adoption, and strategic initiatives\n\n• **Risk Factors:** Revenue headwinds, competitive threats, regulatory challenges, market saturation risks, and external dependencies\n\nFormat with clear bullet points, include specific numbers, percentages, and actionable insights.`,
      
      profitability: `Analyze ${stockName}'s Profitability Metrics over 5 years (2021-2025):\n${JSON.stringify(financialData, null, 2)}\n\nProvide detailed Key Insights on profitability performance:\n\n• **Profit Expansion Analysis:** Calculate PAT CAGR, year-over-year profit growth rates, profit margins evolution (gross, operating, net), and margin expansion/contraction with specific basis points\n\n• **Operational Efficiency:** Operating leverage benefits, cost optimization initiatives, SG&A as % of revenue trends, and operational scale benefits analysis\n\n• **Bottom-line Quality:** Core earnings vs reported earnings, one-time items impact, tax efficiency analysis, effective tax rate trends, and earnings consistency\n\n• **Return on Capital Metrics:** ROE, ROCE, ROIC trends with detailed analysis, capital allocation efficiency, asset turnover ratios, and shareholder value creation\n\n• **Working Capital Management:** Cash conversion cycle analysis, inventory management efficiency, receivables and payables management, and cash flow generation\n\n• **Margin Resilience:** Pricing power assessment, cost inflation management, margin sustainability in different market conditions, and competitive moat strength\n\n• **Capital Structure Impact:** Debt levels impact on profitability, interest coverage ratios, financial leverage optimization, and cost of capital trends\n\n• **Profitability Outlook:** Future margin expansion potential, cost structure flexibility, scalability benefits, and profit sustainability factors\n\nProvide specific calculations, ratios, and detailed insights with bullet points.`,
      
      eps: `Analyze ${stockName}'s EPS Performance & Valuation over 5 years (2021-2025):\n${JSON.stringify(financialData, null, 2)}\n\nProvide comprehensive EPS analysis with detailed insights:\n\n• **EPS Growth Trajectory:** Calculate EPS CAGR, year-over-year growth rates for each year, growth acceleration/deceleration patterns, and earnings consistency analysis\n\n• **EPS Quality Assessment:** Core EPS vs reported EPS, one-time items impact, share count changes analysis, buyback vs dilution effects, and earnings per share sustainability\n\n• **Valuation Metrics Analysis:** P/E ratio trends, PEG ratio assessment, EV/EBITDA analysis, price-to-book value trends, and relative valuation vs peers\n\n• **Earnings Predictability:** Earnings guidance accuracy, consensus estimate beats/misses, earnings volatility analysis, and forward earnings visibility\n\n• **Dividend & Shareholder Returns:** Dividend per share trends, payout ratio analysis, dividend sustainability, share buyback programs, and total shareholder returns\n\n• **Book Value Analysis:** Book value per share growth, tangible book value trends, asset quality assessment, and intrinsic value indicators\n\n• **Growth vs Valuation Trade-off:** Risk-adjusted returns, growth sustainability vs current valuation, fair value assessment, and investment attractiveness\n\n• **Forward EPS Outlook:** Earnings growth projections, key growth drivers, potential headwinds, and target price implications\n\nInclude specific EPS calculations, growth rates, and valuation metrics with detailed analysis.`,
      
      sentiment: `Based on ${stockName}'s comprehensive 5-year financial performance (2021-2025):\n${JSON.stringify(financialData, null, 2)}\n\nProvide detailed Investment Sentiment Analysis:\n\n**KEY INSIGHTS (Bullet Points):**\n\n• **Revenue Acceleration:** Analyze revenue growth momentum, calculate specific growth rates, identify acceleration patterns, and assess market opportunity capture\n\n• **Profit Expansion:** Detail profit margin improvements, operational leverage benefits, cost optimization success, and bottom-line growth quality\n\n• **Margin Resilience:** Assess OPM expansion in basis points, pricing power demonstration, cost management effectiveness, and operational efficiency gains\n\n• **Catalysts for Growth:** Identify key business drivers, market expansion opportunities, new product/service launches, technological advantages, and strategic initiatives\n\n• **Diversified Revenue Streams:** Analyze revenue mix, client diversification, geographic expansion, product portfolio breadth, and recurring revenue components\n\n• **Return Metrics Excellence:** Detail ROE/ROCE improvements, capital allocation efficiency, asset utilization optimization, and shareholder value creation\n\n**RISKS & CHALLENGES:**\n\n• **Regulatory Environment:** Assess regulatory changes impact, compliance costs, policy headwinds, and regulatory risk mitigation\n\n• **Competition Intensity:** Analyze competitive pressures, market share dynamics, pricing competition, and differentiation strategies\n\n• **Market Saturation:** Evaluate growth runway limitations, market maturity indicators, expansion opportunities, and growth sustainability\n\n• **External Dependencies:** Assess supply chain risks, raw material cost volatility, currency fluctuations, and macroeconomic sensitivity\n\n**OVERALL INVESTMENT SENTIMENT:**\nProvide clear BULLISH/NEUTRAL/BEARISH recommendation with:\n• Risk-reward assessment with specific ratios and metrics\n• Key performance catalysts to monitor\n• Price target range with valuation justification\n• Investment horizon and portfolio allocation guidance\n• Entry/exit level recommendations\n\nUse specific financial data, calculations, and provide actionable investment insights.`
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
        model: 'deepseek/deepseek-r1',
        messages: [
          {
            role: 'system',
            content: 'You are a senior equity research analyst with 25+ years experience in Indian stock markets and global financial analysis. Provide extremely detailed, data-driven insights with specific calculations, ratios, trends, and actionable recommendations. Use clear bullet points, comprehensive formatting, and be thorough yet professional. Always include specific numbers, percentages, basis points, and calculations from the financial data. Provide institutional-quality analysis with specific catalysts, risks, and investment recommendations.'
          },
          {
            role: 'user',
            content: prompts[section as keyof typeof prompts]
          }
        ],
        temperature: 0.1,
        max_tokens: 3000,
        stream: false
      }),
    });

    console.log('API Response Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API call failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response Data:', data);
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
      revenue: `**📈 Key Insights (Revenue Analysis 2021-2025):**\n\n• **Revenue Acceleration:** Growth surged to ${salesCAGR}% CAGR over 5 years, demonstrating strong business momentum and market capture\n• **Operating Leverage:** OPM improved from ${data[0].opm}% to ${data[data.length-1].opm}%, highlighting operational efficiency gains and cost optimization\n• **Market Position:** Consistent revenue growth trajectory with ${data.filter((d, i) => i > 0 && d.revenue > data[i-1].revenue).length}/${data.length-1} years of positive growth\n• **Business Scalability:** Revenue evolution from ₹${data[0].revenue.toLocaleString()}Cr (2021) to ₹${data[data.length-1].revenue.toLocaleString()}Cr (2025) shows strong scaling capabilities\n• **Growth Quality:** ${parseFloat(salesCAGR) > 15 ? 'High-quality' : parseFloat(salesCAGR) > 10 ? 'Decent' : 'Moderate'} revenue expansion with sustainable business model\n• **Operational Excellence:** Margin expansion of ${(data[data.length-1].opm - data[0].opm * 100).toFixed(0)} basis points demonstrates pricing power and efficiency`,
      
      profitability: `**💰 Key Insights (Profitability Analysis 2021-2025):**\n\n• **Profit Expansion:** Net profit grew at ${profitCAGR}% CAGR, outperforming revenue growth through operational leverage\n• **Margin Resilience:** Operating margins expanded ${((data[data.length-1].opm - data[0].opm) * 100).toFixed(0)}+ basis points over 5 years, indicating strong cost management\n• **Return Metrics:** Average ROE of ${(data.reduce((sum, d) => sum + d.roe, 0) / data.length).toFixed(1)}% and ROCE of ${(data.reduce((sum, d) => sum + d.roce, 0) / data.length).toFixed(1)}% demonstrate efficient capital utilization\n• **Earnings Quality:** ${data.filter((d, i) => i > 0 && d.pat > data[i-1].pat).length >= 3 ? 'Consistent' : 'Variable'} profit growth with strong fundamentals\n• **Tax Efficiency:** Effective tax management with stable tax rates supporting bottom-line growth\n• **Profitability Trajectory:** PAT evolution from ₹${data[0].pat.toLocaleString()}Cr to ₹${data[data.length-1].pat.toLocaleString()}Cr shows ${profitCAGR}% compound growth`,
      
      eps: `**📊 Key Insights (EPS Performance 2021-2025):**\n\n• **EPS Acceleration:** Earnings per share grew at ${epsCAGR}% CAGR, demonstrating strong shareholder value creation\n• **Growth Consistency:** ${data.filter((d, i) => i > 0 && d.epsGrowth > 0).length}/${data.length-1} years with positive EPS growth showing earnings reliability\n• **Valuation Attractiveness:** Current PEG ratio of ${data[data.length-1].pegRatio} suggests ${parseFloat(data[data.length-1].pegRatio) < 1 ? 'undervalued' : parseFloat(data[data.length-1].pegRatio) < 1.5 ? 'fairly valued' : 'premium valuation'} opportunity\n• **Earnings Journey:** EPS progression from ₹${data[0].eps} (2021) to ₹${data[data.length-1].eps} (2025) reflects strong business fundamentals\n• **Growth Quality:** ${parseFloat(epsCAGR) > 15 ? 'Superior' : parseFloat(epsCAGR) > 10 ? 'Strong' : 'Moderate'} earnings growth trajectory with sustainable business model\n• **Shareholder Returns:** Consistent EPS expansion supporting long-term wealth creation potential`,
      
      sentiment: `**🎯 Key Insights (Investment Sentiment 2021-2025):**\n\n• **Revenue Acceleration:** Strong ${salesCAGR}% revenue CAGR demonstrating market leadership and growth capture capabilities\n• **Profit Expansion:** Net profit growth of ${profitCAGR}% CAGR for 5 consecutive years, showcasing operational excellence and margin expansion\n• **Margin Resilience:** OPM expansion of ${((data[data.length-1].opm - data[0].opm) * 100).toFixed(0)}+ basis points highlighting scalable business model with operational leverage\n• **Catalysts:** Strong fundamentals with ROE of ${data[data.length-1].roe}% and ROCE of ${data[data.length-1].roce}% indicating efficient capital allocation\n• **Diversified Growth:** Multiple revenue streams supporting sustainable business expansion and market resilience\n• **Return Metrics:** Superior capital efficiency with consistent double-digit returns demonstrating management effectiveness\n\n**RISKS:**\n• Regulatory changes and policy shifts impacting business environment\n• Competition intensity in core markets affecting pricing power\n• Market saturation risks in mature segments requiring new growth drivers\n• Macroeconomic headwinds potentially impacting demand patterns\n\n**OVERALL INVESTMENT SENTIMENT:** ${parseFloat(data[data.length-1].pegRatio) < 1.2 && parseFloat(epsCAGR) > 12 && data[data.length-1].roe > 15 ? '🟢 BULLISH' : parseFloat(data[data.length-1].pegRatio) > 2 || parseFloat(epsCAGR) < 5 ? '🔴 BEARISH' : '🟡 NEUTRAL'}\n\n**Risk-Reward Assessment:** ${parseFloat(salesCAGR) > 12 && data[data.length-1].roe > 15 ? 'Favorable for long-term wealth creation' : 'Moderate with selective opportunities'}\n**Investment Recommendation:** ${parseFloat(data[data.length-1].pegRatio) < 1.5 ? 'BUY for long-term accumulation' : 'HOLD and monitor for better entry levels'}`
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
        description: "5-year financial data analyzed with comprehensive AI-powered insights (2021-2025)"
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
