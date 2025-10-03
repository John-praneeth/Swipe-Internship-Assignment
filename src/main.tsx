import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { ConfigProvider } from 'antd'
import { store, persistor } from './store/store'
import App from './App'
import './index.css'

// Check for corrupted localStorage and clear if needed
try {
  const testKey = '__storage_test__';
  localStorage.setItem(testKey, 'test');
  localStorage.removeItem(testKey);
} catch (error) {
  console.error('localStorage is not available or corrupted:', error);
  try {
    localStorage.clear();
  } catch (e) {
    console.error('Could not clear localStorage:', e);
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Provider store={store}>
        <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#1890ff',
              },
            }}
          >
            <App />
          </ConfigProvider>
        </PersistGate>
      </Provider>
    </React.StrictMode>,
  );
} catch (error) {
  console.error('Failed to render app:', error);
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: sans-serif;">
      <h1>Error Loading Application</h1>
      <p>Please try clearing your browser cache and localStorage, then refresh.</p>
      <button onclick="localStorage.clear(); location.reload();">Clear Cache & Reload</button>
    </div>
  `;
}
