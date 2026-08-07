import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePostApiAuthLogin, usePostApiAuthVerifyLogin } from '../api/endpoints';
import '../index.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [step, setStep] = useState(1); 
  const [otp, setOtp] = useState('');

  const { mutate: verifyLogin, isPending: isVerifyPending } = usePostApiAuthVerifyLogin();
  
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
            // Şifre doğruysa 2. adıma geç!
            alert("Lütfen e-postanıza gelen 6 haneli doğrulama kodunu girin.");
            setStep(2); 
        },
        onError: (err) => {
            alert("Giriş Başarısız: E-posta veya şifre hatalı.");
        }
    });
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    
    verifyLogin({
        data: { email: email, otp: otp }
    }, {
        onSuccess: (response) => {
            if (response.status !== 200) {
                alert("Doğrulama Başarısız!");
                return;
            }

            const actualData = response.data?.data || response.data;
            const userRole = actualData?.role || actualData?.Role;

            // İşte rol kontrolü burada yapılıyor!
            if (userRole !== "Admin" && userRole !== "admin") {
                alert("Güvenlik Duvarı: Bu panele girmeye yetkiniz yok! (Gelen Rol: " + userRole + ")");
                return;
            }
            
            // Eğer Admin ise asıl token'ı kaydet ve içeri al
            localStorage.setItem("adminToken", actualData.token);
            navigate("/");
        },
        onError: (err) => {
            alert("Hata: Kod yanlış veya süresi dolmuş.");
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
        
        {step === 1 ? (
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
              {isPending ? "Kod Gönderiliyor..." : "Devam Et"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifySubmit}>
            <div className="form-group">
              <label>Doğrulama Kodu (OTP)</label>
              <input 
                type="text" 
                className="glass-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Örn: 123456"
                maxLength="6"
                style={{ textAlign: 'center', letterSpacing: '3px', fontSize: '20px' }}
                required 
              />
            </div>
            <button type="submit" className="glass-button" disabled={isVerifyPending}>
              {isVerifyPending ? "Doğrulanıyor..." : "Güvenli Giriş Yap"}
            </button>
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              style={{ marginTop: '15px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', width: '100%', textDecoration: 'underline' }}
            >
              Vazgeç ve Geri Dön
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
