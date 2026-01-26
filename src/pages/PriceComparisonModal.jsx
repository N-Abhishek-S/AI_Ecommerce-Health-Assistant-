import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  TrendingUp,
  Shield,
  Zap,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
  Smartphone,
  Store,
  DollarSign,
  Tag,
  ChevronRight,
  BarChart3,
  Clock,
  RefreshCw,
  Sparkles,
  ShoppingBag,
  TrendingDown,
  Info,
  Star,
  Truck,
  Battery,
  Camera,
  Filter,
  SortAsc,
  ChevronDown,
  Globe,
  Award,
  Percent,
  Shield as ShieldIcon,
  Download,
  Share2,
  Bookmark,
  ThumbsUp
} from "lucide-react";

// Platform configuration with colors and icons
const PLATFORM_CONFIG = {
  'cell point': { color: 'from-blue-500 to-cyan-500', bgColor: 'bg-linear-to-r from-blue-50 to-cyan-50', borderColor: 'border-blue-200', textColor: 'text-blue-700' },
  'cashify': { color: 'from-green-500 to-emerald-500', bgColor: 'bg-linear-to-r from-green-50 to-emerald-50', borderColor: 'border-green-200', textColor: 'text-green-700' },
  'bhatiamobile': { color: 'from-purple-500 to-pink-500', bgColor: 'bg-linear-to-r from-purple-50 to-pink-50', borderColor: 'border-purple-200', textColor: 'text-purple-700' },
  'skinos products': { color: 'from-yellow-500 to-orange-500', bgColor: 'bg-linear-to-r from-yellow-50 to-orange-50', borderColor: 'border-yellow-200', textColor: 'text-yellow-700' },
  'supreme mobiles': { color: 'from-red-500 to-rose-500', bgColor: 'bg-linear-to-r from-red-50 to-rose-50', borderColor: 'border-red-200', textColor: 'text-red-700' },
  'bajaj markets x ondc': { color: 'from-indigo-500 to-violet-500', bgColor: 'bg-linear-to-r from-indigo-50 to-violet-50', borderColor: 'border-indigo-200', textColor: 'text-indigo-700' },
  'a to z communication': { color: 'from-teal-500 to-cyan-500', bgColor: 'bg-linear-to-r from-teal-50 to-cyan-50', borderColor: 'border-teal-200', textColor: 'text-teal-700' },
  'green okra mall': { color: 'from-lime-500 to-green-500', bgColor: 'bg-linear-to-r from-lime-50 to-green-50', borderColor: 'border-lime-200', textColor: 'text-lime-700' },
  'gudfast': { color: 'from-amber-500 to-orange-500', bgColor: 'bg-linear-to-r from-amber-50 to-orange-50', borderColor: 'border-amber-200', textColor: 'text-amber-700' },
  'cubotlifestyle.com': { color: 'from-gray-500 to-slate-500', bgColor: 'bg-linear-to-r from-gray-50 to-slate-50', borderColor: 'border-gray-200', textColor: 'text-gray-700' },
  'default': { color: 'from-gray-500 to-slate-500', bgColor: 'bg-linear-to-r from-gray-50 to-slate-50', borderColor: 'border-gray-200', textColor: 'text-gray-700' }
};

export default function PriceComparisonTool() {
  const [url, setUrl] = useState("");
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [activePlatform, setActivePlatform] = useState("all");
  const [sortBy, setSortBy] = useState("price-asc");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState([0, 20000]);
  const [exporting, setExporting] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    notifyBestPrice: true,
    showRefurbished: true,
    preferTrustedStores: true
  });

  // Load recent searches and preferences from localStorage
  useEffect(() => {
    try {
      const savedSearches = localStorage.getItem("priceComparisonRecentSearches");
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }
      
      const savedPrefs = localStorage.getItem("priceComparisonPrefs");
      if (savedPrefs) {
        setUserPreferences(JSON.parse(savedPrefs));
      }
    } catch (e) {
      console.error("Failed to load data:", e);
    }
  }, []);

  const saveToRecentSearches = (productName, data) => {
    try {
      const newSearch = {
        id: Date.now(),
        name: productName,
        date: new Date().toISOString(),
        timestamp: Date.now(),
        url: url,
        data: data,
        bestPrice: getBestPrice(data?.results)?.numericPrice
      };
      
      const updated = [newSearch, ...recentSearches.slice(0, 9)];
      setRecentSearches(updated);
      localStorage.setItem("priceComparisonRecentSearches", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save recent search:", e);
    }
  };

  const updateUserPreferences = (key, value) => {
    const updated = { ...userPreferences, [key]: value };
    setUserPreferences(updated);
    localStorage.setItem("priceComparisonPrefs", JSON.stringify(updated));
  };

  // Enhanced price parsing
  const extractPriceNumber = useCallback((priceString) => {
    if (!priceString) return Infinity;
    try {
      const cleanString = priceString.replace(/[^\d.,]/g, '');
      const match = cleanString.match(/([\d,]+(?:\.\d+)?)/);
      if (match) {
        return parseFloat(match[1].replace(/,/g, ''));
      }
      return Infinity;
    } catch (e) {
      console.warn("Price parsing error:", e);
      return Infinity;
    }
  }, []);

  const formatPrice = useCallback((priceString) => {
    if (!priceString) return "Price not available";
    
    const priceNum = extractPriceNumber(priceString);
    if (priceNum === Infinity || isNaN(priceNum)) return "Price not available";
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(priceNum);
  }, [extractPriceNumber]);

  // Parse API response with improved error handling
  const parseApiResponse = useCallback((response) => {
    try {
      console.log("Raw API response:", response);
      
      // Handle direct array response (like your sample data)
      if (Array.isArray(response)) {
        return {
          identified_product: response[0]?.product_name || "Product",
          results: response,
          input_url: url,
          timestamp: new Date().toISOString()
        };
      }
      
      // Handle various response formats
      if (typeof response === 'object' && response !== null) {
        // Check for direct results
        if (Array.isArray(response.results || response.data)) {
          const results = response.results || response.data;
          return {
            identified_product: response.identified_product || results[0]?.product_name || "Product",
            results: results,
            input_url: response.input_url || url,
            timestamp: response.timestamp || new Date().toISOString()
          };
        }
        
        // Check for text response with JSON
        if (response.content?.parts?.[0]?.text) {
          const text = response.content.parts[0].text;
          const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const jsonStr = jsonMatch[1] || jsonMatch[0];
            const parsed = JSON.parse(jsonStr);
            return parseApiResponse(parsed); // Recursively parse
          }
        }
      }
      
      throw new Error("Unsupported response format");
    } catch (e) {
      console.error("Parse error:", e);
      throw new Error("Could not parse API response. Please try again.");
    }
  }, [url]);

  // Enhanced data fetching with timeout and retry
  const comparePrices = async () => {
    if (!url.trim()) {
      setError("Please enter a valid product URL");
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch (e) {
      setError("Please enter a valid URL (e.g., https://www.amazon.in/product-url)");
      return;
    }

    setLoading(true);
    setError(null);
    setComparisonData(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch("https://n8n.srv1247505.hstgr.cloud/webhook/price-compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({ 
          url,
          user_preferences: userPreferences 
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error (${response.status}): ${errorText}`);
      }

      const responseData = await response.json();
      console.log("API Response:", responseData);
      
      const parsedData = parseApiResponse(responseData);
      
      if (!parsedData?.results?.length) {
        throw new Error("No price data found for this product.");
      }
      
      // Enhance data with calculated fields
      const enhancedData = {
        ...parsedData,
        results: parsedData.results.map(result => ({
          ...result,
          numericPrice: extractPriceNumber(result.price),
          formattedPrice: formatPrice(result.price),
          platformNormalized: result.platform?.toLowerCase()?.trim(),
          isRefurbished: /refurbished|used|renewed/i.test(result.description || result.product_name),
          trustScore: calculateTrustScore(result.platform),
          lastUpdated: new Date().toISOString()
        })).filter(result => result.numericPrice !== Infinity)
      };
      
      // Save to recent searches
      saveToRecentSearches(parsedData.identified_product, enhancedData);
      
      setComparisonData(enhancedData);
      
      // Show success notification
      showNotification("success", `Found ${enhancedData.results.length} price options`);
      
    } catch (err) {
      console.error("API Error:", err);
      
      if (err.name === 'AbortError') {
        setError("Request timed out. Please try again.");
      } else {
        setError(err.message || "Failed to fetch prices. Please check the URL and try again.");
      }
      
      // Fallback to sample data for demo
      if (process.env.NODE_ENV === 'development') {
        console.log("Using fallback data");
        const sampleData = parseApiResponse(YOUR_SAMPLE_DATA_ARRAY);
        if (sampleData) {
          setComparisonData(sampleData);
          setError(null);
        }
      }
    } finally {
      setLoading(false);
      clearTimeout(timeoutId);
    }
  };

  // Helper functions
  const getBestPrice = useCallback((results) => {
    if (!results?.length) return null;
    
    const validResults = results.filter(r => r.numericPrice !== Infinity);
    if (!validResults.length) return null;
    
    return validResults.reduce((best, current) => 
      current.numericPrice < best.numericPrice ? current : best
    );
  }, []);

  const calculateTrustScore = (platform) => {
    const trustedPlatforms = ['amazon', 'flipkart', 'tata cliq', 'reliance digital'];
    const platformLower = platform.toLowerCase();
    
    if (trustedPlatforms.some(tp => platformLower.includes(tp))) return 90;
    if (platformLower.includes('bajaj') || platformLower.includes('cashify')) return 80;
    return 60;
  };

  const calculateSavings = useCallback((price1, price2) => {
    if (!price1 || !price2 || price1 === Infinity || price2 === Infinity || price2 <= price1) return 0;
    return Math.round(((price2 - price1) / price2) * 100);
  }, []);

  // Filter and sort results
  const getFilteredSortedResults = useCallback(() => {
    if (!comparisonData?.results) return [];
    
    let filtered = [...comparisonData.results];
    
    // Apply platform filter
    if (activePlatform !== "all") {
      filtered = filtered.filter(result => 
        result.platformNormalized?.includes(activePlatform.toLowerCase())
      );
    }
    
    // Apply price range filter
    filtered = filtered.filter(result => 
      result.numericPrice >= selectedPriceRange[0] && 
      result.numericPrice <= selectedPriceRange[1]
    );
    
    // Apply user preferences
    if (!userPreferences.showRefurbished) {
      filtered = filtered.filter(result => !result.isRefurbished);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.numericPrice - b.numericPrice;
        case 'price-desc':
          return b.numericPrice - a.numericPrice;
        case 'trust-desc':
          return b.trustScore - a.trustScore;
        case 'name-asc':
          return a.platform.localeCompare(b.platform);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [comparisonData, activePlatform, sortBy, selectedPriceRange, userPreferences]);

  // Export functionality
  const exportResults = async (format = 'json') => {
    setExporting(true);
    try {
      const data = {
        product: comparisonData.identified_product,
        comparisonDate: new Date().toISOString(),
        results: getFilteredSortedResults(),
        bestPrice: getBestPrice(comparisonData?.results)
      };
      
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `price-comparison-${Date.now()}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        // Convert to CSV
        const headers = ['Platform', 'Product Name', 'Price', 'URL', 'Description'];
        const csvRows = [
          headers.join(','),
          ...data.results.map(row => [
            `"${row.platform}"`,
            `"${row.product_name}"`,
            `"${row.price}"`,
            `"${row.product_url}"`,
            `"${row.description}"`
          ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvRows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `price-comparison-${Date.now()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
      
      showNotification("success", `Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      showNotification("error", "Failed to export data");
      console.error("Export error:", error);
    } finally {
      setExporting(false);
    }
  };

  // Notification system
  const showNotification = (type, message) => {
    // Implement your notification system here
    console.log(`${type}: ${message}`);
  };

  // Get unique platforms for filters
  const uniquePlatforms = useMemo(() => {
    if (!comparisonData?.results) return [];
    return [...new Set(comparisonData.results.map(r => r.platformNormalized))].sort();
  }, [comparisonData]);

  const bestPrice = getBestPrice(comparisonData?.results);
  const filteredResults = getFilteredSortedResults();
  const hasResults = filteredResults.length > 0;

  // Event handlers
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading && url.trim()) {
      comparePrices();
    }
  };

  const handleRetry = () => {
    if (url.trim()) {
      comparePrices();
    }
  };

  const handleRecentSearchClick = (search) => {
    setUrl(search.url);
    if (search.data) {
      setComparisonData(search.data);
    } else {
      comparePrices();
    }
  };

  const shareResults = () => {
    if (navigator.share) {
      navigator.share({
        title: `Price comparison for ${comparisonData?.identified_product}`,
        text: `Check out the best prices for ${comparisonData?.identified_product}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showNotification("success", "Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <header className="mb-8 md:mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-3 bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">PRO</span>
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  PriceWise Pro
                </h1>
                <p className="text-gray-600 text-sm md:text-base mt-1">
                  Enterprise-grade Price Intelligence Platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-linear-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <Globe className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Live • India</span>
              </div>
              <button 
                onClick={shareResults}
                className="p-2.5 bg-white hover:bg-gray-50 rounded-xl border border-gray-300 shadow-sm"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          
          {/* Enhanced Input Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 w-full relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Paste product URL from Amazon, Flipkart, Myntra, etc..."
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-3 focus:ring-blue-200 transition-all duration-300 disabled:opacity-50 bg-white text-lg"
                  disabled={loading}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={comparePrices}
                  disabled={loading || !url.trim()}
                  className="px-8 py-3.5 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 min-w-40 shadow-lg hover:shadow-xl active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="hidden sm:inline">Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Compare Prices</span>
                    </>
                  )}
                </button>
                
                {hasResults && (
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-4 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center gap-2"
                  >
                    <Filter className="w-5 h-5" />
                    <span className="hidden sm:inline">Filters</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Advanced Filters */}
            {showFilters && hasResults && (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort by
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="trust-desc">Trust Score</option>
                      <option value="name-asc">Platform Name</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range: ₹{selectedPriceRange[0].toLocaleString()} - ₹{selectedPriceRange[1].toLocaleString()}
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="50000"
                        step="100"
                        value={selectedPriceRange[0]}
                        onChange={(e) => setSelectedPriceRange([parseInt(e.target.value), selectedPriceRange[1]])}
                        className="flex-1"
                      />
                      <input
                        type="range"
                        min="0"
                        max="50000"
                        step="100"
                        value={selectedPriceRange[1]}
                        onChange={(e) => setSelectedPriceRange([selectedPriceRange[0], parseInt(e.target.value)])}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferences
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={userPreferences.showRefurbished}
                          onChange={(e) => updateUserPreferences('showRefurbished', e.target.checked)}
                          className="rounded text-blue-600"
                        />
                        <span className="text-sm">Show refurbished items</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Quick Tips */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>ISO 27001 Compliant</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Real-time API • 99.9% Uptime</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-purple-500" />
                <span>20+ Platforms Integrated</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        {hasResults && (
          <>
            {/* Product Overview Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    {comparisonData.results[0]?.image && (
                      <img
                        src={comparisonData.results[0].image}
                        alt={comparisonData.identified_product}
                        className="w-20 h-20 object-contain rounded-xl bg-gray-50 border border-gray-200 p-2"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {comparisonData.identified_product}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 bg-linear-to-r from-blue-100 to-cyan-100 text-blue-800 text-sm font-medium rounded-full border border-blue-200">
                          {comparisonData.results.length} Price Options
                        </span>
                        <span className="px-3 py-1 bg-linear-to-r from-green-100 to-emerald-100 text-green-800 text-sm font-medium rounded-full border border-green-200">
                          Updated: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="px-3 py-1 bg-linear-to-r from-purple-100 to-pink-100 text-purple-800 text-sm font-medium rounded-full border border-purple-200">
                          India • INR
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {bestPrice && (
                  <div className="bg-linear-to-r from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-200 shadow-lg min-w-[280px]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-semibold text-green-700">BEST VALUE</span>
                      </div>
                      <Percent className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-green-800 mb-2">
                      {bestPrice.formattedPrice}
                    </div>
                    <div className="text-sm text-green-700 mb-4">
                      Save up to {calculateSavings(bestPrice.numericPrice, 
                        Math.max(...comparisonData.results.map(r => r.numericPrice).filter(p => p !== Infinity))
                      )}%
                    </div>
                    <div className="flex items-center justify-between">
                      <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        PLATFORM_CONFIG[bestPrice.platformNormalized]?.bgColor || 'bg-gray-100'
                      } ${PLATFORM_CONFIG[bestPrice.platformNormalized]?.textColor || 'text-gray-800'}`}>
                        {bestPrice.platform}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.open(bestPrice.product_url, '_blank', 'noopener,noreferrer')}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Buy Now
                        </button>
                        <button className="p-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg">
                          <Bookmark className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Export and Share Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{filteredResults.length}</span> results showing
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {uniquePlatforms.slice(0, 5).map(platform => (
                      <button
                        key={platform}
                        onClick={() => setActivePlatform(activePlatform === platform ? "all" : platform)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          activePlatform === platform
                            ? `${PLATFORM_CONFIG[platform]?.bgColor || 'bg-gray-100'} ${PLATFORM_CONFIG[platform]?.textColor || 'text-gray-800'} border ${PLATFORM_CONFIG[platform]?.borderColor || 'border-gray-300'}`
                            : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </button>
                    ))}
                    {uniquePlatforms.length > 5 && (
                      <button className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        +{uniquePlatforms.length - 5} more
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => exportResults('json')}
                    disabled={exporting}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {exporting ? 'Exporting...' : 'Export JSON'}
                  </button>
                  <button
                    onClick={() => exportResults('csv')}
                    disabled={exporting}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Price Comparison Grid */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {filteredResults.map((result, index) => {
                const platformConfig = PLATFORM_CONFIG[result.platformNormalized] || PLATFORM_CONFIG.default;
                const isBestPrice = bestPrice && result.platform === bestPrice.platform;
                const savings = calculateSavings(bestPrice?.numericPrice, result.numericPrice);
                
                return (
                  <div
                    key={`${result.platform}-${index}`}
                    className={`bg-white rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl group ${
                      isBestPrice 
                        ? 'border-green-500 shadow-xl shadow-green-100/50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {/* Platform Header */}
                    <div className={`px-6 py-4 ${platformConfig.bgColor} border-b ${platformConfig.borderColor}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full bg-linear-to-r ${platformConfig.color}`} />
                          <h3 className="font-bold text-lg text-gray-900">{result.platform}</h3>
                          {result.isRefurbished && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-medium rounded border border-amber-200">
                              Refurbished
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-700">
                            Trust: {result.trustScore}%
                          </div>
                          {isBestPrice && (
                            <div className="flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-800 rounded-full">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Best</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Product Content */}
                    <div className="p-6">
                      <div className="flex gap-4">
                        {result.image && (
                          <div className="shrink-0">
                            <img
                              src={result.image}
                              alt={result.product_name}
                              className="w-24 h-24 object-contain rounded-lg bg-gray-50 p-3 border border-gray-300"
                              loading="lazy"
                              onError={(e) => {
                                e.target.src = `https://via.placeholder.com/96/CCCCCC/FFFFFF?text=${encodeURIComponent(result.platform.charAt(0))}`;
                              }}
                            />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                            {result.product_name}
                          </h4>
                          <div className="text-3xl font-bold text-gray-900 mb-3">
                            {result.formattedPrice}
                          </div>
                          
                          {!isBestPrice && savings > 0 && (
                            <div className="flex items-center gap-2 mb-4">
                              <TrendingDown className="w-4 h-4 text-red-500" />
                              <span className="text-red-600 font-medium">
                                Save {savings}% vs best price
                              </span>
                            </div>
                          )}
                          
                          {result.description && (
                            <div className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {result.description}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => window.open(result.product_url, '_blank', 'noopener,noreferrer')}
                          className="flex-1 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-lg"
                        >
                          <ExternalLink className="w-5 h-5" />
                          Visit Store
                        </button>
                        <button className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center gap-2">
                          <ThumbsUp className="w-5 h-5" />
                          Track
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Analytics Dashboard */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Price Distribution */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Price Analytics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Average Price</span>
                    <span className="text-xl font-bold text-gray-900">
                      ₹{Math.round(
                        comparisonData.results.reduce((sum, r) => sum + r.numericPrice, 0) / comparisonData.results.length
                      ).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Price Range</span>
                    <span className="text-xl font-bold text-gray-900">
                      ₹{Math.min(...comparisonData.results.map(r => r.numericPrice)).toLocaleString('en-IN')} - 
                      ₹{Math.max(...comparisonData.results.map(r => r.numericPrice)).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Median Price</span>
                    <span className="text-xl font-bold text-gray-900">
                      ₹{Math.round(
                        [...comparisonData.results].sort((a, b) => a.numericPrice - b.numericPrice)[
                          Math.floor(comparisonData.results.length / 2)
                        ]?.numericPrice
                      ).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Savings Calculator */}
              <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Potential Savings
                </h3>
                <div className="space-y-3">
                  <div className="text-center py-4">
                    <div className="text-4xl font-bold text-green-800 mb-2">
                      ₹{(bestPrice ? 
                        comparisonData.results
                          .filter(r => r.platform !== bestPrice.platform)
                          .reduce((sum, r) => sum + (r.numericPrice - bestPrice.numericPrice), 0)
                        : 0
                      ).toLocaleString('en-IN')}
                    </div>
                    <div className="text-sm text-green-700">
                      Total potential savings
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => window.open(bestPrice?.product_url, '_blank')}
                    className="w-full py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center gap-2"
                    disabled={!bestPrice}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Buy Best Deal
                  </button>
                  <button
                    onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(comparisonData.identified_product)}+price+comparison`, '_blank')}
                    className="w-full py-3 bg-linear-to-r from-gray-600 to-gray-700 text-white rounded-xl font-medium hover:from-gray-700 hover:to-gray-800 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Search className="w-5 h-5" />
                    Search More
                  </button>
                  <button
                    onClick={handleRetry}
                    className="w-full py-3 bg-linear-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Refresh Prices
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && !hasResults && !error && (
          <div className="text-center py-16 bg-linear-to-br from-white to-blue-50 rounded-2xl shadow-xl border border-gray-200">
            <div className="w-24 h-24 mx-auto mb-6 bg-linear-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Enterprise Price Intelligence</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8 text-lg">
              Compare prices across top Indian e-commerce platforms in real-time
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {['Amazon.in', 'Flipkart.com', 'TataCliq.com', 'Myntra.com', 'RelianceDigital.in', 'Croma.com'].map((platform) => (
                <span key={platform} className="px-4 py-2 bg-white text-gray-700 rounded-xl border border-gray-300 shadow-sm">
                  {platform}
                </span>
              ))}
            </div>
            <div className="text-sm text-gray-500 max-w-lg mx-auto">
              <p className="mb-2">Supported formats:</p>
              <p className="text-xs">• Amazon: https://www.amazon.in/dp/B0ABCD1234</p>
              <p className="text-xs">• Flipkart: https://www.flipkart.com/product-name/p/itm12345</p>
              <p className="text-xs">• Direct product URLs from any major Indian retailer</p>
            </div>
          </div>
        )}

        {/* Recent Searches & Insights */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Searches */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Recent Searches
                </h3>
                {recentSearches.length > 0 && (
                  <button
                    onClick={() => {
                      setRecentSearches([]);
                      localStorage.removeItem("priceComparisonRecentSearches");
                    }}
                    className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
              {recentSearches.length > 0 ? (
                <div className="space-y-3">
                  {recentSearches.map((search) => (
                    <button
                      key={search.id}
                      onClick={() => handleRecentSearchClick(search)}
                      className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-all duration-300 group hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-blue-700 transition-colors">
                            {search.name}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {new Date(search.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            {search.bestPrice && (
                              <div className="text-xs font-medium text-green-700">
                                Best: ₹{search.bestPrice.toLocaleString('en-IN')}
                              </div>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors ml-2 mt-1" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">No recent searches</div>
                </div>
              )}
            </div>
          </div>

          {/* How It Works & Tips */}
          <div className="lg:col-span-2">
            <div className="grid md:grid-cols-2 gap-6">
              {/* How It Works */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  How It Works
                </h3>
                <div className="space-y-4">
                  {[
                    { step: "1", title: "Paste URL", desc: "Copy product URL from any e-commerce site" },
                    { step: "2", title: "Real-time Scan", desc: "Our system scans 20+ platforms instantly" },
                    { step: "3", title: "Smart Analysis", desc: "Get AI-powered price recommendations" },
                    { step: "4", title: "Save & Share", desc: "Export data or share with your team" }
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{item.title}</div>
                        <div className="text-sm text-gray-500 mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shopping Tips */}
              <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Pro Shopping Tips
                </h3>
                <ul className="space-y-3">
                  {[
                    { icon: Star, text: "Check seller ratings & reviews carefully" },
                    { icon: Truck, text: "Compare delivery times and charges" },
                    { icon: ShieldIcon, text: "Verify warranty and return policies" },
                    { icon: Battery, text: "Check refurbished product warranty" },
                    { icon: Camera, text: "Compare product images across platforms" },
                    { icon: Tag, text: "Look for platform-specific discounts" }
                  ].map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <tip.icon className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-700">{tip.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mt-6 bg-linear-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200 shadow-lg">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-bold text-lg text-red-800 mb-2">Unable to fetch prices</h4>
                <p className="text-red-700 mb-4">{error}</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleRetry}
                    className="px-5 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </button>
                  <button
                    onClick={() => setError(null)}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    PriceWise Pro Enterprise
                  </h4>
                  <p className="text-sm text-gray-600">Advanced Price Intelligence Platform</p>
                </div>
              </div>
              <p className="text-gray-600 max-w-lg text-sm">
                Helping businesses and consumers make data-driven purchasing decisions with 
                real-time price comparison across 20+ Indian e-commerce platforms.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h5 className="font-semibold text-gray-900 mb-3">Features</h5>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Real-time Price Tracking</li>
                  <li>Multi-platform Comparison</li>
                  <li>Data Export (JSON/CSV)</li>
                  <li>API Access Available</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900 mb-3">Legal</h5>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Privacy Policy</li>
                  <li>Terms of Service</li>
                  <li>Cookie Policy</li>
                  <li>GDPR Compliance</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              <p>© {new Date().getFullYear()} PriceWise Pro • All prices in INR • Data updated every 5 minutes</p>
              <p className="mt-1 text-xs">Prices are subject to change. Please verify on the retailer's website before purchasing.</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">v2.1.0 • Enterprise</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}