/**
 * =============================================================
 * Order Service - Routes des commandes
 * =============================================================
 * 
 * Routes REST pour la gestion des commandes :
 * 
 *   GET  /api/orders      → Consulter toutes les commandes
 *   GET  /api/orders/:id  → Consulter une commande spécifique
 *   POST /api/orders      → Créer une nouvelle commande
 * 
 * Communication inter-services :
 *   Ce service communique avec le Product Service via son nom DNS
 *   Kubernetes (http://product-service:3001) pour vérifier que les
 *   produits existent avant de créer une commande.
 */

const express = require('express');
const router = express.Router();

// Import des données en mémoire
const { orders, getNextOrderId } = require('../data/orders');

// URL du Product Service via le nom DNS Kubernetes
// En local, on peut surcharger via la variable d'environnement PRODUCT_SERVICE_URL
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-srv:3001';

/**
 * GET /api/orders
 * 
 * Retourne la liste de toutes les commandes.
 */
router.get('/', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des commandes',
      error: error.message
    });
  }
});

/**
 * GET /api/orders/:id
 * 
 * Retourne le détail d'une commande spécifique par son ID.
 * 
 * @param {number} id - L'identifiant de la commande
 */
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'L\'ID de la commande doit être un nombre valide'
      });
    }

    const order = orders.find((o) => o.id === id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Commande avec l'ID ${id} non trouvée`
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de la commande',
      error: error.message
    });
  }
});

/**
 * POST /api/orders
 * 
 * Crée une nouvelle commande.
 * Vérifie chaque produit auprès du Product Service via API REST
 * avant de valider la commande.
 * 
 * @body {Array} items - Liste des articles : [{ productId, name, price, quantity }]
 */
router.post('/', async (req, res) => {
  try {
    const { items } = req.body;

    // Validation : la commande doit contenir au moins un article
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La commande doit contenir au moins un article (items)'
      });
    }

    // -------------------------------------------------------
    // Vérification des produits auprès du Product Service
    // Communication inter-services via API REST
    // -------------------------------------------------------
    const verifiedItems = [];

    for (const item of items) {
      if (!item.productId || !item.quantity) {
        return res.status(400).json({
          success: false,
          message: 'Chaque article doit avoir un productId et une quantity'
        });
      }

      try {
        // Appel REST vers le Product Service pour vérifier le produit
        const response = await fetch(`${PRODUCT_SERVICE_URL}/api/products/${item.productId}`);
        const productData = await response.json();

        if (!productData.success) {
          return res.status(404).json({
            success: false,
            message: `Produit avec l'ID ${item.productId} non trouvé dans le catalogue`
          });
        }

        // Ajouter l'article vérifié avec les données du Product Service
        verifiedItems.push({
          productId: productData.data.id,
          name: productData.data.name,
          price: productData.data.price,
          quantity: item.quantity
        });
      } catch (fetchError) {
        return res.status(503).json({
          success: false,
          message: `Impossible de contacter le Product Service pour vérifier le produit ${item.productId}`,
          error: fetchError.message
        });
      }
    }

    // -------------------------------------------------------
    // Création de la commande
    // -------------------------------------------------------
    const total = verifiedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const newOrder = {
      id: getNextOrderId(),
      items: verifiedItems,
      total: parseFloat(total.toFixed(2)),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    orders.push(newOrder);

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès',
      data: newOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de la commande',
      error: error.message
    });
  }
});

module.exports = router;
