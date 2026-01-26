import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';

const filterOptions = {
  Sunglasses: {
    faceShape: ["Round Face", "Oval Face", "Square Face", "Heart Face", "Diamond Face"],
    frameType: ["Metal", "Acetate", "Plastic", "Mixed"],
    lensColor: ["Black", "Grey", "Brown", "Green", "Blue", "Mirrored"],
    size: ["Small", "Medium", "Large"],
    gender: ["Male", "Female", "Unisex"],
    brand: ["Ray-Ban", "Oakley", "Gucci", "Prada", "Versace"]
  },
  Fashion: {
    colorTone: ["Warm", "Cool", "Neutral"],
    styleType: ["Casual", "Formal", "Sporty", "Business"],
    material: ["Cotton", "Polyester", "Linen", "Denim", "Wool"],
    size: ["XS", "Small", "Medium", "Large", "XL"],
    gender: ["Male", "Female", "Unisex"],
    style: ["Formal", "Informal", "Casual", "Traditional", "Bohemian", "Streetwear"],
    occasion: ["Work", "Party", "Wedding", "Beach", "Everyday"],
    season: ["Summer", "Winter", "Spring", "Fall", "All Season"]
  },
  All: {
    // Add common filters that work across all categories
    gender: ["Male", "Female", "Unisex"],
    size: ["XS", "Small", "Medium", "Large", "XL"],
    // Add more common filters as needed
  }
};

const ShoP_MainFun = () => {
  // State management
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filters, setFilters] = useState({});
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [animationReady, setAnimationReady] = useState(false);
  const [sampleProducts, setSampleProducts] = useState([]);

  // Function to flatten the nested product structure with unique keys
  const flattenProducts = (productsData) => {
    if (Array.isArray(productsData)) {
      // If it's already an array, add unique keys
      return productsData.map((product, index) => ({
        ...product,
        uniqueKey: `product-${product.id || index}-${Date.now()}`
      }));
    }
    
    // If it's an object with gender categories, flatten it
    const flattened = [];
    
    if (productsData.male) {
      Object.entries(productsData.male).forEach(([category, categoryArray]) => {
        if (Array.isArray(categoryArray)) {
          categoryArray.forEach(product => {
            // Create unique key by combining gender, category, and id
            flattened.push({
              ...product,
              uniqueKey: `male-${category}-${product.id}`,
              gender: 'male',
              productCategory: category,
              category: category.charAt(0).toUpperCase() + category.slice(1) // Capitalize first letter
            });
          });
        }
      });
    }
    
    if (productsData.female) {
      Object.entries(productsData.female).forEach(([category, categoryArray]) => {
        if (Array.isArray(categoryArray)) {
          categoryArray.forEach(product => {
            // Create unique key by combining gender, category, and id
            flattened.push({
              ...product,
              uniqueKey: `female-${category}-${product.id}`,
              gender: 'female',
              productCategory: category,
              category: category.charAt(0).toUpperCase() + category.slice(1) // Capitalize first letter
            });
          });
        }
      });
    }
    
    if (productsData.unisex) {
      Object.entries(productsData.unisex).forEach(([category, categoryArray]) => {
        if (Array.isArray(categoryArray)) {
          categoryArray.forEach(product => {
            // Create unique key by combining gender, category, and id
            flattened.push({
              ...product,
              uniqueKey: `unisex-${category}-${product.id}`,
              gender: 'unisex',
              productCategory: category,
              category: category.charAt(0).toUpperCase() + category.slice(1) // Capitalize first letter
            });
          });
        }
      });
    }
    
    return flattened;
  };

  // Initialize products when component mounts
  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Import the JavaScript file
        const productsModule = await import('../data/products');
        
        // Handle different export patterns from JS files
        let productsData;
        
        if (productsModule.default) {
          // ES6 default export
          productsData = productsModule.default;
        } else if (productsModule.products) {
          // Named export 'products'
          productsData = productsModule.products;
        } else {
          // Direct export or other named exports
          // Try to find the first export that contains product data
          const exportKeys = Object.keys(productsModule);
          const dataKey = exportKeys.find(key => 
            typeof productsModule[key] === 'object' && productsModule[key] !== null
          );
          productsData = dataKey ? productsModule[dataKey] : productsModule;
        }
        
        console.log('Raw products data:', productsData);
        
        // Flatten the nested product structure
        const flattenedProducts = flattenProducts(productsData);
        
        if (Array.isArray(flattenedProducts) && flattenedProducts.length > 0) {
          setSampleProducts(flattenedProducts);
          setFilteredProducts(flattenedProducts);
          console.log(`Loaded ${flattenedProducts.length} products`);
          
          // Check for duplicate keys for debugging
          const keys = flattenedProducts.map(p => p.uniqueKey);
          const duplicateKeys = keys.filter((key, index) => keys.indexOf(key) !== index);
          if (duplicateKeys.length > 0) {
            console.warn('Duplicate keys found:', duplicateKeys);
          } else {
            console.log('All keys are unique');
          }
        } else {
          console.error('Products data is not a valid array after flattening:', flattenedProducts);
          setSampleProducts([]);
          setFilteredProducts([]);
        }
      } catch (e) {
        console.error("Error importing products:", e);
        // Fallback to empty array
        setSampleProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setFilters({}); // Reset filters when category changes
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (newFilters[filterType] === value) {
        // If the same filter is clicked again, remove it
        delete newFilters[filterType];
      } else {
        // Otherwise set the new filter
        newFilters[filterType] = value;
      }
      
      return newFilters;
    });
  };

  // Apply filters whenever category or filters change
  useEffect(() => {
    // Ensure we have an array to work with
    const productsArray = Array.isArray(sampleProducts) ? sampleProducts : [];
    let result = [...productsArray];
    
    // Filter by category if not 'All'
    if (selectedCategory !== 'All') {
      result = result.filter(product => {
        // Handle different category property names
        const productCategory = product.category || product.type || product.productType;
        return productCategory === selectedCategory;
      });
    }
    
    // Apply attribute filters
    Object.entries(filters).forEach(([key, value]) => {
      result = result.filter(product => {
        // Special handling for gender filter - check both gender property and productCategory
        if (key === 'gender') {
          // Check if product matches the gender filter
          if (product.gender && product.gender.toLowerCase() === value.toLowerCase()) {
            return true;
          }
          // For Sunglasses and Fashion categories, also check if they're unisex
          if ((product.category === 'Sunglasses' || product.category === 'Fashion') && value === 'Unisex') {
            return true;
          }
          return false;
        }
        
        // Handle array values like multiple styles or occasions
        if (Array.isArray(product[key])) {
          return product[key].some(item => 
            typeof item === 'string' && item.toLowerCase() === value.toLowerCase()
          );
        }
        
        // Handle case-insensitive matching for string properties
        if (typeof product[key] === 'string') {
          return product[key].toLowerCase() === value.toLowerCase();
        }
        
        // Check if the property exists in nested objects
        if (product.attributes && product.attributes[key]) {
          return product.attributes[key].toLowerCase() === value.toLowerCase();
        }
        
        return product[key] === value;
      });
    });
    
    setFilteredProducts(result);
  
    // Set animation ready for next render
    setAnimationReady(false);
    setTimeout(() => setAnimationReady(true), 10);
  }, [selectedCategory, filters, sampleProducts]);

  // Run animation when products are updated and ready
  useEffect(() => {
    if (animationReady && filteredProducts.length > 0) {
      // Check if elements exist before animating
      const cards = document.querySelectorAll('.product-card');
      if (cards.length > 0) {
        gsap.fromTo(".product-card", 
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }
        );
      }
    }
  }, [filteredProducts, animationReady]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    setSelectedCategory('All');
  };

  // StarRating component with proper SVG paths
  const StarRating = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            // Full star
            return (
              <svg
                key={i}
                className="w-4 h-4 text-yellow-400 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            );
          } else if (i === fullStars && hasHalfStar) {
            // Half star
            return (
              <svg
                key={i}
                className="w-4 h-4 text-yellow-400 fill-current"
                viewBox="0 0 20 20"
              >
                <defs>
                  <linearGradient id="half-gradient">
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="#D1D5DB" />
                  </linearGradient>
                </defs>
                <path fill="url(#half-gradient)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            );
          } else {
            // Empty star
            return (
              <svg
                key={i}
                className="w-4 h-4 text-gray-300 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            );
          }
        })}
        <span className="ml-1 text-sm text-gray-500">{rating}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Product Finder</h1>
        
        {/* Category selector */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-4 pb-2">
            {['All', 'Sunglasses', 'Fashion'].map(category => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all duration-300 ${selectedCategory === category 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Filter toggle for mobile */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full flex justify-between items-center px-4 py-3 bg-white rounded-lg shadow-md"
          >
            <span className="font-medium">Filters</span>
            <svg 
              className={`w-5 h-5 transition-transform ${isFilterOpen ? 'transform rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter sidebar */}
          <div className={`lg:w-1/4 bg-white rounded-xl shadow-md p-6 h-fit lg:sticky lg:top-4 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
              {Object.keys(filters).length > 0 && (
                <button 
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all
                </button>
              )}
            </div>
            
            {selectedCategory !== 'All' && filterOptions[selectedCategory] ? (
              Object.entries(filterOptions[selectedCategory]).map(([filterType, options]) => (
                <div key={filterType} className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-3 capitalize">
                    {filterType.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <div className="space-y-2">
                    {options.map(option => (
                      <button
                        key={option}
                        onClick={() => handleFilterChange(filterType, option)}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${filters[filterType] === option 
                          ? 'bg-blue-100 text-blue-700 font-medium' 
                          : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : selectedCategory === 'All' && filterOptions.All ? (
              // Show common filters when "All" category is selected
              Object.entries(filterOptions.All).map(([filterType, options]) => (
                <div key={filterType} className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-3 capitalize">
                    {filterType.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <div className="space-y-2">
                    {options.map(option => (
                      <button
                        key={option}
                        onClick={() => handleFilterChange(filterType, option)}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${filters[filterType] === option 
                          ? 'bg-blue-100 text-blue-700 font-medium' 
                          : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No filters available for this category</p>
            )}
          </div>
          
          {/* Product grid */}
          <div className="lg:w-3/4">
            {/* Results info */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{filteredProducts.length}</span> products
                {Object.keys(filters).length > 0 && ' with selected filters'}
              </p>
            </div>
            
            {/* Products grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <div 
                    key={product.uniqueKey}  // Use the unique key we created
                    className="product-card bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg"
                  >
                    <div className="h-48 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
                      <div className="mb-2">
                        <StarRating rating={product.rating || 4.0} />
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-bold text-gray-800">${(product.price / 100).toFixed(2)}</p>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your filters to find what you're looking for.</p>
                {Object.keys(filters).length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoP_MainFun;