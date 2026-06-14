/* === KF STORE — CAMADA DE DADOS (Firebase + fallback local) === */
const KFStoreDB = (function () {
  const STORAGE_KEYS = {
    products: 'kfstore_products',
    categories: 'kfstore_categories',
    adminLogged: 'kfstore_admin_logged',
    version: 'kfstore_data_version'
  };

  const LOCAL_ADMIN_PASSWORD = 'kfstore2025';
  const DATA_VERSION = 3;
  const STORE_DOC = 'kfstore';

  const DEFAULT_CATEGORIES = [
    'Moletom',
    'Camisas Oversized',
    'Bonés',
    'Calças Cargo',
    'Shorts Cargo',
    'Prata',
    'Tênis'
  ];

  function buildStockBySize(sizes, total) {
    const stockBySize = {};
    const n = sizes.length || 1;
    const base = Math.floor(total / n);
    let remainder = total - base * n;
    sizes.forEach((size) => {
      stockBySize[size] = base + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
    });
    return stockBySize;
  }

  function normalizeProduct(product) {
    const p = { ...product };
    const sizes = Array.isArray(p.sizes) ? p.sizes : [];
    const hasSizes = sizes.length > 0;

    if (hasSizes) {
      if (!p.stockBySize || typeof p.stockBySize !== 'object') {
        p.stockBySize = buildStockBySize(sizes, parseInt(p.stock, 10) || 0);
      }
      p.stock = sizes.reduce((sum, size) => sum + (parseInt(p.stockBySize[size], 10) || 0), 0);
    } else {
      p.stock = Math.max(0, parseInt(p.stock, 10) || 0);
      p.stockBySize = {};
    }

    return p;
  }

  function migrateProducts(products) {
    return (products || []).map(normalizeProduct);
  }

  function makeDefaultProducts() {
    const raw = [
      { id: 'prod-001', name: 'Moletom KF Street', description: 'Moletom streetwear premium com capuz e bolso canguru. Confortável e estiloso para o dia a dia.', price: 159.90, category: 'Moletom', sizes: ['P', 'M', 'G', 'GG'], stock: 8, active: true, image: 'https://picsum.photos/seed/kfmoletom1/600/800' },
      { id: 'prod-002', name: 'Moletom Premium Urban', description: 'Moletom linha premium, tecido de alta qualidade. Disponível do P ao GG.', price: 189.90, category: 'Moletom', sizes: ['P', 'M', 'G', 'GG'], stock: 5, active: true, image: 'https://picsum.photos/seed/kfmoletom2/600/800' },
      { id: 'prod-003', name: 'Camisa Oversized Neon', description: 'Camisa oversized com estampa neon exclusiva KF Store. Modelagem ampla e confortável.', price: 89.90, category: 'Camisas Oversized', sizes: ['P', 'M', 'G', 'GG'], stock: 12, active: true, image: 'https://picsum.photos/seed/kfcamisa1/600/800' },
      { id: 'prod-004', name: 'Camisa Oversized Grafite', description: 'Camisa oversized com print grafite urbano. Algodão premium, do P ao GG.', price: 79.90, category: 'Camisas Oversized', sizes: ['P', 'M', 'G', 'GG'], stock: 6, active: true, image: 'https://picsum.photos/seed/kfcamisa2/600/800' },
      { id: 'prod-005', name: 'Camisa Oversized Básica', description: 'Camisa oversized lisa, ideal para o dia a dia. Cores variadas, tamanhos P ao GG.', price: 69.90, category: 'Camisas Oversized', sizes: ['P', 'M', 'G', 'GG'], stock: 10, active: true, image: 'https://picsum.photos/seed/kfcamisa3/600/800' },
      { id: 'prod-006', name: 'Boné KF Store', description: 'Boné aba curva com bordado KF Store. Ajuste snapback, tamanho único.', price: 59.90, category: 'Bonés', sizes: [], stock: 15, active: true, image: 'https://picsum.photos/seed/kfbone1/600/800' },
      { id: 'prod-007', name: 'Boné Street Preto', description: 'Boné streetwear preto, combina com qualquer look.', price: 49.90, category: 'Bonés', sizes: [], stock: 8, active: true, image: 'https://picsum.photos/seed/kfbone2/600/800' },
      { id: 'prod-008', name: 'Calça Cargo Premium', description: 'Calça cargo linha premium com múltiplos bolsos. Tecido resistente, do P ao GG.', price: 179.90, category: 'Calças Cargo', sizes: ['P', 'M', 'G', 'GG'], stock: 4, active: true, image: 'https://picsum.photos/seed/kfcalca1/600/800' },
      { id: 'prod-009', name: 'Calça Cargo Básica', description: 'Calça cargo linha básica, modelagem confortável. Tamanhos P ao GG.', price: 139.90, category: 'Calças Cargo', sizes: ['P', 'M', 'G', 'GG'], stock: 6, active: true, image: 'https://picsum.photos/seed/kfcalca2/600/800' },
      { id: 'prod-010', name: 'Short Cargo Premium', description: 'Short cargo linha premium, tecido de qualidade. Disponível do P ao GG.', price: 99.90, category: 'Shorts Cargo', sizes: ['P', 'M', 'G', 'GG'], stock: 7, active: true, image: 'https://picsum.photos/seed/kfshort1/600/800' },
      { id: 'prod-011', name: 'Short Cargo Básico', description: 'Short cargo linha básica, perfeito pro verão. Tamanhos P ao GG.', price: 69.90, category: 'Shorts Cargo', sizes: ['P', 'M', 'G', 'GG'], stock: 9, active: true, image: 'https://picsum.photos/seed/kfshort2/600/800' },
      { id: 'prod-012', name: 'Corrente Prata 925', description: 'Corrente em prata 925 com acabamento premium. Peça exclusiva.', price: 189.90, category: 'Prata', sizes: [], stock: 5, active: true, image: 'https://picsum.photos/seed/kfprata1/600/800' },
      { id: 'prod-013', name: 'Pulseira Prata Elos', description: 'Pulseira de elos em prata 925. Elegante e versátil.', price: 79.90, category: 'Prata', sizes: [], stock: 12, active: true, image: 'https://picsum.photos/seed/kfprata2/600/800' },
      { id: 'prod-014', name: 'Pulseira Prata Premium', description: 'Pulseira prata 925 linha premium, design exclusivo.', price: 129.90, category: 'Prata', sizes: [], stock: 4, active: true, image: 'https://picsum.photos/seed/kfprata3/600/800' },
      { id: 'prod-015', name: 'Tênis Street Runner', description: 'Tênis casual streetwear, solado antiderrapante. Várias numerações.', price: 299.90, category: 'Tênis', sizes: ['38', '39', '40', '41', '42', '43'], stock: 6, active: true, image: 'https://picsum.photos/seed/kftenis1/600/800' },
      { id: 'prod-016', name: 'Tênis High Top Urban', description: 'Tênis high top estilo urbano. Conforto e estilo.', price: 349.90, category: 'Tênis', sizes: ['38', '39', '40', '41', '42'], stock: 3, active: true, image: 'https://picsum.photos/seed/kftenis2/600/800' }
    ];
    return migrateProducts(raw);
  }

  const DEFAULT_PRODUCTS = makeDefaultProducts();

  let db = null;
  let storage = null;
  let auth = null;
  let cloudReady = false;
  let connectionError = null;
  let cache = { categories: [], products: [] };
  let subscribers = [];
  let unsubscribeFirestore = null;
  let initPromise = null;

  function isCloudEnabled() {
    return typeof FIREBASE_CONFIG !== 'undefined' &&
      FIREBASE_CONFIG.apiKey &&
      FIREBASE_CONFIG.apiKey !== 'COLE_SUA_API_KEY_AQUI';
  }

  function setCache(categories, products) {
    cache.categories = categories || [];
    cache.products = migrateProducts(products);
  }

  function notify() {
    subscribers.forEach(fn => fn({
      categories: [...cache.categories],
      products: [...cache.products],
      mode: getMode(),
      error: connectionError
    }));
  }

  function seedLocal() {
    const ver = parseInt(localStorage.getItem(STORAGE_KEYS.version) || '0', 10);
    if (ver < DATA_VERSION || !localStorage.getItem(STORAGE_KEYS.products)) {
      localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(DEFAULT_CATEGORIES));
      localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(DEFAULT_PRODUCTS));
      localStorage.setItem(STORAGE_KEYS.version, String(DATA_VERSION));
    } else if (ver < DATA_VERSION) {
      const products = migrateProducts(JSON.parse(localStorage.getItem(STORAGE_KEYS.products) || '[]'));
      localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
      localStorage.setItem(STORAGE_KEYS.version, String(DATA_VERSION));
    }
    setCache(
      JSON.parse(localStorage.getItem(STORAGE_KEYS.categories) || '[]'),
      JSON.parse(localStorage.getItem(STORAGE_KEYS.products) || '[]')
    );
  }

  function saveLocal(categories, products) {
    const normalized = migrateProducts(products);
    localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories));
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(normalized));
    localStorage.setItem(STORAGE_KEYS.version, String(DATA_VERSION));
    setCache(categories, normalized);
    notify();
  }

  async function seedCloudIfEmpty() {
    const doc = await db.collection('stores').doc(STORE_DOC).get();
    if (!doc.exists || !doc.data().products?.length) {
      await db.collection('stores').doc(STORE_DOC).set({
        categories: DEFAULT_CATEGORIES,
        products: DEFAULT_PRODUCTS,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
  }

  function dataURLtoBlob(dataURL) {
    const [header, data] = dataURL.split(',');
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(data);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
    return new Blob([array], { type: mime });
  }

  function initCloud() {
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    db = firebase.firestore();
    storage = firebase.storage();
    auth = firebase.auth();

    return new Promise((resolve, reject) => {
      let resolved = false;

      unsubscribeFirestore = db.collection('stores').doc(STORE_DOC).onSnapshot(
        (doc) => {
          connectionError = null;
          if (doc.exists) {
            const data = doc.data();
            setCache(data.categories || [], data.products || []);
          } else {
            setCache(DEFAULT_CATEGORIES, DEFAULT_PRODUCTS);
          }

          cloudReady = true;
          notify();

          if (!resolved) {
            resolved = true;
            resolve();
          }
        },
        (error) => {
          console.error('Erro Firestore:', error);
          connectionError = error.message || 'Erro de conexão com a nuvem.';
          if (!resolved) {
            resolved = true;
            reject(error);
          }
        }
      );
    });
  }

  function init() {
    if (initPromise) return initPromise;

    initPromise = (async () => {
      connectionError = null;
      if (isCloudEnabled()) {
        try {
          await initCloud();
        } catch (e) {
          console.warn('Firebase indisponível, usando modo local.', e);
          seedLocal();
        }
      } else {
        seedLocal();
      }
      return getMode();
    })();

    return initPromise;
  }

  function subscribe(callback) {
    subscribers.push(callback);
    callback({
      categories: [...cache.categories],
      products: [...cache.products],
      mode: getMode(),
      error: connectionError
    });
    return () => {
      subscribers = subscribers.filter(fn => fn !== callback);
    };
  }

  function getMode() {
    return isCloudEnabled() && cloudReady ? 'cloud' : 'local';
  }

  function getConnectionError() {
    return connectionError;
  }

  function getCategories() {
    return [...cache.categories];
  }

  function getProducts() {
    return [...cache.products];
  }

  function getTotalStock(product) {
    return normalizeProduct(product).stock;
  }

  function getSizeStock(product, size) {
    const p = normalizeProduct(product);
    if (!size) return p.stock;
    return parseInt(p.stockBySize[size], 10) || 0;
  }

  function getAvailableSizes(product) {
    const p = normalizeProduct(product);
    if (!p.sizes.length) return [];
    return p.sizes.filter(size => getSizeStock(p, size) > 0);
  }

  async function saveStore(categories, products) {
    const normalized = migrateProducts(products);
    if (isCloudEnabled() && cloudReady) {
      try {
        if (!auth.currentUser) {
          throw new Error('Faça login no admin para salvar na nuvem.');
        }
        await db.collection('stores').doc(STORE_DOC).set({
          categories,
          products: normalized,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return;
      } catch (cloudErr) {
        console.warn('Erro ao salvar na nuvem, usando modo local:', cloudErr);
        // Se falhar na nuvem, salva localmente
      }
    }
    saveLocal(categories, normalized);
  }

  async function saveProducts(products) {
    await saveStore(cache.categories, products);
  }

  async function saveCategories(categories) {
    await saveStore(categories, cache.products);
  }

  async function uploadImage(imageSource, productId) {
    // Sempre retorna a imagem como base64 para não usar o Storage pago
    return imageSource;
  }

  function onAuthChange(callback) {
    if (!isCloudEnabled() || typeof firebase === 'undefined') {
      callback(null);
      return () => {};
    }
    if (!auth) {
      if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      auth = firebase.auth();
    }
    return auth.onAuthStateChanged(callback);
  }

  async function signIn(email, password) {
    if (isCloudEnabled()) {
      if (!auth) {
        if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
        auth = firebase.auth();
        db = firebase.firestore();
        storage = firebase.storage();
      }
      await auth.signInWithEmailAndPassword(email, password);
      await seedCloudIfEmpty();
      localStorage.setItem(STORAGE_KEYS.adminLogged, 'true');
      return { mode: 'cloud' };
    }

    if (password === LOCAL_ADMIN_PASSWORD) {
      localStorage.setItem(STORAGE_KEYS.adminLogged, 'true');
      return { mode: 'local' };
    }
    throw new Error('Senha incorreta.');
  }

  async function signOut() {
    localStorage.removeItem(STORAGE_KEYS.adminLogged);
    if (auth && auth.currentUser) {
      await auth.signOut();
    }
  }

  function isLoggedIn() {
    if (isCloudEnabled() && auth && auth.currentUser) {
      return true;
    }
    return localStorage.getItem(STORAGE_KEYS.adminLogged) === 'true';
  }

  function getAdminEmail() {
    return typeof ADMIN_EMAIL !== 'undefined' ? ADMIN_EMAIL : '';
  }

  function destroy() {
    if (unsubscribeFirestore) unsubscribeFirestore();
    subscribers = [];
  }

  return {
    DEFAULT_CATEGORIES,
    DEFAULT_PRODUCTS,
    DATA_VERSION,
    isCloudEnabled,
    init,
    subscribe,
    getMode,
    getConnectionError,
    getCategories,
    getProducts,
    normalizeProduct,
    migrateProducts,
    getTotalStock,
    getSizeStock,
    getAvailableSizes,
    saveStore,
    saveProducts,
    saveCategories,
    uploadImage,
    onAuthChange,
    signIn,
    signOut,
    isLoggedIn,
    getAdminEmail,
    destroy
  };
})();
