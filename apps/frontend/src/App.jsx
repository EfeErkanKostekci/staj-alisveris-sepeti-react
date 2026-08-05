/**
 * App.jsx (Ana Uygulama Bileşeni)
 * --------------------------------
 * Bu dosya, uygulamanın ana yönetim merkezidir (State Management).
 *
 * Ne işe yarar?
 * 1. Kullanıcı girişi (Login) durumunu takip eder.
 * 2. API'den tüm alışveriş listelerini çeker ve React Query ile yönetir.
 * 3. Listeler arası geçişi, yeni liste eklemeyi, ürün ekleme/silme ve davet işlemlerini API'ye bağlar.
 * 4. Hangi sayfanın (Dashboard, Liste Detayı, Profil vs.) gösterileceğine karar verir.
 */
import { useState, useEffect } from 'react';
import './index.css';
import './App.css';
import Header from './components/Header.jsx';
import TabBar from './components/TabBar.jsx';
import Dashboard from './components/Dashboard.jsx';
import ListDetail from './components/ListDetail.jsx';
import { EditItemModal, ShareModal, ListOptionsMenu } from './components/Modals.jsx';
import NotificationsPanel from './components/NotificationsPanel.jsx';
import Login from './components/Login.jsx';
import AdvertisementsModal from './components/AdvertisementsModal.jsx';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import {
  useGetApiShoppingLists,
  getGetApiShoppingListsQueryKey,
  usePostApiShoppingLists,
  usePutApiShoppingLists,
  useDeleteApiShoppingListsId,
  useDeleteApiShoppingListItemsId,
  usePutApiShoppingListItems,
  getApiProducts,
  postApiProducts,
  postApiShoppingListItems,
  putApiShoppingListItems,
  deleteApiShoppingListItemsId,
} from './api/endpoints';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('recents');
  const [profilePictureUrl, setProfilePictureUrl] = useState(
    localStorage.getItem('profilePictureUrl') || ''
  );
  const [lists, setLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState(null);

  // Kullanıcı profil bilgileri state'i
  const [userName, setUserName] = useState(() => {
    const firstName = localStorage.getItem('name') || '';
    const lastName = localStorage.getItem('lastName') || '';
    return firstName && lastName ? `${firstName} ${lastName}` : '';
  });
  const [userEmail, setUserEmail] = useState(localStorage.getItem('email') || '');

  // Modalların Açık/Kapalı ve Veri State'leri
  const [editingItem, setEditingItem] = useState(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false); // Bildirim paneli
  const [isAdsOpen, setIsAdsOpen] = useState(false); // Reklam/Fırsat modalı
  const [invites, setInvites] = useState([]); // Bekleyen davetler

  // Aktif sekmeye göre listeleri filtreleme
  const filteredLists = lists.filter((list) => list.status === activeTab);

  // Seçili olan listenin nesnesi
  const activeList = lists.find((list) => list.id === selectedListId);

  const queryClient = useQueryClient();

  // 1. Backend'den tüm listeleri (içindeki ürünler ve ürün isimleriyle beraber) çekiyoruz
  // enabled parametresiyle sadece giriş yapılmışsa veri çekilmesini sağlıyoruz
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useGetApiShoppingLists({ query: { enabled: !!token } });

  // 2. Bekleyen davetleri her 10 saniyede bir çek
  useQuery({
    queryKey: ['my-invites'],
    queryFn: async () => {
      const t = localStorage.getItem('token');
      const res = await fetch('/api/ListShares/my-invites', {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) throw new Error('Davetler alınamadı');
      const data = await res.json();
      setInvites(data || []);
      return data;
    },
    enabled: !!token,
    refetchInterval: 10000,
  });

  const handleLoginSuccess = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', String(data.userId));
    localStorage.setItem('email', data.email);
    localStorage.setItem('name', data.name);
    localStorage.setItem('lastName', data.lastName);

    if (data.profilePictureUrl) {
      localStorage.setItem('profilePictureUrl', data.profilePictureUrl);
      setProfilePictureUrl(data.profilePictureUrl);
    } else {
      localStorage.removeItem('profilePictureUrl');
      setProfilePictureUrl('');
    }

    setToken(data.token);
    setUserName(`${data.name} ${data.lastName}`);
    setUserEmail(data.email);
    queryClient.invalidateQueries({ queryKey: getGetApiShoppingListsQueryKey() });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('name');
    localStorage.removeItem('lastName');
    localStorage.removeItem('profilePictureUrl');
    setToken(null);
    setUserName('');
    setUserEmail('');
    setLists([]);
    setSelectedListId(null);
    setInvites([]);
  };

  const handleProfilePicUpload = async (file) => {
    try {
      // 1. Resim dosyasını API'ye (C#'a) gönderebilmek için FormData kalıbına sokuyoruz
      const formData = new FormData();
      formData.append('file', file);

      const t = localStorage.getItem('token');

      const res = await fetch('/api/users/upload-profile-picture', {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}` }, // Dikkat: FormData yollarken Content-Type yazılmaz!
        body: formData,
      });

      if (!res.ok) throw new Error('Yükleme başarısız oldu!');

      // 3. Backend'den dönen cevabı (Senin Result.Success ile yolladığın paket) alıyoruz
      const resultData = await res.json();
      const newUrl = resultData.data; // Senin backend'den yolladığın 'url' değişkeni tam olarak burada!

      // 4. Ekrandaki resmi güncelliyoruz ve sayfayı yenileyince kaybolmasın diye LocalStorage'a yazıyoruz
      setProfilePictureUrl(newUrl);
      localStorage.setItem('profilePictureUrl', newUrl);

      alert('Fotoğraf yüklendi!');
    } catch (e) {
      console.error(e);
      alert('Fotoğraf yüklenirken bir hata oluştu.');
    }
  };

  // 2. Yeni liste ve eleman işlemleri için mutation'ları tanımlıyoruz
  const t = localStorage.getItem('token');
  const fetchOpts = { headers: { Authorization: `Bearer ${t}` } };

  const createListMutation = usePostApiShoppingLists({ fetch: fetchOpts });
  const updateListMutation = usePutApiShoppingLists({ fetch: fetchOpts }); // Liste güncellemeleri için
  const deleteListMutation = useDeleteApiShoppingListsId({ fetch: fetchOpts });
  const toggleItemMutation = usePutApiShoppingListItems({ fetch: fetchOpts });
  const deleteItemMutation = useDeleteApiShoppingListItemsId({ fetch: fetchOpts });

  // API'den dönen verinin harf formatını (casing) dinamik tespit eden yardımcı
  const listDataForCasing = response?.data?.data ? response.data.data : response?.data;
  const isCamelCase = listDataForCasing?.[0] ? 'id' in listDataForCasing[0] : true;

  // Giden istekleri (payload) API formatına (camelCase / PascalCase) göre düzenleyen yardımcı
  const buildPayload = (fields) => {
    const payload = {};
    Object.entries(fields).forEach(([key, val]) => {
      if (isCamelCase) {
        // camelCase formatı (örn: listId)
        const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
        payload[camelKey] = val;
      } else {
        // PascalCase formatı (örn: ListId)
        const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
        payload[pascalKey] = val;
      }
    });
    return payload;
  };

  // Veritabanından veri geldiğinde local state'i günceller (Casing-safe)
  useEffect(() => {
    // Result pattern'dan dönen gerçek listeyi alıyoruz
    const listData = response?.data?.data ? response.data.data : response?.data;
    if (listData && Array.isArray(listData)) {
      const mapped = listData.map((list) => {
        const id = list.id ?? list.Id;
        const title = list.title ?? list.Title ?? '';
        const tag = list.tag ?? list.Tag ?? '';
        const currentUserId = Number(localStorage.getItem('userId'));
        const listUserId = list.userId ?? list.UserId;
        const isOwner = listUserId === currentUserId;
        const isShared = list.isShared ?? list.IsShared ?? false;
        const isDraft = list.isDraft ?? list.isDraft ?? false;
        const itemsList = list.shoppingListItems ?? list.ShoppingListItems ?? [];
        const currentUserRole = list.currentUserRole ?? list.CurrentUserRole ?? 'Owner';
        const canEdit = currentUserRole === 'Edit' || currentUserRole === 'Owner';

        return {
          id: String(id),
          title: title,
          tag: tag,
          status: isDraft ? 'draft' : !isOwner || isShared ? 'shared' : 'recents',
          canEdit: canEdit,
          currentUserRole: currentUserRole,
          isDraft: isDraft,
          sharedWith: [
            {
              name: userName || localStorage.getItem('name') || 'Kullanıcı',
              email: userEmail || localStorage.getItem('email') || 'user@email.com',
              isOwner: isOwner,
              profilePictureUrl: localStorage.getItem('profilePictureUrl'),
            },
          ],
          items: itemsList.map((item) => {
            const itemId = item.id ?? item.Id;
            const itemProdId = item.productId ?? item.ProductId;
            const prod = item.product ?? item.Product;
            const prodName = prod?.productName ?? prod?.ProductName ?? 'Bilinmeyen Ürün';
            const isChecked = item.isChecked ?? item.IsChecked ?? false;
            const quantity = item.quantity ?? item.Quantity ?? 1;
            const desc = prod?.description ?? prod?.Description ?? '';

            return {
              id: String(itemId),
              productId: itemProdId,
              name: prodName,
              checked: isChecked,
              quantity: Number(quantity),
              unit: 'Pieces',
              description: desc,
            };
          }),
        };
      });
      setLists(mapped);
    }
  }, [response, userName, userEmail]);

  // Ürün adını veritabanında arar, bulursa ID'sini döner, bulamazsa yeni ürün oluşturur (Casing-safe)
  const getOrCreateProduct = async (itemName) => {
    const t = localStorage.getItem('token');
    const authOpts = { headers: { Authorization: `Bearer ${t}` } };

    const res = await getApiProducts(authOpts);
    const productData = res.data?.data ? res.data.data : res.data;
    const products = productData || [];
    const existing = products.find((p) => {
      const name = p.productName ?? p.ProductName ?? '';
      return name.toLowerCase() === itemName.toLowerCase();
    });
    if (existing) {
      return existing.id ?? existing.Id;
    }

    // API formatına uygun dinamik ürün payload'u
    const productPayload = buildPayload({
      productName: itemName,
      description: '',
    });

    const createRes = await postApiProducts(productPayload, authOpts);
    const newProd = createRes.data?.data ? createRes.data.data : createRes.data;
    return newProd?.id ?? newProd?.Id;
  };

  // Liste başlığı veya etiketini güncelleme mantığı (API)
  const handleUpdateList = (listId, updatedFields) => {
    const listData = response?.data?.data ? response.data.data : response?.data;
    const list = listData?.find((l) => String(l.id ?? l.Id) === String(listId));
    if (!list) return;

    const listPayload = buildPayload({
      id: Number(listId),
      title: updatedFields.title !== undefined ? updatedFields.title : (list.title ?? list.Title),
      tag: updatedFields.tag !== undefined ? updatedFields.tag : (list.tag ?? list.Tag),
      userId: Number(localStorage.getItem('userId')),
      isShared: list.isShared ?? list.IsShared ?? false,
    });

    updateListMutation.mutate(
      {
        data: listPayload,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetApiShoppingListsQueryKey() });
        },
        onError: (err) => {
          alert('Liste güncellenemedi: ' + err.message);
        },
      }
    );
  };

  // 1. ÜRÜN TİK ATMA MANTIĞI (API)
  const handleToggleItem = (listId, itemId) => {
    const list = lists.find((l) => l.id === listId);
    const item = list?.items.find((i) => i.id === itemId);
    if (!item) return;

    const togglePayload = buildPayload({
      id: Number(itemId),
      listId: Number(listId),
      productId: item.productId,
      quantity: item.quantity,
      isChecked: !item.checked,
    });

    toggleItemMutation.mutate(
      {
        data: togglePayload,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetApiShoppingListsQueryKey() });
        },
        onError: (err) => {
          alert('Ürün durumu güncellenemedi: ' + err.message);
        },
      }
    );
  };

  // 2. ÜRÜN EKLEME MANTIĞI (API)
  const handleAddItem = async (listId, itemName) => {
    try {
      const productId = await getOrCreateProduct(itemName);
      if (!productId) throw new Error('Ürün oluşturulamadı.');

      const itemPayload = buildPayload({
        listId: Number(listId),
        productId: productId,
        quantity: 1,
        isChecked: false,
      });

      const t = localStorage.getItem('token');
      const authOpts = { headers: { Authorization: `Bearer ${t}` } };
      await postApiShoppingListItems(itemPayload, authOpts);
      queryClient.invalidateQueries({ queryKey: getGetApiShoppingListsQueryKey() });
    } catch (e) {
      console.error('Error adding item:', e);
      alert('Ürün eklenemedi: ' + e.message);
    }
  };

  // 3. ÜRÜN DÜZENLEME & KAYDETME (API)
  const handleSaveItem = async (updatedItem) => {
    try {
      const productId = await getOrCreateProduct(updatedItem.name);
      if (!productId) throw new Error('Ürün bulunamadı veya oluşturulamadı.');

      if (updatedItem.id) {
        // Güncelleme (PUT)
        const itemPayload = buildPayload({
          id: Number(updatedItem.id),
          listId: Number(selectedListId),
          productId: productId,
          quantity: Number(updatedItem.quantity) || 1,
          isChecked: updatedItem.checked || false,
        });
        const t = localStorage.getItem('token');
        const authOpts = { headers: { Authorization: `Bearer ${t}` } };
        await putApiShoppingListItems(itemPayload, authOpts);
      } else {
        // Yeni Ekleme (POST) - Modaldan gelen yeni ürün
        const itemPayload = buildPayload({
          listId: Number(selectedListId),
          productId: productId,
          quantity: Number(updatedItem.quantity) || 1,
          isChecked: false,
        });
        const t = localStorage.getItem('token');
        const authOpts = { headers: { Authorization: `Bearer ${t}` } };
        await postApiShoppingListItems(itemPayload, authOpts);
      }

      queryClient.invalidateQueries({ queryKey: getGetApiShoppingListsQueryKey() });
      setEditingItem(null);
    } catch (e) {
      console.error('Error saving item:', e);
      alert('Ürün kaydedilemedi: ' + e.message);
    }
  };

  // 4. ÜRÜN SİLME (API)
  const handleDeleteItem = (itemId) => {
    deleteItemMutation.mutate(
      {
        id: Number(itemId),
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetApiShoppingListsQueryKey() });
          setEditingItem(null);
        },
      }
    );
  };

  // 5. YENİ ORTAK ÇALIŞAN EKLEME (PAYLAŞMA - Mock)
  const handleAddCollaborator = (listId, email, role) => {
    const list = lists.find((l) => l.id === listId);
    if (list.sharedWith.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
      alert('This user is already invited.');
      return;
    }
    const name = email.split('@')[0];
    const newCollab = {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email,
      isOwner: false,
      role,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?w=150`,
    };
    setLists((prevLists) =>
      prevLists.map((l) => {
        if (l.id !== listId) return l;
        return {
          ...l,
          status: 'shared',
          sharedWith: [...l.sharedWith, newCollab],
        };
      })
    );
    setActiveTab('shared');
  };

  // 6. DAVETLİ YETKİSİNİ DEĞİŞTİRME VEYA ÇIKARMA (API)
  const handleChangePermission = async (shareId, newRole) => {
    const t = localStorage.getItem('token');
    if (newRole === 'Remove') {
      try {
        await fetch(`/api/ListShares/${shareId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${t}` },
        });
        setIsShareOpen(false); // Modal'ı kapat/aç yaparak yenilenmesini sağlayabiliriz
        setTimeout(() => setIsShareOpen(true), 50);
      } catch (err) {
        console.error('Failed to remove share', err);
      }
    } else {
      alert('Role update is not fully implemented yet.');
    }
  };

  // 7. LİSTE SEÇENEKLERİ HAREKETLERİ (API)
  // Davet gönder
  const handleSendInvite = async (listId, email, role) => {
    const t = localStorage.getItem('token');
    const res = await fetch('/api/ListShares/invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${t}`,
      },
      body: JSON.stringify({ listId: Number(listId), inviteeEmail: email, role }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Davet gönderilemedi.');
    }
  };

  // Daveti kabul et
  const handleAcceptInvite = async (inviteId) => {
    const t = localStorage.getItem('token');
    await fetch(`/api/ListShares/${inviteId}/accept`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${t}` },
    });
    setInvites((prev) => prev.filter((i) => i.id !== inviteId));
    queryClient.invalidateQueries({ queryKey: getGetApiShoppingListsQueryKey() });
  };

  // Daveti reddet
  const handleDeclineInvite = async (inviteId) => {
    const t = localStorage.getItem('token');
    await fetch(`/api/ListShares/${inviteId}/decline`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${t}` },
    });
    setInvites((prev) => prev.filter((i) => i.id !== inviteId));
  };

  const handleClearChecked = async () => {
    if (!activeList) return;
    const checkedItems = activeList.items.filter((item) => item.checked);
    try {
      const t = localStorage.getItem('token');
      const authOpts = { headers: { Authorization: `Bearer ${t}` } };
      for (const item of checkedItems) {
        await deleteApiShoppingListItemsId(Number(item.id), authOpts);
      }
      queryClient.invalidateQueries({ queryKey: getGetApiShoppingListsQueryKey() });
    } catch (e) {
      console.error('Error clearing items:', e);
    }
  };

  const handleCopyList = () => {
    if (!activeList) return;
    const itemsText = activeList.items
      .map((item) => `${item.checked ? '[x]' : '[ ]'} ${item.name} (${item.quantity} ${item.unit})`)
      .join('\n');
    const copyText = `${activeList.title}\n${itemsText}`;

    navigator.clipboard
      .writeText(copyText)
      .then(() => alert('List copied to clipboard!'))
      .catch((err) => console.error('Could not copy text: ', err));
  };

  const handleDeleteList = () => {
    if (window.confirm('Are you sure you want to delete this list?')) {
      deleteListMutation.mutate(
        {
          id: Number(selectedListId),
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetApiShoppingListsQueryKey() });
            setSelectedListId(null);
          },
        }
      );
    }
  };

  // Gezinti fonksiyonları
  const handleSelectList = (id) => setSelectedListId(id);
  const handleBack = () => setSelectedListId(null);

  const handleCreateList = () => {
    const storedUserId = Number(localStorage.getItem('userId')) || 1;

    const listPayload = buildPayload({
      title: `New Shopping List ${lists.length + 1}`,
      tag: 'New Tag',
      isShared: false,
      userId: storedUserId,
    });

    createListMutation.mutate(
      {
        data: listPayload,
      },
      {
        onSuccess: async (res) => {
          // Backend 201 Created ile yeni listeyi döndürüyor (Result pattern ile)
          const rawData = res.data?.data ? res.data.data : res.data;
          const newId = rawData?.id ?? rawData?.Id;
          // Önce listeyi yenile, sonra seçili ID'yi ayarla
          await queryClient.invalidateQueries({ queryKey: getGetApiShoppingListsQueryKey() });
          if (newId) {
            setSelectedListId(String(newId));
          }
        },
      }
    );
  };

  const handleToggleDraft = async (listId) => {
    try {
      const t = localStorage.getItem('token');
      const res = await fetch(`/api/shoppinglists/${listId}/draft`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!res.ok) throw new Error('Taslak durumu değiştirilemedi!');

      queryClient.invalidateQueries({ queryKey: getGetApiShoppingListsQueryKey() });
    } catch (e) {
      console.error(e);
      alert(e.message);
    }
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Sol Sütun: Dashboard (Mobilde liste seçiliyse gizlenir) */}
      <div className={`app-sidebar ${activeList ? 'hidden-mobile' : ''}`}>
        <Header
          userName={userName}
          userEmail={userEmail}
          profilePictureUrl={profilePictureUrl}
          onProfilePicUpload={handleProfilePicUpload}
          onLogout={handleLogout}
          onBellClick={() => setIsNotifOpen((v) => !v)}
          onAwardClick={() => setIsAdsOpen(true)}
          inviteCount={invites.length}
        />
        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
        <Dashboard
          lists={filteredLists}
          activeTab={activeTab}
          onSelectList={handleSelectList}
          onCreateList={handleCreateList}
          onToggleDraft={handleToggleDraft}
        />
      </div>

      {/* Sağ Sütun: Detay Paneli (Mobilde liste seçili değilse gizlenir) */}
      <div className={`app-main-content ${!activeList ? 'hidden-mobile' : ''}`}>
        {activeList ? (
          <ListDetail
            list={activeList}
            onBack={handleBack}
            onToggleItem={handleToggleItem}
            onAddItem={handleAddItem}
            onEditItem={(listId, item) => setEditingItem(item)}
            onOpenShare={() => setIsShareOpen(true)}
            onOpenOptions={() => setIsOptionsOpen(true)}
            onUpdateList={handleUpdateList}
          />
        ) : (
          <div className="desktop-placeholder">
            <svg
              width="150"
              height="150"
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
            </svg>
            <h3>Select a list to view details</h3>
            <p>
              Choose a shopping list from the left panel to manage your items or create a new list.
            </p>
          </div>
        )}
      </div>

      {/* ==========================================
          MODALLAR
          ========================================== */}
      <EditItemModal
        isOpen={editingItem !== null}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
      />

      <ShareModal
        isOpen={isShareOpen}
        list={activeList}
        onClose={() => setIsShareOpen(false)}
        onAddCollaborator={handleAddCollaborator}
        onChangePermission={handleChangePermission}
        onInvite={handleSendInvite}
      />

      {isNotifOpen && (
        <NotificationsPanel
          invites={invites}
          onAccept={handleAcceptInvite}
          onDecline={handleDeclineInvite}
          onClose={() => setIsNotifOpen(false)}
        />
      )}

      <AdvertisementsModal 
        isOpen={isAdsOpen} 
        onClose={() => setIsAdsOpen(false)} 
      />

      <ListOptionsMenu
        isOpen={isOptionsOpen}
        list={activeList}
        onClose={() => setIsOptionsOpen(false)}
        onClearChecked={handleClearChecked}
        onCopyList={handleCopyList}
        onDeleteList={handleDeleteList}
      />
    </div>
  );
}
