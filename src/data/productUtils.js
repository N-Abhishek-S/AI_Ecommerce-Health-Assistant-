// src/data/productUtils.js
import { products } from './products';

// Platform configurations
export const PLATFORMS = {
  AMAZON: {
    name: "Amazon",
    logo: "📦",
    color: "#FF9900",
    baseUrl: "https://www.amazon.in",
    commissionRate: 0.08,
    deliverySpeed: 2
  },
  FLIPKART: {
    name: "Flipkart",
    logo: "🛍️",
    color: "#047BD5",
    baseUrl: "https://www.flipkart.com",
    commissionRate: 0.07,
    deliverySpeed: 3
  },
  MYNTRA: {
    name: "Myntra",
    logo: "👗",
    color: "#FF3E6C",
    baseUrl: "https://www.myntra.com",
    commissionRate: 0.12,
    deliverySpeed: 4
  },
  AJIO: {
    name: "Ajio",
    logo: "🕶️",
    color: "#000000",
    baseUrl: "https://www.ajio.com",
    commissionRate: 0.10,
    deliverySpeed: 5
  },
  STYLEGENIUS: {
    name: "StyleGenius (Us)",
    logo: "💎",
    color: "#7C3AED",
    baseUrl: "#",
    commissionRate: 0.05,
    deliverySpeed: 3
  }
};

/**
 * Generate simulated price comparison data for a product
 * @param {Object} product - The product to compare
 * @param {Array} platforms - Array of platform keys to include
 * @returns {Array} Array of price comparisons
 */
export const generatePriceComparisons = (product, platforms = Object.keys(PLATFORMS)) => {
  if (!product || !product.price) return [];
  
  const basePrice = product.price;
  const comparisons = [];
  
  platforms.forEach(platformKey => {
    const platform = PLATFORMS[platformKey];
    if (!platform) return;
    
    // Skip our own store in the platform list (we'll add it separately)
    if (platformKey === 'STYLEGENIUS') return;
    
    // Generate price variation (-25% to +20%)
    const variation = (Math.random() * 0.45) - 0.25;
    const price = Math.round(basePrice * (1 + variation));
    
    // Generate rating variation (-0.5 to +0.3)
    const ratingVariation = (Math.random() * 0.8) - 0.5;
    const rating = Math.min(5, Math.max(2.5, (product.rating || 4) + ratingVariation)).toFixed(1);
    
    // Calculate delivery days based on platform speed and some randomness
    const deliveryDays = Math.max(1, platform.deliverySpeed + Math.floor(Math.random() * 4) - 1);
    const deliveryText = deliveryDays === 1 ? "Tomorrow" : deliveryDays === 0 ? "Today" : `${deliveryDays} days`;
    
    // Calculate reviews with some variation
    const reviews = Math.round((product.reviews || 1000) * (0.3 + Math.random() * 1.4));
    
    // Determine if item is in stock (85% chance)
    const inStock = Math.random() > 0.15;
    
    // Generate original price (higher than current price for discount)
    const originalPrice = Math.round(price * (1.1 + Math.random() * 0.3));
    const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    
    comparisons.push({
      platform: platform.name,
      platformKey,
      logo: platform.logo,
      price: price,
      originalPrice: originalPrice,
      discount: discount > 0 ? discount : 0,
      delivery: deliveryText,
      deliveryDays: deliveryDays,
      rating: parseFloat(rating),
      reviews: reviews,
      inStock: inStock,
      url: `${platform.baseUrl}/product/${product.id || 'sample'}`,
      lastUpdated: getRandomTimeAgo(),
      trustScore: Math.floor(Math.random() * 25) + 70, // 70-94
      isSponsored: Math.random() > 0.8 // 20% chance of being sponsored
    });
  });
  
  // Sort by price (lowest first)
  comparisons.sort((a, b) => a.price - b.price);
  
  // Add our own store for comparison (always at a competitive price)
  const ourPrice = Math.round(basePrice * (0.95 + Math.random() * 0.1)); // 95% to 105% of base
  comparisons.push({
    platform: PLATFORMS.STYLEGENIUS.name,
    platformKey: "STYLEGENIUS",
    logo: PLATFORMS.STYLEGENIUS.logo,
    price: ourPrice,
    originalPrice: ourPrice,
    discount: 0,
    delivery: "2-3 days",
    deliveryDays: 3,
    rating: 4.8,
    reviews: product.reviews || Math.round(Math.random() * 5000) + 1000,
    inStock: true,
    isOfficial: true,
    url: "#",
    lastUpdated: "Just now",
    trustScore: 95,
    benefits: ["Free shipping", "Easy returns", "Quality guarantee", "Style advice"]
  });
  
  return comparisons;
};

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: INR)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'INR') => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '₹0';
  }
  
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    return `₹${amount.toLocaleString('en-IN')}`;
  }
};

/**
 * Calculate savings percentage
 * @param {number} originalPrice - Original price
 * @param {number} discountedPrice - Discounted price
 * @returns {number} Savings percentage (rounded)
 */
export const calculateSavingsPercentage = (originalPrice, discountedPrice) => {
  if (!originalPrice || !discountedPrice || 
      typeof originalPrice !== 'number' || typeof discountedPrice !== 'number' ||
      originalPrice <= 0 || discountedPrice <= 0 || 
      originalPrice <= discountedPrice) {
    return 0;
  }
  
  const percentage = ((originalPrice - discountedPrice) / originalPrice) * 100;
  return Math.round(Math.max(0, Math.min(100, percentage)));
};

/**
 * Get platform color classes for Tailwind CSS
 * @param {string} platform - Platform name
 * @returns {string} Tailwind CSS classes
 */
export const getPlatformColorClasses = (platform) => {
  if (!platform) return 'bg-gray-100 text-gray-800 border-gray-200';
  
  const platformColors = {
    'Amazon': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Flipkart': 'bg-blue-100 text-blue-800 border-blue-200',
    'Myntra': 'bg-pink-100 text-pink-800 border-pink-200',
    'Ajio': 'bg-gray-100 text-gray-800 border-gray-200',
    'Nykaa Fashion': 'bg-pink-50 text-pink-700 border-pink-100',
    'StyleGenius (Us)': 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200',
    'Amazon.in': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Flipkart.com': 'bg-blue-100 text-blue-800 border-blue-200',
    'Myntra.com': 'bg-pink-100 text-pink-800 border-pink-200',
    'Ajio.com': 'bg-gray-100 text-gray-800 border-gray-200'
  };
  
  // Try exact match first
  if (platformColors[platform]) {
    return platformColors[platform];
  }
  
  // Try partial match
  for (const [key, value] of Object.entries(platformColors)) {
    if (platform.includes(key) || key.includes(platform)) {
      return value;
    }
  }
  
  // Default fallback
  return 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getRecommendedProducts = (analysisResult, productData) => {
  const { gender, face_shape, skin_tone } = analysisResult;
  
  if (!gender || !face_shape || !skin_tone) {
    return getFallbackProducts(productData, gender);
  }

  const genderKey = gender.toLowerCase();
  const faceShape = face_shape.toLowerCase();
  const skinTone = skin_tone.toLowerCase();

  // Use the passed productData instead of accessing products directly
  return {
    sunglasses: filterSunglasses(productData.sunglasses || [], faceShape, 4),
    clothing: filterBySkinTone(productData.clothing || [], skinTone, 4),
    accessories: filterBySkinTone(productData.accessories || [], skinTone, 4),
    watches: filterBySkinTone(productData.watches || [], skinTone, 4),
    footwear: filterBySkinTone(productData.footwear || [], skinTone, 4),
    hairstyles: filterHairstyles(productData.hairstyles || [], faceShape, 4)
  };
};

function filterSunglasses(sunglasses, faceShape, limit) {
  try {
    if (!Array.isArray(sunglasses)) {
      console.warn('Sunglasses data is not an array:', sunglasses);
      return [];
    }
    
    const filtered = sunglasses
      .filter(product => {
        if (!product || !product.faceShapeCompatibility) return false;
        if (!Array.isArray(product.faceShapeCompatibility)) return false;
        
        return product.faceShapeCompatibility.some(shape => {
          if (!shape) return false;
          return shape.toLowerCase().includes(faceShape.toLowerCase());
        });
      })
      .slice(0, limit);
    
    console.log(`Found ${filtered.length} sunglasses for face shape: ${faceShape}`);
    return filtered;
  } catch (error) {
    console.error('Error filtering sunglasses:', error);
    return [];
  }
}

function filterBySkinTone(productArray, skinTone, limit) {
  try {
    if (!Array.isArray(productArray)) {
      console.warn('Product data is not an array:', productArray);
      return [];
    }
    
    const filtered = productArray
      .filter(product => {
        if (!product || !product.skinToneCompatibility) return false;
        if (!Array.isArray(product.skinToneCompatibility)) return false;
        
        return product.skinToneCompatibility.some(tone => {
          if (!tone) return false;
          return tone.toLowerCase().includes(skinTone.toLowerCase());
        });
      })
      .slice(0, limit);
    
    console.log(`Found ${filtered.length} products for skin tone: ${skinTone}`);
    return filtered;
  } catch (error) {
    console.error('Error filtering products by skin tone:', error);
    return [];
  }
}

function filterHairstyles(hairstyles, faceShape, limit) {
  try {
    if (!Array.isArray(hairstyles)) {
      console.warn('Hairstyles data is not an array:', hairstyles);
      return [];
    }
    
    const filtered = hairstyles
      .filter(style => {
        if (!style || !style.faceShapeCompatibility) return false;
        
        if (Array.isArray(style.faceShapeCompatibility)) {
          return style.faceShapeCompatibility.some(shape => {
            if (!shape) return false;
            return shape.toLowerCase().includes(faceShape.toLowerCase());
          });
        } else if (typeof style.faceShapeCompatibility === 'string') {
          return style.faceShapeCompatibility.toLowerCase().includes(faceShape.toLowerCase());
        }
        return false;
      })
      .slice(0, limit);
    
    console.log(`Found ${filtered.length} hairstyles for face shape: ${faceShape}`);
    return filtered;
  } catch (error) {
    console.error('Error filtering hairstyles:', error);
    return [];
  }
}

// Changed from function declaration to export const to make it available for import
export const getFallbackProducts = (productData, category) => {
  try {
    // If category is provided, return fallback for that specific category
    if (category && productData[category]) {
      console.log(`Using fallback products for ${category}:`, productData[category].slice(0, 4));
      return productData[category].slice(0, 4);
    }
    
    // If no category is provided, return fallbacks for all categories
    const fallbackProducts = {
      sunglasses: (productData.sunglasses || []).slice(0, 4),
      clothing: (productData.clothing || []).slice(0, 4),
      accessories: (productData.accessories || []).slice(0, 4),
      watches: (productData.watches || []).slice(0, 4),
      footwear: (productData.footwear || []).slice(0, 4),
      hairstyles: (productData.hairstyles || []).slice(0, 4)
    };
    
    console.log('Using fallback products:', fallbackProducts);
    return fallbackProducts;
  } catch (error) {
    console.error('Error getting fallback products:', error);
    return category ? [] : {
      sunglasses: [],
      clothing: [],
      accessories: [],
      watches: [],
      footwear: [],
      hairstyles: []
    };
  }
};

export const getColorValue = (colorName) => {
  const colorMap = {
    'navy': '#1e3a8a',
    'black': '#000000',
    'white': '#ffffff',
    'charcoal': '#374151',
    'burgundy': '#800020',
    'forest green': '#228B22',
    'olive': '#808000',
    'cream': '#fffdd0',
    'beige': '#f5f5dc',
    'khaki': '#f0e68c',
    'grey': '#808080',
    'blue': '#0000ff',
    'red': '#ff0000',
    'green': '#008000',
    'purple': '#800080',
    'pink': '#ffc0cb',
    'yellow': '#ffff00',
    'orange': '#ffa500',
    'brown': '#a52a2a',
    'teal': '#008080',
    'lavender': '#e6e6fa',
    'maroon': '#800000',
    'coral': '#ff7f50',
    'peach': '#ffdab9',
    'emerald': '#50c878',
    'sapphire': '#0f52ba',
    'ruby': '#e0115f',
    'amber': '#ffbf00',
    'silver': '#c0c0c0',
    'gold': '#ffd700',
    'rose gold': '#b76e79',
    'bronze': '#cd7f32',
    'platinum': '#e5e4e2',
    'emerald green': '#50c878',
    'royal blue': '#4169e1',
    'mustard yellow': '#ffdb58',
    'coral': '#ff7f50',
    'brown': '#8B4513'
  };
  
  return colorMap[colorName?.toLowerCase()] || '#6b7280';
};

// Helper function to generate random "time ago" strings
const getRandomTimeAgo = () => {
  const times = [
    "Just now",
    "5 min ago", 
    "10 min ago",
    "15 min ago",
    "20 min ago",
    "30 min ago",
    "45 min ago",
    "1 hour ago",
    "2 hours ago",
    "3 hours ago",
    "5 hours ago",
    "Today",
    "Yesterday"
  ];
  return times[Math.floor(Math.random() * times.length)];
};

// Optional: Export platform list if needed elsewhere
export { PLATFORMS as PLATFORMS_LIST };

// Optional: Default export with all functions
export default {
  generatePriceComparisons,
  formatCurrency,
  calculateSavingsPercentage,
  getPlatformColorClasses,
  getRecommendedProducts,
  getFallbackProducts,
  getColorValue,
  PLATFORMS
};