import React, { useEffect, useRef, useState, Component } from 'react';
import { gsap } from 'gsap';

// Error Boundary component to catch rendering errors
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 rounded-2xl border-2 border-red-200 text-center">
          <h3 className="text-xl font-bold text-red-800 mb-3">Something went wrong</h3>
          <p className="text-red-700 mb-4">There was an error loading this component.</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="px-6 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Safe SVG Icon component
const Icon = ({ symbol, className = "" }) => {
  const safeSymbols = {
    'hospital': (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
      </svg>
    ),
    'microphone': (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill="currentColor"/>
        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill="currentColor"/>
      </svg>
    ),
    'emergency': (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 13v8h-2v-8H3v-2h8V3h2v8h8v2h-8z" fill="currentColor"/>
      </svg>
    ),
    'check': (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
      </svg>
    ),
    'lock': (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="currentColor"/>
      </svg>
    ),
    'clock': (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor"/>
      </svg>
    ),
    'target': (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
      </svg>
    ),
    'wrench': (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" fill="currentColor"/>
      </svg>
    ),
    'robot': (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 14h-1c0-3.87-3.13-7-7-7h-1V5.73c.45-.31.75-.81.75-1.38 0-.97-.78-1.75-1.75-1.75s-1.75.78-1.75 1.75c0 .57.3 1.07.75 1.38V7h-1c-3.87 0-7 3.13-7 7H2c-.55 0-1 .45-1 1s.45 1 1 1h1v2c0 2.76 2.24 5 5 5h8c2.76 0 5-2.24 5-5v-2h1c.55 0 1-.45 1-1s-.45-1-1-1zm-8 8H8c-1.66 0-3-1.34-3-3v-2c0-2.76 2.24-5 5-5h2c2.76 0 5 2.24 5 5v2c0 1.66-1.34 3-3 3z" fill="currentColor"/>
        <circle cx="9" cy="14" r="1.25" fill="currentColor"/>
        <circle cx="15" cy="14" r="1.25" fill="currentColor"/>
      </svg>
    ),
    'chat': (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="currentColor"/>
      </svg>
    ),
    'chart': (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" fill="currentColor"/>
      </svg>
    ),
    'globe': (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor"/>
      </svg>
    ),
    'lightbulb': (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 017 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" fill="currentColor"/>
      </svg>
    ),
    'warning': (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="currentColor"/>
      </svg>
    ),
    'laptop': (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z" fill="currentColor"/>
      </svg>
    ),
    'reload': (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
      </svg>
    ),
    'book': (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" fill="currentColor"/>
      </svg>
    ),
    'info': (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/>
      </svg>
    ),
  };

  return safeSymbols[symbol] || null;
};

const HealthVoiceAssistant = () => {
  const headerRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const widgetCardRef = useRef(null);
  const footerRef = useRef(null);
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [micPermission, setMicPermission] = useState('prompt'); // 'prompt', 'granted', 'denied', 'unsupported'
  const [isSecureContext, setIsSecureContext] = useState(true);
  const [isBrowser, setIsBrowser] = useState(false);

  // Check if we're in a browser environment and secure context
  useEffect(() => {
    setIsBrowser(typeof window !== 'undefined');
    if (typeof window !== 'undefined') {
      setIsSecureContext(window.isSecureContext);
    }
  }, []);

  // Check microphone permissions
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

  // Request microphone access
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
      
      // Stop the stream immediately since we just needed permission
      stream.getTracks().forEach(track => track.stop());
      
      setMicPermission('granted');
      return true;
    } catch (error) {
      console.error('Microphone access denied:', error);
      setMicPermission('denied');
      return false;
    }
  };

  // Function to load the widget script safely
  const loadWidgetScript = async () => {
    if (scriptLoaded || !isBrowser) return;

    // Check microphone permission first
    const hasPermission = await checkMicrophonePermission();
    
    if (!hasPermission && micPermission === 'prompt') {
      // Don't auto-load widget if we need to request permission
      return;
    }

    // Check if script is already loaded
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
      console.log('✅ ElevenLabs widget script loaded successfully');
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load ElevenLabs widget script');
      setWidgetLoaded(false);
    };

    document.head.appendChild(script);
    setScriptLoaded(true);
  };

  useEffect(() => {
    // Page load animations
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

    // Initial checks
    checkMicrophonePermission();
  }, []);

  const handleGetStarted = async () => {
    if (!isBrowser) {
      console.error('Not running in a browser environment');
      return;
    }

    // Check and request microphone permission
    if (micPermission !== 'granted') {
      const granted = await requestMicrophoneAccess();
      if (!granted) {
        return; // Stop if permission denied
      }
    }

    // Load widget if not already loaded
    if (!widgetLoaded) {
      await loadWidgetScript();
    }

    // Smooth scroll to widget section
    widgetCardRef.current.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center'
    });
    
    // Add a bounce animation to draw attention
    gsap.fromTo(widgetCardRef.current,
      { scale: 1 },
      { scale: 1.05, duration: 0.3, yoyo: true, repeat: 1 }
    );
  };

  const handleEmergencyContact = () => {
    alert('🚨 Emergency contact feature would be implemented here!\n\nThis would connect you with healthcare professionals or emergency services.');
  };

  const handleRetryWidget = async () => {
    setWidgetLoaded(false);
    // Small delay to ensure state update
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

  const openPermissionsGuide = () => {
    if (isBrowser) {
      window.open('https://support.google.com/chrome/answer/2693767', '_blank');
    }
  };

  // Render microphone permission status
  const renderPermissionStatus = () => {
    if (!isBrowser) {
      return (
        <div className="text-center p-6 bg-gray-50 rounded-2xl border-2 border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon symbol="laptop" className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            Browser Environment Required
          </h3>
          <p className="text-gray-700 mb-4">
            This component requires a browser environment to function.
          </p>
        </div>
      );
    }

    if (!isSecureContext) {
      return (
        <div className="text-center p-6 bg-red-50 rounded-2xl border-2 border-red-200">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon symbol="lock" className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-red-800 mb-3">
            Secure Connection Required
          </h3>
          <p className="text-red-700 mb-4">
            Microphone access requires a secure HTTPS connection or localhost.
          </p>
          <div className="text-sm text-red-600 bg-red-100 p-3 rounded-lg">
            <strong>Solution:</strong> Use HTTPS or run on localhost
          </div>
        </div>
      );
    }

    switch (micPermission) {
      case 'denied':
        return (
          <div className="text-center p-6 bg-red-50 rounded-2xl border-2 border-red-200">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon symbol="microphone" className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-red-800 mb-3">
              Microphone Access Denied
            </h3>
            <p className="text-red-700 mb-4">
              Please allow microphone access to use the voice assistant.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all duration-300 flex items-center justify-center"
              >
                <Icon symbol="reload" className="w-5 h-5 mr-2" />
                Reload Page
              </button>
              <button 
                onClick={openPermissionsGuide}
                className="px-6 py-3 bg-white text-red-700 font-semibold rounded-xl border-2 border-red-300 hover:border-red-400 transition-all duration-300 flex items-center justify-center"
              >
                <Icon symbol="book" className="w-5 h-5 mr-2" />
                Permission Guide
              </button>
            </div>
          </div>
        );

      case 'granted':
        return (
          <div className="text-center p-6 bg-green-50 rounded-2xl border-2 border-green-200">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon symbol="check" className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-3">
              Microphone Ready!
            </h3>
            <p className="text-green-700 mb-4">
              Microphone access granted. Loading voice assistant...
            </p>
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        );

      case 'unsupported':
        return (
          <div className="text-center p-6 bg-yellow-50 rounded-2xl border-2 border-yellow-200">
            <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon symbol="wrench" className="w-10 h-10 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-yellow-800 mb-3">
              Browser Not Supported
            </h3>
            <p className="text-yellow-700 mb-4">
              Your browser doesn't support microphone access or you're not in a secure context.
            </p>
            <div className="text-sm text-yellow-600 bg-yellow-100 p-3 rounded-lg">
              <strong>Solution:</strong> Try using a modern browser like Chrome, Firefox, or Edge in a secure context (HTTPS or localhost)
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center p-6 bg-blue-50 rounded-2xl border-2 border-blue-200">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon symbol="microphone" className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-blue-800 mb-3">
              Microphone Access Required
            </h3>
            <p className="text-blue-700 mb-4">
              This voice assistant needs microphone access to hear you speak.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={handleAllowMicrophone}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-teal-600 transition-all duration-300 flex items-center justify-center"
              >
                <Icon symbol="microphone" className="w-5 h-5 mr-2" />
                Allow Microphone
              </button>
              <button 
                onClick={openPermissionsGuide}
                className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl border-2 border-blue-300 hover:border-blue-400 transition-all duration-300 flex items-center justify-center"
              >
                <Icon symbol="info" className="w-5 h-5 mr-2" />
                Learn More
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-100">
      {/* Header */}
      <header 
        ref={headerRef}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-blue-200 shadow-lg"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Icon symbol="hospital" className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                AI Health Assistant
              </h1>
            </div>
            
            <div className="flex space-x-4">
              <button 
                onClick={handleGetStarted}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:from-blue-600 hover:to-teal-600"
              >
                Get Started
              </button>
              <button 
                onClick={handleEmergencyContact}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:from-red-600 hover:to-pink-600 flex items-center"
              >
                <Icon symbol="emergency" className="w-5 h-5 mr-2" />
                Emergency
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
            className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-blue-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight"
          >
            Your Personal AI Health
            <span className="block bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
              Voice Assistant
            </span>
          </h1>
          
          <p 
            ref={descriptionRef}
            className="text-2xl md:text-3xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed font-medium"
          >
            Available 24/7 • Powered by Advanced AI • Your Health Companion
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button 
              onClick={handleGetStarted}
              className="px-10 py-5 bg-gradient-to-r from-blue-500 to-teal-500 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 hover:from-blue-600 hover:to-teal-600 group"
            >
              <span className="flex items-center justify-center">
                <Icon symbol="microphone" className="w-6 h-6 mr-3" />
                Start Talking
                <span className="ml-3 group-hover:animate-bounce">👇</span>
              </span>
            </button>
            
            <button className="px-8 py-5 bg-white text-gray-700 text-lg font-semibold rounded-2xl border-2 border-blue-200 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:border-blue-300 hover:bg-blue-50 flex items-center">
              <Icon symbol="book" className="w-5 h-5 mr-2" />
              Learn More
            </button>
          </div>

          {/* Security Notice */}
          {!isSecureContext && isBrowser && (
            <div className="max-w-2xl mx-auto mb-8 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-2xl">
              <div className="flex items-center justify-center space-x-2 text-yellow-800">
                <Icon symbol="warning" className="w-6 h-6" />
                <p className="font-semibold">
                  For full functionality, please use HTTPS or localhost
                </p>
              </div>
            </div>
          )}

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border-2 border-blue-100 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <Icon symbol="clock" className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">24/7 Availability</h3>
              <p className="text-gray-600">Always here when you need health guidance, anytime day or night.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border-2 border-teal-100 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <Icon symbol="target" className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Personalized Advice</h3>
              <p className="text-gray-600">Tailored health recommendations based on your specific needs.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border-2 border-cyan-100 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <Icon symbol="lock" className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Privacy First</h3>
              <p className="text-gray-600">Your health data is secure and confidential with enterprise-grade encryption.</p>
            </div>
          </div>
        </section>

        {/* Widget Section */}
        <section className="max-w-4xl mx-auto">
          <div 
            ref={widgetCardRef}
            className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl border-2 border-blue-200 p-8 hover:shadow-3xl transition-all duration-500 relative overflow-hidden"
          >
            {/* Glowing effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-teal-400 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-800 mb-3">
                  <Icon symbol="microphone" className="inline-block w-10 h-10 mr-3 text-blue-600" />
                  Talk to Your Health Assistant
                </h2>
                <p className="text-xl text-gray-600">
                  Click the microphone and start speaking about your health concerns
                </p>
              </div>

              {/* ElevenLabs Widget Container */}
              <div className="bg-white rounded-2xl p-6 border-2 border-blue-100 shadow-inner min-h-[400px] flex items-center justify-center">
                <ErrorBoundary>
                  {widgetLoaded && micPermission === 'granted' ? (
                    <div className="w-full max-w-2xl mx-auto">
                      <elevenlabs-convai 
                        agent-id="agent_6901k65h2k6feg8tq6kaf2vmhmxe"
                        style={{ 
                          width: '100%', 
                          minHeight: '350px',
                          borderRadius: '16px',
                          border: '2px solid #e5e7eb'
                        }}
                      />
                    </div>
                  ) : (
                    renderPermissionStatus()
                  )}
                </ErrorBoundary>
              </div>

              {/* Usage Tips */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <Icon symbol="lightbulb" className="w-5 h-5 mr-2" />
                    Pro Tip
                  </h4>
                  <p className="text-blue-700 text-sm">
                    Speak clearly and describe your symptoms in detail for the most accurate advice.
                  </p>
                </div>
                <div className="bg-teal-50 rounded-2xl p-4 border border-teal-200">
                  <h4 className="font-semibold text-teal-800 mb-2 flex items-center">
                    <Icon symbol="warning" className="w-5 h-5 mr-2" />
                    Remember
                  </h4>
                  <p className="text-teal-700 text-sm">
                    This is an AI assistant. For emergencies, always contact healthcare professionals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Info Section */}
        <section className="max-w-4xl mx-auto mt-16">
          <div className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-3xl p-8 text-white shadow-2xl">
            <h2 className="text-3xl font-bold mb-4 text-center">
              Why Choose Our Health Assistant?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Icon symbol="robot" className="w-8 h-8 text-blue-200" />
                  <div>
                    <h4 className="font-bold text-lg">AI-Powered Insights</h4>
                    <p className="text-blue-100">Advanced machine learning for accurate health guidance</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Icon symbol="chat" className="w-8 h-8 text-blue-200" />
                  <div>
                    <h4 className="font-bold text-lg">Natural Conversations</h4>
                    <p className="text-blue-100">Speak naturally as you would with a human expert</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Icon symbol="chart" className="w-8 h-8 text-blue-200" />
                  <div>
                    <h4 className="font-bold text-lg">Health Tracking</h4>
                    <p className="text-blue-100">Monitor your symptoms and progress over time</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Icon symbol="globe" className="w-8 h-8 text-blue-200" />
                  <div>
                    <h4 className="font-bold text-lg">Multi-Language</h4>
                    <p className="text-blue-100">Support for multiple languages and dialects</p>
                  </div>
                </div>
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
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-teal-400 rounded-xl flex items-center justify-center">
                <Icon symbol="hospital" className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">AI Health Assistant</span>
            </div>
            
            <div className="text-lg">
              <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent font-semibold">
                Powered by ElevenLabs
              </span>
            </div>
            
            <div className="text-gray-400">
              © 2024 Health Tech Inc. • Your privacy matters
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HealthVoiceAssistant;