import React, { useState } from "react";
import FilterSidebar from "@/components/FilterSidebar";
import { ProductCard } from "@/components/ProductCard";
import { mockProducts } from "@/data/products";

export default function ProductsPage() {
  const [filters, setFilters] = useState({
    category: "all",
    priceRange: [0, 100000],
    traits: [],
    inStock: true
  });

  // Filter products based on selected filters
  const filteredProducts = mockProducts.filter(product => {
    // Category filter
    if (filters.category !== "all" && product.category !== filters.category) {
      return false;
    }
    
    // Price range filter
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
      return false;
    }
    
    // In stock filter (assuming all products are in stock for this example)
    if (filters.inStock) {
      // Add your in-stock logic here
    }
    
    // Personality traits filter
    if (filters.traits.length > 0) {
      // Add your trait matching logic here
    }
    
    return true;
  });

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
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Filters sidebar */}
        <div className="w-1/4">
          <FilterSidebar 
            filters={filters} 
            setFilters={setFilters} 
            products={mockProducts} 
          />
        </div>
        
        {/* Products grid */}
        <div className="w-3/4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">All Products</h1>
            <p className="text-gray-600">{filteredProducts.length} products found</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
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
      </div>
    </div>
  );
}