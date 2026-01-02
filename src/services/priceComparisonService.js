// Simulated Price Comparison Service

const PLATFORMS = [
  { name: "Amazon", logo: "📦", color: "text-yellow-600" },
  { name: "Flipkart", logo: "🛍️", color: "text-blue-600" },
  { name: "Myntra", logo: "👗", color: "text-pink-600" },
  { name: "Ajio", logo: "🕶️", color: "text-gray-800" },
  { name: "Nykaa Fashion", logo: "💄", color: "text-pink-500" }
];

export const fetchPriceComparison = async (product) => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 800));

  if (!product || !product.price) {
    throw new Error("Invalid product data");
  }

  const basePrice = product.price;
  
  // Select 2-4 random competitors
  const competitorsCount = Math.floor(Math.random() * 3) + 2;
  const shuffledPlatforms = [...PLATFORMS].sort(() => 0.5 - Math.random());
  const selectedPlatforms = shuffledPlatforms.slice(0, competitorsCount);

  const comparisons = selectedPlatforms.map(platform => {
    // Generate price variation (-15% to +20%)
    const variation = (Math.random() * 0.35) - 0.15;
    const price = Math.round(basePrice * (1 + variation));
    
    // Generate delivery days (1 to 7)
    const deliveryDays = Math.floor(Math.random() * 7) + 1;
    
    // Generate rating (3.5 to 5.0)
    const rating = (Math.random() * 1.5 + 3.5).toFixed(1);

    return {
      platform: platform.name,
      logo: platform.logo,
      price: price,
      delivery: deliveryDays === 1 ? "Tomorrow" : `${deliveryDays} days`,
      rating: rating,
      url: "#", // In a real app, this would be the affiliate link
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  });

  // Add "Official Store" (current app) for comparison
  comparisons.push({
    platform: "StyleGenius (Us)",
    logo: "💎",
    price: basePrice,
    delivery: "2-3 days",
    rating: "4.8",
    isOfficial: true,
    url: "#"
  });

  // Sort by Price (Ascending)
  return comparisons.sort((a, b) => a.price - b.price);
};
