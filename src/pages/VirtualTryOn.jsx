import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Draggable from 'react-draggable';
import { products } from '../data/products.js';

const VirtualTryOn = () => {
  const [userImage, setUserImage] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const location = useLocation();

  // Filter for try-on compatible products (e.g., Sunglasses)
  const tryOnProducts = products.unisex?.sunglasses || [];

  useEffect(() => {
    if (location.state?.product) {
      setSelectedProduct(location.state.product);
    }
  }, [location.state]);

  // Fallback transparent image for sunglasses if the product image is not ideal
  // Using a sample transparent PNG for demo purposes if the real image is a model photo
  const DEMO_TRANSPARENT_GLASSES = "https://purepng.com/public/uploads/large/purepng.com-glassesglasseseyewearvision-correctionlenseye-protection-14215264627726af9q.png";

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserImage(e.target.result);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    // Reset transformations when switching products
    setScale(1);
    setRotation(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Virtual Trial Room</h1>
        <p className="text-center text-gray-600 mb-8">Upload your photo and try on our latest collection!</p>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Side: Trial Area */}
          <div className="lg:w-2/3 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div
              ref={containerRef}
              className="relative w-full h-[500px] bg-gray-100 flex items-center justify-center overflow-hidden"
            >
              {loading ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-500">Loading image...</p>
                </div>
              ) : userImage ? (
                <>
                  <img
                    src={userImage}
                    alt="User"
                    className="w-full h-full object-contain pointer-events-none select-none"
                  />

                  {selectedProduct && (
                    <Draggable bounds="parent">
                      <div
                        className="absolute cursor-move"
                        style={{
                          transform: `scale(${scale}) rotate(${rotation}deg)`,
                          // transformOrigin: 'center center' - handled by Draggable/CSS combo usually, but inline transform overrides draggable transform sometimes.
                          // Better to apply scale/rotate to an inner element or use a wrapper.
                        }}
                      >
                        <div style={{ transform: `scale(${scale}) rotate(${rotation}deg)` }}>
                          <img
                            // Use demo transparent image if available, else product image (which might have bg)
                            src={DEMO_TRANSPARENT_GLASSES}
                            alt={selectedProduct.name}
                            className="w-48 drop-shadow-2xl"
                            draggable={false}
                          />
                        </div>
                      </div>
                    </Draggable>
                  )}
                </>
              ) : (
                <div className="text-center p-8">
                  <div className="mb-4">
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <label className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md">
                    Upload Your Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  <p className="mt-2 text-sm text-gray-500">or use camera</p>
                </div>
              )}
            </div>

            {/* Controls */}
            {userImage && selectedProduct && (
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Size: {scale.toFixed(1)}x</label>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rotation: {rotation}°</label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
                <div className="mt-4 text-center text-sm text-gray-500">
                  <span className="inline-block bg-white px-2 py-1 rounded border">✋ Drag product to adjust position</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Product Selector */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 h-full max-h-[600px] flex flex-col">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Select Sunglasses</h2>

              <div className="overflow-y-auto flex-grow space-y-4 pr-2">
                {tryOnProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border-2 flex items-center gap-3 ${
                      selectedProduct?.id === product.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{product.name}</h3>
                      <p className="text-blue-600 font-bold text-sm">₹{product.price}</p>
                    </div>
                    {selectedProduct?.id === product.id && (
                      <div className="ml-auto text-blue-500">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}

                {tryOnProducts.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No sunglasses found in catalog.</p>
                )}
              </div>

              {selectedProduct && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]">
                    Add {selectedProduct.name} to Cart
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;
