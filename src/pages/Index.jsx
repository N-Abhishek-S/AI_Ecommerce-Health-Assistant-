import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { products as productsData } from '../data/products'; // Import the entire products object

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const Index = () => {
  const heroRef = useRef(null);
  const taglineRef = useRef(null);
  const ctaRef = useRef(null);
  const productRefs = useRef([]);
  const featureRefs = useRef([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    // Process products data to get featured products
    const allProducts = [];
    
    // Process each gender category
    Object.keys(productsData).forEach(gender => {
      // Process each product type within the gender
      Object.keys(productsData[gender]).forEach(productType => {
        // Check if it's an array before processing
        if (Array.isArray(productsData[gender][productType])) {
          // Add each product with additional metadata
          productsData[gender][productType].forEach(product => {
            // Ensure price is a number and has a default value
            const productPrice = typeof product.price === 'number' ? product.price : 
                               (typeof product.price === 'string' ? parseFloat(product.price) : 0);
            
            allProducts.push({
              ...product,
              gender: gender,
              productType: productType,
              // Map properties to what the component expects
              name: product.name || 'Product Name',
              description: product.description || 'Product description',
              price: productPrice // Ensure price is always a number
            });
          });
        }
      });
    });

    // Get a subset of products for featured section (max 6)
    const featured = allProducts.slice(0, 6);
    setFeaturedProducts(featured);
  }, []);

  useEffect(() => {
    // Hero section animations
    gsap.fromTo(taglineRef.current, 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    );
    
    gsap.fromTo(ctaRef.current, 
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.8, delay: 0.5, ease: 'back.out(1.7)' }
    );

    // Product card animations
    productRefs.current.forEach((el, index) => {
      if (el) {
        gsap.fromTo(el,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            },
            delay: index * 0.2
          }
        );
      }
    });

    // Feature section animations
    featureRefs.current.forEach((el, index) => {
      if (el) {
        gsap.fromTo(el,
          { opacity: 0, x: index % 2 === 0 ? -50 : 50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }
    });

    // Clean up
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [featuredProducts]);
  
  const features = [
    {
      title: "Personalized Recommendations",
      description: "Our AI learns your style and preferences to suggest products you'll love.",
      icon: (
        <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: "Price Tracking",
      description: "Get alerts when prices drop on items you're interested in.",
      icon: (
        <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Virtual Try-On",
      description: "See how clothes, accessories, and makeup look on you before buying.",
      icon: (
        <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Smart Comparisons",
      description: "Quickly compare similar products to find the best value for your needs.",
      icon: (
        <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
   
      <section ref={heroRef} className="relative py-20 md:py-28 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 ref={taglineRef} className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Shopping Made Smarter with AI
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Discover products you'll love, compare prices instantly, and make informed decisions with your personal AI shopping assistant.
            </p>
            <div ref={ctaRef} className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all">
                Try It Free
              </button>
              <button className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all">
                See Demo
              </button>
            </div>
          </div>
        </div>
        
        <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-100 rounded-full opacity-50 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-100 rounded-full opacity-50 blur-3xl animate-pulse delay-1000"></div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Featured Products</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <div 
                key={product.id || index}
                ref={el => productRefs.current[index] = el}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="h-56 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://picsum.photos/seed/${product.id || index}/300/200.jpg`;
                    }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-indigo-600">
                      {typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : '$0.00'}
                    </span>
                    <button className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg font-medium transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Why Choose Our AI Assistant?</h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-16">
            Our intelligent shopping assistant revolutionizes how you discover and purchase products online.
          </p>
          
          <div className="space-y-20">
            {features.map((feature, index) => (
              <div 
                key={index}
                ref={el => featureRefs.current[index] = el}
                className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}
              >
                <div className="flex-shrink-0 w-full md:w-1/3 flex justify-center">
                  <div className="bg-indigo-50 p-6 rounded-2xl shadow-inner">
                    {feature.icon}
                  </div>
                </div>
                <div className="w-full md:w-2/3">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-lg text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;