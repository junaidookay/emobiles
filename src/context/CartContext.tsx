import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = 'emobiles_guest_cart';

const saveGuestCart = (items: CartItem[]) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

const loadGuestCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(loadGuestCart);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const prevUserId = useRef<string | null>(null);

  // Fetch cart from DB when user logs in + merge guest cart
  useEffect(() => {
    if (user && prevUserId.current !== user.id) {
      prevUserId.current = user.id;
      (async () => {
        setLoading(true);
        const { data: dbItems } = await supabase
          .from('cart_items')
          .select('product_id, quantity')
          .eq('user_id', user.id);

        const guestItems = loadGuestCart();

        if (guestItems.length > 0 && dbItems) {
          // Merge guest cart into DB
          for (const gi of guestItems) {
            const existing = dbItems.find(d => d.product_id === gi.product.id);
            if (existing) {
              await supabase.from('cart_items')
                .update({ quantity: existing.quantity + gi.quantity })
                .eq('user_id', user.id)
                .eq('product_id', gi.product.id);
            } else {
              await supabase.from('cart_items').insert({
                user_id: user.id,
                product_id: gi.product.id,
                quantity: gi.quantity,
              });
            }
          }
          localStorage.removeItem(GUEST_CART_KEY);
        }

        // Now fetch full cart with product details
        const { data: fullCart } = await supabase
          .from('cart_items')
          .select('product_id, quantity, products(*, product_images(id, url, sort_order))')
          .eq('user_id', user.id);

        if (fullCart) {
          const mapped: CartItem[] = fullCart
            .filter((ci: any) => ci.products)
            .map((ci: any) => ({
              product: {
                id: ci.products.id,
                name: ci.products.name,
                slug: ci.products.slug,
                description: ci.products.description || '',
                shortDescription: ci.products.short_description || '',
                price: ci.products.price,
                discountPrice: ci.products.discount_price ?? undefined,
                stock: ci.products.stock,
                sku: ci.products.sku || '',
                brandId: ci.products.brand_id || '',
                categoryId: ci.products.category_id || '',
                images: ci.products.product_images?.map((i: any) => i.url) || [],
                specifications: ci.products.specifications || {},
                rating: ci.products.rating,
                reviewCount: ci.products.review_count,
                isFeatured: ci.products.is_featured,
                isNew: ci.products.is_new,
                isBestSeller: ci.products.is_best_seller,
                createdAt: ci.products.created_at,
              },
              quantity: ci.quantity,
            }));
          setItems(mapped);
        }
        setLoading(false);
      })();
    } else if (!user) {
      prevUserId.current = null;
      setItems(loadGuestCart());
    }
  }, [user]);

  const syncToDb = useCallback(async (productId: string, quantity: number) => {
    if (!user) return;
    if (quantity <= 0) {
      await supabase.from('cart_items').delete().eq('user_id', user.id).eq('product_id', productId);
    } else {
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();
      if (existing) {
        await supabase.from('cart_items').update({ quantity }).eq('id', existing.id);
      } else {
        await supabase.from('cart_items').insert({ user_id: user.id, product_id: productId, quantity });
      }
    }
  }, [user]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      let newItems: CartItem[];
      if (existing) {
        const newQty = existing.quantity + quantity;
        newItems = prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
        syncToDb(product.id, newQty);
      } else {
        newItems = [...prev, { product, quantity }];
        syncToDb(product.id, quantity);
      }
      if (!user) saveGuestCart(newItems);
      return newItems;
    });
    toast.success(`${product.name} added to cart`);
  }, [user, syncToDb]);

  const removeFromCart = useCallback((productId: string) => {
    setItems(prev => {
      const newItems = prev.filter(item => item.product.id !== productId);
      if (!user) saveGuestCart(newItems);
      return newItems;
    });
    syncToDb(productId, 0);
    toast.info('Item removed from cart');
  }, [user, syncToDb]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev => {
      const newItems = prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      if (!user) saveGuestCart(newItems);
      return newItems;
    });
    syncToDb(productId, quantity);
  }, [removeFromCart, user, syncToDb]);

  const clearCart = useCallback(async () => {
    setItems([]);
    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id);
    }
    localStorage.removeItem(GUEST_CART_KEY);
  }, [user]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const price = item.product.discountPrice ?? item.product.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, subtotal, loading }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export type { CartItem };
