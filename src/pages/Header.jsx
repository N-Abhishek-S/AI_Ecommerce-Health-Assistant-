import { useState, useRef } from "react";
import { NavLink } from "react-router-dom";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef(null);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { to: "/ecommerce", label: "🛍️ Shop", color: "blue" },
    { to: "/aiassist", label: "🤖 AI Stylist", color: "purple" },
    { to: "/sales-assistant", label: "💬 AI Sales Agent", color: "blue" },
    { to: "/healthvoiceassistant", label: "🏥 Health Analyst", color: "purple" },
    { to: "/customervoiceassistant", label: "🎤 customer-care", color: "purple" },
    { to: "/mainfun", label: "👗 Virtual Try-On", color: "green" },
  ];

  const getNavLinkClass = (isActive, color) => {
    const baseClasses = "px-4 py-2.5 rounded-lg font-medium transition-all duration-200";
    const activeClasses = {
      blue: "bg-blue-50 text-blue-700 border border-blue-200",
      purple: "bg-purple-50 text-purple-700 border border-purple-200",
      green: "bg-green-50 text-green-700 border border-green-200"
    };
    const inactiveClasses = "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent";
    
    return `${baseClasses} ${isActive ? activeClasses[color] : inactiveClasses}`;
  };

  return (
    <header 
      ref={headerRef} 
      className="bg-white backdrop-blur-lg shadow-sm py-4 px-6 sticky top-0 z-50 border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Logo and Mobile Menu */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">AI</span>
            </div>
            <span className="text-xl font-bold text-gray-900">StyleGenius</span>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl w-full order-3 md:order-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search for fashion, styles, or ask AI..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-sm"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2 order-2 md:order-3">
          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 mr-4">
            {navItems.map((item) => (
              <NavLink 
                key={item.to}
                to={item.to} 
                className={({ isActive }) => getNavLinkClass(isActive, item.color)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button className="p-2.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-lg transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            
            <NavLink to="/cart">
              <button className="relative p-2.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-lg transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full h-4 w-4 flex items-center justify-center">3</span>
              </button>
            </NavLink>
            
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            
            <NavLink to="/singin">
              <button className="px-4 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm">
                Sign In
              </button>
            </NavLink>
            
            <NavLink to="/get-started">
              <button className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm shadow-sm">
                Get Started
              </button>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
          <nav className="grid gap-2">
            {navItems.map((item) => (
              <NavLink 
                key={item.to}
                to={item.to} 
                className={({ isActive }) => getNavLinkClass(isActive, item.color)}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            
            <div className="border-t border-gray-100 pt-3 mt-2 grid grid-cols-2 gap-2">
              <NavLink to="/singin">
                <button className="w-full px-4 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm border border-gray-200">
                  Sign In
                </button>
              </NavLink>
              <NavLink to="/get-started">
                <button className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm">
                  Get Started
                </button>
              </NavLink>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;