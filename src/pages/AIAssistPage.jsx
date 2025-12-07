import React, { useState, useRef } from 'react';
import { gsap } from 'gsap';
import AnalysisResult from '../pages/AnaliysisResult'; // Adjust path as needed

const AIAssistPage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const uploaderRef = useRef(null);
  const previewRef = useRef(null);
  const statusRef = useRef(null);

  const N8N_WEBHOOK_URL = 'https://n8n.srv1022996.hstgr.cloud/webhook/webhook/image-upload';

  // GSAP animations
  const animateUploader = () => {
    if (uploaderRef.current) {
      gsap.fromTo(uploaderRef.current, 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }
  };

  const animatePreview = () => {
    if (previewRef.current) {
      gsap.fromTo(previewRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }
      );
    }
  };

  const animateStatus = (isSuccess) => {
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
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('❌ Please select a valid image file (JPEG, PNG, etc.)');
      animateStatus(false);
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('❌ File size must be less than 10MB');
      animateStatus(false);
      return;
    }

    setError('');
    setSelectedImage(file);
    setUploadStatus('idle');
    setAnalysisData(null);
    
    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Animate preview after a short delay
    setTimeout(animatePreview, 100);
  };

  // Function to clean and parse JSON from potential markdown
  const safeJsonParse = (text) => {
    if (!text) return { message: 'Empty response' };

    try {
      // First, try to parse as pure JSON
      return JSON.parse(text);
    } catch (firstError) {
      console.log('First parse attempt failed, cleaning text...');
      
      try {
        // Remove markdown code blocks
        let cleanedText = text
          .replace(/```json\s*/g, '')  // Remove ```json
          .replace(/```\s*/g, '')      // Remove ```
          .replace(/`/g, '')           // Remove backticks
          .trim();
        
        // Remove any extra text before or after JSON
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedText = jsonMatch[0];
        }
        
        return JSON.parse(cleanedText);
      } catch (secondError) {
        console.log('JSON parsing failed, returning raw text:', text);
        return { 
          rawResponse: text,
          error: 'Response was not valid JSON',
          cleanedText: text.replace(/`/g, '').trim()
        };
      }
    }
  };

  const uploadImageToN8N = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setUploadStatus('uploading');
    setError('');

    const formData = new FormData();
    formData.append('data', selectedImage);
    formData.append('fileName', selectedImage.name);
    formData.append('timestamp', new Date().toISOString());

    try {
      console.log('📤 Uploading image to n8n...');
      
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        body: formData,
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('📄 Raw response text:', responseText);

      // Use safe JSON parsing
      const result = safeJsonParse(responseText);
      
      // Add timestamp if not present
      if (!result.timestamp) {
        result.timestamp = new Date().toISOString();
      }
      
      setUploadStatus('success');
      setAnalysisData(result);
      animateStatus(true);
      console.log('✅ Processed response:', result);

    } catch (err) {
      console.error('❌ Upload error:', err);
      setUploadStatus('error');
      setError(err.message);
      animateStatus(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedImage(null);
    setPreviewUrl('');
    setUploadStatus('idle');
    setAnalysisData(null);
    setError('');
    setIsLoading(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // Create a synthetic event for the file input
      const syntheticEvent = {
        target: { files: [file] }
      };
      handleImageChange(syntheticEvent);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Initialize animations on component mount
  React.useEffect(() => {
    animateUploader();
    
    // Cleanup object URLs on unmount
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto"> {/* Increased max-width */}
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            🎭 AI Style Analyzer
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Upload your photo for personalized style recommendations
          </p>
          <p className="text-lg text-gray-500">
            Get insights about your face shape, skin tone, and perfect accessories
          </p>
        </div>

        {/* Upload Card */}
        <div 
          ref={uploaderRef}
          className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border-2 border-dashed border-gray-300 hover:border-purple-400 transition-all duration-300"
        >
          {!selectedImage ? (
            // Upload Area
            <div
              className="text-center cursor-pointer py-16"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            </div>
          ) : (
            // Preview Area
            <div ref={previewRef} className="text-center">
              <div className="relative inline-block mb-8">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-64 h-64 object-cover rounded-2xl shadow-2xl mx-auto border-4 border-white"
                />
                <button
                  onClick={handleReset}
                  className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-600 transition-all duration-200 shadow-lg hover:scale-110"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-3 bg-gray-50 rounded-xl p-4 max-w-md mx-auto">
                <p className="text-xl font-semibold text-gray-800">
                  {selectedImage.name}
                </p>
                <p className="text-sm text-gray-600">
                  {formatFileSize(selectedImage.size)} • {selectedImage.type}
                </p>
              </div>
            </div>
          )}

          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div 
            ref={statusRef}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center font-medium"
          >
            {error}
          </div>
        )}

        {/* Upload Button */}
        {selectedImage && !analysisData && (
          <div className="text-center space-y-4">
            <button
              onClick={uploadImageToN8N}
              disabled={isLoading}
              className={`
                relative px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105
                ${isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700'
                }
                text-white shadow-2xl hover:shadow-3xl
              `}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  🔍 Analyzing Your Style...
                </span>
              ) : (
                '🚀 Analyze Face Features'
              )}
            </button>

            <button
              onClick={handleReset}
              className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl font-semibold hover:from-red-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              🗑️ Clear Selection
            </button>
          </div>
        )}

        {/* Status Messages */}
        {uploadStatus === 'success' && (
          <div 
            ref={statusRef}
            className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-center font-medium"
          >
            ✅ Analysis completed successfully!
          </div>
        )}

        {uploadStatus === 'error' && (
          <div 
            ref={statusRef}
            className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center font-medium"
          >
            ❌ Analysis failed. Please try again with a clearer photo.
          </div>
        )}

        {/* Analysis Results - Using the AnalysisResult Component */}
        {analysisData && !analysisData.error && (
          <div className="mt-8 bg-white rounded-3xl shadow-2xl p-8">
            <AnalysisResult result={analysisData} />
            
            {/* Reset button after analysis */}
            <div className="text-center mt-8">
              <button
                onClick={handleReset}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                🔄 Analyze Another Image
              </button>
            </div>
          </div>
        )}

        {/* Debug Info - Only show if there's raw response data */}
        {analysisData && analysisData.rawResponse && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <details className="cursor-pointer">
              <summary className="font-semibold text-yellow-800 text-lg">
                🔧 Debug Information (Raw Response)
              </summary>
              <div className="mt-4 bg-white p-4 rounded-lg overflow-auto text-sm text-gray-800 font-mono">
                {analysisData.rawResponse}
              </div>
            </details>
          </div>
        )}

        {/* Webhook Info */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Webhook URL: <code className="bg-gray-100 px-3 py-1 rounded-lg text-xs">{N8N_WEBHOOK_URL}</code></p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistPage;