/**
 * Kullanıcının login olduktan sonra karşısına çıkan sayfa
 * Bu sayfada kullanıcının varsa listeleri ekrana getirilir eğer yoksa ekranda bir görsel ve ekleme butonuna giden bir ok gösterilir.
 */
import './Dashboard.css';

export default function Dashboard({ lists, activeTab, onSelectList, onCreateList, onToggleDraft }) {
  return (
    <div className="dashboard-container">
      {lists.length === 0 ? (
        // Ekranın boş olduğu durumda gösterilecek olan kısım. className = "empty-state" çünkü sadece ekran boş olduğunda çağrılacak
        <div className="empty-state">
          <div className="empty-illustration">
            {/* Liste olmadığı durumda ekranda gösterilecek resim */}
            <svg
              width="180"
              height="180"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="20" y="50" width="160" height="110" rx="16" fill="#F4EBFF" />
              <path
                d="M20 70C20 58.9543 29.0457 50 40 50H85L105 70H180V160H20V70Z"
                fill="#D6BBFB"
                opacity="0.7"
              />
              <path
                d="M40 70H160C171.046 70 180 79.0457 180 90V150C180 161.046 171.046 170 160 170H40C28.9543 170 20 161.046 20 150V90C20 79.0457 28.9543 70 40 70Z"
                fill="#7F56D9"
              />
              <circle cx="100" cy="120" r="24" fill="#F4EBFF" opacity="0.3" />
              <path
                d="M92 120H108M100 112V128"
                stroke="#F4EBFF"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
          {/* Liste olmadığı durumda ekranda gözükecek yazılar ve ok */}
          <h3 className="empty-title">Start by creating list</h3>
          <p className="empty-description">
            Your smart shopping list will shown here, start by creating a new list.
          </p>
          <div className="arrow-pointer">
            <svg
              width="80"
              height="80"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 20C40 50 50 70 80 80"
                stroke="#7F56D9"
                strokeWidth="2"
                strokeDasharray="5 5"
                strokeLinecap="round"
              />
              <path
                d="M80 80L70 72M80 80L75 90"
                stroke="#7F56D9"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      ) : (
        // Eğer veritabanından liste geri dönüyorsa burada ekrana yazılacak. className = "lists-stack" çünkü sadece liste varsa gözükecek
        <div className="lists-stack">
          {lists.map((list) => {
            const totalItems = list.items.length; // Listenin içindeki elemanların sayısını alıyoruz.
            const completedItems = list.items.filter((item) => item.checked).length; // Listenin içindeki elemanların kaçının tamamlandığını alıyoruz.

            return (
              // Geriye bir kart ve kartın içinde listenin bilgilerini döndürüyoruz.
              <div key={list.id} className="list-card" onClick={() => onSelectList(list.id)}>
                <div className="card-top">
                  <div className="card-info">
                    <h3 className="card-title">{list.title}</h3>

                    {/* Ortak Çalışan Avatarları */}
                    <div className="collaborators">
                      {list.sharedWith.map((user, idx) => {
                        // Eğer liste biriyle paylaşıldıysa o kullanıcının ismini alıyoruz ve istediğimiz formata getiriyoruz.
                        const initials = user.name
                          ? user.name
                              .split(' ')
                              .map((w) => w[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)
                          : '?';
                        return (
                          // Geriye ise kullanıcının avatarını döndürüp ekrana yazdırıyoruz
                          <div
                            key={idx}
                            className="collab-avatar collab-avatar-initials"
                            title={user.name}
                            style={{
                              zIndex: list.sharedWith.length - idx,
                              backgroundImage: user.profilePictureUrl
                                ? `url(${user.profilePictureUrl})`
                                : 'none',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              color: user.profilePictureUrl ? 'transparent' : undefined,
                            }}
                          >
                            {initials}
                          </div>
                        );
                      })}
                      {/*  */}
                      {list.sharedWith.length > 1 && ( // Ortak kullanıcıların sayısını alıyoruz.
                        <span className="collab-more">+{list.sharedWith.length}</span>
                      )}
                    </div>
                  </div>

                  {/* Kartın sağ üstündeki favorileme butonu */}
                  <button
                    className="favorite-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleDraft(list.id);
                    }}
                    aria-label="Add to favorites"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      fill={list.isDraft ? '#FFD700' : 'currentColor'}
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                </div>

                {/* Detay Bilgileri Satırı */}
                <div className="card-details-row">
                  {/* Liste İkonu ve Tamamlanan Öğe Sayısı */}
                  <div className="detail-item">
                    <svg
                      className="detail-icon"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="8" y1="6" x2="21" y2="6" strokeLinecap="round" />
                      <line x1="8" y1="12" x2="21" y2="12" strokeLinecap="round" />
                      <line x1="8" y1="18" x2="21" y2="18" strokeLinecap="round" />
                      <line x1="3" y1="6" x2="3.01" y2="6" strokeLinecap="round" strokeWidth="3" />
                      <line
                        x1="3"
                        y1="12"
                        x2="3.01"
                        y2="12"
                        strokeLinecap="round"
                        strokeWidth="3"
                      />
                      <line
                        x1="3"
                        y1="18"
                        x2="3.01"
                        y2="18"
                        strokeLinecap="round"
                        strokeWidth="3"
                      />
                    </svg>
                    <span>
                      List {completedItems}/{totalItems} Completed
                    </span>
                  </div>

                  {/* Kategori Etiketi ve İkonu */}
                  <div className="detail-item">
                    <svg
                      className="detail-icon"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <line x1="7" y1="7" x2="7.01" y2="7" strokeLinecap="round" strokeWidth="3" />
                    </svg>
                    <span>{list.tag}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sağ Alttaki Ekleme Butonu */}
      <button className="floating-add-btn" onClick={onCreateList} aria-label="Create new list">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
          <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
