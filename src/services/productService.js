import { products } from '../data/products.js';

let allProductsCache = null;

export const getAllProducts = () => {
  if (allProductsCache) return allProductsCache;

  const flattened = [];
  // The keys might be lowercase or capitalized, we iterate what's available or known keys
  const genders = ['male', 'female', 'unisex'];
  
  genders.forEach(gender => {
    if (products[gender]) {
      Object.entries(products[gender]).forEach(([productType, items]) => {
        if (Array.isArray(items)) {
          items.forEach(item => {
            // Ensure unique ID or key if needed, but for search we just need properties
            // We preserve original category if present, or use productType
            const category = item.category || productType;
            
            flattened.push({
              ...item,
              gender: gender,
              productType: productType, // Keep the grouping key (e.g. 'clothing', 'Watches')
              category: category,
              // Ensure price is a number
              price: Number(item.price) || 0
            });
          });
        }
      });
    }
  });
  
  allProductsCache = flattened;
  return flattened;
};

export const searchProducts = ({ query, gender, maxPrice, minPrice, category }) => {
  let results = getAllProducts();

  if (gender) {
    // If user specifies gender, show that gender + unisex. 
    // If user specifies unisex, show unisex.
    // If specific gender is requested, we usually include unisex items too unless strictly male/female.
    // For now, simple matching.
    const g = gender.toLowerCase();
    if (g === 'male') {
      results = results.filter(p => p.gender === 'male' || p.gender === 'unisex');
    } else if (g === 'female') {
      results = results.filter(p => p.gender === 'female' || p.gender === 'unisex');
    } else {
      results = results.filter(p => p.gender === g);
    }
  }

  if (category) {
    const cat = category.toLowerCase();
    results = results.filter(p => 
      (p.category && p.category.toLowerCase().includes(cat)) || 
      (p.productType && p.productType.toLowerCase().includes(cat))
    );
  }

  if (minPrice !== undefined && minPrice !== null) {
    results = results.filter(p => p.price >= minPrice);
  }

  if (maxPrice !== undefined && maxPrice !== null) {
    results = results.filter(p => p.price <= maxPrice);
  }

  if (query) {
    const lowerQuery = query.toLowerCase();
    const terms = lowerQuery.split(/\s+/).filter(t => t.length > 2); // Ignore very short words
    
    if (terms.length > 0) {
      results = results.filter(p => {
        const searchableText = `${p.name} ${p.description || ''} ${p.category || ''} ${p.productType || ''}`.toLowerCase();
        // Check if ANY of the terms match (or ALL? usually ALL for search, but for chat maybe ANY is safer? Let's try ALL first for precision)
        return terms.every(term => searchableText.includes(term));
      });
    }
  }

  return results;
};
