/**
 * main.jsx (Uygulamanın Başlangıç Noktası)
 * ----------------------------------------
 * Bu dosya, React uygulamasının DOM'a monte edildiği ve başlatıldığı yerdir.
 * React Query (QueryClientProvider) gibi genel sağlayıcıları (providers) barındırır.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'

// Global Fetch Interceptor: localStorage'da token varsa otomatik olarak tüm API isteklerine ekler
const originalFetch = window.fetch;
window.fetch = async (url, options) => {
  const token = localStorage.getItem('token');
  if (token) {
    options = options || {};
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };

    // Eğer gönderilen veri FormData ise (yani dosya yüklüyorsak) Content-Type eklemiyoruz
    // Tarayıcı bunu multipart/form-data olarak kendisi otomatik ayarlayacak.
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    options.headers = headers;
  }
  
  const res = await originalFetch(url, options);
  
  // Eğer yanıt HTTP 2xx dışında bir hata kodu içeriyorsa hata fırlatıyoruz
  if (!res.ok) {
    let errorMsg = `HTTP error! Status: ${res.status}`;
    try {
      const clonedRes = res.clone(); // Gövdenin tekrar okunabilmesi için klonluyoruz
      const text = await clonedRes.text();
      const obj = JSON.parse(text);
      errorMsg = obj.message || text || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }
  
  return res;
};

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
          <App />
    </QueryClientProvider>
  </StrictMode>,
)
