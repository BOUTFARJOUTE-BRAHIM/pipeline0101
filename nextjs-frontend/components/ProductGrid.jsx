'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addToCartAction } from '@/lib/actions';

/**
 * ProductGrid - Client Component
 *
 * Reçoit les produits déjà chargés côté serveur (aucun fetch au montage,
 * contrairement à l'ancien ProductList.jsx qui faisait un useEffect +
 * fetch() vers le Product Service depuis le navigateur).
 *
 * Le seul rôle de ce composant est de gérer l'interactivité locale
 * (animation "Ajouté !") et d'appeler la Server Action addToCartAction,
 * qui s'exécute côté serveur et revalide le cache pour rafraîchir le
 * badge du panier.
 */
export default function ProductGrid({ initialProducts, initialError }) {
  const [addedProducts, setAddedProducts] = useState(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const categoryEmojis = {
    Ordinateurs: '💻',
    Smartphones: '📱',
    Audio: '🎧',
    Tablettes: '📟',
    Accessoires: '🖱️',
    Écrans: '🖥️',
  };

  const getStockInfo = (stock) => {
    if (stock === 0) return { text: 'Rupture de stock', className: 'product-card__stock--out' };
    if (stock <= 10) return { text: `Plus que ${stock} en stock`, className: 'product-card__stock--low' };
    return { text: `${stock} en stock`, className: '' };
  };

  const handleAddToCart = (product) => {
    startTransition(async () => {
      try {
        const response = await addToCartAction({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        });

        if (response.success) {
          setAddedProducts((prev) => new Set(prev).add(product.id));
          setTimeout(() => {
            setAddedProducts((prev) => {
              const next = new Set(prev);
              next.delete(product.id);
              return next;
            });
          }, 1500);
        }
      } catch (err) {
        console.error("Erreur lors de l'ajout au panier:", err);
      }
    });
  };

  if (initialError) {
    return (
      <div className="error-message">
        <p>⚠️ {initialError}</p>
        <button
          className="btn-add-cart"
          style={{ maxWidth: '200px', margin: '1rem auto 0' }}
          onClick={() => router.refresh()}
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (initialProducts.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">📦</div>
        <p>Aucun produit disponible</p>
      </div>
    );
  }

  return (
    <div className="products-grid">
      {initialProducts.map((product) => {
        const stockInfo = getStockInfo(product.stock);
        const isAdded = addedProducts.has(product.id);

        return (
          <article className="product-card" key={product.id}>
            <div className="product-card__image-container">
              <span className="product-card__emoji">
                {categoryEmojis[product.category] || '📦'}
              </span>
              <span className="product-card__category">{product.category}</span>
            </div>

            <div className="product-card__body">
              <h3 className="product-card__name">{product.name}</h3>
              <p className="product-card__description">{product.description}</p>

              <div className="product-card__footer">
                <span className="product-card__price">{product.price.toFixed(2)} €</span>
                <span className="product-card__rating">⭐ {product.rating}</span>
              </div>

              <span className={`product-card__stock ${stockInfo.className}`}>
                {stockInfo.text}
              </span>

              <button
                className={`btn-add-cart ${isAdded ? 'btn-add-cart--added' : ''}`}
                onClick={() => handleAddToCart(product)}
                disabled={product.stock === 0 || isPending}
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
