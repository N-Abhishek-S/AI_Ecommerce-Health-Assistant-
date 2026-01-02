import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { Search, TrendingUp, Star, Truck, ExternalLink, Zap, Shield, Check, Clock } from "lucide-react";

const PriceComparisonModal = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);

  const containerRef = useRef(null);
  const resultsRef = useRef(null);
  const inputRef = useRef(null);

  // GSAP animations
  useEffect(() => {
    if (results.length > 0 && resultsRef.current) {
      gsap.fromTo(
        resultsRef.current.children,
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "back.out(1.2)"
        }
      );
    }
  }, [results]);

  // Animate container on mount
  useEffect(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current, {
        opacity: 10,
        y: 40,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.2
      });
    }

    // Auto focus input
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 300);
    }
  }, []);

  // Generate AI insights
  const generateAIInsights = (data) => {
    if (!data || data.length === 0) return null;

    const prices = data.map(item => item.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    const bestDeal = data[0]; // Since array is sorted by price
    const worstDeal = data[data.length - 1];

    const savings = worstDeal.price - bestDeal.price;
    const savingsPercentage = ((savings / worstDeal.price) * 100).toFixed(1);

    return {
      bestPlatform: bestDeal.platform,
      savings: savings,
      savingsPercentage: savingsPercentage,
      priceRange: priceRange,
      avgPrice: avgPrice.toFixed(0),
      recommendation: savingsPercentage > 15 ? "Highly Recommended" : "Good Deal",
      confidence: Math.min(95, 70 + (savingsPercentage * 2)),
      pros: [
        `Save ₹${savings} compared to ${worstDeal.platform}`,
        `Best price on ${bestDeal.platform}`,
        savingsPercentage > 20 ? "Excellent price variation" : "Reasonable price range"
      ],
      quickDelivery: data.filter(item => 
        item.delivery.includes("Tomorrow") || 
        item.delivery.includes("1 Day")
      ).length > 0
    };
  };

  // Enhanced mock price comparison logic
  const fetchPriceComparison = () => {
    if (!query.trim()) {
      // Animate input shake if empty
      if (inputRef.current) {
        gsap.to(inputRef.current, {
          x: [-5, 5, -5, 5, 0],
          duration: 0.4,
          ease: "power1.out"
        });
      }
      return;
    }

    setLoading(true);
    setAiInsights(null);

    // Clear previous results with animation
    if (resultsRef.current) {
      gsap.to(resultsRef.current.children, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        stagger: 0.05,
        onComplete: () => {
          setResults([]);
        }
      });
    }

    setTimeout(() => {
      const basePrice = Math.floor(Math.random() * 2000) + 3000;

      const mockData = [
        {
          platform: "Amazon",
          price: basePrice - Math.floor(Math.random() * 300) - 100,
          delivery: "Tomorrow",
          rating: (4 + Math.random() * 0.5).toFixed(1),
          reviews: Math.floor(Math.random() * 5000) + 1000,
          trustScore: 95,
          logo: "📦",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          link: "#",
          isPrime: true,
          lastUpdated: "10 min ago"
        },
        {
          platform: "Flipkart",
          price: basePrice - Math.floor(Math.random() * 200),
          delivery: "2 Days",
          rating: (4 + Math.random() * 0.3).toFixed(1),
          reviews: Math.floor(Math.random() * 4000) + 500,
          trustScore: 92,
          logo: "🛍️",
          color: "bg-blue-100 text-blue-800 border-blue-200",
          link: "#",
          isPlus: true,
          lastUpdated: "15 min ago"
        },
        {
          platform: "Myntra",
          price: basePrice + Math.floor(Math.random() * 200),
          delivery: "3–4 Days",
          rating: (4.2 + Math.random() * 0.3).toFixed(1),
          reviews: Math.floor(Math.random() * 3000) + 800,
          trustScore: 90,
          logo: "👗",
          color: "bg-pink-100 text-pink-800 border-pink-200",
          link: "#",
          fashionScore: "Premium",
          lastUpdated: "30 min ago"
        },
        {
          platform: "Ajio",
          price: basePrice + Math.floor(Math.random() * 100) - 50,
          delivery: "4–5 Days",
          rating: (4.1 + Math.random() * 0.4).toFixed(1),
          reviews: Math.floor(Math.random() * 2000) + 300,
          trustScore: 88,
          logo: "🕶️",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          link: "#",
          stylePoints: "Trendy",
          lastUpdated: "1 hour ago"
        },
        {
          platform: "Reliance Digital",
          price: basePrice - Math.floor(Math.random() * 150),
          delivery: "1–2 Days",
          rating: (4.3 + Math.random() * 0.3).toFixed(1),
          reviews: Math.floor(Math.random() * 2500) + 600,
          trustScore: 94,
          logo: "🏪",
          color: "bg-indigo-100 text-indigo-800 border-indigo-200",
          link: "#",
          warranty: "Extended",
          lastUpdated: "25 min ago"
        }
      ];

      const sortedData = mockData.sort((a, b) => a.price - b.price);
      setResults(sortedData);
      
      // Generate AI insights
      const insights = generateAIInsights(sortedData);
      setAiInsights(insights);
      
      setLoading(false);
    }, 800);
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchPriceComparison();
    }
  };

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Smart Price Comparison
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Find the best prices across top platforms with AI-powered insights
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-linear-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-8 shadow-lg border border-blue-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter product name, URL, or paste a link..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={fetchPriceComparison}
            disabled={loading}
            className="flex-1 px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing Prices...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Find Best Price
              </>
            )}
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={() => setQuery("iPhone 15 Pro Max")}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm"
            >
              iPhone 15
            </button>
            <button
              onClick={() => setQuery("Sony Headphones")}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm"
            >
              Headphones
            </button>
            <button
              onClick={() => setQuery("Nike Air Max")}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm"
            >
              Nike Shoes
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center p-12">
          <div className="inline-block relative">
            <div className="w-20 h-20 border-4 border-blue-100 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full absolute top-0 left-0 animate-spin"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">
            Scanning Platforms...
          </h3>
          <p className="text-gray-600">Checking real-time prices across Amazon, Flipkart, Myntra & more</p>
        </div>
      )}

      {/* AI Insights */}
      {aiInsights && !loading && (
        <div className="bg-linear-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-8 border border-green-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">AI Insights</h3>
              <p className="text-gray-600">Smart recommendations based on price analysis</p>
            </div>
            <div className="ml-auto px-4 py-2 bg-white rounded-lg border border-green-200">
              <span className="font-bold text-green-700">{aiInsights.confidence}%</span>
              <span className="text-gray-600 ml-1">Confidence</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-white p-4 rounded-xl border">
              <div className="text-sm text-gray-500 mb-1">Best Platform</div>
              <div className="text-lg font-bold text-gray-900">{aiInsights.bestPlatform}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border">
              <div className="text-sm text-gray-500 mb-1">Potential Savings</div>
              <div className="text-lg font-bold text-green-600">₹{aiInsights.savings}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border">
              <div className="text-sm text-gray-500 mb-1">Savings %</div>
              <div className="text-lg font-bold text-green-600">{aiInsights.savingsPercentage}%</div>
            </div>
            <div className="bg-white p-4 rounded-xl border">
              <div className="text-sm text-gray-500 mb-1">Recommendation</div>
              <div className="text-lg font-bold text-blue-600">{aiInsights.recommendation}</div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {aiInsights.pros.map((pro, idx) => (
              <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">{pro}</span>
              </div>
            ))}
            {aiInsights.quickDelivery && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg">
                <Truck className="w-4 h-4" />
                <span className="text-sm">Fast delivery available</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Price Comparison Results
              <span className="text-gray-500 text-sm font-normal ml-2">
                ({results.length} platforms compared)
              </span>
            </h3>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Updated just now
            </div>
          </div>

          <div ref={resultsRef} className="space-y-4">
            {results.map((item, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-xl ${
                  index === 0
                    ? "border-green-500 bg-linear-to-r from-green-50 to-emerald-50 shadow-lg"
                    : "border-gray-200 bg-white hover:border-blue-200"
                }`}
              >
                {index === 0 && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-linear-to-r from-green-500 to-emerald-600 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg">
                      <span className="font-bold">BEST DEAL</span>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Platform Info */}
                  <div className="flex items-start gap-4">
                    <div className={`text-3xl ${index === 0 ? 'scale-110' : ''} transition-transform`}>
                      {item.logo}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-bold text-gray-900">{item.platform}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.color}`}>
                          {item.platform}
                        </span>
                        {item.isPrime && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                            PRIME
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="ml-1 font-semibold">{item.rating}</span>
                            <span className="text-gray-500 ml-1">/5</span>
                          </div>
                          <span className="text-gray-500 text-sm">({item.reviews.toLocaleString()} reviews)</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{item.delivery}</span>
                          {item.delivery.includes("Tomorrow") && (
                            <span className="text-xs text-green-600 font-semibold">⚡ Fast</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Shield className="w-4 h-4" />
                          Trust Score: <span className="font-semibold">{item.trustScore}/100</span>
                        </div>
                      </div>
                      
                      {item.lastUpdated && (
                        <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Updated {item.lastUpdated}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Price & Actions */}
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">
                        ₹{item.price.toLocaleString()}
                      </div>
                      {index === 0 && (
                        <div className="mt-1 text-sm text-green-600 font-semibold">
                          Lowest Price Guaranteed
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-3">
                      <button className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        View Deal
                      </button>
                      <button className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
                        Track Price
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Stats */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900">
                  {results.length}
                </div>
                <div className="text-sm text-gray-600">Platforms Compared</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">
                  ₹{(results[0]?.price || 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Best Price</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">
                  {aiInsights?.savingsPercentage || 0}%
                </div>
                <div className="text-sm text-gray-600">Average Savings</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">
                  ₹{aiInsights?.savings || 0}
                </div>
                <div className="text-sm text-gray-600">Total Savings</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && query && (
        <div className="text-center p-12">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h3>
          <p className="text-gray-600">Try searching for a different product or check the spelling</p>
        </div>
      )}
    </div>
  );
};

export default PriceComparisonModal;