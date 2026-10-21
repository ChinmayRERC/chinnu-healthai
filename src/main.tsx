import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'
import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  posthog.init('phc_XXXXXXXXXX', {
    api_host: 'https://us.i.posthog.com',
    capture_pageview: true,
    capture_pageleave: true
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
