// ParentComponent.jsx - The component that renders and controls the modal
import React, { useState } from 'react';
import PriceComparisonModal from './PriceComparisonModal';

const ParentComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Sample product data
  const sampleProduct = {
    id: 1,
    name: "Premium Wireless Headphones",
    description: "Noise-cancelling over-ear headphones with 30-hour battery life",
    price: 34999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    rating: 4.8,
    reviews: 3250
  };

  const handleOpenModal = () => {
    setSelectedProduct(sampleProduct);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Product Page</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <img 
                src={sampleProduct.image} 
                alt={sampleProduct.name}
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div className="md:w-2/3">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{sampleProduct.name}</h2>
              <p className="text-gray-600 mb-4">{sampleProduct.description}</p>
              <div className="flex items-center mb-4">
                <div className="text-3xl font-bold text-gray-900">₹{sampleProduct.price.toLocaleString()}</div>
                <div className="ml-4 flex items-center">
                  <span className="text-yellow-500">★★★★★</span>
                  <span className="ml-2 text-gray-600">({sampleProduct.reviews} reviews)</span>
                </div>
              </div>
              
              <button
                onClick={handleOpenModal}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2"
              >
                <span>Compare Prices</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-4">Click the button above to open the price comparison modal</p>
          <div className="inline-flex items-center bg-blue-50 px-4 py-2 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-blue-700">Modal state: {isModalOpen ? 'OPEN' : 'CLOSED'}</span>
          </div>
        </div>
      </div>

      {/* The Modal Component - Rendered conditionally */}
      <PriceComparisonModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ParentComponent;