import React from "react";
import { ProductCard } from "../components/ProductCard";
import { Products } from "../products/Products";

export default function HomePage() {
  const featuredProducts = mockProducts.filter(product => product.featured);
  
  const handleAddToCart = (product) => {
    // Add to cart logic
    console.log("Added to cart:", product);
  };

  const handleViewDetails = (product) => {
    // View details logic
    console.log("View details:", product);
  };

  const handleAddToWishlist = (product) => {
    // Add to wishlist logic
    console.log("Added to wishlist:", product);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Featured Products</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
            onViewDetails={handleViewDetails}
            onAddToWishlist={handleAddToWishlist}
          />
        ))}
      </div>
    </div>
  );
}