import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/context.jsx";
import Dashboard from "./pages/dashboard.jsx";
import FormViewer from "./pages/formViewer.jsx";
import ResponsesList from "./pages/responseList.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/form/:formId" element={<FormViewer />} />
          <Route path="/responses/:formId" element={<ResponsesList />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
