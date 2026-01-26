// src/components/VirtualTryOn.jsx
import React, { useState, useRef } from "react";
import {
  Upload,
  User,
  Image as ImageIcon,
  ShoppingBag,
  Camera,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Send,
  Trash2,
  FileUp,
  Zap,
  ChevronRight
} from "lucide-react";

const VirtualTryOn = () => {
  // State for images
  const [userImage, setUserImage] = useState(null);
  const [userImageFile, setUserImageFile] = useState(null);
  const [productImages, setProductImages] = useState([]);
  
  // State for form fields
  const [formData, setFormData] = useState({
    gender: "Men",
    productName: "",
    productCategory: "Shirts",
    notes: ""
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Refs
  const userFileInputRef = useRef(null);
  const productFileInputRef = useRef(null);

  // Constants
  const GENDERS = ["Men", "Women", "Unisex"];
  const CATEGORIES = [
    "Shirts", "Pants", "Footwear", "Watches", "Glasses", 
    "Bags", "Accessories", "Jewelry", "Wallets"
  ];
  
  const N8N_WEBHOOK_URL = "https://n8n.srv1247505.hstgr.cloud/webhook-test/try-on";
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const MIN_PRODUCT_IMAGES = 3;
  const MAX_PRODUCT_IMAGES = 5;

  // Validate image file
  const validateImage = (file) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    
    if (!file) return { valid: false, error: "No file selected" };
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: "Please upload JPG, PNG, or WebP files only" };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: "File size must be less than 10MB" };
    }
    
    return { valid: true, error: null };
  };

  // Handle user image upload
  const handleUserImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const validation = validateImage(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
    
    setLoading(true);
    setError("");
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setUserImage(e.target.result);
      setUserImageFile(file);
      setSuccess("User photo uploaded successfully!");
      setLoading(false);
    };
    reader.onerror = () => {
      setError("Failed to load image");
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  // Handle product image upload
  const handleProductImagesUpload = (e) => {
    const files = Array.from(e.target.files || []);
    
    if (productImages.length + files.length > MAX_PRODUCT_IMAGES) {
      setError(`Maximum ${MAX_PRODUCT_IMAGES} product images allowed`);
      return;
    }
    
    setError("");
    
    const validFiles = [];
    const invalidFiles = [];
    
    files.forEach(file => {
      const validation = validateImage(file);
      if (validation.valid) {
        validFiles.push({
          file,
          preview: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
          type: file.type
        });
      } else {
        invalidFiles.push({ file, error: validation.error });
      }
    });
    
    if (invalidFiles.length > 0) {
      setError(`${invalidFiles.length} file(s) rejected: ${invalidFiles[0].error}`);
    }
    
    if (validFiles.length > 0) {
      setProductImages(prev => [...prev, ...validFiles]);
      if (validFiles.length === 1) {
        setSuccess(`Added 1 product image`);
      } else {
        setSuccess(`Added ${validFiles.length} product images`);
      }
    }
    
    if (productFileInputRef.current) {
      productFileInputRef.current.value = "";
    }
  };

  // Remove product image
  const removeProductImage = (index) => {
    setProductImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Clear all
  const handleClearAll = () => {
    setUserImage(null);
    setUserImageFile(null);
    setProductImages([]);
    setResult(null);
    setError("");
    setSuccess("");
    if (userFileInputRef.current) userFileInputRef.current.value = "";
    if (productFileInputRef.current) productFileInputRef.current.value = "";
    
    // Clean up object URLs
    productImages.forEach(img => {
      URL.revokeObjectURL(img.preview);
    });
  };

  // Submit to n8n
  const handleSubmit = async () => {
    // Validation
    if (!userImageFile) {
      setError("Please upload your photo first");
      return;
    }
    
    if (productImages.length < MIN_PRODUCT_IMAGES) {
      setError(`Please upload at least ${MIN_PRODUCT_IMAGES} product images`);
      return;
    }
    
    setUploading(true);
    setError("");
    setSuccess("");
    setResult(null);
    
    try {
      // Prepare FormData
      const formDataObj = new FormData();
      
      // Add user image
      formDataObj.append("user_image", userImageFile, "user_photo.jpg");
      
      // Add product images
      productImages.forEach((img, index) => {
        formDataObj.append(`product_${index}`, img.file, `product_${index}.jpg`);
      });
      
      // Add metadata
      formDataObj.append("gender", formData.gender);
      formDataObj.append("product_name", formData.productName || "Test Product");
      formDataObj.append("product_category", formData.productCategory);
      formDataObj.append("notes", formData.notes);
      formDataObj.append("timestamp", new Date().toISOString());
      formDataObj.append("total_products", productImages.length.toString());
      formDataObj.append("test_mode", "true");
      
      console.log("Submitting to n8n:", {
        userImage: userImageFile.name,
        productImages: productImages.length,
        gender: formData.gender,
        category: formData.productCategory
      });
      
      // Send to n8n
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        body: formDataObj,
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setResult(result);
      
      if (result.success) {
        setSuccess(`Success! ${productImages.length} images uploaded to n8n. Check console for details.`);
        console.log("n8n Response:", result);
      } else {
        setError(result.error || "Upload failed");
      }
      
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
            <Zap className="text-white" size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            n8n Image Upload Tester
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Test your virtual try-on n8n webhook by uploading user and product images
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
            <span className="font-medium">Webhook URL:</span>
            <code className="text-xs">{N8N_WEBHOOK_URL}</code>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload Forms */}
          <div className="space-y-6">
            {/* User Photo Upload */}
            <div className="bg-white rounded-2xl shadow-lg border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User size={24} />
                Step 1: Upload User Photo
              </h2>
              
              {!userImage ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  {loading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="animate-spin text-blue-600 mb-3" size={32} />
                      <p className="text-gray-600">Processing image...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto text-gray-400 mb-3" size={40} />
                      <p className="text-gray-700 font-medium mb-2">Upload your selfie/portrait</p>
                      <p className="text-gray-500 text-sm mb-4">JPG, PNG, or WebP • Max 10MB</p>
                      
                      <input
                        ref={userFileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleUserImageUpload}
                        className="hidden"
                        id="user-file-upload"
                      />
                      
                      <label
                        htmlFor="user-file-upload"
                        className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
                      >
                        Choose User Photo
                      </label>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden border">
                    <img 
                      src={userImage} 
                      alt="User uploaded" 
                      className="w-full h-64 object-cover" 
                    />
                    <button
                      onClick={() => {
                        setUserImage(null);
                        setUserImageFile(null);
                        if (userFileInputRef.current) userFileInputRef.current.value = "";
                      }}
                      className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <p className="text-green-600 text-sm flex items-center gap-2">
                    <CheckCircle size={16} />
                    User photo ready ({userImageFile.name})
                  </p>
                </div>
              )}
            </div>

            {/* Product Images Upload */}
            <div className="bg-white rounded-2xl shadow-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingBag size={24} />
                  Step 2: Upload Product Images
                </h2>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  productImages.length >= MIN_PRODUCT_IMAGES 
                    ? "bg-green-100 text-green-800" 
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {productImages.length} / {MIN_PRODUCT_IMAGES}
                </span>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors mb-6">
                <ImageIcon className="mx-auto text-gray-400 mb-3" size={40} />
                <p className="text-gray-700 font-medium mb-2">Upload product images</p>
                <p className="text-gray-500 text-sm mb-4">
                  Upload {MIN_PRODUCT_IMAGES}-{MAX_PRODUCT_IMAGES} product images
                </p>
                
                <input
                  ref={productFileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleProductImagesUpload}
                  className="hidden"
                  id="product-file-upload"
                  multiple
                />
                
                <label
                  htmlFor="product-file-upload"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
                >
                  <FileUp size={20} className="inline mr-2" />
                  Choose Product Images
                </label>
                
                <p className="text-xs text-gray-500 mt-3">
                  You can select multiple images at once (Ctrl+Click or Cmd+Click)
                </p>
              </div>
              
              {/* Product Images Grid */}
              {productImages.length > 0 && (
                <>
                  <h3 className="font-medium text-gray-900 mb-3">Uploaded Product Images:</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {productImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border">
                          <img 
                            src={img.preview} 
                            alt={`Product ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={() => removeProductImage(index)}
                          className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="text-xs text-gray-500 truncate mt-1">
                          {img.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Configuration Form */}
            <div className="bg-white rounded-2xl shadow-lg border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Camera size={24} />
                Step 3: Configuration
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {GENDERS.map(gender => (
                      <button
                        key={gender}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, gender }))}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          formData.gender === gender
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                    placeholder="Enter product name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Category
                  </label>
                  <select
                    value={formData.productCategory}
                    onChange={(e) => setFormData(prev => ({ ...prev, productCategory: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional information for testing..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Preview & Submit */}
          <div className="space-y-6">
            {/* Summary & Submit */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Send size={24} />
                Step 4: Test Upload
              </h2>
              
              <div className="space-y-4">
                <div className="bg-white/20 rounded-lg p-4">
                  <h3 className="font-bold mb-3">Upload Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>User Photo:</span>
                      <span className="font-medium">
                        {userImageFile ? "✅ Ready" : "❌ Missing"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Product Images:</span>
                      <span className={`font-medium ${
                        productImages.length >= MIN_PRODUCT_IMAGES ? "text-green-300" : "text-yellow-300"
                      }`}>
                        {productImages.length} uploaded
                        {productImages.length < MIN_PRODUCT_IMAGES && 
                          ` (need ${MIN_PRODUCT_IMAGES - productImages.length} more)`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gender:</span>
                      <span className="font-medium">{formData.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span className="font-medium">{formData.productCategory}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleSubmit}
                    disabled={uploading || !userImageFile || productImages.length < MIN_PRODUCT_IMAGES}
                    className={`flex-1 px-6 py-3 font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                      uploading
                        ? "bg-blue-400 cursor-not-allowed"
                        : !userImageFile || productImages.length < MIN_PRODUCT_IMAGES
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-white text-blue-600 hover:shadow-xl hover:scale-105"
                    }`}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Uploading to n8n...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Test Upload to n8n
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleClearAll}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <X size={20} />
                    Clear All
                  </button>
                </div>
                
                <div className="text-sm opacity-90">
                  <p className="flex items-center gap-2">
                    <ChevronRight size={16} />
                    This will send all images to your n8n webhook for processing
                  </p>
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {(error || success) && (
              <div className={`rounded-2xl p-6 ${
                error ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"
              }`}>
                <div className="flex items-start gap-3">
                  {error ? (
                    <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
                  ) : (
                    <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                  )}
                  <div>
                    <h3 className={`font-bold ${error ? "text-red-800" : "text-green-800"} mb-1`}>
                      {error ? "Error" : "Success"}
                    </h3>
                    <p className={error ? "text-red-700" : "text-green-700"}>
                      {error || success}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Result Display */}
            {result && (
              <div className="bg-white rounded-2xl shadow-lg border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">n8n Response</h2>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-700 mb-2">Response Data:</h3>
                    <pre className="text-sm text-gray-600 overflow-auto max-h-60">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                  
                  {result.output_image && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Output Image:</h3>
                      <div className="rounded-lg overflow-hidden border">
                        <img 
                          src={result.output_image} 
                          alt="n8n output" 
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-white rounded-2xl shadow-lg border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">How to Use</h2>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Upload User Photo</h4>
                    <p className="text-sm text-gray-600">Upload a clear selfie or portrait photo</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Upload Product Images</h4>
                    <p className="text-sm text-gray-600">Upload 3-5 product/fashion item images</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Configure Settings</h4>
                    <p className="text-sm text-gray-600">Select gender and product category</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Test Upload</h4>
                    <p className="text-sm text-gray-600">Send images to n8n webhook for testing</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium text-gray-900 mb-2">Expected n8n Webhook Format:</h4>
                <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs font-mono overflow-x-auto">
                  <code>
                    POST {N8N_WEBHOOK_URL}<br/>
                    Content-Type: multipart/form-data<br/>
                    <br/>
                    Form Data:<br/>
                    • user_image: [File] (User photo)<br/>
                    • product_0: [File] (Product image 1)<br/>
                    • product_1: [File] (Product image 2)<br/>
                    • product_2: [File] (Product image 3)<br/>
                    • gender: "Men" | "Women" | "Unisex"<br/>
                    • product_name: "Test Product"<br/>
                    • timestamp: "2024-01-24T10:30:00.000Z"
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Console Info */}
        <div className="mt-8 bg-gray-900 text-gray-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Zap size={20} />
              Developer Console
            </h3>
            <span className="px-3 py-1 bg-gray-700 text-xs rounded-full">Check browser console for logs</span>
          </div>
          <p className="text-sm text-gray-300 mb-2">
            All API requests and responses are logged to the browser console.
          </p>
          <div className="text-xs text-gray-400 font-mono">
            <p>Open DevTools (F12) → Console tab to see:</p>
            <ul className="mt-2 space-y-1 ml-4">
              <li>• FormData being sent to n8n</li>
              <li>• HTTP response status</li>
              <li>• Full JSON response from n8n</li>
              <li>• Any errors during upload</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;
