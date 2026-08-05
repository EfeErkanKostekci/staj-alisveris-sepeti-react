import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePostApiAuthLogin } from '../api/endpoints';
import '../index.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  const { mutate: login, isPending } = usePostApiAuthLogin();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    login({
        data: {
            email: email,
            password: password
        }
    }, {
        onSuccess: (response) => {
            // Fetch kullanıldığı için 400/500 hataları da buraya düşer, status'u kontrol etmeliyiz.
            if (response.status !== 200) {
                alert("Giriş Başarısız: E-posta veya şifre hatalı.");
                return;
            }

            const actualData = response.data?.data || response.data;
            console.log("BACKENDDEN GELEN VERI:", actualData);

            const userRole = actualData?.role || actualData?.Role; // C# bazen büyük harf bırakabiliyor

            if (userRole !== "Admin" && userRole !== "admin") {
                alert("Güvenlik Duvarı: Bu panele girmeye yetkiniz yok! (Gelen Rol: " + userRole + ")");
                return;
            }
            
            // Eğer Admin ise token'ı kaydet ve yönlendir
            localStorage.setItem("adminToken", actualData.token);
            navigate("/");
        },
        onError: (err) => {
            alert("Giriş Başarısız: E-posta veya şifre hatalı.");
        }
    });
  };

  return (
    <div className="admin-container">
      <div className="glass-panel" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div className="form-header">
          <h2>Admin Girişi</h2>
          <p>Panele erişmek için yetkili hesabınızla giriş yapın</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>E-posta</label>
            <input 
              type="email" 
              className="glass-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@test.com"
              required 
            />
          </div>

          <div className="form-group">
            <label>Şifre</label>
            <input 
              type="password" 
              className="glass-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>

          <button type="submit" className="glass-button" disabled={isPending}>
            {isPending ? "Giriş Yapılıyor..." : "Güvenli Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
