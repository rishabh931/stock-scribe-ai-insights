
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
    revenue: generateRevenueInsights(stockName, financialData, salesCAGR, omExpansion),
    profitability: generateProfitabilityInsights(stockName, financialData, profitCAGR, avgROE, avgROCE),
    eps: generateEPSInsights(stockName, financialData, epsCAGR, currentPEG),
    sentiment: generateSentimentInsights(stockName, salesCAGR, profitCAGR, epsCAGR, avgROE, currentPEG, omExpansion)
  };
};

const calculateCAGR = (start: number, end: number, years: number): number => {
  return ((Math.pow(end / start, 1 / years) - 1) * 100);
};

const calculateAverage = (values: number[]): number => {
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

const generateRevenueInsights = (stockName: string, data: any[], cagr: number, omExpansion: number): string => {
  const growth = cagr > 15 ? 'Strong' : cagr > 10 ? 'Moderate' : 'Slow';
  const trend = omExpansion > 100 ? 'expanding' : omExpansion > 0 ? 'stable' : 'contracting';
  
  return `**📈 Revenue Analysis:**
• ${growth} revenue growth at ${cagr.toFixed(1)}% CAGR (2021-2025)
• Operating margins ${trend} by ${Math.abs(omExpansion).toFixed(0)} basis points
• Revenue scale: ₹${data[0].revenue.toLocaleString()}Cr → ₹${data[data.length-1].revenue.toLocaleString()}Cr
• Growth quality: ${cagr > 12 ? 'Excellent' : cagr > 8 ? 'Good' : 'Average'} with ${data.filter((d, i) => i > 0 && d.revenue > data[i-1].revenue).length}/${data.length-1} positive years`;
};

const generateProfitabilityInsights = (stockName: string, data: any[], cagr: number, roe: number, roce: number): string => {
  const quality = cagr > roe ? 'Superior' : cagr > 10 ? 'Strong' : 'Moderate';
  
  return `**💰 Profitability Analysis:**
• Net profit CAGR: ${cagr.toFixed(1)}% demonstrating ${quality.toLowerCase()} earnings growth
• Capital efficiency: ROE ${roe.toFixed(1)}% | ROCE ${roce.toFixed(1)}%
• Profit margins: Current OPM ${data[data.length-1].opm}% vs ${data[0].opm}% in 2021
• Earnings consistency: ${data.filter((d, i) => i > 0 && d.pat > data[i-1].pat).length}/${data.length-1} years of growth`;
};

const generateEPSInsights = (stockName: string, data: any[], cagr: number, peg: number): string => {
  const valuation = peg < 1 ? 'Undervalued' : peg < 1.5 ? 'Fair' : 'Expensive';
  
  return `**📊 EPS Performance:**
• EPS growth: ${cagr.toFixed(1)}% CAGR from ₹${data[0].eps} to ₹${data[data.length-1].eps}
• Valuation: PEG ${peg} indicates ${valuation.toLowerCase()} opportunity
• Growth trajectory: ${cagr > 15 ? 'Accelerating' : cagr > 10 ? 'Steady' : 'Moderate'} earnings expansion
• Shareholder value: ${cagr > 12 ? 'Excellent' : 'Moderate'} wealth creation potential`;
};

const generateSentimentInsights = (stockName: string, sales: number, profit: number, eps: number, roe: number, peg: number, om: number): string => {
  const score = calculateScore(sales, profit, eps, roe, peg, om);
  const sentiment = score > 7 ? '🟢 BULLISH' : score > 5 ? '🟡 NEUTRAL' : '🔴 BEARISH';
  
  return `**🎯 Investment Sentiment:**
• Overall rating: ${sentiment} (Score: ${score}/10)
• Growth drivers: ${sales.toFixed(1)}% revenue | ${profit.toFixed(1)}% profit expansion
• Risk factors: ${peg > 2 ? 'High valuation' : 'Market competition'} | Regulatory changes
• Recommendation: ${score > 7 ? 'BUY - Strong fundamentals' : score > 5 ? 'HOLD - Monitor closely' : 'AVOID - Weak metrics'}
• Investment horizon: ${score > 7 ? 'Long-term wealth creator' : 'Short to medium term'}`;
};

const calculateScore = (sales: number, profit: number, eps: number, roe: number, peg: number, om: number): number => {
  let score = 5; // Base score
  
  // Growth scoring
  if (sales > 15) score += 1.5;
  else if (sales > 10) score += 1;
  
  if (profit > 15) score += 1.5;
  else if (profit > 10) score += 1;
  
  // Profitability scoring
  if (roe > 20) score += 1;
  else if (roe > 15) score += 0.5;
  
  // Valuation scoring
  if (peg < 1) score += 1;
  else if (peg > 2) score -= 1;
  
  // Margin expansion
  if (om > 100) score += 0.5;
  else if (om < 0) score -= 0.5;
  
  return Math.min(Math.max(Math.round(score * 10) / 10, 0), 10);
};
