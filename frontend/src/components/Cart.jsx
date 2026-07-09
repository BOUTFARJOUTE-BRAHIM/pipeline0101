import { useState, useEffect } from 'react';
import { getCart, removeFromCart, createOrder } from '../services/api';
import './Cart.css';

/**
 * =============================================================
 * Cart Component
 * =============================================================
 * 
 * Affiche le contenu du panier récupéré depuis le Cart Service.
 * Permet de supprimer des articles et de passer une commande
 * via le Order Service.
 * 
 * @param {Function} onCartUpdate - Callback pour rafraîchir le compteur du panier
 * @param {Function} onNavigate   - Callback pour naviguer vers une autre page
 */
function Cart({ onCartUpdate, onNavigate }) {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [ordering, setOrdering] = useState(false);

  // Récupérer le panier au montage
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCart();

      if (response.success) {
        setCart(response.data);
        setTotal(response.total);
      } else {
        setError('Impossible de charger le panier');
      }
    } catch (err) {
      setError(`Erreur de connexion au Cart Service : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Supprimer un article du panier
   */
  const handleRemove = async (productId) => {
    try {
      const response = await removeFromCart(productId);

      if (response.success) {
        await fetchCart();
        if (onCartUpdate) onCartUpdate();
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  };

  /**
   * Passer la commande via le Order Service
   * Envoie les articles du panier au Order Service qui vérifie
   * chaque produit auprès du Product Service
   */
  const handleOrder = async () => {
    try {
      setOrdering(true);
      setError(null);

      // Préparer les items pour la commande
      const items = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      const response = await createOrder(items);

      if (response.success) {
        setOrderSuccess(response.data);

        // Vider le panier côté client (les articles restent dans le Cart Service 
        // mais on montre le succès de la commande)
        // Pour un vrai projet, on appellerait un endpoint pour vider le panier
        setCart([]);
        setTotal(0);
        if (onCartUpdate) onCartUpdate();
      } else {
        setError(response.message || 'Erreur lors de la création de la commande');
      }
    } catch (err) {
      setError(`Erreur de connexion au Order Service : ${err.message}`);
    } finally {
      setOrdering(false);
    }
  };

  // --- Loading ---
  if (loading) {
    return (
      <div className="loading">
        <div className="loading__spinner"></div>
        <p>Chargement du panier...</p>
      </div>
    );
  }

  // --- Commande réussie ---
  if (orderSuccess) {
    return (
      <div className="cart-container">
        <div className="order-success">
          <h2>🎉 Commande #{orderSuccess.id} créée avec succès !</h2>
          <p style={{ marginTop: '0.5rem', color: 'var(--color-text-secondary)' }}>
            Total : <strong>{orderSuccess.total.toFixed(2)} €</strong> — 
            Statut : <strong>{orderSuccess.status}</strong>
          </p>
          <button
            className="btn-order"
            style={{ maxWidth: '300px', margin: '1.5rem auto 0' }}
            onClick={() => onNavigate('orders')}
          >
            📋 Voir mes commandes
          </button>
        </div>
      </div>
    );
  }

  // --- Error ---
  if (error) {
    return (
      <div className="error-message">
        <p>⚠️ {error}</p>
        <button className="btn-add-cart" style={{ maxWidth: '200px', margin: '1rem auto 0' }} onClick={fetchCart}>
          Réessayer
        </button>
      </div>
    );
  }

  // --- Panier vide ---
  if (cart.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🛒</div>
        <p>Votre panier est vide</p>
        <button
          className="btn-add-cart"
          style={{ maxWidth: '250px', margin: '1rem auto 0' }}
          onClick={() => onNavigate('products')}
        >
          Parcourir les produits
        </button>
      </div>
    );
  }

  // --- Rendu du panier ---
  return (
    <div className="cart-container">
      {/* Liste des articles */}
      {cart.map((item) => (
        <div className="cart-item" key={item.productId}>
          <div className="cart-item__info">
            <h3 className="cart-item__name">{item.name}</h3>
            <div className="cart-item__details">
              <span className="cart-item__price">{item.price.toFixed(2)} €</span>
              <span className="cart-item__quantity">× {item.quantity}</span>
            </div>
          </div>
          <span className="cart-item__subtotal">
            {(item.price * item.quantity).toFixed(2)} €
          </span>
          <button
            className="btn-remove"
            onClick={() => handleRemove(item.productId)}
          >
            ✕ Supprimer
          </button>
        </div>
      ))}

      {/* Résumé du panier */}
      <div className="cart-summary">
        <div className="cart-summary__row">
          <span className="cart-summary__label">Articles</span>
          <span className="cart-summary__value">{cart.length}</span>
        </div>
        <div className="cart-summary__row cart-summary__row--total">
          <span className="cart-summary__label cart-summary__label--total">Total</span>
          <span className="cart-summary__value cart-summary__value--total">
            {total.toFixed(2)} €
          </span>
        </div>
      </div>

      {/* Bouton Commander */}
      <button
        className="btn-order"
        onClick={handleOrder}
        disabled={ordering}
      >
        {ordering ? '⏳ Commande en cours...' : '🚀 Passer la commande'}
      </button>
    </div>
  );
}

export default Cart;
