// src/utils/imageUtils.js

// List of products known to have image issues
export const PROBLEMATIC_PRODUCTS = [
  'Silk Scarf', 'Formal Shirt', 'Summer Dress', 'Casual T-Shirt', 'Denim Jeans',
  'Luxury Watch', 'Sandals', 'Casual Sneakers', 'Formal Shoes', 'Designer Watch',
  'Running Shoes', 'Sport Watch', 'Classic Watch', 'Sunglasses Case', 
  'Leather Belt', 'Smart Watch'
];

// Function to get a reliable image URL
export const getReliableImageUrl = (product, index) => {
  // If product name is in our problematic list, use fallback immediately
  if (product.name && PROBLEMATIC_PRODUCTS.includes(product.name)) {
    return `https://via.placeholder.com/300x200?text=${encodeURIComponent(product.name)}&bg=f0f0f0&fg=333`;
  }
  
  // If no image property exists
  if (!product.image) {
    return `https://via.placeholder.com/300x200?text=${encodeURIComponent(product.name || 'Product')}&bg=f0f0f0&fg=333`;
  }
  
  let imageUrl = product.image;
  
  // Fix common URL issues
  if (imageUrl.startsWith('hhttps')) {
    imageUrl = imageUrl.replace('hhttps', 'https');
  }
  
  // Fix double slashes
  imageUrl = imageUrl.replace(/([^:]\/)\/+/g, '$1');
  
  // Fix missing protocol
  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    imageUrl = `https://${imageUrl}`;
  }
  
  return imageUrl;
};

// Function to validate image URLs
export const validateImageUrl = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};