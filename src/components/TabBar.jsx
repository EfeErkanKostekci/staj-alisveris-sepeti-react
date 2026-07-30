/**
 * TabBar.jsx (Sekme Menüsü)
 * ---------------------------------------
 * Bu dosya, ana sayfada "Tüm Listeler", "Benimkiler", "Paylaşılanlar" gibi filtreleri içeren sekme çubuğudur.
 * Kullanıcının listeler arasında geçiş yapmasını sağlar.
 */
import './TabBar.css';

export default function TabBar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'recents', label: 'Recents' },
    { id: 'draft', label: 'Draft' },
    { id: 'shared', label: 'Shared' }
  ];

  return (
    <div className="tab-bar-container">
      <div className="tab-bar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
