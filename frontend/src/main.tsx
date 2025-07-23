import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { ClerkProvider } from '@clerk/clerk-react'
// import { BrowserRouter, Routes, Route } from 'react-router'
// import LoginPage from './pages/LoginPage.tsx'

const queryClient = new QueryClient();
// const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// if (!PUBLISHABLE_KEY) {
//   throw new Error('Missing Publishable Key')
// }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <BrowserRouter> */}
      {/* <ClerkProvider publishableKey={PUBLISHABLE_KEY}> */}
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster richColors position='top-right' />
      </QueryClientProvider>
      {/* </ClerkProvider> */}
    {/* </BrowserRouter> */}
  </StrictMode>,
)
