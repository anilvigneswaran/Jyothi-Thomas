import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'

// Per specification: Set Vite base to './' and do not use React StrictMode.
const rootElement = document.getElementById('root')
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<App />)
}
