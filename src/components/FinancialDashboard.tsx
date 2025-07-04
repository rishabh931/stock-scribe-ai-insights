import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RevenueChart } from '@/components/RevenueChart';
import { ProfitabilityChart } from '@/components/ProfitabilityChart';
import { EPSChart } from '@/components/EPSChart';
import { AIInsights } from '@/components/AIInsights';
import { RawDataTable } from '@/components/RawDataTable';
import { Download, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FinancialDashboardProps {
  stockName: string;
  financialData: any[];
  aiInsights: any;
  isLoading: boolean;
}

export const FinancialDashboard = ({ stockName, financialData, aiInsights, isLoading }: FinancialDashboardProps) => {
  const handleDownloadReport = () => {
    try {
      const reportContent = generateReportContent();
      
      const blob = new Blob([reportContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${stockName}_Financial_Analysis_Report_5Years_2021-2025.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Report Downloaded",
        description: `${stockName} 5-year analysis report (2021-2025) has been downloaded`
      });
    } catch (error) {
      toast({
        title: "Download Error",
        description: "Failed to generate report",
        variant: "destructive"
      });
    }
  };

  const generateReportContent = () => {
    const latestData = financialData[financialData.length - 1];
    const firstData = financialData[0];
    
    const salesCAGR = ((Math.pow(latestData.revenue / firstData.revenue, 1/4) - 1) * 100).toFixed(1);
    const profitCAGR = ((Math.pow(latestData.pat / firstData.pat, 1/4) - 1) * 100).toFixed(1);
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>${stockName} Financial Analysis Report (5 Years: 2021-2025)</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 40px; }
            .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
            .metric-card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
            .section { margin-bottom: 40px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f5f5f5; }
            .sentiment { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>${stockName} Comprehensive Financial Analysis Report (2021-2025)</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            <p><strong>5-Year Performance Overview with Latest Data Including 2025</strong></p>
        </div>
        
        <div class="metrics">
            <div class="metric-card">
                <h3>Latest Revenue (2025)</h3>
                <p>₹${latestData.revenue.toLocaleString()}Cr</p>
            </div>
            <div class="metric-card">
                <h3>Operating Margin (2025)</h3>
                <p>${latestData.opm}%</p>
            </div>
            <div class="metric-card">
                <h3>EPS (2025)</h3>
                <p>₹${latestData.eps}</p>
            </div>
            <div class="metric-card">
                <h3>ROE (2025)</h3>
                <p>${latestData.roe}%</p>
            </div>
            <div class="metric-card">
                <h3>ROCE (2025)</h3>
                <p>${latestData.roce}%</p>
            </div>
            <div class="metric-card">
                <h3>Sales CAGR (5Y)</h3>
                <p>${salesCAGR}%</p>
            </div>
            <div class="metric-card">
                <h3>Profit CAGR (5Y)</h3>
                <p>${profitCAGR}%</p>
            </div>
            <div class="metric-card">
                <h3>PEG Ratio (2025)</h3>
                <p>${latestData.pegRatio}</p>
            </div>
        </div>

        <div class="section">
            <h2>Financial Data (5 Years: 2021-2025)</h2>
            <table>
                <thead>
                    <tr>
                        <th>Year</th>
                        <th>Revenue (Cr)</th>
                        <th>Operating Profit (Cr)</th>
                        <th>OPM %</th>
                        <th>PAT (Cr)</th>
                        <th>EPS</th>
                        <th>EPS Growth %</th>
                        <th>ROE %</th>
                        <th>ROCE %</th>
                    </tr>
                </thead>
                <tbody>
                    ${financialData.map(data => `
                        <tr>
                            <td>${data.year}</td>
                            <td>₹${data.revenue.toLocaleString()}</td>
                            <td>₹${data.operatingProfit.toLocaleString()}</td>
                            <td>${data.opm}%</td>
                            <td>₹${data.pat.toLocaleString()}</td>
                            <td>₹${data.eps}</td>
                            <td>${data.epsGrowth}%</td>
                            <td>${data.roe}%</td>
                            <td>${data.roce}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>Comprehensive AI-Driven Analysis (2021-2025)</h2>
            <h3>Revenue Analysis & Key Insights</h3>
            <p>${aiInsights?.revenue || 'Analysis not available'}</p>
            
            <h3>Profitability Analysis & Key Insights</h3>
            <p>${aiInsights?.profitability || 'Analysis not available'}</p>
            
            <h3>EPS Performance & Key Insights</h3>
            <p>${aiInsights?.eps || 'Analysis not available'}</p>
            
            <div class="sentiment">
                <h3>Investment Sentiment Analysis & Key Insights</h3>
                <p>${aiInsights?.sentiment || 'Sentiment analysis not available'}</p>
            </div>
        </div>
    </body>
    </html>`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-slate-600">Analyzing {stockName}...</p>
          <p className="text-sm text-slate-500">Fetching 5-year financial data (2021-2025) and generating comprehensive AI insights</p>
        </div>
      </div>
    );
  }

  if (!financialData) return null;

  const latestData = financialData[financialData.length - 1];
  const firstData = financialData[0];
  
  // Calculate compound growth rates for 5 years
  const salesCAGR = ((Math.pow(latestData.revenue / firstData.revenue, 1/4) - 1) * 100).toFixed(1);
  const profitCAGR = ((Math.pow(latestData.pat / firstData.pat, 1/4) - 1) * 100).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">{stockName} Analysis (2021-2025)</h2>
          <p className="text-slate-600">Comprehensive financial analysis with detailed AI insights including latest 2025 data</p>
        </div>
        <Button onClick={handleDownloadReport} className="bg-green-600 hover:bg-green-700">
          <Download className="h-4 w-4 mr-2" />
          Download 5Y Report (2021-2025)
        </Button>
      </div>

      {/* Enhanced Financial Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-700">
              ₹{latestData.revenue.toLocaleString()}Cr
            </div>
            <div className="text-sm text-blue-600">Latest Revenue (2025)</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-700">
              {latestData.opm}%
            </div>
            <div className="text-sm text-green-600">Operating Margin</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-700">
              ₹{latestData.eps}
            </div>
            <div className="text-sm text-purple-600">Latest EPS</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-700">
              {latestData.pegRatio}
            </div>
            <div className="text-sm text-orange-600">PEG Ratio</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-rose-50 to-rose-100 border-rose-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-rose-700">
              {latestData.roe}%
            </div>
            <div className="text-sm text-rose-600">ROE</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-cyan-50 to-cyan-100 border-cyan-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-cyan-700">
              {latestData.roce}%
            </div>
            <div className="text-sm text-cyan-600">ROCE</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-indigo-700">
              {salesCAGR}%
            </div>
            <div className="text-sm text-indigo-600">Sales CAGR</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-700">
              {profitCAGR}%
            </div>
            <div className="text-sm text-emerald-600">Profit CAGR</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section with Raw Data */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Revenue & Operating Profit Analysis (2021-2025)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RawDataTable 
              data={financialData} 
              columns={['year', 'revenue', 'operatingProfit', 'opm']}
              title="Revenue Data (2021-2025)"
            />
            <RevenueChart data={financialData} />
            <AIInsights insights={aiInsights?.revenue} stockName={stockName} sectionTitle="Detailed Revenue Analysis & Key Insights" />
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💰 Profitability Analysis (2021-2025)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RawDataTable 
              data={financialData} 
              columns={['year', 'pbt', 'pat']}
              title="Profitability Data (2021-2025)"
            />
            <ProfitabilityChart data={financialData} />
            <AIInsights insights={aiInsights?.profitability} stockName={stockName} sectionTitle="Detailed Profitability Analysis & Key Insights" />
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📈 EPS Performance Trend (2021-2025)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <RawDataTable 
            data={financialData} 
            columns={['year', 'eps', 'epsGrowth', 'pegRatio']}
            title="EPS Data with Growth Rate (2021-2025)"
          />
          <EPSChart data={financialData} />
          <AIInsights insights={aiInsights?.eps} stockName={stockName} sectionTitle="Detailed EPS Analysis & Key Insights" />
        </CardContent>
      </Card>

      {/* Sentiment Analysis Section */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-slate-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎯 Investment Sentiment Analysis & Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AIInsights insights={aiInsights?.sentiment} stockName={stockName} sectionTitle="Comprehensive Investment Analysis & Key Insights" />
        </CardContent>
      </Card>
    </div>
  );
};
