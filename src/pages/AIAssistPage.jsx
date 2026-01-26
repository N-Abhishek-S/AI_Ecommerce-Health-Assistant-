import { useState, useRef } from "react";

const IMAGE_ANALYSIS_URL = "https://n8n.srv1247505.hstgr.cloud/webhook/image-upload";
const FACE_SHAPE_URL = "https://n8n.srv1247505.hstgr.cloud/webhook/face-shape";

export default function ImageUpload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    // Validate file
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File size should be less than 5MB");
        return;
      }
      
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(selectedFile.type)) {
        setError("Please upload JPG, PNG, or WebP files only");
        return;
      }
    }
    
    setFile(selectedFile);
    setError("");
    setResult(null);
    
    // Create preview
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setImagePreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an image first");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      // Call both endpoints
      const [imageAnalysisRes, faceShapeRes] = await Promise.all([
        fetch(IMAGE_ANALYSIS_URL, {
          method: "POST",
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
        }),
        fetch(FACE_SHAPE_URL, {
          method: "POST",
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
        })
      ]);

      if (!imageAnalysisRes.ok) {
        throw new Error(`Image analysis error: ${imageAnalysisRes.status} ${imageAnalysisRes.statusText}`);
      }

      if (!faceShapeRes.ok) {
        throw new Error(`Face shape analysis error: ${faceShapeRes.status} ${faceShapeRes.statusText}`);
      }

      const imageAnalysisData = await imageAnalysisRes.json();
      const faceShapeData = await faceShapeRes.json();

      // Extract data from both responses
      const imageResult = Array.isArray(imageAnalysisData) && imageAnalysisData.length > 0 
        ? imageAnalysisData[0] 
        : imageAnalysisData;

      const faceShapeResult = Array.isArray(faceShapeData) && faceShapeData.length > 0 
        ? faceShapeData[0] 
        : faceShapeData;

      // Merge both results
      const mergedResult = {
        ...imageResult,
        face_shape: faceShapeResult.face_shape,
        face_metrics: faceShapeResult.metrics
      };

      setResult(mergedResult);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const event = { target: { files: [droppedFile] } };
      handleFileChange(event);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearAll = () => {
    setFile(null);
    setResult(null);
    setImagePreview(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Color configuration
  const colorDetails = {
    navy: {
      name: "Navy Blue",
      hex: "#000080",
      description: "Classic and professional",
      style: "Business, formal, versatile",
      rgb: "0, 0, 128"
    },
    emerald: {
      name: "Emerald Green",
      hex: "#50C878",
      description: "Vibrant and fresh",
      style: "Statement pieces, accessories",
      rgb: "80, 200, 120"
    },
    burgundy: {
      name: "Burgundy",
      hex: "#800020",
      description: "Deep and luxurious",
      style: "Evening wear, winter fashion",
      rgb: "128, 0, 32"
    },
    charcoal: {
      name: "Charcoal Gray",
      hex: "#36454F",
      description: "Modern and sleek",
      style: "Urban, minimalist, professional",
      rgb: "54, 69, 79"
    },
    'royal blue': {
      name: "Royal Blue",
      hex: "#4169E1",
      description: "Bold and regal",
      style: "Formal, statement pieces",
      rgb: "65, 105, 225"
    },
    olive: {
      name: "Olive Green",
      hex: "#808000",
      description: "Earthy and sophisticated",
      style: "Casual, military, streetwear",
      rgb: "128, 128, 0"
    },
    teal: {
      name: "Teal",
      hex: "#008080",
      description: "Calm and elegant",
      style: "Business, evening wear, accessories",
      rgb: "0, 128, 128"
    },
    mustard: {
      name: "Mustard Yellow",
      hex: "#FFDB58",
      description: "Warm and vibrant",
      style: "Casual, autumn fashion, statement pieces",
      rgb: "255, 219, 88"
    },
    maroon: {
      name: "Maroon",
      hex: "#800000",
      description: "Rich and classic",
      style: "Formal, winter wear, luxury",
      rgb: "128, 0, 0"
    },
    beige: {
      name: "Beige",
      hex: "#F5F5DC",
      description: "Neutral and versatile",
      style: "Minimalist, office wear, basics",
      rgb: "245, 245, 220"
    }
  };

  // Get confidence color
  const getConfidenceColor = (confidence) => {
    switch(confidence?.toLowerCase()) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get attribute icon
  const getAttributeIcon = (attribute) => {
    const icons = {
      gender: '👤',
      age_range: '📅',
      face_shape: '🟢',
      skin_tone: '🎨',
      hair_type: '💇',
      beard: '🧔',
      confidence: '📊',
      face_metrics: '📐'
    };
    return icons[attribute] || '📋';
  };

  // Format attribute name
  const formatAttributeName = (name) => {
    return name.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Format attribute value
  const formatAttributeValue = (name, value) => {
    if (name === 'beard') {
      return value ? 'Yes' : 'No';
    }
    if (name === 'confidence') {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
    if (name === 'face_metrics') {
      return 'View Details';
    }
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return value;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            AI Style & Color Analysis
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your photo to receive personalized color recommendations and style analysis powered by AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <div className="mb-2 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Upload Your Image</h2>
              {result && (
                <button
                  onClick={clearAll}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear All
                </button>
              )}
            </div>
            <p className="text-gray-500 mb-8">Get personalized style advice based on your features</p>
            
            {/* Drag & Drop Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={triggerFileInput}
              className={`border-3 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer mb-6 ${
                loading ? 'border-gray-300 bg-gray-50' : 
                error ? 'border-red-300 bg-red-50' : 
                'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
                disabled={loading}
              />
              
              <div className="flex flex-col items-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                  loading ? 'bg-gray-100' : 'bg-blue-50'
                }`}>
                  {loading ? (
                    <svg className="animate-spin w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                
                <div className="mb-2">
                  <p className="text-lg font-semibold text-gray-700">
                    {file ? file.name : 'Drop your image here'}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'or click to browse'}
                  </p>
                </div>
                
                <p className="text-gray-400 text-sm">
                  Supports JPG, PNG, WebP • Max 5MB
                </p>
              </div>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Preview</h3>
                <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-72 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                    <p className="text-white text-sm font-medium">
                      Ready for analysis
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-0.5 ${
                loading || !file
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing Image...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Analyze Image & Get Recommendations
                </span>
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-[fadeIn_0.5s_ease-out]">
                <div className="flex items-center text-red-800">
                  <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-bold">Upload Error</div>
                    <div className="text-sm">{error}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
              <p className="text-gray-500">Personalized recommendations based on your features</p>
            </div>
            
            {result ? (
              <div className="space-y-10 animate-[fadeIn_0.5s_ease-out]">
                {/* Confidence Badge */}
                <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Analysis Confidence</div>
                      <div className="text-sm text-gray-600">How accurate our analysis is</div>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold border ${getConfidenceColor(result.confidence)}`}>
                    {result.confidence?.toUpperCase() || 'MEDIUM'}
                  </span>
                </div>

                {/* Personal Attributes */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Your Features</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(result).map(([key, value]) => {
                      if (key === 'recommended_colors' || key === 'confidence' || key === 'face_metrics') return null;
                      
                      return (
                        <div key={key} className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition-colors group">
                          <div className="flex items-center mb-2">
                            <span className="text-2xl mr-3">{getAttributeIcon(key)}</span>
                            <div>
                              <div className="text-sm text-gray-500 font-medium">{formatAttributeName(key)}</div>
                              <div className="text-lg font-bold text-gray-900">
                                {formatAttributeValue(key, value)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Face Shape Metrics */}
                    {result.face_metrics && (
                      <div className="md:col-span-2">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                          <div className="flex items-center mb-3">
                            <span className="text-2xl mr-3">📐</span>
                            <h4 className="font-bold text-gray-900">Face Shape Analysis</h4>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div className="text-center">
                              <div className="text-sm text-gray-500">Face Shape</div>
                              <div className="font-bold text-lg text-gray-900">{result.face_shape}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-gray-500">Height/Width Ratio</div>
                              <div className="font-bold text-lg text-gray-900">
                                {result.face_metrics?.height_width_ratio?.toFixed(2)}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-gray-500">Confidence</div>
                              <div className="font-bold text-lg text-gray-900">High</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recommended Colors */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-teal-100 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Recommended Colors</h3>
                  </div>

                  <div className="mb-6">
                    <p className="text-gray-600 mb-4">Based on your features, these colors will complement you best:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {result.recommended_colors?.map((color, index) => {
                        const colorInfo = colorDetails[color.toLowerCase()] || {
                          name: color.charAt(0).toUpperCase() + color.slice(1),
                          hex: '#6b7280',
                          description: 'Complements your features',
                          style: 'Various styles'
                        };
                        
                        return (
                          <div 
                            key={index} 
                            className="rounded-xl overflow-hidden border border-gray-200 shadow-sm group hover:shadow-md transition-all duration-300"
                          >
                            <div 
                              className="h-24 w-full"
                              style={{ backgroundColor: colorInfo.hex }}
                            />
                            <div className="p-3 bg-white">
                              <div className="font-bold text-gray-900 text-sm mb-1">{colorInfo.name}</div>
                              <div className="text-xs text-gray-500">{colorInfo.description}</div>
                              <div className="text-xs text-gray-400 mt-1">{colorInfo.hex}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Style Tips */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-100">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-gray-900">Style Tips</h4>
                    </div>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">Combine these colors with neutral basics for balanced outfits</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">Use brighter colors as accent pieces in accessories</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">Layer different shades of recommended colors for depth</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Save Results */}
                <div className="border-t pt-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        const dataStr = JSON.stringify(result, null, 2);
                        const dataBlob = new Blob([dataStr], { type: 'application/json' });
                        const url = URL.createObjectURL(dataBlob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `style-analysis-${new Date().toISOString().split('T')[0]}.json`;
                        link.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white rounded-xl font-semibold transition-all flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Save Results
                    </button>
                    <button
                      onClick={clearAll}
                      className="flex-1 py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-all flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Analyze Another
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-16">
                <div className="w-32 h-32 mx-auto mb-6 text-gray-200">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-400 mb-3">
                  No Analysis Yet
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  Upload a clear, well-lit photo of yourself to receive personalized color and style recommendations.
                </p>
                <div className="flex items-center justify-center text-sm text-gray-400">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Tips: Use a neutral background and face the camera directly
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center space-x-6 text-gray-400 text-sm mb-4">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              AI-Powered Analysis
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure & Private
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Instant Results
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            Results are based on visual attributes detected in your uploaded image. 
            For best results, upload a clear photo with good lighting.
          </p>
        </div>
      </div>
    </div>
  );
}