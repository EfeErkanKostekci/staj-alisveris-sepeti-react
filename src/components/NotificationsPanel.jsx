/**
 * NotificationsPanel.jsx (Bildirimler Paneli)
 * -------------------------------------------
 * Bu dosya, kullanıcı çan ikonuna tıkladığında sağ taraftan veya menü üzerinden açılan bildirim penceresidir.
 * 
 * Ne işe yarar?
 * 1. Kullanıcıya gelen "Sizi ... listesine davet etti" şeklindeki paylaşımları (Pending invites) gösterir.
 * 2. Davetleri Kabul Et (Accept) veya Reddet (Decline) düğmelerini barındırır.
 */
import './NotificationsPanel.css';

export default function NotificationsPanel({ invites, onAccept, onDecline, onClose }) {
    return (
        <div className="notif-backdrop" onClick={onClose}>
            <div className="notif-panel" onClick={(e) => e.stopPropagation()}>
                <div className="notif-header">
                    <h3>Bildirimler</h3>
                    {invites.length > 0 && (
                        <span className="notif-count-badge">{invites.length}</span>
                    )}
                </div>

                {invites.length === 0 ? (
                    <div className="notif-empty">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p>Bekleyen davet yok</p>
                    </div>
                ) : (
                    <div className="notif-list">
                        {invites.map((invite) => (
                            <div key={invite.id} className="notif-card">
                                <div className="notif-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" strokeLinecap="round" strokeLinejoin="round"/>
                                        <polyline points="16 6 12 2 8 6" strokeLinecap="round" strokeLinejoin="round"/>
                                        <line x1="12" y1="2" x2="12" y2="15" strokeLinecap="round"/>
                                    </svg>
                                </div>
                                <div className="notif-content">
                                    <p className="notif-message">
                                        <strong>{invite.inviterName}</strong> sizi{' '}
                                        <strong>"{invite.listTitle}"</strong> listesine davet etti
                                    </p>
                                    <p className="notif-meta">
                                        {invite.inviterEmail} · {invite.role === 'Edit' ? 'Düzenleme' : 'Görüntüleme'} yetkisi
                                    </p>
                                    <div className="notif-actions">
                                        <button
                                            className="notif-accept-btn"
                                            onClick={() => onAccept(invite.id)}
                                        >
                                            Kabul Et
                                        </button>
                                        <button
                                            className="notif-decline-btn"
                                            onClick={() => onDecline(invite.id)}
                                        >
                                            Reddet
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
