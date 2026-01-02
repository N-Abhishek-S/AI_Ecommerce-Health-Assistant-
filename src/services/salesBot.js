import { searchProducts } from './productService.js';

const INTENTS = {
  GREETING: 'greeting',
  FIND_PRODUCT: 'find_product',
  HELP: 'help',
  UNKNOWN: 'unknown'
};

const KEYWORDS = {
  greetings: ['hi', 'hello', 'hey', 'start', 'begin', 'good morning', 'good afternoon'],
  help: ['help', 'what can you do', 'guide', 'support'],
  // Map user terms to dataset categories
  categoryMapping: {
    'shirt': 'clothing',
    't-shirt': 'clothing',
    'jeans': 'clothing',
    'pant': 'clothing',
    'trousers': 'clothing',
    'suit': 'clothing',
    'blazer': 'clothing',
    'jacket': 'clothing',
    'hoodie': 'clothing',
    'sweater': 'clothing',
    'dress': 'clothing',
    'kurta': 'clothing',
    'sherwani': 'clothing',
    'shoe': 'footwear',
    'boot': 'footwear',
    'sandal': 'footwear',
    'sneaker': 'footwear',
    'loafer': 'footwear',
    'watch': 'watches',
    'sunglass': 'sunglasses',
    'bag': 'accessories',
    'wallet': 'accessories',
    'belt': 'accessories',
    'hat': 'accessories',
    'cap': 'accessories',
    'jewelry': 'accessories',
    'necklace': 'accessories',
    'ring': 'accessories',
    'bracelet': 'accessories'
  },
  genders: {
    male: ['men', 'man', 'male', 'boy', 'guy', 'gentleman'],
    female: ['women', 'woman', 'female', 'girl', 'lady'],
    unisex: ['unisex', 'all']
  }
};

export const processUserMessage = async (message) => {
  const lowerMsg = message.toLowerCase();

  // 1. Detect Intent
  let intent = INTENTS.UNKNOWN;
  if (KEYWORDS.greetings.some(w => lowerMsg.includes(w)) && lowerMsg.split(' ').length < 4) {
    intent = INTENTS.GREETING;
  } else if (KEYWORDS.help.some(w => lowerMsg.includes(w))) {
    intent = INTENTS.HELP;
  } else {
    // If it contains product keywords or price info, assume find_product
    intent = INTENTS.FIND_PRODUCT;
  }

  // 2. Handle Intents
  if (intent === INTENTS.GREETING) {
    return {
      text: "Hello! I'm your AI Shopping Assistant. I can help you find products based on your budget, style, and preferences. Try saying 'Show me men's formal shirts under 2000'.",
      products: []
    };
  }

  if (intent === INTENTS.HELP) {
    return {
      text: "I can help you discover products. You can ask for things like:\n- 'Red shirts for men'\n- 'Watches under 5000'\n- 'Formal shoes'\n- 'Summer collection'",
      products: []
    };
  }

  if (intent === INTENTS.FIND_PRODUCT) {
    // Extract parameters
    const filters = {};
    
    // Gender
    if (KEYWORDS.genders.male.some(w => lowerMsg.includes(w))) filters.gender = 'male';
    else if (KEYWORDS.genders.female.some(w => lowerMsg.includes(w))) filters.gender = 'female';
    
    // Price (simple regex for "under X", "below X", "less than X")
    const priceMatch = lowerMsg.match(/(?:under|below|less than|max)[\s₹]*(\d+)/);
    if (priceMatch) {
      filters.maxPrice = parseInt(priceMatch[1]);
    }
    
    // Min Price ("above X")
    const minPriceMatch = lowerMsg.match(/(?:above|over|more than|min)[\s₹]*(\d+)/);
    if (minPriceMatch) {
      filters.minPrice = parseInt(minPriceMatch[1]);
    }

    // Category detection with mapping
    for (const [term, category] of Object.entries(KEYWORDS.categoryMapping)) {
      if (lowerMsg.includes(term)) {
        filters.category = category;
        break; 
      }
    }

    // Query cleaning
    let cleanQuery = lowerMsg
      .replace(/show me|i want|looking for|find|search/g, '')
      .replace(/men|women|male|female/g, '') 
      .replace(/(?:under|below|less than|max)[\s₹]*(\d+)/g, '')
      .replace(/(?:above|over|more than|min)[\s₹]*(\d+)/g, '')
      .replace(/'s/g, '') // Remove 's
      .replace(/products?/g, '')
      .trim();
    
    // If we found a mapped category (e.g. 'shirt'), keep it in query to search for 'shirt' text within 'clothing' category
    // But filters.category is set to 'clothing'.
    
    filters.query = cleanQuery;

    console.log("Extracted Filters:", filters);

    const products = searchProducts(filters);
    
    if (products.length > 0) {
      // Pick top 5
      const topProducts = products.slice(0, 5);
      return {
        text: `I found ${products.length} products that match your request. Here are the top ones:`,
        products: topProducts
      };
    } else {
      // Retry without specific category filter if 0 results, just use query
      if (filters.category) {
        delete filters.category;
        const fallbackProducts = searchProducts(filters);
        if (fallbackProducts.length > 0) {
           return {
            text: `I didn't find exactly what you asked for in that category, but here are some similar items found by searching:`,
            products: fallbackProducts.slice(0, 5)
          };
        }
      }

      return {
        text: "I couldn't find any products matching those specific criteria. Try adjusting the price range or using different keywords.",
        products: []
      };
    }
  }

  return {
    text: "I'm not sure I understood that. Could you try asking for a specific product type, like 'sunglasses' or 'shoes'?",
    products: []
  };
};
