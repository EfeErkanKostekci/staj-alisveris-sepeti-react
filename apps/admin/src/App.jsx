import { useState } from 'react';
import './index.css';
import { usePostApiAdvertisements } from './api/endpoints';

export default function App() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    productUrl: '',
    imageUrl: '',
    email: false
  });
  
  const token = localStorage.getItem("adminToken");
  const fetchOpts = { headers: { Authorization: `Bearer ${token}` } };
  const { mutate: addAdvertisement } = usePostApiAdvertisements({ fetch: fetchOpts });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Backend'e POST atıyoruz!
    addAdvertisement({
        data: {
            title: formData.title,
            description: formData.description,
            productUrl: formData.productUrl,
            imageUrl: formData.imageUrl,
            email: formData.email
        }
    }, {
        onSuccess: () => alert("Reklam başarıyla eklendi! 🎉"),
        onError: (err) => alert("Hata: " + (err.response?.data?.message || err.message))
    });
  };

  return (
    <div className="admin-container">
      <div className="glass-panel">
        <div className="form-header">
          <h2>Yeni Reklam Oluştur</h2>
          <p>Müşterilere gösterilecek kampanyayı tanımlayın</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Reklam Başlığı</label>
            <input 
              type="text" 
              className="glass-input"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Örn: Yaz İndirimleri Başladı!"
              required 
            />
          </div>

          <div className="form-group">
            <label>Kampanya Açıklaması</label>
            <textarea 
              className="glass-input"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Reklam detaylarını buraya girin..."
              required 
            />
          </div>

          <div className="form-group">
            <label>Ürün Yönlendirme Linki</label>
            <input 
              type="url" 
              className="glass-input"
              value={formData.productUrl}
              onChange={(e) => setFormData({...formData, productUrl: e.target.value})}
              placeholder="https://site.com/urun..."
              required 
            />
          </div>

          <div className="form-group">
            <label>Görsel URL</label>
            <input 
              type="url" 
              className="glass-input"
              value={formData.imageUrl}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              placeholder="https://..."
              required 
            />
          </div>

          <div className = "form-group">
              <label>E-posta gönder</label>
              <input type ="checkbox" checked = {formData.email} onChange={(e) => setFormData({...formData, email: e.target.checked})}></input>
          </div>

          <button type="submit" className="glass-button">
            Reklamı Yayınla
          </button>
        </form>
      </div>
    </div>
  );
}