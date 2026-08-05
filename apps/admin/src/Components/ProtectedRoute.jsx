import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
    // LocalStorage'dan token'ı alıyoruz
    const token = localStorage.getItem('adminToken');

    // Eğer token yoksa (kullanıcı giriş yapmamışsa) onu zorla /login sayfasına yönlendiriyoruz
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Token varsa, gitmek istediği sayfayı (children) gösteriyoruz
    return children;
}
