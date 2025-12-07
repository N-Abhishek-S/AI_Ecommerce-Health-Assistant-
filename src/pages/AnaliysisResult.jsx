// src/components/AnalysisResult.jsx
import React, { useEffect, useState } from 'react';
import { getRecommendedProducts, getFallbackProducts } from '../data/productUtils';
import ProductCard from './ProductCard';
import { products } from '../data/products';

const AnalysisResult = ({ result }) => {
  const [recommendedProducts, setRecommendedProducts] = useState({
    sunglasses: [],
    clothing: [],
    accessories: [],
    watches: [],
    footwear: [],
    hairstyles: []
  });

  // Add debugging to check what we're receiving
  useEffect(() => {
    console.log('AnalysisResult received:', result);
    
    if (result) {
      // Get the gender from the result and convert to lowercase
      const gender = result.gender ? result.gender.toLowerCase() : 'male';
      
      // Check if products for the detected gender exist
      if (!products[gender]) {
        console.error(`Products for ${gender} not found in products data`);
        return;
      }
      
      const productData = {
        sunglasses: products[gender].sunglasses || [],
        clothing: products[gender].clothing || [],
        accessories: products[gender].accessories || [],
        watches: products[gender].watches || products[gender].Watches || [],
        footwear: products[gender].footwear || products[gender].Footwear || [],
        hairstyles: products[gender].hairstyles || products[gender].Hairstyle || []
      };

      console.log(`Products loaded for ${gender}:`, {
        sunglasses: productData.sunglasses.length,
        clothing: productData.clothing.length,
        accessories: productData.accessories.length,
        watches: productData.watches.length,
        footwear: productData.footwear.length,
        hairstyles: productData.hairstyles.length
      });

      // Pass both result and productData to getRecommendedProducts
      const recommended = getRecommendedProducts(result, productData);
      
      console.log('Recommended products:', recommended);
      
      // Ensure we have at least 4 products per category, using fallbacks if needed
      const finalProducts = {
        sunglasses: recommended.sunglasses.length > 0 
          ? recommended.sunglasses 
          : getFallbackProducts(productData, 'sunglasses'),
        clothing: recommended.clothing.length > 0 
          ? recommended.clothing 
          : getFallbackProducts(productData, 'clothing'),
        accessories: recommended.accessories.length > 0 
          ? recommended.accessories 
          : getFallbackProducts(productData, 'accessories'),
        watches: recommended.watches.length > 0 
          ? recommended.watches 
          : getFallbackProducts(productData, 'watches'),
        footwear: recommended.footwear.length > 0 
          ? recommended.footwear 
          : getFallbackProducts(productData, 'footwear'),
        hairstyles: recommended.hairstyles.length > 0 
          ? recommended.hairstyles 
          : getFallbackProducts(productData, 'hairstyles')
      };

      console.log('After ensuring categories:', finalProducts);
      setRecommendedProducts(finalProducts);
    }
  }, [result]);

  // Check if we have analysis result data
  if (!result) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">No analysis result available</h2>
        <p>Please upload an image for analysis to see product recommendations.</p>
      </div>
    );
  }

  // Add a check to see if we have any products to display
  const hasProducts = Object.values(recommendedProducts).some(category => category.length > 0);
  
  if (!hasProducts) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">No products available</h2>
        <p>We couldn't find any products matching your analysis. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="analysis-result container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8">Recommended Products</h2>
      
      <div className="mb-8 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Your Analysis Results</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><strong>Gender:</strong> {result.gender}</div>
          <div><strong>Face Shape:</strong> {result.face_shape}</div>
          <div><strong>Skin Tone:</strong> {result.skin_tone}</div>
        </div>
        <div className="mt-4">
          <strong>Recommended Colors:</strong> {result.recommended_colors?.join(', ') || 'N/A'}
        </div>
      </div>
      
      {recommendedProducts.sunglasses.length > 0 && (
        <div className="product-category mb-12">
          <h3 className="text-2xl font-semibold mb-6 pb-2 border-b">Sunglasses</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.sunglasses.map((product, index) => (
              <ProductCard key={`sunglasses-${index}`} product={product} index={index} />
            ))}
          </div>
        </div>
      )}
      
      {recommendedProducts.clothing.length > 0 && (
        <div className="product-category mb-12">
          <h3 className="text-2xl font-semibold mb-6 pb-2 border-b">Clothing</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.clothing.map((product, index) => (
              <ProductCard key={`clothing-${index}`} product={product} index={index} />
            ))}
          </div>
        </div>
      )}
      
      {recommendedProducts.accessories.length > 0 && (
        <div className="product-category mb-12">
          <h3 className="text-2xl font-semibold mb-6 pb-2 border-b">Accessories</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.accessories.map((product, index) => (
              <ProductCard key={`accessories-${index}`} product={product} index={index} />
            ))}
          </div>
        </div>
      )}
      
      {recommendedProducts.watches.length > 0 && (
        <div className="product-category mb-12">
          <h3 className="text-2xl font-semibold mb-6 pb-2 border-b">Watches</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.watches.map((product, index) => (
              <ProductCard key={`watches-${index}`} product={product} index={index} />
            ))}
          </div>
        </div>
      )}
      
      {recommendedProducts.footwear.length > 0 && (
        <div className="product-category mb-12">
          <h3 className="text-2xl font-semibold mb-6 pb-2 border-b">Footwear</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.footwear.map((product, index) => (
              <ProductCard key={`footwear-${index}`} product={product} index={index} />
            ))}
          </div>
        </div>
      )}
      
      {recommendedProducts.hairstyles.length > 0 && (
        <div className="product-category mb-12">
          <h3 className="text-2xl font-semibold mb-6 pb-2 border-b">Hairstyles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.hairstyles.map((product, index) => (
              <ProductCard key={`hairstyles-${index}`} product={product} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisResult;