import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App.jsx";                 // Layout wrapper (Header + Footer + Outlet)
import "./index.css";
import Home from "./pages/Home.jsx";
import Checkout from "./pages/Checkout.jsx";
import Auth from "./pages/Auth.jsx";
import Admin from "./pages/Admin.jsx";
import Cart from "./pages/Cart.jsx";

import SingInForm from "./pages/SignInForm.jsx";            // Make sure file name matches exactly
import ShoP_MainFun from "./pages/ShoP_MainFun.jsx";
import Ai_Assist from "./pages/AIAssistPage.jsx";
import EcommercePage from "./pages/EcommercePage.jsx";
import Index from "./pages/Index.jsx";
import HealthVoiceAssistant from "./pages/HealthVoiceAssistant.jsx";
import CustomerCareVoiceAssistant from "./pages/CustomerCareVoiceAssistant.jsx";

import { CartProvider } from "./context/CartContext.jsx";

function Main() {
  return (
    <StrictMode>
      <CartProvider>
        <BrowserRouter
          basename={import.meta.env.BASE_URL}
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            {/* Parent layout route */}
            <Route path="/" element={<App />}>
              {/* Default (index) route */}
              <Route index element={<Index />} />

              {/* Old routes */}
              <Route path="checkout" element={<Checkout />} />
              <Route path="auth" element={<Auth />} />
              <Route path="admin" element={<Admin />} />
              <Route path="cart" element={<Cart />} />

              {/* New routes */}
              <Route path="singin" element={<SingInForm />} />
              <Route
                path="healthvoiceassistant"
                element={<HealthVoiceAssistant />}
              />
              <Route
                path="customervoiceassistant"
                element={<CustomerCareVoiceAssistant />}
              />
              <Route path="mainfun" element={<ShoP_MainFun />} />
              <Route path="aiassist" element={<Ai_Assist />} />
              <Route path="ecommerce" element={<EcommercePage />} />
              <Route path="homepage" element={<Home />} />

              {/* Catch-all 404 → Home (or Homepage, your choice) */}
              <Route path="*" element={<Home />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById("root")).render(<Main />);
