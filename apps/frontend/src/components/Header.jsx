/**
 * Bu dosya uygulamanın en üst kısmında yer alan başlık (Header) alanını oluşturur.
 *
 * Sol üstte kullanıcının profil resmini (adının baş harflerinden oluşan avatar) gösterir.
 * Uygulamanın adını ("Shared List") ortada barındırır.
 * Sağ üst köşede bildirim çanını gösterir ve gelen davet (invite) sayısını kırmızı bir rozetle (badge) belirtir.
 */
import { useRef, useState, useEffect } from 'react';
import './Header.css';

export default function Header({
  userName,
  userEmail,
  onLogout,
  onBellClick,
  onAwardClick,
  inviteCount = 0,
  profilePictureUrl,
  onProfilePicUpload,
  onDeleteAccount,
}) {
  // Kullanıcının ad ve soyadının baş harflerini alıp dairesel avatar içinde gösteriyoruz
  const getInitials = (name) => {
    if (!name) return 'U'; // Eğer bir şekilde isim yoksa Unknown "U" gösteriyoruz
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownTimeoutRef = useRef(null);

  const handleUserInfoClick = () => {
    setShowDropdown(true);

    // Varsa eski sayacı iptal et
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }

    // 3 saniye sonra dropdown'ı otomatik kapat
    dropdownTimeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 3000);
  };

  // Bileşen silindiğinde hafızada sayaç kalmasın diye temizliyoruz
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    };
  }, []);

  const fileInputRef = useRef(null);
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Dosya boyutu en fazla 3 MB olabilir!');
      e.target.value = null;
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Lütfen sadece resim (jpeg, png) yükleyin!');
      e.target.value = null;
      return;
    }

    if (onProfilePicUpload) {
      onProfilePicUpload(file);
    }
  };

  return (
    // Sol tarafta sadece kullanıcı adı, e-postası ve fotosu olduğu için onları döndürür.
    <header className="header-container">
      <div className="left-side">
        {/* 1. Tıklanabilir Avatar Kutusu */}
        <div
          className="user-avatar-initials"
          onClick={() => fileInputRef.current.click()}
          style={{
            cursor: 'pointer',
            backgroundImage: profilePictureUrl ? `url(${profilePictureUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          title="Profil Fotoğrafını Değiştir"
        >
          {/* Eğer resim URL'si yoksa baş harfleri göster */}
          {!profilePictureUrl && getInitials(userName)}
        </div>
        {/* 2. Kullanıcının görmeyeceği ama dosya seçmesini sağlayan gizli alan */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/jpeg, image/png"
          onChange={handleFileChange}
        />
        <div
          className="user-info"
          onClick={handleUserInfoClick}
          style={{ cursor: 'pointer', position: 'relative' }}
        >
          <h4 className="user-name">{userName || 'Kullanıcı'}</h4>
          <p className="user-email">{userEmail || 'user@email.com'}</p>

          {/* Çıkış Yap Dropdown'u */}
          {showDropdown && onLogout && (
            <div
              className="user-dropdown"
              onClick={(e) => e.stopPropagation()} 
              onMouseEnter={() => clearTimeout(dropdownTimeoutRef.current)} 
              onMouseLeave={handleUserInfoClick} 
              style={{
                position: 'absolute',
                top: '100%',
                left: '0',
                marginTop: '8px',
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: '8px',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column', // Öğeleri alt alta dizer
                gap: '0px',
              }}
            >
              {/* SADECE ÇIKIŞ YAP KISMI */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '4px 0'
                }}
                onClickCapture={onLogout} // <-- SADECE KENDİ DİVİNDE!
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f04438"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span style={{ color: '#f04438', fontSize: '14px', fontWeight: '500' }}>
                  Çıkış Yap
                </span>
              </div>
               {/* SADECE HESABIMI SİL KISMI */}
              <div
                className="user-dropdown-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  marginTop: '4px',
                  paddingTop: '8px',
                  borderTop: '1px solid #f0f0f0'
                }}
                onClickCapture={onDeleteAccount} // <-- SADECE KENDİ DİVİNDE!
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f04438" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span style={{ color: '#f04438', fontSize: '14px', fontWeight: '500' }}>
                  Hesabımı Sil
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="right-side">
        {/* Ödül/Madalya Butonu */}
        <button className="icon-button award-btn" aria-label="Award badge" onClick={onAwardClick}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Bildirim Zili Butonu */}
        <button className="icon-button bell-btn" aria-label="Notifications" onClick={onBellClick}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13.73 21a2 2 0 0 1-3.46 0"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {inviteCount > 0 && (
            <span className="bell-badge bell-badge-active">
              {inviteCount > 9 ? '9+' : inviteCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
