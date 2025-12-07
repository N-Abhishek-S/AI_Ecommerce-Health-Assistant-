// src/data/productUtils.js
import { products } from './products';

export const getRecommendedProducts = (analysisResult, productData) => {
  const { gender, face_shape, skin_tone } = analysisResult;
  
  if (!gender || !face_shape || !skin_tone) {
    return getFallbackProducts(productData, gender);
  }

  const genderKey = gender.toLowerCase();
  const faceShape = face_shape.toLowerCase();
  const skinTone = skin_tone.toLowerCase();

  // Use the passed productData instead of accessing products directly
  return {
    sunglasses: filterSunglasses(productData.sunglasses || [], faceShape, 4),
    clothing: filterBySkinTone(productData.clothing || [], skinTone, 4),
    accessories: filterBySkinTone(productData.accessories || [], skinTone, 4),
    watches: filterBySkinTone(productData.watches || [], skinTone, 4),
    footwear: filterBySkinTone(productData.footwear || [], skinTone, 4),
    hairstyles: filterHairstyles(productData.hairstyles || [], faceShape, 4)
  };
};

function filterSunglasses(sunglasses, faceShape, limit) {
  try {
    if (!Array.isArray(sunglasses)) {
      console.warn('Sunglasses data is not an array:', sunglasses);
      return [];
    }
    
    const filtered = sunglasses
      .filter(product => {
        if (!product || !product.faceShapeCompatibility) return false;
        if (!Array.isArray(product.faceShapeCompatibility)) return false;
        
        return product.faceShapeCompatibility.some(shape => {
          if (!shape) return false;
          return shape.toLowerCase().includes(faceShape.toLowerCase());
        });
      })
      .slice(0, limit);
    
    console.log(`Found ${filtered.length} sunglasses for face shape: ${faceShape}`);
    return filtered;
  } catch (error) {
    console.error('Error filtering sunglasses:', error);
    return [];
  }
}

function filterBySkinTone(productArray, skinTone, limit) {
  try {
    if (!Array.isArray(productArray)) {
      console.warn('Product data is not an array:', productArray);
      return [];
    }
    
    const filtered = productArray
      .filter(product => {
        if (!product || !product.skinToneCompatibility) return false;
        if (!Array.isArray(product.skinToneCompatibility)) return false;
        
        return product.skinToneCompatibility.some(tone => {
          if (!tone) return false;
          return tone.toLowerCase().includes(skinTone.toLowerCase());
        });
      })
      .slice(0, limit);
    
    console.log(`Found ${filtered.length} products for skin tone: ${skinTone}`);
    return filtered;
  } catch (error) {
    console.error('Error filtering products by skin tone:', error);
    return [];
  }
}

function filterHairstyles(hairstyles, faceShape, limit) {
  try {
    if (!Array.isArray(hairstyles)) {
      console.warn('Hairstyles data is not an array:', hairstyles);
      return [];
    }
    
    const filtered = hairstyles
      .filter(style => {
        if (!style || !style.faceShapeCompatibility) return false;
        
        if (Array.isArray(style.faceShapeCompatibility)) {
          return style.faceShapeCompatibility.some(shape => {
            if (!shape) return false;
            return shape.toLowerCase().includes(faceShape.toLowerCase());
          });
        } else if (typeof style.faceShapeCompatibility === 'string') {
          return style.faceShapeCompatibility.toLowerCase().includes(faceShape.toLowerCase());
        }
        return false;
      })
      .slice(0, limit);
    
    console.log(`Found ${filtered.length} hairstyles for face shape: ${faceShape}`);
    return filtered;
  } catch (error) {
    console.error('Error filtering hairstyles:', error);
    return [];
  }
}

// Changed from function declaration to export const to make it available for import
export const getFallbackProducts = (productData, category) => {
  try {
    // If category is provided, return fallback for that specific category
    if (category && productData[category]) {
      console.log(`Using fallback products for ${category}:`, productData[category].slice(0, 4));
      return productData[category].slice(0, 4);
    }
    
    // If no category is provided, return fallbacks for all categories
    const fallbackProducts = {
      sunglasses: (productData.sunglasses || []).slice(0, 4),
      clothing: (productData.clothing || []).slice(0, 4),
      accessories: (productData.accessories || []).slice(0, 4),
      watches: (productData.watches || []).slice(0, 4),
      footwear: (productData.footwear || []).slice(0, 4),
      hairstyles: (productData.hairstyles || []).slice(0, 4)
    };
    
    console.log('Using fallback products:', fallbackProducts);
    return fallbackProducts;
  } catch (error) {
    console.error('Error getting fallback products:', error);
    return category ? [] : {
      sunglasses: [],
      clothing: [],
      accessories: [],
      watches: [],
      footwear: [],
      hairstyles: []
    };
  }
};

export const getColorValue = (colorName) => {
  const colorMap = {
    'navy': '#1e3a8a',
    'black': '#000000',
    'white': '#ffffff',
    'charcoal': '#374151',
    'burgundy': '#800020',
    'forest green': '#228B22',
    'olive': '#808000',
    'cream': '#fffdd0',
    'beige': '#f5f5dc',
    'khaki': '#f0e68c',
    'grey': '#808080',
    'blue': '#0000ff',
    'red': '#ff0000',
    'green': '#008000',
    'purple': '#800080',
    'pink': '#ffc0cb',
    'yellow': '#ffff00',
    'orange': '#ffa500',
    'brown': '#a52a2a',
    'teal': '#008080',
    'lavender': '#e6e6fa',
    'maroon': '#800000',
    'coral': '#ff7f50',
    'peach': '#ffdab9',
    'emerald': '#50c878',
    'sapphire': '#0f52ba',
    'ruby': '#e0115f',
    'amber': '#ffbf00',
    'silver': '#c0c0c0',
    'gold': '#ffd700',
    'rose gold': '#b76e79',
    'bronze': '#cd7f32',
    'platinum': '#e5e4e2',
    'emerald green': '#50c878',
    'royal blue': '#4169e1',
    'mustard yellow': '#ffdb58',
    'coral': '#ff7f50',
    'brown': '#8B4513'
  };
  
  return colorMap[colorName?.toLowerCase()] || '#6b7280';
};