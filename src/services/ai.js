import { products } from "../data/products.js";

// Mock AI analysis using simple heuristics
export async function analyzeImage(file) {
  await new Promise((r) => setTimeout(r, 800));
  
  // Add validation for products
  if (!Array.isArray(products)) {
    console.error('Products is not an array:', products);
    // Fallback to empty array if products is not available
    const fallbackProducts = [];
    
    const seed = file
      ? (file.size % 97) + 1
      : Math.floor(Math.random() * 100) + 1;
    const faceShapes = ["round", "oval", "square", "heart"];
    const skinTones = ["fair", "medium", "dark"];
    const face = faceShapes[seed % faceShapes.length];
    const skin = skinTones[seed % skinTones.length];

    const palettes = {
      fair: ["#5B5BD6", "#FFA24C", "#24C8AF", "#FF6B9A"],
      medium: ["#6E59FF", "#FF7847", "#2EC4B6", "#FFD166"],
      dark: ["#9B5DE5", "#F15BB5", "#00BBF9", "#00F5D4"],
    };

    const sunglassesMap = {
      round: ["wayfarer", "square"],
      oval: ["aviator", "round"],
      square: ["round", "aviator"],
      heart: ["cat-eye", "round"],
    };

    const wantedStyles = sunglassesMap[face];

    return {
      faceShape: face,
      skinTone: skin,
      palettes: palettes[skin],
      sunglassesStyles: wantedStyles,
      recommendations: { sunglasses: [], outfits: [] }, // Empty arrays as fallback
    };
  }

  const seed = file
    ? (file.size % 97) + 1
    : Math.floor(Math.random() * 100) + 1;
  const faceShapes = ["round", "oval", "square", "heart"];
  const skinTones = ["fair", "medium", "dark"];
  const face = faceShapes[seed % faceShapes.length];
  const skin = skinTones[seed % skinTones.length];

  const palettes = {
    fair: ["#5B5BD6", "#FFA24C", "#24C8AF", "#FF6B9A"],
    medium: ["#6E59FF", "#FF7847", "#2EC4B6", "#FFD166"],
    dark: ["#9B5DE5", "#F15BB5", "#00BBF9", "#00F5D4"],
  };

  const sunglassesMap = {
    round: ["wayfarer", "square"],
    oval: ["aviator", "round"],
    square: ["round", "aviator"],
    heart: ["cat-eye", "round"],
  };

  const wantedStyles = sunglassesMap[face];
  
  // Safe filtering with array validation
  const recSunglasses = (Array.isArray(products) ? products : [])
    .filter((p) => p && p.type === "sunglasses" && wantedStyles.includes(p.style))
    .slice(0, 12);

  const recOutfits = (Array.isArray(products) ? products : [])
    .filter((p) => p && p.type === "outfit")
    .filter((p) => p.palette && Array.isArray(p.palette) && p.palette.some((hex) => palettes[skin].includes(hex)))
    .slice(0, 8);

  return {
    faceShape: face,
    skinTone: skin,
    palettes: palettes[skin],
    sunglassesStyles: wantedStyles,
    recommendations: { sunglasses: recSunglasses, outfits: recOutfits },
  };
}