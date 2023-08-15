import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Station from "./pages/Station";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<Home />} />
          <Route path="stations/:stationCode" element={<Station />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
