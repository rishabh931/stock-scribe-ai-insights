
// Consistent stock data generator using stock name as seed
export const generateConsistentStockData = (stockName: string) => {
  // Use stock name to create a consistent seed
  const seed = stockName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Simple seeded random number generator
  const seededRandom = (seed: number) => {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  const years = ['2021', '2022', '2023', '2024', '2025'];
  
  // Base values specific to stock (using seed)
  const baseRevenue = Math.floor(seededRandom(seed) * 50000) + 10000;
  const baseGrowthRate = seededRandom(seed + 1) * 0.2 + 0.05; // 5-25% growth rate
  
  return years.map((year, index) => {
    const yearSeed = seed + index;
    const revenue = Math.floor(baseRevenue * Math.pow(1 + baseGrowthRate, index));
    const operatingProfit = Math.floor(revenue * (0.15 + seededRandom(yearSeed + 10) * 0.15));
    const opm = Math.floor((operatingProfit / revenue) * 100);
    const pbt = Math.floor(revenue * (0.12 + seededRandom(yearSeed + 20) * 0.08));
    const pat = Math.floor(revenue * (0.08 + seededRandom(yearSeed + 30) * 0.07));
    const eps = Math.floor(50 + (index * 15) + seededRandom(yearSeed + 40) * 30);
    const prevEps = index > 0 ? (50 + ((index-1) * 15) + seededRandom(yearSeed + 39) * 30) : eps;
    const epsGrowth = index > 0 ? Math.round(((eps - prevEps) / prevEps) * 100 * 100) / 100 : 0;
    
    return {
      year,
      revenue,
      operatingProfit,
      opm,
      pbt,
      pat,
      eps,
      epsGrowth,
      pegRatio: (seededRandom(yearSeed + 50) * 2 + 0.5).toFixed(1),
      roe: Math.floor(seededRandom(yearSeed + 60) * 25) + 10,
      roce: Math.floor(seededRandom(yearSeed + 70) * 20) + 8,
      netWorth: Math.floor(revenue * (0.4 + seededRandom(yearSeed + 80) * 0.3)),
      totalAssets: Math.floor(revenue * (0.8 + seededRandom(yearSeed + 90) * 0.4))
    };
  });
};

// Note: This still uses mock data. For real-time data, you would need:
// 1. A financial data API subscription (Alpha Vantage, Yahoo Finance, etc.)
// 2. Backend integration to handle API calls and data processing
// 3. Proper error handling and data validation
