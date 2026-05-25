import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import axios from 'axios';
import { decryptPayload, encryptPayload } from './utils/crypto';

// Setup Global Encryption Interceptor
axios.interceptors.request.use(
  async (config) => {
    if (config.data && !(config.data instanceof FormData)) {
      try {
        const encrypted = await encryptPayload(config.data);
        config.data = {
          a: btoa(JSON.stringify(encrypted))
        };
      } catch (error) {
        console.error("Global request encryption interceptor failed:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Setup Global Decryption Interceptor
axios.interceptors.response.use(
  async (response) => {
    if (response.data && response.data.a) {
      try {
        const envelopeStr = atob(response.data.a);
        const envelope = JSON.parse(envelopeStr);
        const decryptedData = await decryptPayload(envelope.data, envelope.iv, envelope.tag);
        response.data = decryptedData;
      } catch (error) {
        console.error("Global decryption interceptor failed:", error);
      }
    }
    return response;
  },
  async (error) => {
    if (error.response && error.response.data && error.response.data.a) {
      try {
        const envelopeStr = atob(error.response.data.a);
        const envelope = JSON.parse(envelopeStr);
        const decryptedData = await decryptPayload(envelope.data, envelope.iv, envelope.tag);
        error.response.data = decryptedData;
      } catch (decryptionError) {
        console.error("Global error decryption failed:", decryptionError);
      }
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);