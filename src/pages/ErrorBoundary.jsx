// src/components/ErrorBoundary.jsx
import React, { Component } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by ErrorBoundary:', error);
      console.error('Error info:', errorInfo);
    }
    
    // You can also log to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null 
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border p-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                <AlertCircle className="text-red-600" size={48} />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Oops! Something went wrong
              </h1>
              
              <p className="text-gray-600 mb-6">
                We encountered an unexpected error. Please try reloading the page.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-3 bg-gray-100 rounded-lg text-left">
                  <p className="text-sm text-red-600 font-mono mb-2">
                    Error: {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <p className="text-xs text-gray-600 font-mono">
                      {this.state.errorInfo.componentStack}
                    </p>
                  )}
                </div>
              )}
              
              <div className="space-y-3">
                <button
                  onClick={this.handleReload}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  <RefreshCw size={20} />
                  Reload Page
                </button>
                
                <button
                  onClick={this.handleReset}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Home size={20} />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;