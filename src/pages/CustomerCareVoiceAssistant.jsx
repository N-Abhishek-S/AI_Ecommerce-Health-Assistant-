import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const CustomerCareVoiceAssistant = () => {
  const headerRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const widgetCardRef = useRef(null);
  const footerRef = useRef(null);
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [micPermission, setMicPermission] = useState('prompt');
  const [isSecureContext, setIsSecureContext] = useState(true);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);

  // ElevenLabs Configuration
  const AGENT_ID = "agent_0101k6dy2ab7f4d92dd45v8cbb7h";

  useEffect(() => {
    // Check if we're in a browser environment
    setIsBrowser(typeof window !== 'undefined');
    
    if (typeof window !== 'undefined') {
      setIsSecureContext(window.isSecureContext);
      const hostname = window.location.hostname;
      setIsLocalhost(hostname === 'localhost' || hostname === '127.0.0.1');
      
      if (!isSecureContext && !isLocalhost) {
        console.warn('Running on insecure HTTP. Microphone will not work.');
      }
    }
  }, []);

  const checkMicrophonePermission = async () => {
    if (!isBrowser) {
      setMicPermission('unsupported');
      return false;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicPermission('unsupported');
        return false;
      }
      
      if (isLocalhost) {
        setMicPermission('granted');
        return true;
      }

      const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
      setMicPermission(permissionStatus.state);

      permissionStatus.onchange = () => {
        setMicPermission(permissionStatus.state);
      };

      return permissionStatus.state === 'granted';
    } catch (error) {
      console.warn('Microphone permission check failed:', error);
      setMicPermission('unknown');
      return false;
    }
  };

  const requestMicrophoneAccess = async () => {
    if (!isBrowser) {
      setMicPermission('unsupported');
      return false;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicPermission('unsupported');
        return false;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      stream.getTracks().forEach(track => track.stop());
      setMicPermission('granted');
      return true;
    } catch (error) {
      console.error('Microphone access denied:', error);
      setMicPermission('denied');
      return false;
    }
  };

  const loadWidgetScript = async () => {
    if (scriptLoaded || !isBrowser) return;

    const existingScript = document.querySelector('script[src*="convai-widget-embed"]');
    if (existingScript) {
      setScriptLoaded(true);
      setWidgetLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    
    script.onload = () => {
      setScriptLoaded(true);
      setWidgetLoaded(true);
      console.log('✅ ElevenLabs Customer Care widget loaded successfully');
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load ElevenLabs widget script');
      setWidgetLoaded(false);
    };

    document.head.appendChild(script);
    setScriptLoaded(true);
  };

  useEffect(() => {
    if (!isBrowser) return;
    
    const tl = gsap.timeline();

    tl.fromTo(headerRef.current,
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    )
    .fromTo(titleRef.current,
      { x: -100, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" },
      "-=0.3"
    )
    .fromTo(descriptionRef.current,
      { x: 100, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" },
      "-=0.5"
    )
    .fromTo(widgetCardRef.current,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: "elastic.out(1, 0.5)" },
      "-=0.3"
    )
    .fromTo(footerRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
      "-=0.2"
    );

    checkMicrophonePermission();
  }, [isBrowser]);

  const handleGetStarted = async () => {
    if (!isBrowser) return;
    
    if (!isLocalhost && !isSecureContext) {
      widgetCardRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
      return;
    }

    if (micPermission !== 'granted') {
      const granted = await requestMicrophoneAccess();
      if (!granted) return;
    }

    if (!widgetLoaded) {
      await loadWidgetScript();
    }

    widgetCardRef.current.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center'
    });
    
    gsap.fromTo(widgetCardRef.current,
      { scale: 1 },
      { scale: 1.05, duration: 0.3, yoyo: true, repeat: 1 }
    );
  };

  const handleLiveAgent = () => {
    alert('👥 Connecting you with a live customer care agent...\n\nThis feature would integrate with your live chat or phone system.');
  };

  const handleRetryWidget = () => {
    setWidgetLoaded(false);
    setTimeout(() => {
      loadWidgetScript();
    }, 100);
  };

  const handleAllowMicrophone = async () => {
    const granted = await requestMicrophoneAccess();
    if (granted) {
      await loadWidgetScript();
    }
  };

  const redirectToLocalhost = () => {
    if (!isBrowser) return;
    
    const currentUrl = new URL(window.location.href);
    currentUrl.hostname = 'localhost';
    currentUrl.port = '3000';
    window.location.href = currentUrl.toString();
  };

  const renderPermissionStatus = () => {
    if (!isBrowser) {
      return (
        <div className="text-center p-8 bg-gray-50 rounded-2xl border-2 border-gray-300">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">💻</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Browser Environment Required
          </h3>
          <p className="text-gray-700 mb-6 text-lg">
            This component requires a browser environment to function.
          </p>
        </div>
      );
    }

    if (!isLocalhost && !isSecureContext) {
      return (
        <div className="text-center p-8 bg-yellow-50 rounded-2xl border-2 border-yellow-300">
          <div className="w-20 h-20 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔒</span>
          </div>
          <h3 className="text-2xl font-bold text-yellow-800 mb-4">
            Secure Connection Required
          </h3>
          <p className="text-yellow-700 mb-6 text-lg">
            Voice features require HTTPS or localhost for microphone access.
          </p>
          
          <div className="bg-yellow-100 p-4 rounded-xl mb-6 text-left">
            <h4 className="font-bold text-yellow-800 mb-2">🛠️ Quick Solutions:</h4>
            <ul className="text-yellow-700 space-y-2">
              <li>• <strong>Use Localhost:</strong> Access via http://localhost:3000</li>
              <li>• <strong>Development:</strong> Run on localhost during development</li>
              <li>• <strong>Production:</strong> Ensure your site uses HTTPS</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={redirectToLocalhost}
              className="px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg"
            >
              🔄 Switch to Localhost
            </button>
          </div>
        </div>
      );
    }

    if (widgetLoaded && micPermission === 'granted') {
      return (
        <div className="w-full max-w-2xl mx-auto">
          <elevenlabs-convai 
            agent-id={AGENT_ID}
            style={{ 
              width: '100%', 
              minHeight: '350px',
              borderRadius: '16px',
              border: '2px solid #e5e7eb'
            }}
          />
        </div>
      );
    }

    return (
      <div className="text-center p-8 bg-blue-50 rounded-2xl border-2 border-blue-300">
        <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🎤</span>
        </div>
        <h3 className="text-2xl font-bold text-blue-800 mb-4">
          Enable Voice Support
        </h3>
        <p className="text-blue-700 mb-6 text-lg">
          Click below to enable microphone and start talking with our AI customer care assistant.
        </p>
        <button 
          onClick={handleAllowMicrophone}
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-teal-600 transition-all duration-300 shadow-lg transform hover:scale-105"
        >
          🎤 Start Voice Chat
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-100">
      {/* Header */}
      <header 
        ref={headerRef}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-purple-200 shadow-lg"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">💬</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Customer Care
              </h1>
            </div>
            
            {/* Localhost Indicator */}
            {isLocalhost && (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold border border-green-300">
                ✅ Localhost - Voice Ready
              </div>
            )}
            
            <div className="flex space-x-4">
              <button 
                onClick={handleGetStarted}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:from-purple-600 hover:to-pink-600"
              >
                Start Chat
              </button>
              <button 
                onClick={handleLiveAgent}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:from-blue-600 hover:to-cyan-600"
              >
                👥 Live Agent
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 
            ref={titleRef}
            className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent leading-tight"
          >
            AI-Powered Customer
            <span className="block bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Care Voice Assistant
            </span>
          </h1>
          
          <p 
            ref={descriptionRef}
            className="text-2xl md:text-3xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed font-medium"
          >
            24/7 Instant Support • Natural Conversations • Multilingual Help
          </p>

          {/* Development Notice */}
          {!isSecureContext && !isLocalhost && isBrowser && (
            <div className="max-w-2xl mx-auto mb-8 p-6 bg-orange-50 border-2 border-orange-400 rounded-2xl">
              <div className="flex items-center justify-center space-x-3 text-orange-800">
                <span className="text-2xl">🔒</span>
                <div>
                  <p className="font-bold text-lg">Development Mode Recommended</p>
                  <p className="text-sm">For full voice features, use http://localhost:3000</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button 
              onClick={handleGetStarted}
              className="px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 hover:from-purple-600 hover:to-pink-600 group"
            >
              <span className="flex items-center justify-center">
                🎤 Start Voice Chat
                <span className="ml-3 group-hover:animate-bounce">👇</span>
              </span>
            </button>
            
            <button 
              onClick={handleLiveAgent}
              className="px-8 py-5 bg-white text-gray-700 text-lg font-semibold rounded-2xl border-2 border-purple-200 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:border-purple-300 hover:bg-purple-50"
            >
              💬 Text Chat
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border-2 border-purple-100 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Instant Response</h3>
              <p className="text-gray-600">Get immediate answers to your questions 24/7</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border-2 border-pink-100 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Multilingual Support</h3>
              <p className="text-gray-600">Communicate in multiple languages naturally</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border-2 border-orange-100 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Problem Solving</h3>
              <p className="text-gray-600">Technical support and troubleshooting assistance</p>
            </div>
          </div>
        </section>

        {/* Widget Section */}
        <section className="max-w-4xl mx-auto">
          <div 
            ref={widgetCardRef}
            className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-2xl border-2 border-purple-200 p-8 hover:shadow-3xl transition-all duration-500 relative overflow-hidden"
          >
            {/* Glowing effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-800 mb-3">
                  🎤 Talk to Customer Care
                </h2>
                <p className="text-xl text-gray-600">
                  Click the microphone and speak naturally about your issue or question
                </p>
              </div>

              {/* ElevenLabs Widget Container */}
              <div className="bg-white rounded-2xl p-6 border-2 border-purple-100 shadow-inner min-h-[400px] flex items-center justify-center">
                {renderPermissionStatus()}
              </div>

              {/* Common Questions */}
              <div className="mt-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                  💡 Common Questions You Can Ask:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-2">🛍️ Order Support</h4>
                    <ul className="text-purple-700 text-sm space-y-1">
                      <li>• "Where is my order?"</li>
                      <li>• "I want to return a product"</li>
                      <li>• "Track my shipment"</li>
                    </ul>
                  </div>
                  <div className="bg-pink-50 rounded-2xl p-4 border border-pink-200">
                    <h4 className="font-semibold text-pink-800 mb-2">🔧 Technical Help</h4>
                    <ul className="text-pink-700 text-sm space-y-1">
                      <li>• "Reset my password"</li>
                      <li>• "App not working"</li>
                      <li>• "Feature explanation"</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Usage Tips */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">💡 Pro Tip</h4>
                  <p className="text-purple-700 text-sm">
                    Speak clearly and provide specific details for faster resolution.
                  </p>
                </div>
                <div className="bg-pink-50 rounded-2xl p-4 border border-pink-200">
                  <h4 className="font-semibold text-pink-800 mb-2">⏱️ Availability</h4>
                  <p className="text-pink-700 text-sm">
                    Available 24/7 for instant support in multiple languages.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Support Channels Section */}
        <section className="max-w-4xl mx-auto mt-16">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-8 text-white shadow-2xl">
            <h2 className="text-3xl font-bold mb-6 text-center">
              🚀 Multiple Support Channels
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎤</span>
                </div>
                <h4 className="font-bold text-lg mb-2">Voice Assistant</h4>
                <p className="text-purple-100 text-sm">
                  Natural voice conversations with AI-powered support
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <h4 className="font-bold text-lg mb-2">Live Chat</h4>
                <p className="text-purple-100 text-sm">
                  Connect with human agents for complex issues
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📧</span>
                </div>
                <h4 className="font-bold text-lg mb-2">Email Support</h4>
                <p className="text-purple-100 text-sm">
                  Detailed assistance via email with 24-hour response
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer 
        ref={footerRef}
        className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-8 mt-16"
      >
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                <span className="text-white">💬</span>
              </div>
              <span className="text-xl font-bold">AI Customer Care</span>
            </div>
            
            <div className="text-lg">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">
                Powered by ElevenLabs
              </span>
            </div>
            
            <div className="text-gray-400">
              © 2024 Customer Care Inc. • We're here to help
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerCareVoiceAssistant;