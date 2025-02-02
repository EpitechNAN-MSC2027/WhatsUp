import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ConnexionMain from './connexion/connexion-main.jsx';
import App from './chat/app.jsx';
import AvatarCustomization from './avatar.jsx';
import './style.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<ConnexionMain />} />
        <Route path="/chat" element={<App />} />
        <Route path="/avatar-customization" element={<AvatarCustomization />} />
        <Route path="/" element={<Navigate to="/chat" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
