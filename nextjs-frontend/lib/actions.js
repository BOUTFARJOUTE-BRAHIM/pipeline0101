'use server';

import { revalidatePath } from 'next/cache';
import { addToCart, removeFromCart, createOrder } from './api';

/**
 * =============================================================
 * Server Actions
 * =============================================================
 *
 * Ces fonctions s'exécutent EXCLUSIVEMENT sur le serveur Next.js, même
 * si elles sont importées et appelées depuis des composants clients
 * (Next.js génère automatiquement le point d'entrée RPC nécessaire).
 *
 * C'est l'équivalent server-side des appels fetch() que faisait
 * l'ancien src/services/api.js directement depuis le navigateur.
 *
 * revalidatePath('/', 'layout') invalide le cache de rendu de toute
 * l'arborescence (donc le compteur du panier dans le layout, la page
 * panier et la page commandes) pour que les Server Components
 * ré-exécutent leurs fetch() au prochain rendu.
 */

export async function addToCartAction(product) {
  const result = await addToCart(product);
  revalidatePath('/', 'layout');
  return result;
}

export async function removeFromCartAction(productId) {
  const result = await removeFromCart(productId);
  revalidatePath('/', 'layout');
  return result;
}

export async function createOrderAction(items) {
  const result = await createOrder(items);
  revalidatePath('/', 'layout');
  return result;
}
