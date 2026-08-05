/**
 * Bu dosya, belirli bir alışveriş listesinin içine girildiğinde ekranda görünen arayüzü temsil eder.
 *
 * Seçili listeye ait ürünleri gösterir ve ürünlere tik atılıp (tamamlandı) atılmadığını yönetir.
 * Yeni ürün eklemek için bir giriş alanı (input) sunar. Yazarken otomatik tamamlama (autocomplete) özelliği sunar.
 * Ürünlerin düzenlenmesi veya silinmesi için gerekli düğmeleri barındırır.
 * Liste başlığını ve etiketini güncellemeyi sağlar.
 * Kullanıcının listeyi düzenleme yetkisi yoksa ("View" rolü) girdi alanlarını kilitler.
 */
import { useState, useRef, useEffect } from 'react';
import './ListDetail.css';

// Autocomplete için önerilen ürün listesi
const SUGGESTIONS_DICTIONARY = [
  'Milk',
  'Eggs',
  'Butter',
  'Garlic Butter',
  'Peanut Butter',
  'Amul Butter',
  'Cheese',
  'Tofu',
  'Onions',
  'Yogurt',
  'Bread',
  'Coffee',
  'Olive Oil',
  'Tomatoes',
  'Lettuce',
  'Beef patties',
  'Buns',
  'Charcoal',
];

export default function ListDetail({
  list,
  onBack,
  onToggleItem,
  onAddItem,
  onEditItem,
  onOpenShare,
  onOpenOptions,
  onUpdateList,
}) {
  const [isAddingInline, setIsAddingInline] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const inputRef = useRef(null);

  // Başlık ve Etiket düzenleme state'leri
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(list.title);
  const [isEditingTag, setIsEditingTag] = useState(false);
  const [tagInput, setTagInput] = useState(list.tag || '');

  // Başka listeye geçildiğinde input değerlerini sıfırlıyoruz
  useEffect(() => {
    setTitleInput(list.title);
    setTagInput(list.tag || '');
  }, [list]);

  const totalItems = list.items.length;
  const completedItems = list.items.filter((item) => item.checked).length;

  // Input değeri değiştikçe önerileri filtrele
  useEffect(() => {
    if (inputValue.trim() === '') {
      setFilteredSuggestions([]);
    } else {
      const filtered = SUGGESTIONS_DICTIONARY.filter(
        (item) =>
          item.toLowerCase().includes(inputValue.toLowerCase()) &&
          !list.items.some((existing) => existing.name.toLowerCase() === item.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    }
  }, [inputValue, list.items]);

  // Ekleme moduna geçildiğinde input'a odaklan
  useEffect(() => {
    if (isAddingInline && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingInline]);

  const handleAddItem = (itemName) => {
    if (!itemName.trim()) return;
    onAddItem(list.id, itemName.trim());
    setInputValue('');
    setIsAddingInline(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddItem(inputValue);
    } else if (e.key === 'Escape') {
      setIsAddingInline(false);
    }
  };

  const handleTitleDoubleClick = () => {
    if (list.canEdit) {
      setIsEditingTitle(true);
      setIsEditingTag(false);
    }
  };

  const handleTagDoubleClick = () => {
    if (list.canEdit) {
      setIsEditingTag(true);
      setIsEditingTitle(false);
    }
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (titleInput.trim() !== list.title && list.canEdit) {
      onUpdateList(list.id, { title: titleInput.trim(), tag: list.tag, isShared: list.isShared });
    } else {
      setTitleInput(list.title);
    }
  };

  const handleTagBlur = () => {
    setIsEditingTag(false);
    if (tagInput.trim() !== (list.tag || '') && list.canEdit) {
      onUpdateList(list.id, { title: list.title, tag: tagInput.trim(), isShared: list.isShared });
    } else {
      setTagInput(list.tag || '');
    }
  };

  return (
    <div className="list-detail-container">
      {/* ÜST GEZİNTİ ALANI */}
      <div className="detail-header">
        <button className="back-btn" onClick={onBack} aria-label="Go back">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="19" y1="12" x2="5" y2="12" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="12 19 5 12 12 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="header-right-actions">
          {/* Paylaşım Avatarları (Dinamik Baş Harf Halka Tasarımı) */}
          <div className="collaborators-badge" onClick={onOpenShare}>
            {list.sharedWith.slice(0, 2).map((user, idx) => {
              const getInitials = (n) => {
                if (!n) return 'U';
                const parts = n.trim().split(' ');
                if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
                return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
              };
              return (
                <div key={idx} className="header-collab-avatar-initials" title={user.name}>
                  {getInitials(user.name)}
                </div>
              );
            })}
            {list.sharedWith.length > 2 && (
              <span className="collab-count-badge">+{list.sharedWith.length}</span>
            )}
            <button
              className="add-collab-btn"
              onClick={(e) => {
                e.stopPropagation();
                onOpenShare();
              }}
            >
              <svg
                width="16"
                height="16"
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

          {/* Menü (Üç nokta) Butonu */}
          <button className="options-menu-btn" onClick={onOpenOptions} aria-label="List options">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* LİSTE BAŞLIĞI VE BİLGİLERİ */}
      <div className="list-meta-info">
        {isEditingTitle ? (
          <input
            type="text"
            className="edit-list-title-input"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleBlur();
              else if (e.key === 'Escape') {
                setIsEditingTitle(false);
                setTitleInput(list.title);
              }
            }}
            autoFocus
          />
        ) : (
          <h2
            className="detail-list-title"
            onClick={handleTitleDoubleClick}
            title="Tıklayarak düzenleyin"
          >
            {list.title}
          </h2>
        )}

        <div className="meta-row">
          <div className="meta-item">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="8" y1="6" x2="21" y2="6" strokeLinecap="round" />
              <line x1="8" y1="12" x2="21" y2="12" strokeLinecap="round" />
              <line x1="8" y1="18" x2="21" y2="18" strokeLinecap="round" />
              <line x1="3" y1="6" x2="3.01" y2="6" strokeLinecap="round" strokeWidth="3" />
              <line x1="3" y1="12" x2="3.01" y2="12" strokeLinecap="round" strokeWidth="3" />
              <line x1="3" y1="18" x2="3.01" y2="18" strokeLinecap="round" strokeWidth="3" />
            </svg>
            <span>
              List {completedItems}/{totalItems} Completed
            </span>
          </div>

          {isEditingTag ? (
            <input
              type="text"
              className="edit-list-tag-input"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onBlur={handleTagBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTagBlur();
                else if (e.key === 'Escape') {
                  setIsEditingTag(false);
                  setTagInput(list.tag || '');
                }
              }}
              autoFocus
            />
          ) : (
            <div
              className="meta-item tag-badge"
              onClick={handleTagDoubleClick}
              title="Tıklayarak etiket ekleyin/düzenleyin"
            >
              <svg
                width="16"
                height="16"
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
              <span>{list.tag || 'Add tag'}</span>
            </div>
          )}
        </div>
      </div>

      {/* ÜRÜN CHECKLIST ALANI */}
      <div className="items-list-container">
        {totalItems === 0 && !isAddingInline ? (
          <div className="empty-items-state">
            <div className="empty-items-illustration">
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="25"
                  y="15"
                  width="70"
                  height="90"
                  rx="8"
                  fill="#F9FAFB"
                  stroke="#EAECF0"
                  strokeWidth="2"
                />
                <rect x="40" y="8" width="40" height="14" rx="4" fill="#7F56D9" />
                <line
                  x1="40"
                  y1="40"
                  x2="80"
                  y2="40"
                  stroke="#EAECF0"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <line
                  x1="40"
                  y1="60"
                  x2="80"
                  y2="60"
                  stroke="#EAECF0"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <line
                  x1="40"
                  y1="80"
                  x2="70"
                  y2="80"
                  stroke="#EAECF0"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="90" cy="90" r="16" fill="#F4EBFF" />
                <path
                  d="M86 90H94M90 86V94"
                  stroke="#7F56D9"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h4 className="empty-items-title">Add items to your list</h4>
            <p className="empty-items-description">
              Your smart shopping list will shown here, start by creating a new list
            </p>
          </div>
        ) : (
          <div className="checklist-stack">
            {list.items.map((item) => (
              <div key={item.id} className={`checklist-item-card ${item.checked ? 'checked' : ''}`}>
                <button
                  className="checkbox-wrapper"
                  onClick={() => list.canEdit && onToggleItem(list.id, item.id)}
                  disabled={!list.canEdit}
                  style={{
                    border: 'none',
                    background: 'none',
                    padding: 0,
                    cursor: list.canEdit ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <div className={`custom-checkbox ${item.checked ? 'checked' : ''}`}>
                    {item.checked && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <polyline
                          points="20 6 9 17 4 12"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="item-name">{item.name}</span>
                </button>

                {list.canEdit && (
                  <button
                    className="edit-item-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditItem(list.id, item);
                    }}
                    aria-label="Edit item"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}

            {isAddingInline && (
              <div className="inline-add-container">
                <div className="inline-input-wrapper">
                  <div className="custom-checkbox"></div>
                  <input
                    ref={inputRef}
                    type="text"
                    className="inline-add-input"
                    placeholder="Type item name..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                      setTimeout(() => {
                        if (inputValue.trim() === '') setIsAddingInline(false);
                      }, 200);
                    }}
                  />
                </div>
                {filteredSuggestions.length > 0 && (
                  <div className="autocomplete-dropdown">
                    {filteredSuggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="autocomplete-option"
                        onMouseDown={() => handleAddItem(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {list.canEdit && !isAddingInline && (
        <div className="detail-footer-btn-container">
          <button className="primary-add-item-btn" onClick={() => onEditItem({})}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
              <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
            </svg>
            <span>Add new item</span>
          </button>
        </div>
      )}
    </div>
  );
}
