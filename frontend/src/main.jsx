import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import axios from 'axios'
import './index.css'
import App from './App.jsx'
import useAuthStore from './store/useAuthStore'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const normalizeUrl = (url) => {
  if (typeof url !== 'string') return url
  return url.replace('http://localhost:8000/api/v1', 'http://localhost:8000/api')
}

const attachAuthHeader = (headers = {}) => {
  const token = useAuthStore.getState().accessToken
  if (!token) return headers
  if (headers.Authorization) return headers
  return { ...headers, Authorization: `Bearer ${token}` }
}

// Patch global fetch for legacy Faculty pages that still use fetch directly.
const nativeFetch = window.fetch.bind(window)
window.fetch = (input, init = {}) => {
  let nextInput = input
  if (typeof input === 'string') {
    nextInput = normalizeUrl(input)
  } else if (input instanceof Request) {
    nextInput = new Request(normalizeUrl(input.url), input)
  }

  const headers = attachAuthHeader(init.headers || {})
  return nativeFetch(nextInput, { ...init, headers })
}

// Patch default axios instance for modules importing `axios` directly.
axios.interceptors.request.use((config) => {
  config.url = normalizeUrl(config.url)
  config.headers = attachAuthHeader(config.headers || {})

  if (typeof config.url === 'string' && config.url.startsWith('/')) {
    config.baseURL = API_BASE
  }

  return config
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
