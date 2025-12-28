// ShoP_MainFun.jsx
import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import ProductCard from './ProductCard'; // Import the ProductCard component

// Enhanced filter options that match your product data structure
const filterOptions = {
  All: {
    gender: ["Male", "Female", "Unisex"],
    category: ["Footwear", "Clothing", "Watches", "Accessories", "Sunglasses", "Hairstyle"]
  },
  Sunglasses: {
    faceShape: ["Round Face", "Oval Face", "Square Face", "Heart Face", "Diamond Face"],
    frameType: ["Metal", "Acetate", "Plastic", "Mixed"],
    lensColor: ["Black", "Grey", "Brown", "Green", "Blue", "Mirrored"],
    size: ["Small", "Medium", "Large"],
    gender: ["Male", "Female", "Unisex"],
    brand: ["Ray-Ban", "Oakley", "Gucci", "Prada", "Versace"]
  },
  Fashion: {
    style: ["Formal", "Informal", "Casual", "Traditional"],
    occasion: ["Work", "Party", "Wedding", "Beach", "Everyday"],
    size: ["XS", "Small", "Medium", "Large", "XL"],
    gender: ["Male", "Female", "Unisex"],
    material: ["Cotton", "Polyester", "Linen", "Denim", "Wool"]
  },
  Footwear: {
    style: ["Formal", "Informal", "Casual", "Traditional"],
    category: ["Formal", "Informal", "Casual", "Traditional"],
    size: ["Small", "Medium", "Large"],
    gender: ["Male", "Female", "Unisex"]
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
  const [rawProducts, setRawProducts] = useState(null);

  // Function to flatten the nested product structure with proper field mapping
  const flattenProducts = (productsData) => {
    if (Array.isArray(productsData)) {
      return productsData;
    }
    
    const flattened = [];
    
    // Process each gender category
    ['male', 'female', 'unisex'].forEach(gender => {
      if (productsData[gender]) {
        Object.entries(productsData[gender]).forEach(([productType, productsArray]) => {
          if (Array.isArray(productsArray)) {
            productsArray.forEach(product => {
              // Fix malformed image URLs
              const fixedImage = product.image ? product.image.replace(/^hhttps/, 'https') : '';
              
              // Normalize product data for consistent filtering
              const normalizedProduct = {
                ...product,
                uniqueKey: `${gender}-${productType}-${product.id || Math.random().toString(36).substr(2, 9)}`,
                gender: gender.charAt(0).toUpperCase() + gender.slice(1), // Capitalize
                productType: productType,
                // Map category based on product type
                category: mapProductTypeToCategory(productType),
                // Ensure all filterable fields exist with defaults
                style: product.style || product.category || 'Casual',
                size: product.size || 'Medium',
                brand: product.brand || 'Generic',
                // Add fields that might be missing
                faceShape: product.faceShape || null,
                frameType: product.frameType || null,
                lensColor: product.lensColor || null,
                occasion: product.occasion || null,
                material: product.material || null,
                // Use the fixed image URL
                image: fixedImage || `https://picsum.photos/seed/${gender}-${productType}-${product.id || 'default'}/300/200.jpg`
              };
              flattened.push(normalizedProduct);
            });
          }
        });
      }
    });
    
    return flattened;
  };

  // Helper function to map product types to categories
  const mapProductTypeToCategory = (productType) => {
    const categoryMap = {
      'Footwear': 'Footwear',
      'clothing': 'Clothing',
      'Watches': 'Watches',
      'accessories': 'Accessories',
      'sunglasses': 'Sunglasses',
      'Hairstyle': 'Hairstyle'
    };
    return categoryMap[productType] || productType;
  };

  // Initialize products when component mounts
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsModule = await import('../data/products.js');
        const products = productsModule.default || productsModule.products || productsModule;
        
        console.log('Raw products data:', products);
        setRawProducts(products);
        
        const flattenedProducts = flattenProducts(products);
        
        if (Array.isArray(flattenedProducts) && flattenedProducts.length > 0) {
          setSampleProducts(flattenedProducts);
          setFilteredProducts(flattenedProducts);
          console.log(`Loaded ${flattenedProducts.length} products`);
          
          // Check if all keys are unique
          const keys = flattenedProducts.map(p => p.uniqueKey);
          const uniqueKeys = new Set(keys);
          console.log('All keys are unique:', keys.length === uniqueKeys.size);
        } else {
          setSampleProducts([]);
          setFilteredProducts([]);
          console.log('No products found');
        }
      } catch (e) {
        console.error("Error importing products:", e);
        setSampleProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  // Apply filters whenever category or filters change
  useEffect(() => {
    if (sampleProducts.length === 0) return;

    let result = [...sampleProducts];
    
    console.log('Applying filters:', { selectedCategory, filters, productCount: result.length });

    // Filter by main category if not 'All'
    if (selectedCategory !== 'All') {
      // Special handling for Fashion category
      if (selectedCategory === 'Fashion') {
        result = result.filter(product => 
          ['Clothing', 'Footwear', 'Accessories'].includes(product.category)
        );
      } else {
        result = result.filter(product => product.category === selectedCategory);
      }
      console.log(`After category filter (${selectedCategory}):`, result.length);
    }
    
    // Apply all active filters
    Object.entries(filters).forEach(([filterType, filterValue]) => {
      if (filterValue) {
        const previousCount = result.length;
        result = result.filter(product => {
          const productValue = product[filterType];
          
          // Skip if product doesn't have this field
          if (productValue === undefined || productValue === null) {
            return false;
          }
          
          // Handle different data types
          if (Array.isArray(productValue)) {
            return productValue.some(item => 
              item.toLowerCase() === filterValue.toLowerCase()
            );
          }
          if (typeof productValue === 'string') {
            return productValue.toLowerCase() === filterValue.toLowerCase();
          }
          return productValue === filterValue;
        });
        console.log(`After ${filterType}=${filterValue} filter:`, previousCount, '->', result.length);
      }
    });
    
    setFilteredProducts(result);
    setAnimationReady(false);
    setTimeout(() => setAnimationReady(true), 10);
  }, [selectedCategory, filters, sampleProducts]);

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setFilters({});
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (newFilters[filterType] === value) {
        delete newFilters[filterType];
      } else {
        newFilters[filterType] = value;
      }
      
      console.log('Updated filters:', newFilters);
      return newFilters;
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    setSelectedCategory('All');
  };

  // Run animation when products are updated
  useEffect(() => {
    if (animationReady && filteredProducts.length > 0) {
      const cards = document.querySelectorAll('.product-card');
      if (cards.length > 0) {
        gsap.fromTo(".product-card", 
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }
        );
      }
    }
  }, [filteredProducts, animationReady]);

  // Get available filter options for current category
  const getCurrentFilterOptions = () => {
    if (selectedCategory === 'All') {
      return filterOptions.All;
    }
    return filterOptions[selectedCategory] || {};
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
            {['All', 'Sunglasses', 'Fashion', 'Footwear'].map(category => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === category 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                }`}
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
          <div className={`lg:w-1/4 bg-white rounded-xl shadow-md p-6 h-fit lg:sticky lg:top-4 ${
            isFilterOpen ? 'block' : 'hidden lg:block'
          }`}>
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
            
            {Object.keys(getCurrentFilterOptions()).length > 0 ? (
              Object.entries(getCurrentFilterOptions()).map(([filterType, options]) => (
                <div key={filterType} className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-3 capitalize">
                    {filterType.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <div className="space-y-2">
                    {options.map(option => (
                      <button
                        key={option}
                        onClick={() => handleFilterChange(filterType, option)}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          filters[filterType] === option 
                            ? 'bg-blue-100 text-blue-700 font-medium' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
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
            
            {/* Active filters display */}
            {Object.keys(filters).length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-700 mb-3">Active Filters</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(filters).map(([filterType, value]) => (
                    <span
                      key={`${filterType}-${value}`}
                      className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full flex items-center"
                    >
                      {value}
                      <button
                        onClick={() => handleFilterChange(filterType, value)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
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
              {Object.keys(filters).length > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear filters
                </button>
              )}
            </div>
            
            {/* Products grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard 
                    key={product.uniqueKey} 
                    product={product} 
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters to find what you're looking for.</p>
                {Object.keys(filters).length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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