import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/app/api';
import { App } from '@/app/App';
// Geist (latin and latin-ext for Polish letters, among others); the browser downloads only the subsets it uses.
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
