import React, { useEffect, useRef } from 'react';
import { FaGlasses, FaShoppingBag, FaStar, FaRegClock } from 'react-icons/fa';
import { gsap } from 'gsap';
import ProductCard from './ProductCard';

const ProductRecommendations = ({ recommendations, gender }) => {
  const sectionRef = useRef(null);
  const categoryRefs = useRef([]);

  useEffect(() => {
    if (sectionRef.current) {
      gsap.fromTo(sectionRef.current, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );

      if (categoryRefs.current.length > 0) {
        gsap.fromTo(categoryRefs.current,
          { opacity: 0, y: 40 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.7, 
            stagger: 0.2,
            ease: "power3.out",
            delay: 0.3
          }
        );
      }
    }
  }, [recommendations]);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'sunglasses': return <FaGlasses className="text-blue-500" />;
      case 'clothing': return <FaShoppingBag className="text-purple-500" />;
      case 'accessories': return <FaStar className="text-yellow-500" />;
      case 'watches': return <FaRegClock className="text-green-500" />;
      case 'footwear': return <FaShoppingBag className="text-red-500" />;
      case 'hairstyles': return <FaStar className="text-pink-500" />;
      default: return <FaStar className="text-gray-500" />;
    }
  };

  const getCategoryTitle = (category) => {
    const genderPrefix = gender === 'male' ? "Men's" : 
                         gender === 'female' ? "Women's" : "Unisex";
    
    switch (category) {
      case 'sunglasses': return 'Sunglasses for Your Face Shape';
      case 'clothing': return `${genderPrefix} Clothing`;
      case 'accessories': return `${genderPrefix} Accessories`;
      case 'watches': return `${genderPrefix} Watches`;
      case 'footwear': return `${genderPrefix} Footwear`;
      case 'hairstyles': return `${genderPrefix} Hairstyles`;
      default: return 'Recommended Products';
    }
  };

  // Check if recommendations is valid
  if (!recommendations || typeof recommendations !== 'object') {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🛍️</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">No Products Found</h3>
        <p className="text-gray-600">We couldn't find products matching your criteria. Please try again later.</p>
      </div>
    );
  }

  // Filter out empty categories
  const nonEmptyCategories = Object.entries(recommendations).filter(([_, products]) => 
    Array.isArray(products) && products.length > 0
  );

  if (nonEmptyCategories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🛍️</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">No Products Found</h3>
        <p className="text-gray-600">We couldn't find products matching your criteria. Please try again later.</p>
      </div>
    );
  }

  return (
    <div ref={sectionRef} className="product-recommendations">
      <div className="text-center mb-10">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
          🛍️ Recommended Products
        </h3>
        <p className="text-gray-600 text-lg">
          Curated selections based on your face shape, skin tone, and style preferences
        </p>
      </div>

      <div className="space-y-12">
        {nonEmptyCategories.map(([category, products], index) => (
          <div 
            key={category}
            ref={el => categoryRefs.current[index] = el}
            className="product-category"
          >
            <div className="flex items-center mb-6">
              <div className="text-2xl mr-3">
                {getCategoryIcon(category)}
              </div>
              <h4 className="text-2xl font-bold text-gray-800">
                {getCategoryTitle(category)}
              </h4>
              <span className="ml-3 bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                {products.length} items
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, productIndex) => (
                <ProductCard 
                  key={`${category}-${product.id || productIndex}`} 
                  product={product} 
                  index={productIndex} 
                  category={category}
                />
              ))}
            </div>
            
            <div className="text-center mt-6">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-300">
                View All {getCategoryTitle(category)}
                <svg className="ml-2 -mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductRecommendations;