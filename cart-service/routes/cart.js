/**
 * =============================================================
 * Cart Service - Routes du panier
 * =============================================================
 * 
 * Routes REST pour la gestion du panier :
 * 
 *   GET    /api/cart            → Afficher le contenu du panier
 *   POST   /api/cart            → Ajouter un produit au panier
 *   DELETE /api/cart/:productId → Supprimer un produit du panier
 */

const express = require('express');
const router = express.Router();

// Import du panier en mémoire
const cart = require('../data/cart');

/**
 * GET /api/cart
 * 
 * Retourne le contenu complet du panier avec le total.
 */
router.get('/', (req, res) => {
  try {
    // Calcul du prix total du panier
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    res.status(200).json({
      success: true,
      count: cart.length,
      total: parseFloat(total.toFixed(2)),
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du panier',
      error: error.message
    });
  }
});

/**
 * POST /api/cart
 * 
 * Ajoute un produit au panier.
 * Si le produit existe déjà dans le panier, la quantité est incrémentée.
 * 
 * @body {number} productId - L'ID du produit à ajouter
 * @body {string} name      - Le nom du produit
 * @body {number} price     - Le prix unitaire du produit
 * @body {number} quantity  - La quantité à ajouter (par défaut 1)
 */
router.post('/', (req, res) => {
  try {
    const { productId, name, price, quantity = 1 } = req.body;

    // Validation des champs obligatoires
    if (!productId || !name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Les champs productId, name et price sont obligatoires'
      });
    }

    // Vérifier si le produit existe déjà dans le panier
    const existingItem = cart.find((item) => item.productId === productId);

    if (existingItem) {
      // Si le produit existe, incrémenter la quantité
      existingItem.quantity += quantity;

      return res.status(200).json({
        success: true,
        message: `Quantité du produit "${name}" mise à jour dans le panier`,
        data: existingItem
      });
    }

    // Sinon, ajouter le nouveau produit au panier
    const newItem = {
      productId,
      name,
      price,
      quantity
    };

    cart.push(newItem);

    res.status(201).json({
      success: true,
      message: `Produit "${name}" ajouté au panier`,
      data: newItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'ajout au panier',
      error: error.message
    });
  }
});

/**
 * DELETE /api/cart/:productId
 * 
 * Supprime un produit du panier par son productId.
 * 
 * @param {number} productId - L'ID du produit à supprimer
 */
router.delete('/:productId', (req, res) => {
  try {
    const productId = parseInt(req.params.productId);

    // Vérification que l'ID est un nombre valide
    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: 'L\'ID du produit doit être un nombre valide'
      });
    }

    // Recherche de l'index du produit dans le panier
    const index = cart.findIndex((item) => item.productId === productId);

    // Vérification que le produit est dans le panier
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Produit avec l'ID ${productId} non trouvé dans le panier`
      });
    }

    // Suppression du produit du panier
    const removedItem = cart.splice(index, 1)[0];

    res.status(200).json({
      success: true,
      message: `Produit "${removedItem.name}" supprimé du panier`,
      data: removedItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du produit du panier',
      error: error.message
    });
  }
});

module.exports = router;
