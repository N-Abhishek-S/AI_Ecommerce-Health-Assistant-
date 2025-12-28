import React from 'react';
import { gsap } from 'gsap';

const PriceComparisonModal = ({ isOpen, onClose, product, comparisons, loading }) => {
  // Animation ref
  const modalRef = React.useRef(null);

  React.useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.fromTo(modalRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.2)" }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center">
          <h3 className="font-bold text-lg flex items-center">
            <span className="mr-2">🔍</span> Price Comparison
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto">
          {product && (
            <div className="mb-4 flex items-center gap-3 pb-4 border-b border-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-12 h-12 object-cover rounded-lg border border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{product.name}</p>
                <p className="text-sm text-gray-500">{product.category}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-500 font-medium">Scanning prices across web...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {comparisons.map((item, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-xl border-2 flex items-center justify-between transition-all hover:scale-[1.02] ${
                    index === 0
                      ? 'border-green-500 bg-green-50 shadow-md' // Best Price
                      : 'border-gray-100 hover:border-blue-100 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{item.logo}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800">{item.platform}</p>
                        {index === 0 && (
                          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            BEST DEAL
                          </span>
                        )}
                        {item.isOfficial && (
                          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            OFFICIAL
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 gap-2 mt-0.5">
                        <span>🚚 {item.delivery}</span>
                        <span>⭐ {item.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-bold text-lg ${index === 0 ? 'text-green-700' : 'text-gray-900'}`}>
                      ₹{item.price.toLocaleString()}
                    </p>
                    <a
                      href={item.url}
                      className={`text-xs font-semibold hover:underline ${index === 0 ? 'text-green-600' : 'text-blue-600'}`}
                      onClick={(e) => e.preventDefault()} // Prevent actual navigation for demo
                    >
                      View Deal →
                    </a>
                  </div>
                </div>
              ))}
              <p className="text-center text-xs text-gray-400 mt-4">
                Prices updated just now. Delivery times may vary by location.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceComparisonModal;
