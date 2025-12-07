import React, { useState, useEffect } from 'react';
import { FaPlus, FaMinus, FaTrash, FaArrowLeft, FaCreditCard } from 'react-icons/fa';
import { SiVisa, SiMastercard, SiAmericanexpress, SiPaypal } from 'react-icons/si';

const Cart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Classic Aviator Sunglasses",
      price: 89.99,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1160&q=80",
      color: "Black",
      size: "Medium"
    },
    {
      id: 2,
      name: "Running Shoes",
      price: 119.99,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      color: "White",
      size: "10"
    },
    {
      id: 3,
      name: "Business Formal Shirt",
      price: 59.99,
      quantity: 2,
      image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1160&q=80",
      color: "Blue",
      size: "Large"
    }
  ]);

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(15.00);
  const [isPromoApplied, setIsPromoApplied] = useState(true);

  // Calculate cart totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 5.99;
  const tax = subtotal * 0.09;
  const total = subtotal + shipping + tax - discount;

  // Update item quantity
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  // Remove item from cart
  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Apply promo code
  const applyPromo = () => {
    if (promoCode.toUpperCase() === 'SAVE15') {
      setDiscount(15.00);
      setIsPromoApplied(true);
    } else {
      setDiscount(0);
      setIsPromoApplied(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Shopping Cart</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Your Cart ({cartItems.length} items)</h2>
              </div>
              
              {cartItems.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-gray-400 text-5xl mb-4">🛒</div>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500">Add some items to your cart to continue shopping</p>
                  <button className="mt-6 bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition duration-200">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-gray-200">
                    {cartItems.map(item => (
                      <div key={item.id} className="p-6 flex flex-col sm:flex-row items-start transition-all duration-300">
                        <div className="sm:w-24 sm:h-24 w-full h-48 mb-4 sm:mb-0 rounded-lg overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 sm:ml-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                              <p className="text-gray-500 mt-1">Color: {item.color} | Size: {item.size}</p>
                            </div>
                            <p className="text-lg font-semibold text-gray-900">${item.price.toFixed(2)}</p>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button 
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <FaMinus size={12} />
                              </button>
                              <span className="px-4 py-1">{item.quantity}</span>
                              <button 
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <FaPlus size={12} />
                              </button>
                            </div>
                            <button 
                              className="text-red-500 hover:text-red-700 transition-colors flex items-center"
                              onClick={() => removeItem(item.id)}
                            >
                              <FaTrash className="mr-1" size={14} /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-6 border-t border-gray-200 flex justify-between items-center">
                    <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                      <FaArrowLeft className="mr-2" /> Continue Shopping
                    </button>
                    <button 
                      className="text-red-500 hover:text-red-700 font-medium flex items-center"
                      onClick={clearCart}
                    >
                      <FaTrash className="mr-2" /> Clear Cart
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-md sticky top-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Order Summary</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">-${discount.toFixed(2)}</span>
                </div>
                
                <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Total</span>
                  <span className="text-xl font-bold text-gray-900">${total.toFixed(2)}</span>
                </div>
                
                <div className="pt-4">
                  <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition duration-200 flex items-center justify-center">
                    <FaCreditCard className="mr-2" /> Proceed to Checkout
                  </button>
                </div>
                
                <div className="pt-4">
                  <p className="text-gray-600 text-sm">We accept:</p>
                  <div className="flex space-x-2 mt-2">
                    <div className="w-10 h-6 bg-gray-200 rounded-sm flex items-center justify-center">
                      <SiVisa className="text-blue-800" size={16} />
                    </div>
                    <div className="w-10 h-6 bg-gray-200 rounded-sm flex items-center justify-center">
                      <SiMastercard className="text-red-600" size={16} />
                    </div>
                    <div className="w-10 h-6 bg-gray-200 rounded-sm flex items-center justify-center">
                      <SiAmericanexpress className="text-blue-600" size={16} />
                    </div>
                    <div className="w-10 h-6 bg-gray-200 rounded-sm flex items-center justify-center">
                      <SiPaypal className="text-blue-500" size={16} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Promo Code */}
            <div className="bg-white rounded-xl shadow-md mt-6 p-6">
              <h3 className="font-semibold text-gray-800 mb-3">Apply Promo Code</h3>
              <div className="flex">
                <input 
                  type="text" 
                  placeholder="Enter promo code" 
                  className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <button 
                  className="bg-gray-800 text-white px-4 rounded-r-lg hover:bg-gray-900 transition duration-200"
                  onClick={applyPromo}
                >
                  Apply
                </button>
              </div>
              {promoCode && !isPromoApplied && (
                <p className="text-red-500 text-sm mt-2">Invalid promo code. Try "SAVE15"</p>
              )}
              {isPromoApplied && discount > 0 && (
                <p className="text-green-500 text-sm mt-2">Promo code applied! ${discount.toFixed(2)} discount.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;