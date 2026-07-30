/**
 * Login.jsx (Giriş ve Kayıt Ekranı)
 * ---------------------------------
 * Bu dosya, uygulamanın giriş ve kayıt olma formlarını (Auth) yönetir.
 * 
 * Ne işe yarar?
 * 1. Kullanıcının e-posta ve şifresiyle sisteme girmesini sağlar (Login).
 * 2. Yeni kullanıcıların kayıt olmasını sağlar (Register).
 * 3. İşlem başarılı olduğunda Token (JWT) alıp tarayıcıya (localStorage) kaydeder.
 */
import React, { useState } from 'react';
import { usePostApiAuthLogin, usePostApiAuthRegister } from '../api/endpoints';

export default function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loginMutation = usePostApiAuthLogin();
  const registerMutation = usePostApiAuthRegister();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isRegister) {
      registerMutation.mutate({
        data: { name, lastName, email, password }
      }, {
        onSuccess: (regRes) => {
          // HTTP durum kodu 200 ile 299 arasındaysa kayıt başarılıdır
          if (regRes.status >= 200 && regRes.status < 300) {
            // Kayıt başarılıysa kullanıcıyı otomatik olarak giriş yaptırıyoruz
            loginMutation.mutate({
              data: { email, password }
            }, {
              onSuccess: (logRes) => {
                if (logRes.status >= 200 && logRes.status < 300) {
                  onLoginSuccess(logRes.data.data);
                } else {
                  setErrorMsg("Giriş yapılamadı: " + (logRes.data?.message || "E-posta veya şifre hatalı."));
                }
              },
              onError: (err) => {
                setErrorMsg("Giriş yapılamadı: " + err.message);
              }
            });
          } else {
            // Kayıt başarısızsa backend'den dönen hata mesajını gösteriyoruz
            setErrorMsg("Kayıt olunamadı: " + (regRes.data?.message || "Geçersiz bilgiler veya e-posta kullanımda."));
          }
        },
        onError: (err) => {
          setErrorMsg("Kayıt olunamadı: " + err.message);
        }
      });
    } else {
      loginMutation.mutate({
        data: { email, password }
      }, {
        onSuccess: (logRes) => {
          if (logRes.status >= 200 && logRes.status < 300) {
            onLoginSuccess(logRes.data.data);
          } else {
            setErrorMsg("Giriş yapılamadı: " + (logRes.data?.message || "E-posta adresi veya şifre hatalı."));
          }
        },
        onError: (err) => {
          setErrorMsg("Giriş yapılamadı: " + err.message);
        }
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-backdrop"></div>
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <h2>{isRegister ? 'Hesap Oluştur' : 'Giriş Yap'}</h2>
          <p>{isRegister ? 'Alışveriş sepetinizi yönetmeye başlayın' : 'Sepetlerinize erişmek için giriş yapın'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && (
            <div className="form-row">
              <div className="form-group">
                <label>Ad</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John"
                  required
                />
              </div>
              <div className="form-group">
                <label>Soyad</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>E-posta Adresi</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {errorMsg && <div className="login-error">{errorMsg}</div>}

          <button type="submit" className="login-btn" disabled={loginMutation.isPending || registerMutation.isPending}>
            {loginMutation.isPending || registerMutation.isPending ? (
              <span className="spinner"></span>
            ) : (
              isRegister ? 'Kayıt Ol ve Giriş Yap' : 'Giriş Yap'
            )}
          </button>
        </form>

        <div className="login-footer">
          <span>{isRegister ? 'Zaten hesabınız var mı?' : 'Hesabınız yok mu?'}</span>
          <button onClick={() => { setIsRegister(!isRegister); setErrorMsg(''); }} className="toggle-auth-btn">
            {isRegister ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </div>
      </div>
    </div>
  );
}
