/**
 * Bu dosya uygulamanın en üst kısmında yer alan başlık (Header) alanını oluşturur.
 * 
 * Sol üstte kullanıcının profil resmini (adının baş harflerinden oluşan avatar) gösterir.
 * Uygulamanın adını ("Shared List") ortada barındırır.
 * Sağ üst köşede bildirim çanını gösterir ve gelen davet (invite) sayısını kırmızı bir rozetle (badge) belirtir.
 */
import './Header.css';

export default function Header({ userName, userEmail, onLogout, onBellClick, inviteCount = 0 }) {
  // Kullanıcının ad ve soyadının baş harflerini alıp dairesel avatar içinde gösteriyoruz
  const getInitials = (name) => {
    if (!name) return 'U'; // Eğer bir şekilde isim yoksa Unknown "U" gösteriyoruz
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    // Sol tarafta sadece kullanıcı adı, e-postası ve fotosu olduğu için onları döndürür.
    <header className="header-container">
      <div className="left-side">
        <div className="user-avatar-initials">
          {getInitials(userName)}
        </div>
        <div className="user-info">
          <h4 className="user-name">{userName || 'Kullanıcı'}</h4>
          <p className="user-email">{userEmail || 'user@email.com'}</p>
        </div>
      </div>

      {/* Sağ tarafta bulunan çıkış yapma, madalya ve bildirim butonlarını buldurduğu için onları döndürüyoruz. */}
      <div className="right-side"> 
        {/* Çıkış Yap (Logout) Butonu */}
        {onLogout && (
          <button className="icon-button logout-btn" onClick={onLogout} aria-label="Logout" title="Çıkış Yap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        )}

        {/* Ödül/Madalya Butonu */}
        <button className="icon-button award-btn" aria-label="Award badge">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Bildirim Zili Butonu */}
        <button className="icon-button bell-btn" aria-label="Notifications" onClick={onBellClick}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {inviteCount > 0 && (
            <span className="bell-badge bell-badge-active">{inviteCount > 9 ? '9+' : inviteCount}</span>
          )}
        </button>
      </div>
    </header>
  );
}
