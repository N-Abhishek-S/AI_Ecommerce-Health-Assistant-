import React, { useState, useEffect, useRef } from 'react';
import { processUserMessage } from '../services/salesBot';
import ProductCard from './ProductCard'; // Reuse existing ProductCard

const SalesAssistant = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: "Hi! I'm your AI Shopping Assistant. Looking for something specific? Try 'Red shirts for men' or 'Watches under 2000'." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      // Optional: Auto-send after voice? Let's just fill input for review
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Simulate network delay
      await new Promise(r => setTimeout(r, 600));
      
      const response = await processUserMessage(userMsg.text);
      
      const botMsg = { 
        id: Date.now() + 1, 
        sender: 'bot', 
        text: response.text,
        products: response.products
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Bot Error:", error);
      setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: "Sorry, I encountered an error processing your request." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-4">
      <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col bg-white shadow-xl rounded-2xl overflow-hidden my-4 border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">🤖</div>
            <div>
              <h1 className="font-bold text-lg">AI Sales Assistant</h1>
              <p className="text-xs text-white/80">Always here to help you shop</p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div 
                className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-purple-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
              
              {/* Product Recommendations */}
              {msg.products && msg.products.length > 0 && (
                <div className="mt-4 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {msg.products.map(product => (
                    <div key={product.id} className="transform scale-95 origin-top-left">
                       {/* Passing simplified product prop if needed, or ensuring ProductCard handles it */}
                       <ProductCard product={product} /> 
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-start">
              <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask for fashion advice (e.g. 'Blue shirts under 1500')..."
              className="flex-grow px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 transition-all"
            />
            <button
              onClick={handleVoiceInput}
              className={`p-3 rounded-xl transition-all ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Voice Input"
            >
              🎤
            </button>
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAssistant;
