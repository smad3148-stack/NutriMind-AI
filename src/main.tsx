import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { platform } from './lib/platform';
import './lib/crashReporter'; // Installs window-level error interception early

// Register PWA Service Worker if on supported platform
platform.registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

