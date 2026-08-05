import React from 'react';
import { useGetApiAdvertisements } from '../api/endpoints';

export default function AdvertisementsModal({ isOpen, onClose }) {
  const { data: response, isLoading, isError } = useGetApiAdvertisements({
    query: {
      enabled: isOpen
    }
  });

  if (!isOpen) return null;

  // Casing-safe data extraction
  const adsData = response?.data?.data ? response.data.data : response?.data;
  const ads = Array.isArray(adsData) ? adsData : [];

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose} 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999 
      }}
    >
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
            maxWidth: '900px', 
            width: '90%', 
            maxHeight: '85vh', 
            overflowY: 'auto',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            borderRadius: '24px'
        }}
      >
        <div className="modal-header" style={{ padding: '24px 32px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#111827', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>🎉</span> Güncel Fırsatlar & Duyurular
          </h2>
          <button className="close-btn" onClick={onClose} style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>×</button>
        </div>
        
        <div className="modal-body" style={{ padding: '32px', minHeight: '300px' }}>
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <p style={{ color: '#6b7280', fontSize: '16px' }}>Kampanyalar yükleniyor...</p>
            </div>
          )}
          
          {isError && (
            <div style={{ textAlign: 'center', color: '#ef4444', background: '#fef2f2', padding: '20px', borderRadius: '12px' }}>
                <p>Fırsatlar alınırken bir hata oluştu. Daha sonra tekrar deneyin.</p>
            </div>
          )}
          
          {!isLoading && !isError && ads.length === 0 && (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: 0.5, marginBottom: '16px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p style={{ fontSize: '18px' }}>Şu an aktif bir kampanya veya duyuru bulunmuyor.</p>
            </div>
          )}

          {!isLoading && ads.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
              {ads.map((ad) => {
                const id = ad.id || ad.Id;
                const title = ad.title || ad.Title;
                const description = ad.description || ad.Description;
                const imageUrl = ad.imageUrl || ad.ImageUrl || '';
                const cleanUrl = imageUrl.trim();
                const createdAt = ad.createdAt || ad.CreatedAt;

                return (
                  <div key={id} style={{ 
                    border: '1px solid #f3f4f6', 
                    borderRadius: '16px', 
                    overflow: 'hidden',
                    background: '#ffffff',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    cursor: 'default',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)';
                  }}
                  >
                    {cleanUrl && (
                      <div style={{ width: '100%', height: '180px', background: '#f9fafb', position: 'relative' }}>
                        <img 
                          src={cleanUrl.startsWith('http') ? cleanUrl : `http://localhost:5233${cleanUrl}`} 
                          alt={title} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          onError={(e) => {
                            e.target.onerror = null; // Sonsuz döngüyü engelle
                            e.target.src = 'https://via.placeholder.com/400x200?text=Gorsel+Yuklenemedi'; // Hata durumunda varsayılan resim
                          }}
                        />
                      </div>
                    )}
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', color: '#111827', fontWeight: '600' }}>{title}</h3>
                        <p style={{ margin: 0, fontSize: '14px', color: '#4b5563', flexGrow: 1, lineHeight: '1.5' }}>{description}</p>
                        
                        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '12px', marginTop: '4px', textAlign: 'right' }}>
                            <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>
                                🔥 {new Date(createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
