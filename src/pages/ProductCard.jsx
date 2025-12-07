import React, { useState } from 'react';

const ProductCard = ({ product, index }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  if (!product) return null;

  const getPlaceholderImage = (name, category) => {
    const colors = {
      clothing: '#4F46E5',
      accessories: '#10B981', 
      watches: '#F59E0B',
      footwear: '#EF4444',
      sunglasses: '#8B5CF6',
      hairstyle: '#EC4899'
    };
    
    const color = colors[category?.toLowerCase()] || '#6B7280';
    const initials = name ? name.charAt(0).toUpperCase() : 'P';
    
    const svgString = `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dy=".3em">${initials}</text>
    </svg>`;
    
    return `data:image/svg+xml;base64,${btoa(svgString)}`;
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <div className="product-card bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 overflow-hidden">
      <div className="product-image-container h-48 bg-gray-100 overflow-hidden relative">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        )}
        <img 
          src={imageError || !product.image ? getPlaceholderImage(product.name, product.category) : product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      </div>
      
      <div className="product-info p-4">
        <h3 className="product-name font-semibold text-gray-800 mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <p className="product-category text-sm text-gray-500 mb-2 capitalize">
          {product.category}
        </p>
        
        <p className="product-description text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="product-meta flex justify-between items-center">
          <span className="product-price font-bold text-lg text-purple-600">
            ₹{product.price?.toLocaleString()}
          </span>
          
          <div className="compatibility-badges flex flex-wrap gap-1">
            {product.skinToneCompatibility && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                Skin
              </span>
            )}
            {product.faceShapeCompatibility && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                Face
              </span>
            )}
          </div>
        </div>
        
        <button className="w-full mt-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white py-2 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 font-medium">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;