import { defineConfig } from 'orval';

export default defineConfig({
  shoppingCartApi: {
    input: {
      // Backend çalışırken Swagger'ın yayınladığı şema URL'i
      target: 'http://localhost:5232/swagger/v1/swagger.json', 
    },
    output: {
      target: './src/api/endpoints.ts', // Üretilecek istek metotlarının ve modellerinin konumu
      client: 'react-query', // Bize doğrudan React Query hook'ları (useQuery, useMutation) üretir
      mode: 'split', // Kodların daha düzenli olması için modelleri ve sorguları ayrı dosyalarda oluşturur
    },
  },
});
