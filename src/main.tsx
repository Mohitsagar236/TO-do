import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App';
import './index.css';

// Initialize stores
import { useUserStore } from './store/userStore';
import { useTaskStore } from './store/taskStore';
import { useOfflineStore } from './store/offlineStore';

// Wait for store hydration to complete before rendering
Promise.all([
  useUserStore.persist.rehydrate(),
  useTaskStore.persist.rehydrate(),
  useOfflineStore.persist.rehydrate()
]).then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>
  );
});