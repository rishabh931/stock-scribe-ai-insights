
export const generateLocalInsights = (stockName: string, financialData: any[]) => {
  // Calculate key metrics
  const salesCAGR = calculateCAGR(financialData[0].revenue, financialData[financialData.length-1].revenue, 4);
  const profitCAGR = calculateCAGR(financialData[0].pat, financialData[financialData.length-1].pat, 4);
  const epsCAGR = calculateCAGR(financialData[0].eps, financialData[financialData.length-1].eps, 4);
  
  const avgROE = calculateAverage(financialData.map(d => d.roe));
  const avgROCE = calculateAverage(financialData.map(d => d.roce));
  const currentPEG = parseFloat(financialData[financialData.length-1].pegRatio);
  
  const omExpansion = (financialData[financialData.length-1].opm - financialData[0].opm) * 100;
  
  return {
    revenue: generateDetailedRevenueInsights(stockName, financialData, salesCAGR, omExpansion),
    profitability: generateDetailedProfitabilityInsights(stockName, financialData, profitCAGR, avgROE, avgROCE),
    eps: generateDetailedEPSInsights(stockName, financialData, epsCAGR, currentPEG),
    sentiment: generateDetailedSentimentInsights(stockName, salesCAGR, profitCAGR, epsCAGR, avgROE, currentPEG, omExpansion)
  };
};

const calculateCAGR = (start: number, end: number, years: number): number => {
  return ((Math.pow(end / start, 1 / years) - 1) * 100);
};

const calculateAverage = (values: number[]): number => {
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

const generateDetailedRevenueInsights = (stockName: string, data: any[], cagr: number, omExpansion: number): string => {
  const growth = cagr > 15 ? 'Exceptional' : cagr > 12 ? 'Strong' : cagr > 8 ? 'Moderate' : 'Slow';
  const trend = omExpansion > 150 ? 'rapidly expanding' : omExpansion > 50 ? 'expanding' : omExpansion > 0 ? 'stable' : 'contracting';
  const consistency = data.filter((d, i) => i > 0 && d.revenue > data[i-1].revenue).length;
  
  return `**📈 Revenue Analysis (Detailed Local Analysis):**
• **Growth Performance**: ${growth} revenue growth at ${cagr.toFixed(1)}% CAGR over 2021-2025 period
• **Scale Expansion**: Revenue grew from ₹${data[0].revenue.toLocaleString()}Cr to ₹${data[data.length-1].revenue.toLocaleString()}Cr
• **Operating Efficiency**: Margins ${trend} by ${Math.abs(omExpansion).toFixed(0)} basis points, indicating ${omExpansion > 0 ? 'improving' : 'declining'} operational control
• **Growth Consistency**: ${consistency}/${data.length-1} years showed positive growth, demonstrating ${consistency >= 4 ? 'excellent' : consistency >= 3 ? 'good' : 'inconsistent'} execution
• **Market Position**: ${cagr > 12 ? 'Market leader potential with sustainable competitive advantages' : cagr > 8 ? 'Solid market player with growth opportunities' : 'Needs strategic repositioning for better growth'}
• **Revenue Quality**: ${cagr > avgMarketGrowth() ? 'Outperforming market averages' : 'Underperforming relative to market standards'}`;
};

const generateDetailedProfitabilityInsights = (stockName: string, data: any[], cagr: number, roe: number, roce: number): string => {
  const quality = cagr > 15 ? 'Superior' : cagr > 10 ? 'Strong' : cagr > 5 ? 'Moderate' : 'Weak';
  const efficiency = roe > 20 ? 'Excellent' : roe > 15 ? 'Good' : roe > 10 ? 'Average' : 'Poor';
  const consistency = data.filter((d, i) => i > 0 && d.pat > data[i-1].pat).length;
  
  return `**💰 Profitability Analysis (Detailed Local Analysis):**
• **Earnings Growth**: ${quality} net profit CAGR of ${cagr.toFixed(1)}% showcasing ${cagr > 12 ? 'exceptional' : 'moderate'} value creation ability
• **Capital Efficiency Metrics**: 
  - ROE: ${roe.toFixed(1)}% (${efficiency} shareholder value generation)
  - ROCE: ${roce.toFixed(1)}% (${roce > 15 ? 'Strong' : roce > 10 ? 'Adequate' : 'Weak'} capital deployment)
• **Margin Evolution**: Operating margins improved from ${data[0].opm}% to ${data[data.length-1].opm}%, showing ${data[data.length-1].opm > data[0].opm ? 'operational leverage' : 'margin pressure'}
• **Profit Consistency**: ${consistency}/${data.length-1} years of growth indicates ${consistency >= 4 ? 'highly reliable' : consistency >= 3 ? 'moderately stable' : 'volatile'} earnings stream
• **Management Efficiency**: ${roe > roce ? 'Effective use of financial leverage' : 'Conservative capital structure'}
• **Competitive Moat**: ${roe > 18 && roce > 15 ? 'Strong economic moat with pricing power' : 'Developing competitive advantages'}`;
};

const generateDetailedEPSInsights = (stockName: string, data: any[], cagr: number, peg: number): string => {
  const valuation = peg < 0.8 ? 'Significantly Undervalued' : peg < 1.2 ? 'Fair Value' : peg < 1.8 ? 'Moderately Expensive' : 'Overvalued';
  const growth = cagr > 20 ? 'Accelerating' : cagr > 15 ? 'Strong' : cagr > 10 ? 'Steady' : 'Declining';
  
  return `**📊 EPS Performance (Detailed Local Analysis):**
• **Earnings Per Share Journey**: Grew from ₹${data[0].eps} to ₹${data[data.length-1].eps} at ${cagr.toFixed(1)}% CAGR
• **Growth Trajectory**: ${growth} earnings expansion indicating ${cagr > 15 ? 'exceptional business momentum' : 'moderate business progress'}
• **Valuation Assessment**: PEG ratio of ${peg} suggests ${valuation.toLowerCase()} investment opportunity
• **Shareholder Wealth Creation**: ${cagr > 15 ? 'Excellent wealth multiplier for long-term investors' : cagr > 10 ? 'Decent returns for patient capital' : 'Below-average wealth creation'}
• **Earnings Quality**: ${data.filter((d, i) => i > 0 && d.eps > data[i-1].eps).length}/${data.length-1} years of positive EPS growth shows ${data.filter((d, i) => i > 0 && d.eps > data[i-1].eps).length >= 4 ? 'exceptional' : 'moderate'} management execution
• **Future Potential**: ${peg < 1 && cagr > 12 ? 'High probability of continued outperformance' : 'Requires monitoring for sustained performance'}`;
};

const generateDetailedSentimentInsights = (stockName: string, sales: number, profit: number, eps: number, roe: number, peg: number, om: number): string => {
  const score = calculateDetailedScore(sales, profit, eps, roe, peg, om);
  const sentiment = score > 8 ? '🟢 STRONG BUY' : score > 6.5 ? '🟢 BUY' : score > 5 ? '🟡 HOLD' : score > 3 ? '🟠 WEAK HOLD' : '🔴 AVOID';
  
  return `**🎯 Investment Sentiment (Comprehensive Local Analysis):**
• **Overall Investment Rating**: ${sentiment} (Score: ${score}/10)
• **Growth Drivers Analysis**:
  - Revenue momentum: ${sales.toFixed(1)}% CAGR ${sales > 12 ? '(Strong tailwinds)' : '(Moderate growth)'}
  - Profit expansion: ${profit.toFixed(1)}% CAGR ${profit > 15 ? '(Exceptional execution)' : '(Steady progress)'}
• **Key Strengths**: ${getStrengths(sales, profit, roe, peg, om)}
• **Risk Factors**: ${getRisks(sales, profit, roe, peg, om)}
• **Investment Recommendation**: 
  - ${score > 7 ? 'ACCUMULATE - Strong fundamentals with multiple growth catalysts' : score > 5 ? 'MONITOR - Mixed signals requiring closer tracking' : 'AVOID - Weak metrics with limited upside potential'}
• **Optimal Investment Horizon**: ${score > 7 ? '3-5 years for wealth multiplication' : score > 5 ? '1-2 years with active monitoring' : 'Not suitable for current market conditions'}
• **Risk-Reward Profile**: ${score > 7 ? 'High reward, moderate risk' : score > 5 ? 'Moderate reward, moderate risk' : 'Low reward, high risk'}`;
};

const calculateDetailedScore = (sales: number, profit: number, eps: number, roe: number, peg: number, om: number): number => {
  let score = 5; // Base score
  
  // Enhanced growth scoring
  if (sales > 20) score += 2;
  else if (sales > 15) score += 1.5;
  else if (sales > 10) score += 1;
  else if (sales < 5) score -= 1;
  
  if (profit > 25) score += 2;
  else if (profit > 15) score += 1.5;
  else if (profit > 10) score += 1;
  else if (profit < 5) score -= 1;
  
  // Enhanced profitability scoring
  if (roe > 25) score += 1.5;
  else if (roe > 20) score += 1;
  else if (roe > 15) score += 0.5;
  else if (roe < 10) score -= 0.5;
  
  // Enhanced valuation scoring
  if (peg < 0.8) score += 1.5;
  else if (peg < 1.2) score += 0.5;
  else if (peg > 2) score -= 1.5;
  else if (peg > 1.8) score -= 1;
  
  // Margin expansion scoring
  if (om > 150) score += 1;
  else if (om > 50) score += 0.5;
  else if (om < -50) score -= 1;
  
  return Math.min(Math.max(Math.round(score * 10) / 10, 0), 10);
};

const getStrengths = (sales: number, profit: number, roe: number, peg: number, om: number): string => {
  const strengths = [];
  if (sales > 15) strengths.push('Robust revenue growth');
  if (profit > 20) strengths.push('Exceptional profit expansion');
  if (roe > 20) strengths.push('Superior capital efficiency');
  if (peg < 1) strengths.push('Attractive valuation');
  if (om > 100) strengths.push('Margin expansion');
  
  return strengths.length > 0 ? strengths.join(', ') : 'Stable business model';
};

const getRisks = (sales: number, profit: number, roe: number, peg: number, om: number): string => {
  const risks = [];
  if (sales < 8) risks.push('Slow revenue growth');
  if (profit < 10) risks.push('Weak profit momentum');
  if (roe < 12) risks.push('Low capital efficiency');
  if (peg > 2) risks.push('High valuation risk');
  if (om < -50) risks.push('Margin pressure');
  
  return risks.length > 0 ? risks.join(', ') : 'Market volatility, regulatory changes';
};

const avgMarketGrowth = (): number => 12; // Assumed market average
