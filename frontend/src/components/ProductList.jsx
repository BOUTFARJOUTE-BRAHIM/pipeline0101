import { useState, useEffect } from 'react';
import { getProducts, addToCart } from '../services/api';
import './ProductList.css';

/**
 * =============================================================
 * ProductList Component
 * =============================================================
 * 
 * Affiche la grille des produits récupérés depuis le Product Service.
 * Permet d'ajouter un produit au panier via le Cart Service.
 * 
 * @param {Function} onCartUpdate - Callback pour mettre à jour le compteur du panier
 */
function ProductList({ onCartUpdate }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedProducts, setAddedProducts] = useState(new Set());

  // Emoji par catégorie pour l'affichage visuel
  const categoryEmojis = {
    'Ordinateurs': '💻',
    'Smartphones': '📱',
    'Audio': '🎧',
    'Tablettes': '📟',
    'Accessoires': '🖱️',
    'Écrans': '🖥️'
  };

  // Récupération des produits au montage du composant
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProducts();

      if (response.success) {
        setProducts(response.data);
      } else {
        setError('Impossible de charger les produits');
      }
    } catch (err) {
      setError(`Erreur de connexion au Product Service : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Ajouter un produit au panier via le Cart Service
   */
  const handleAddToCart = async (product) => {
    try {
      const response = await addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      });

      if (response.success) {
        // Animation visuelle de confirmation
        setAddedProducts((prev) => new Set(prev).add(product.id));
        setTimeout(() => {
          setAddedProducts((prev) => {
            const next = new Set(prev);
            next.delete(product.id);
            return next;
          });
        }, 1500);

        // Notifier le parent pour mettre à jour le badge du panier
        if (onCartUpdate) onCartUpdate();
      }
    } catch (err) {
      console.error('Erreur lors de l\'ajout au panier:', err);
    }
  };

  /**
   * Déterminer le label de stock
   */
  const getStockInfo = (stock) => {
    if (stock === 0) return { text: 'Rupture de stock', className: 'product-card__stock--out' };
    if (stock <= 10) return { text: `Plus que ${stock} en stock`, className: 'product-card__stock--low' };
    return { text: `${stock} en stock`, className: '' };
  };

  // --- États de chargement et d'erreur ---
  if (loading) {
    return (
      <div className="loading">
        <div className="loading__spinner"></div>
        <p>Chargement des produits...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>⚠️ {error}</p>
        <button className="btn-add-cart" style={{ maxWidth: '200px', margin: '1rem auto 0' }} onClick={fetchProducts}>
          Réessayer
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">📦</div>
        <p>Aucun produit disponible</p>
      </div>
    );
  }

  // --- Rendu de la grille de produits ---
  return (
    <div className="products-grid">
      {products.map((product) => {
        const stockInfo = getStockInfo(product.stock);
        const isAdded = addedProducts.has(product.id);

        return (
          <article className="product-card" key={product.id}>
            {/* Image / Emoji */}
            <div className="product-card__image-container">
              <span className="product-card__emoji">
                {categoryEmojis[product.category] || '📦'}
              </span>
              <span className="product-card__category">{product.category}</span>
            </div>

            {/* Corps de la carte */}
            <div className="product-card__body">
              <h3 className="product-card__name">{product.name}</h3>
              <p className="product-card__description">{product.description}</p>

              {/* Prix et rating */}
              <div className="product-card__footer">
                <span className="product-card__price">{product.price.toFixed(2)} €</span>
                <span className="product-card__rating">
                  ⭐ {product.rating}
                </span>
              </div>

              {/* Stock */}
              <span className={`product-card__stock ${stockInfo.className}`}>
                {stockInfo.text}
              </span>

              {/* Bouton Ajouter au panier */}
              <button
                className={`btn-add-cart ${isAdded ? 'btn-add-cart--added' : ''}`}
                onClick={() => handleAddToCart(product)}
                disabled={product.stock === 0}
              >
                {isAdded ? '✓ Ajouté !' : '🛒 Ajouter au panier'}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default ProductList;
