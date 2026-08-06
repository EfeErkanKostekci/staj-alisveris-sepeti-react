/**
 * Login.jsx (Giriş, Kayıt ve Şifremi Unuttum Ekranı)
 * --------------------------------------------------
 * Bu dosya, tüm kimlik doğrulama işlemlerini ve OTP adımlarını yönetir.
 */
import React, { useState } from 'react';
import {
  usePostApiAuthLogin,
  usePostApiAuthRegister,
  usePostApiAuthVerifyLogin,
  usePostApiAuthVerifyRegister,
  usePostApiAuthForgotPassword,
  usePostApiAuthResetPassword,
  usePostApiAuthResendOtp,
} from '../api/endpoints';

export default function Login({ onLoginSuccess }) {
  // Görünüm Durumu: 'login', 'register', veya 'forgot-password'
  const [view, setView] = useState('login');
  
  // Adım Durumu: 1 (Bilgileri Girme), 2 (OTP Girme)
  const [step, setStep] = useState(1); 
  
  // Form Alanları
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // API İstekleri (Orval Hook'ları)
  const loginMutation = usePostApiAuthLogin();
  const verifyLoginMutation = usePostApiAuthVerifyLogin();
  
  const registerMutation = usePostApiAuthRegister();
  const verifyRegisterMutation = usePostApiAuthVerifyRegister();
  
  const forgotPasswordMutation = usePostApiAuthForgotPassword();
  const resetPasswordMutation = usePostApiAuthResetPassword();
  const resendOtpMutation = usePostApiAuthResendOtp();

  // Ekran değiştiğinde veya Geri dönüldüğünde formu sıfırlar
  const resetForm = () => {
    setStep(1);
    setOtp('');
    setNewPassword('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleViewChange = (newView) => {
    setView(newView);
    resetForm();
  };

  // ================= ADIM 1: İlk İstek (Şifre/E-posta Kontrolü ve OTP İsteği) =================
  const handleStep1Submit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (view === 'login') {
      loginMutation.mutate(
        { data: { email, password } },
        {
          onSuccess: (res) => {
            if (res.data?.data?.requiresOtp) {
              setStep(2);
              setSuccessMsg('Giriş için doğrulama kodu e-postanıza gönderildi.');
            }
          },
          onError: (err) => setErrorMsg('Giriş yapılamadı: ' + err.message)
        }
      );
    } else if (view === 'register') {
      registerMutation.mutate(
        { data: { name, lastName, email, password } },
        {
          onSuccess: (res) => {
            if (res.data?.data?.requiresOtp || res.status === 200) {
              setStep(2);
              setSuccessMsg('Kayıt işlemini tamamlamak için e-postanıza gönderilen kodu girin.');
            }
          },
          onError: (err) => setErrorMsg('Kayıt olunamadı: ' + err.message)
        }
      );
    } else if (view === 'forgot-password') {
      forgotPasswordMutation.mutate(
        { data: { email } },
        {
          onSuccess: () => {
            setStep(2);
            setSuccessMsg('Şifre sıfırlama kodu e-postanıza gönderildi.');
          },
          onError: (err) => setErrorMsg('İşlem başarısız: ' + err.message)
        }
      );
    }
  };

  // ================= ADIM 2: OTP Doğrulama ve İşlemi Tamamlama =================
  const handleStep2Submit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (view === 'login') {
      verifyLoginMutation.mutate(
        { data: { email, otp } },
        {
          onSuccess: (res) => {
            if (res.status >= 200 && res.status < 300) {
              onLoginSuccess(res.data.data);
            }
          },
          onError: (err) => setErrorMsg('Doğrulama başarısız: ' + err.message)
        }
      );
    } else if (view === 'register') {
      verifyRegisterMutation.mutate(
        { data: { email, otp } },
        {
          onSuccess: (res) => {
            if (res.status >= 200 && res.status < 300) {
              handleViewChange('login');
              setSuccessMsg('Kayıt başarıyla tamamlandı! Lütfen giriş yapın.');
            }
          },
          onError: (err) => setErrorMsg('Doğrulama başarısız: ' + err.message)
        }
      );
    } else if (view === 'forgot-password') {
      resetPasswordMutation.mutate(
        { data: { email, otp, newPassword } },
        {
          onSuccess: () => {
            handleViewChange('login');
            setSuccessMsg('Şifreniz başarıyla sıfırlandı! Yeni şifrenizle giriş yapabilirsiniz.');
          },
          onError: (err) => setErrorMsg('Sıfırlama başarısız: ' + err.message)
        }
      );
    }
  };

  const handleResendOtp = () => {
    setErrorMsg('');
    setSuccessMsg('');
    resendOtpMutation.mutate(
      { data: { email } },
      {
        onSuccess: () => {
          setSuccessMsg('Yeni doğrulama kodu e-postanıza gönderildi.');
        },
        onError: (err) => setErrorMsg('Kod gönderilemedi: ' + err.message)
      }
    );
  };

  // Herhangi bir API isteği atılırken yükleme durumunu takip etmek için
  const isPending = 
    loginMutation.isPending || verifyLoginMutation.isPending ||
    registerMutation.isPending || verifyRegisterMutation.isPending ||
    forgotPasswordMutation.isPending || resetPasswordMutation.isPending || resendOtpMutation.isPending;

  return (
    <div className="login-container">
      <div className="login-backdrop"></div>
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <h2>
            {view === 'register' ? 'Hesap Oluştur' : 
             view === 'forgot-password' ? 'Şifremi Unuttum' : 'Giriş Yap'}
          </h2>
          <p>
            {step === 2 
              ? 'Lütfen e-postanıza gelen doğrulama kodunu girin' 
              : view === 'register' ? 'Alışveriş sepetinizi yönetmeye başlayın'
              : view === 'forgot-password' ? 'E-postanızı girin, size sıfırlama kodu gönderelim'
              : 'Sepetlerinize erişmek için giriş yapın'}
          </p>
        </div>

        {successMsg && (
          <div className="login-success" style={{ color: '#039855', marginBottom: '16px', fontSize: '14px', textAlign: 'center', background: '#ECFDF3', padding: '10px', borderRadius: '8px' }}>
            {successMsg}
          </div>
        )}
        
        {errorMsg && <div className="login-error">{errorMsg}</div>}

        {step === 1 ? (
          <form onSubmit={handleStep1Submit} className="login-form">
            {view === 'register' && (
              <div className="form-row">
                <div className="form-group">
                  <label>Ad</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John" required />
                </div>
                <div className="form-group">
                  <label>Soyad</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" required />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>E-posta Adresi</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@mail.com" required />
            </div>

            {view !== 'forgot-password' && (
              <div className="form-group">
                <label>Şifre</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
            )}

            {view === 'login' && (
              <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '15px' }}>
                <span 
                  style={{ fontSize: '12px', color: '#7F56D9', cursor: 'pointer', fontWeight: '500' }} 
                  onClick={() => handleViewChange('forgot-password')}
                >
                  Şifremi Unuttum
                </span>
              </div>
            )}

            <button type="submit" className="login-btn" disabled={isPending}>
              {isPending ? <span className="spinner"></span> : 'Devam Et'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleStep2Submit} className="login-form">
            <div className="form-group">
              <label>Doğrulama Kodu (OTP)</label>
              <input 
                type="text" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                placeholder="Örn: 123456" 
                required 
                maxLength="6" 
                style={{ letterSpacing: '2px', textAlign: 'center', fontSize: '18px' }}
              />
            </div>

            {view === 'forgot-password' && (
              <div className="form-group">
                <label>Yeni Şifre</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" required />
              </div>
            )}

            <button type="submit" className="login-btn" disabled={isPending}>
              {isPending ? <span className="spinner"></span> : 'Doğrula ve Tamamla'}
            </button>
            
            <button 
              type="button" 
              onClick={handleResendOtp}
              disabled={resendOtpMutation.isPending}
              style={{ marginTop: '10px', background: 'transparent', border: 'none', color: '#7F56D9', cursor: 'pointer', width: '100%', fontWeight: '500' }}
            >
              {resendOtpMutation.isPending ? 'Gönderiliyor...' : 'Kodu Tekrar Gönder'}
            </button>
            
            <button 
              type="button" 
              onClick={resetForm} 
              style={{ marginTop: '10px', background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', width: '100%', fontWeight: '500' }}
            >
              Vazgeç ve Geri Dön
            </button>
          </form>
        )}

        {step === 1 && view !== 'forgot-password' && (
          <div className="login-footer">
            <span>{view === 'register' ? 'Zaten hesabınız var mı?' : 'Hesabınız yok mu?'}</span>
            <button
              type="button"
              onClick={() => handleViewChange(view === 'login' ? 'register' : 'login')}
              className="toggle-auth-btn"
            >
              {view === 'register' ? 'Giriş Yap' : 'Kayıt Ol'}
            </button>
          </div>
        )}
        
        {step === 1 && view === 'forgot-password' && (
          <div className="login-footer">
            <button
              type="button"
              onClick={() => handleViewChange('login')}
              className="toggle-auth-btn"
              style={{ margin: '0 auto' }}
            >
              Giriş Ekranına Dön
            </button>
          </div>
        )}
      </div>
    </div>
  );
}