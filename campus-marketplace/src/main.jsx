import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { ListingsProvider } from './context/ListingsContext.jsx'
import { UIProvider } from './context/UIContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ListingsProvider>
          <UIProvider>
            <App />
          </UIProvider>
        </ListingsProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
