import React, { useState, useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import AnalysisResult from '../pages/AnaliysisResult';

const AIAssistPage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [connectivityStatus, setConnectivityStatus] = useState('checking');
  const [useMockEndpoint, setUseMockEndpoint] = useState(false);
  
  const uploaderRef = useRef(null);
  const previewRef = useRef(null);
  const statusRef = useRef(null);
  const fileInputRef = useRef(null);

  // Get environment variables correctly for Vite
  const getEnvVariable = (key, defaultValue = '') => {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key] || defaultValue;
    }
    return defaultValue;
  };

  // Configurable endpoints
  const REAL_ENDPOINTS = [
    getEnvVariable('VITE_N8N_WEBHOOK_URL'),
    'https://n8n.srv1022996.hstgr.cloud/webhook/webhook/image-upload',
    'http://localhost:5678/webhook/image-upload',
  ].filter(endpoint => endpoint && endpoint.trim() !== '');

  // Mock endpoint that returns simulated data
  const MOCK_ENDPOINTS = [
    '/api/mock/analyze', // Local mock endpoint
  ];

  // Use mock endpoints if no real endpoints work
  const ACTIVE_ENDPOINTS = useMockEndpoint ? MOCK_ENDPOINTS : REAL_ENDPOINTS;

  // Mock analysis data for testing
  const generateMockAnalysis = (imageInfo) => {
    const faceShapes = ['Oval', 'Round', 'Square', 'Heart', 'Diamond', 'Oblong'];
    const skinTones = ['Fair', 'Light', 'Medium', 'Olive', 'Tan', 'Dark', 'Deep'];
    const seasons = ['Spring', 'Summer', 'Autumn', 'Winter'];
    const styles = ['Classic', 'Bohemian', 'Minimalist', 'Edgy', 'Romantic', 'Sporty'];
    
    return {
      success: true,
      timestamp: new Date().toISOString(),
      analysis: {
        faceShape: faceShapes[Math.floor(Math.random() * faceShapes.length)],
        skinTone: skinTones[Math.floor(Math.random() * skinTones.length)],
        colorSeason: seasons[Math.floor(Math.random() * seasons.length)],
        personalStyle: styles[Math.floor(Math.random() * styles.length)],
        confidence: (Math.random() * 0.5 + 0.5).toFixed(2), // 0.5 to 1.0
      },
      recommendations: {
        jewelry: ['Delicate chain necklaces', 'Hoop earrings', 'Minimalist bracelets'],
        glasses: ['Cat-eye frames', 'Round metal frames', 'Clear acetate frames'],
        hairstyles: ['Layered bob', 'Soft waves', 'Sleek ponytail'],
        colors: ['Navy blue', 'Sage green', 'Dusty rose', 'Cream white'],
      },
      imageInfo: {
        fileName: imageInfo?.name || 'uploaded_image.jpg',
        fileSize: imageInfo?.size || 0,
        fileType: imageInfo?.type || 'image/jpeg',
      },
      endpointUsed: 'mock',
      note: 'This is mock data for testing. Set up n8n server for real analysis.',
    };
  };

  // Check if endpoint is a mock endpoint
  const isMockEndpoint = (endpoint) => {
    return endpoint === '/api/mock/analyze' || endpoint.includes('mock');
  };

  // GSAP animations
  const animateUploader = useCallback(() => {
    if (uploaderRef.current) {
      gsap.fromTo(uploaderRef.current, 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }
  }, []);

  const animatePreview = useCallback(() => {
    if (previewRef.current) {
      gsap.fromTo(previewRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }
      );
    }
  }, []);

  const animateStatus = useCallback((isSuccess) => {
    if (statusRef.current) {
      gsap.fromTo(statusRef.current,
        { y: -20, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.5,
          color: isSuccess ? '#10b981' : '#ef4444',
          ease: "power2.out"
        }
      );
    }
  }, []);

  // Check endpoint availability
  const checkEndpoint = useCallback(async (endpoint) => {
    if (!endpoint || endpoint.trim() === '') return false;
    
    // Mock endpoints are always available
    if (isMockEndpoint(endpoint)) return true;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(endpoint, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      return response.ok || response.status === 405; // 405 Method Not Allowed is okay for some endpoints
    } catch {
      return false;
    }
  }, []);

  const handleImageChange = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setError('❌ Please select a valid image file (JPEG, PNG, WEBP, GIF, SVG)');
      animateStatus(false);
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError(`❌ File size must be less than 10MB (Current: ${formatFileSize(file.size)})`);
      animateStatus(false);
      return;
    }

    // Reset states
    setError('');
    setImageLoadError(false);
    setSelectedImage(file);
    setUploadStatus('idle');
    setAnalysisData(null);
    
    // Create and validate preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Preload image to check if it's valid
    const img = new Image();
    img.onload = () => {
      console.log('✅ Image loaded successfully');
      // Animate preview after image is confirmed valid
      setTimeout(animatePreview, 100);
    };
    img.onerror = () => {
      console.error('❌ Failed to load image');
      setImageLoadError(true);
      setError('Selected image could not be loaded. Please try another file.');
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      setPreviewUrl('');
    };
    img.src = objectUrl;
  }, [animatePreview, animateStatus]);

  const uploadImageToN8N = useCallback(async () => {
    if (!selectedImage) {
      setError('❌ No image selected');
      return;
    }

    setIsLoading(true);
    setUploadStatus('uploading');
    setError('');

    let lastError = '';
    let successfulEndpoint = null;
    let responseData = null;
    
    // Try each endpoint until one works
    for (const endpoint of ACTIVE_ENDPOINTS) {
      if (!endpoint || endpoint.trim() === '') continue;
      
      try {
        console.log(`📤 Attempting upload to: ${endpoint}`);
        
        if (isMockEndpoint(endpoint)) {
          // Use mock data for testing
          await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
          responseData = generateMockAnalysis(selectedImage);
          successfulEndpoint = endpoint;
          console.log('✅ Using mock analysis data');
          break;
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        const formData = new FormData();
        formData.append('image', selectedImage);
        formData.append('fileName', selectedImage.name);
        formData.append('fileType', selectedImage.type);
        formData.append('fileSize', selectedImage.size.toString());
        formData.append('timestamp', new Date().toISOString());

        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          lastError = `Server responded with status: ${response.status} ${response.statusText}`;
          continue;
        }

        const responseText = await response.text();
        console.log('📥 Response received, length:', responseText.length);

        // Parse response
        const result = JSON.parse(responseText);
        result.serverTimestamp = new Date().toISOString();
        result.endpointUsed = endpoint;
        
        // Success!
        successfulEndpoint = endpoint;
        responseData = result;
        break;

      } catch (err) {
        console.log(`❌ Failed with ${endpoint}:`, err.message);
        lastError = err.message;
        continue;
      }
    }

    // Handle success or failure
    if (successfulEndpoint && responseData) {
      setUploadStatus('success');
      setAnalysisData(responseData);
      animateStatus(true);
      console.log('✅ Analysis successful from:', successfulEndpoint);
    } else {
      setUploadStatus('error');
      setError(`❌ Upload failed. ${lastError ? `Error: ${lastError}` : 'Please check your connection and try again.'}`);
      
      // Suggest using mock data if all real endpoints failed
      if (!useMockEndpoint && REAL_ENDPOINTS.length > 0) {
        setError(prev => `${prev} Click "Use Mock Data" to test with sample analysis.`);
      }
      
      animateStatus(false);
    }
    
    setIsLoading(false);
  }, [selectedImage, animateStatus, useMockEndpoint]);

  const handleReset = useCallback(() => {
    // Clean up object URLs
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    // Reset all states
    setSelectedImage(null);
    setPreviewUrl('');
    setUploadStatus('idle');
    setAnalysisData(null);
    setError('');
    setImageLoadError(false);
    setIsLoading(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previewUrl]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50', 'scale-105');
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50', 'scale-105');
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50', 'scale-105');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      // Create a synthetic event
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      const syntheticEvent = {
        target: {
          files: dataTransfer.files
        }
      };
      
      handleImageChange(syntheticEvent);
    }
  }, [handleImageChange]);

  const formatFileSize = useCallback((bytes) => {
    if (typeof bytes !== 'number' || bytes < 0) return '0 Bytes';
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }, []);

  const handleFileInputClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const toggleMockEndpoint = useCallback(() => {
    setUseMockEndpoint(prev => !prev);
    setError('');
    setAnalysisData(null);
  }, []);

  // Check if we're in development mode
  const isDevelopment = getEnvVariable('MODE', 'development') === 'development';

  // Initialize on component mount
  useEffect(() => {
    animateUploader();
    
    // Log environment info for debugging
    console.log('🔍 Environment mode:', isDevelopment ? 'Development' : 'Production');
    console.log('🔍 Available endpoints:', ACTIVE_ENDPOINTS);
    console.log('🔍 Using mock endpoint:', useMockEndpoint);

    // Cleanup on unmount
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [animateUploader, previewUrl, isDevelopment, useMockEndpoint]);

  // Render helpers
  const renderUploadArea = () => (
    <div
      className="text-center cursor-pointer py-16 transition-all duration-300"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleFileInputClick}
    >
      <div className="w-24 h-24 mx-auto mb-6 bg-linear-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <svg className="w-12 h-12 text-purple-500 group-hover:text-purple-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      </div>
      <h3 className="text-2xl font-semibold text-gray-700 mb-3">
        Drop your image here
      </h3>
      <p className="text-gray-500 mb-4 text-lg">
        or click to browse files
      </p>
      <p className="text-sm text-gray-400">
        Supports JPEG, PNG, WEBP, GIF • Max 10MB
      </p>
      {useMockEndpoint && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 text-sm font-medium">
            ⚠️ Using Mock Data Mode
          </p>
        </div>
      )}
    </div>
  );

  const renderPreviewArea = () => (
    <div ref={previewRef} className="text-center">
      <div className="relative inline-block mb-8">
        {imageLoadError ? (
          <div className="w-64 h-64 bg-linear-to-br from-red-50 to-pink-100 rounded-2xl flex flex-col items-center justify-center mx-auto border-4 border-white shadow-2xl">
            <svg className="w-16 h-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600 font-medium">Failed to load image</p>
          </div>
        ) : (
          <img
            src={previewUrl}
            alt="Preview"
            className="w-64 h-64 object-cover rounded-2xl shadow-2xl mx-auto border-4 border-white"
            onError={() => setImageLoadError(true)}
          />
        )}
        <button
          onClick={handleReset}
          className="absolute -top-3 -right-3 bg-linear-to-r from-red-500 to-pink-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-300"
          aria-label="Remove image"
        >
          ×
        </button>
      </div>
      
      {selectedImage && (
        <div className="space-y-3 bg-linear-to-r from-gray-50 to-blue-50 rounded-xl p-6 max-w-md mx-auto border border-gray-200">
          <p className="text-xl font-semibold text-gray-800 truncate" title={selectedImage.name}>
            📄 {selectedImage.name}
          </p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <span className="bg-white px-3 py-1 rounded-full text-gray-600 shadow-sm">
              📊 {formatFileSize(selectedImage.size)}
            </span>
            <span className="bg-white px-3 py-1 rounded-full text-gray-600 shadow-sm">
              🏷️ {selectedImage.type.split('/')[1]?.toUpperCase() || 'Unknown'}
            </span>
            <span className="bg-white px-3 py-1 rounded-full text-gray-600 shadow-sm">
              ⏰ {new Date(selectedImage.lastModified).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            🎭 AI Style Analyzer
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Upload your photo for personalized style recommendations
          </p>
          <p className="text-lg text-gray-500">
            Get insights about your face shape, skin tone, and perfect accessories
          </p>
          <div className="mt-6 flex flex-col items-center gap-4">
            <div className={`flex items-center justify-center gap-2 ${connectivityStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`w-2 h-2 rounded-full ${connectivityStatus === 'online' ? 'bg-green-600 animate-pulse' : 'bg-red-600'}`}></div>
              {connectivityStatus === 'online' ? 'Connected' : 'Offline'}
            </div>
            <button
              onClick={toggleMockEndpoint}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                useMockEndpoint 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {useMockEndpoint ? '✅ Using Mock Data' : '🔄 Switch to Mock Data'}
            </button>
          </div>
        </div>

        {/* Upload Card */}
        <div 
          ref={uploaderRef}
          className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border-2 border-dashed border-gray-300 hover:border-purple-400 transition-all duration-300 group"
        >
          {!selectedImage ? renderUploadArea() : renderPreviewArea()}

          <input
            ref={fileInputRef}
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            aria-label="Upload image file"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div 
            ref={statusRef}
            className="mb-6 p-6 bg-linear-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl text-red-700 text-center font-medium flex items-center justify-center gap-3 shadow-lg animate-pulse"
          >
            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Upload Button */}
        {selectedImage && !analysisData && !imageLoadError && (
          <div className="text-center space-y-6">
            <button
              onClick={uploadImageToN8N}
              disabled={isLoading}
              className={`
                relative px-12 py-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105
                active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                ${isLoading 
                  ? 'bg-linear-to-r from-gray-400 to-gray-600' 
                  : 'bg-linear-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700'
                }
                text-white shadow-2xl hover:shadow-3xl focus:outline-none focus:ring-4 focus:ring-purple-300
              `}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-7 w-7 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  🔍 Analyzing Your Style...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  🚀 {useMockEndpoint ? 'Test with Mock Data' : 'Analyze Face Features'}
                </span>
              )}
            </button>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={handleReset}
                className="px-8 py-4 bg-linear-to-r from-red-500 to-pink-600 text-white rounded-2xl font-semibold hover:from-red-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-300 shadow-lg hover:shadow-xl"
              >
                🗑️ Clear Selection
              </button>
              <button
                onClick={handleFileInputClick}
                className="px-8 py-4 bg-linear-to-r from-gray-500 to-gray-700 text-white rounded-2xl font-semibold hover:from-gray-600 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-gray-300 shadow-lg hover:shadow-xl"
              >
                📁 Choose Different Image
              </button>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {uploadStatus === 'success' && (
          <div 
            ref={statusRef}
            className="mt-6 p-6 bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl text-green-700 text-center font-medium flex items-center justify-center gap-3 shadow-lg"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            ✅ Analysis completed successfully!
          </div>
        )}

        {uploadStatus === 'error' && !useMockEndpoint && (
          <div 
            ref={statusRef}
            className="mt-6 p-6 bg-linear-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl text-red-700 text-center font-medium flex items-center justify-center gap-3 shadow-lg"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ❌ Analysis failed. All endpoints are unreachable.
          </div>
        )}

        {/* Analysis Results */}
        {analysisData && !analysisData.error && (
          <div className="mt-8 bg-white rounded-3xl shadow-2xl p-8">
            <div className="mb-6">
              {analysisData.endpointUsed === 'mock' && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="font-semibold">Demo Mode Active</span>
                  </div>
                  <p className="text-yellow-700 text-sm mt-1">
                    This is sample data for testing. To get real analysis, set up your n8n server and update the endpoint URL.
                  </p>
                </div>
              )}
              <AnalysisResult result={analysisData} />
            </div>
            
            <div className="text-center mt-8 space-y-4">
              <button
                onClick={handleReset}
                className="px-10 py-5 bg-linear-to-r from-purple-500 to-blue-600 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-xl hover:shadow-2xl text-lg"
              >
                🔄 Analyze Another Image
              </button>
              {analysisData.endpointUsed && analysisData.endpointUsed !== 'mock' && (
                <p className="text-sm text-gray-500">
                  Analysis served from: <code className="bg-gray-100 px-2 py-1 rounded text-xs max-w-xs truncate inline-block" title={analysisData.endpointUsed}>
                    {analysisData.endpointUsed.replace(/^https?:\/\//, '')}
                  </code>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Setup Instructions */}
        {!useMockEndpoint && REAL_ENDPOINTS.length === 0 && (
          <div className="mt-8 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-blue-800 mb-3">🚀 Setup Instructions</h3>
            <div className="space-y-3 text-blue-700">
              <p>To use real AI analysis, you need to:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Set up an n8n server locally or use a hosted service</li>
                <li>Create a webhook workflow in n8n</li>
                <li>Add the webhook URL to your environment variables</li>
                <li>For now, click "Switch to Mock Data" to test the interface</li>
              </ol>
              <div className="mt-4 p-3 bg-white rounded-lg border border-blue-100">
                <p className="text-sm text-blue-600 font-mono">
                  Add to .env file: VITE_N8N_WEBHOOK_URL="your-webhook-url-here"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Debug Info - Only show in development */}
        {isDevelopment && (
          <div className="mt-8 bg-linear-to-r from-gray-50 to-slate-100 border border-gray-200 rounded-2xl p-6">
            <details className="cursor-pointer">
              <summary className="font-semibold text-gray-800 text-lg flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                🔍 Debug Information
              </summary>
              <div className="mt-4 space-y-4">
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Real Endpoints:</strong> {REAL_ENDPOINTS.length}</p>
                  <p><strong>Using Mock:</strong> {useMockEndpoint ? 'Yes' : 'No'}</p>
                  <p><strong>Environment:</strong> {isDevelopment ? 'Development' : 'Production'}</p>
                  <p><strong>Image Selected:</strong> {selectedImage ? 'Yes' : 'No'}</p>
                  <div className="bg-white p-3 rounded-lg border">
                    <p className="font-medium mb-1">Endpoint List:</p>
                    {ACTIVE_ENDPOINTS.map((endpoint, idx) => (
                      <div key={idx} className="text-xs font-mono truncate">
                        {idx + 1}. {endpoint}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistPage;