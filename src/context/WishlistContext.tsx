import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const prevUserId = useRef<string | null>(null);

  useEffect(() => {
    if (user && prevUserId.current !== user.id) {
      prevUserId.current = user.id;
      (async () => {
        setLoading(true);
        const { data } = await supabase
          .from('wishlist')
          .select('product_id, products(*, product_images(id, url, sort_order))')
          .eq('user_id', user.id);

        if (data) {
          const mapped: Product[] = data
            .filter((w: any) => w.products)
            .map((w: any) => ({
              id: w.products.id,
              name: w.products.name,
              slug: w.products.slug,
              description: w.products.description || '',
              shortDescription: w.products.short_description || '',
              price: w.products.price,
              discountPrice: w.products.discount_price ?? undefined,
              stock: w.products.stock,
              sku: w.products.sku || '',
              brandId: w.products.brand_id || '',
              categoryId: w.products.category_id || '',
              images: w.products.product_images?.map((i: any) => i.url) || [],
              specifications: w.products.specifications || {},
              rating: w.products.rating,
              reviewCount: w.products.review_count,
              isFeatured: w.products.is_featured,
              isNew: w.products.is_new,
              isBestSeller: w.products.is_best_seller,
              createdAt: w.products.created_at,
            }));
          setItems(mapped);
        }
        setLoading(false);
      })();
    } else if (!user) {
      prevUserId.current = null;
      setItems([]);
    }
  }, [user]);

  const addToWishlist = useCallback(async (product: Product) => {
    setItems(prev => {
      if (prev.find(p => p.id === product.id)) return prev;
      return [...prev, product];
    });
    if (user) {
      await supabase.from('wishlist').insert({ user_id: user.id, product_id: product.id });
    }
    toast.success(`${product.name} added to wishlist`);
  }, [user]);

  const removeFromWishlist = useCallback(async (productId: string) => {
    setItems(prev => prev.filter(p => p.id !== productId));
    if (user) {
      await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', productId);
    }
    toast.info('Removed from wishlist');
  }, [user]);

  const isInWishlist = useCallback((productId: string) => {
    return items.some(p => p.id === productId);
  }, [items]);

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isInWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
