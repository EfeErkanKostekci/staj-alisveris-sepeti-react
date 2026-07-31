/**
 * Bu dosya, kullanıcı arayüzünde diğer içeriklerin üzerinde açılan (popup/modal) pencereleri barındırır.
 * 
 * İçerisindeki Bileşenler:
 * 1. EditItemModal: Yeni bir ürün eklerken veya var olan bir ürünü düzenlerken kullanılan detay formu.
 * 2. ShareListModal: Listeyi başka kullanıcılara davet göndermek ve kimlerin listeye dahil olduğunu yönetmek için kullanılır. Sadece liste sahibi davet atabilir veya rolleri değiştirebilir.
 * 3. ListOptionsMenu: Listenin sağ üst köşesindeki 3 noktaya tıklanınca açılan menü (Listeyi kopyalama, tamamlananları silme, listeyi silme).
 */
import { useState, useEffect } from 'react';
import './Modals.css';

// ==========================================
// 1. ÜRÜN DÜZENLEME MODALI (Screen 6 & 7)
// ==========================================
export function EditItemModal({ isOpen, item, onClose, onSave, onDelete }) {
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('Pieces');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');

    // Modal her açıldığında seçili ürün bilgilerini form doldursun
    useEffect(() => {
        if (item) {
            setName(item.name || '');
            setQuantity(item.quantity || 1);
            setUnit(item.unit || 'Pieces');
            setPrice(item.price || 0);
            setDescription(item.description || '');
        }
    }, [item, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...item,
            name,
            quantity: Number(quantity),
            unit,
            price: Number(price),
            description
        });
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{item?.id ? 'Edit Item' : 'Add New Item'}</h3>
                    <button className="close-modal-btn" onClick={onClose} aria-label="Close">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                            <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Item name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Butter"
                        />
                    </div>

                    <div className="form-row-grid">
                        <div className="form-group">
                            <label>Quantity</label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="0002"
                            />
                        </div>
                        <div className="form-group">
                            <label>Unit</label>
                            <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                                <option value="Pieces">Pieces</option>
                                <option value="Pack">Pack</option>
                                <option value="Litre">Litre</option>
                                <option value="Kg">Kg</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            rows="3"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter a description..."
                        />
                    </div>

                    <div className="form-actions">
                        {item?.id && (
                            <button
                                type="button"
                                className="delete-item-action-btn"
                                onClick={() => onDelete(item.id)}
                            >
                                Delete Item
                            </button>
                        )}
                        <button type="submit" className="save-item-btn">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ==========================================
// 2. LİSTEYİ PAYLAŞMA MODALI (Screen 8)
// ==========================================
export function ShareModal({ isOpen, list, onClose, onAddCollaborator, onChangePermission, onInvite }) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('Edit');
    const [isSending, setIsSending] = useState(false);
    const [sendMsg, setSendMsg] = useState('');
    const [collaborators, setCollaborators] = useState([]);

    const fetchCollaborators = async () => {
        try {
            const res = await fetch(`/api/ListShares/list/${list.id}/collaborators`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const responseJson = await res.json();
                const mapped = responseJson.data.map(share => ({
                    id: share.id,
                    name: share.inviteeName || 'Unknown',
                    email: share.inviteeEmail || '...',
                    role: share.role,
                    status: share.status,
                    isOwner: share.role === 'Owner',
                    avatar: share.profilePictureUrl ? share.profilePictureUrl : `https://api.dicebear.com/7.x/notionists/svg?seed=${share.inviteeEmail}`
                }));
                setCollaborators(mapped);
            }
        } catch (err) {
            console.error('Failed to fetch collaborators:', err);
        }
    };

    useEffect(() => {
        if (isOpen && list) {
            fetchCollaborators();
        }
    }, [isOpen, list]);

    if (!isOpen || !list) return null;

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setIsSending(true);
        setSendMsg('');
        try {
            if (onInvite) {
                await onInvite(list.id, email.trim(), role);
                setSendMsg('✅ Davet gönderildi!');
                fetchCollaborators(); // Listeyi yenile
            } else if (onAddCollaborator) {
                onAddCollaborator(list.id, email.trim(), role);
            }
            setEmail('');
        } catch (err) {
            setSendMsg('❌ ' + (err.message || 'Davet gönderilemedi.'));
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Share</h3>
                    <button className="close-modal-btn" onClick={onClose} aria-label="Close">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                            <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* E-posta davet alanı - Sadece liste sahibi görebilir */}
                {list?.currentUserRole === 'Owner' && (
                    <form onSubmit={handleInvite} className="share-invite-form">
                        <div className="share-input-row">
                            <input
                                type="email"
                                required
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isSending}
                            />
                            <select value={role} onChange={(e) => setRole(e.target.value)} className="role-select" disabled={isSending}>
                                <option value="Edit">Edit</option>
                                <option value="View">View</option>
                            </select>
                            <button type="submit" className="invite-action-btn" disabled={isSending}>
                                {isSending ? '...' : 'Invite'}
                            </button>
                        </div>
                        {sendMsg && (
                            <p style={{ fontSize: '12px', marginTop: '8px', padding: '0 2px', color: sendMsg.startsWith('✅') ? '#12b76a' : '#f04438' }}>
                                {sendMsg}
                            </p>
                        )}
                    </form>
                )}

                {/* Davetliler Listesi */}
                <div className="invites-section">
                    <h4 className="invites-title">Invites</h4>
                    <div className="invites-list">
                        {collaborators.map((user, idx) => (
                            <div key={user.id || idx} className="invite-user-row">
                                <div className="user-left">
                                    <img src={user.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.email}`} alt={user.name} className="invite-avatar" />
                                    <div className="invite-user-details">
                                        <span className="invite-user-name">
                                            {user.name} 
                                            {user.status === 'Pending' && <span style={{ fontSize: '10px', color: '#f79009', marginLeft: '6px' }}>(Pending)</span>}
                                        </span>
                                        <span className="invite-user-email">{user.email}</span>
                                    </div>
                                </div>

                                <div className="user-right">
                                    {user.isOwner ? (
                                        <span className="owner-badge">Owner</span>
                                    ) : (
                                        <select
                                            value={user.role || 'Edit'}
                                            onChange={(e) => {
                                                if (onChangePermission) {
                                                    onChangePermission(user.id, e.target.value);
                                                }
                                            }}
                                            className="role-inline-select"
                                            disabled={list?.currentUserRole !== 'Owner'}
                                        >
                                            <option value="Edit">Edit</option>
                                            <option value="View">View</option>
                                            <option value="Remove">Remove</option>
                                        </select>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// 3. LİSTE SEÇENEKLERİ MENÜSÜ (Dropdown) (item Po...)
// ==========================================
export function ListOptionsMenu({ isOpen, list, onClose, onClearChecked, onCopyList, onDeleteList }) {
    if (!isOpen || !list) return null;

    const isOwner = list.currentUserRole === "Owner";

    return (
        <div className="dropdown-backdrop" onClick={onClose}>
            <div className="options-dropdown-card" onClick={(e) => e.stopPropagation()}>
                {list.canEdit && (
                    <button className="dropdown-option-btn" onClick={() => { onClearChecked(); onClose(); }}>
                        Clear Checked Items
                    </button>
                )}
                <button className="dropdown-option-btn" onClick={() => { onCopyList(); onClose(); }}>
                    Copy List
                </button>
                {isOwner && (
                    <button className="dropdown-option-btn delete-option" onClick={() => { onDeleteList(); onClose(); }}>
                        Delete
                    </button>
                )}
            </div>
        </div>
    );
}
