import React from "react";
import { Outlet } from "react-router-dom";

import Header from "./pages/Header.jsx";
import Footer from "./pages/Footer.jsx";

function App() {
  return (
    <>
      <Header />
      {/* Adjust this min-height if your header/footer heights change */}
      <main className="min-h-[calc(100vh-136px)]">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default App;
