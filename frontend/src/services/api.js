/**
 * =============================================================
 * Frontend - Configuration API (Services URLs)
 * =============================================================
 * 
 * URLs des microservices configurées via variables d'environnement Vite.
 * 
 * En développement local :
 *   Créer un fichier .env avec les URLs localhost
 * 
 * Dans Kubernetes :
 *   Les noms DNS internes sont utilisés par défaut
 *   (product-service, cart-service, order-service)
 */

// URLs des microservices via les noms DNS Kubernetes
// Utiliser les variables d'environnement Vite pour surcharger en local
const API_CONFIG = {
  PRODUCT_SERVICE: import.meta.env.VITE_PRODUCT_SERVICE_URL || 'http://product-service:3001',
  CART_SERVICE: import.meta.env.VITE_CART_SERVICE_URL || 'http://cart-service:3002',
  ORDER_SERVICE: import.meta.env.VITE_ORDER_SERVICE_URL || 'http://order-service:3003'
};

// =============================================================
// Product Service API
// =============================================================

/**
 * Récupérer la liste de tous les produits
 * @param {string} category - (Optionnel) Filtrer par catégorie
 */
export const getProducts = async (category = '') => {
  const url = category
    ? `${API_CONFIG.PRODUCT_SERVICE}/api/products?category=${category}`
    : `${API_CONFIG.PRODUCT_SERVICE}/api/products`;

  const response = await fetch(url);
  return response.json();
};

/**
 * Récupérer le détail d'un produit
 * @param {number} id - L'ID du produit
 */
export const getProductById = async (id) => {
  const response = await fetch(`${API_CONFIG.PRODUCT_SERVICE}/api/products/${id}`);
  return response.json();
};

// =============================================================
// Cart Service API
// =============================================================

/**
 * Récupérer le contenu du panier
 */
export const getCart = async () => {
  const response = await fetch(`${API_CONFIG.CART_SERVICE}/api/cart`);
  return response.json();
};

/**
 * Ajouter un produit au panier
 * @param {Object} product - Le produit à ajouter { productId, name, price, quantity }
 */
export const addToCart = async (product) => {
  const response = await fetch(`${API_CONFIG.CART_SERVICE}/api/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });
  return response.json();
};

/**
 * Supprimer un produit du panier
 * @param {number} productId - L'ID du produit à supprimer
 */
export const removeFromCart = async (productId) => {
  const response = await fetch(`${API_CONFIG.CART_SERVICE}/api/cart/${productId}`, {
    method: 'DELETE'
  });
  return response.json();
};

// =============================================================
// Order Service API
// =============================================================

/**
 * Créer une nouvelle commande
 * @param {Array} items - Liste des articles [{ productId, quantity }]
 */
export const createOrder = async (items) => {
  const response = await fetch(`${API_CONFIG.ORDER_SERVICE}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });
  return response.json();
};

/**
 * Récupérer toutes les commandes
 */
export const getOrders = async () => {
  const response = await fetch(`${API_CONFIG.ORDER_SERVICE}/api/orders`);
  return response.json();
};

export default API_CONFIG;
