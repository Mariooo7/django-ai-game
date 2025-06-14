import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext.jsx'; // <-- 导入 AuthProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> {/* <-- 在这里包裹 App 组件 */}
      <App />
    </AuthProvider>
  </React.StrictMode>,
)