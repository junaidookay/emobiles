import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NeonGradientCard from '@/components/magicui/NeonGradientCard';
import { useProducts, ProductWithImages } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/context/CartContext';
import { ShoppingCart } from 'lucide-react';

const AccessoriesSection = () => {
  const { data: products, isLoading } = useProducts({ bestSeller: true, limit: 6 });

  if (isLoading) {
    return (
      <section className="container py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-[320px] rounded-2xl" />)}
        </div>
      </section>
    );
  }

  return (
    <section className="container py-20 md:py-28">
      <div className="flex items-end justify-between mb-14">
        <div>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Best <span className="text-gradient">Sellers</span>
          </h2>
          <p className="text-muted-foreground text-lg">Most loved by our customers</p>
        </div>
        <Button variant="ghost" asChild className="hidden md:flex">
          <Link to="/shop">Shop All <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {products?.slice(0, 6).map(product => (
          <AccessoryCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

const AccessoryCard = ({ product }: { product: ProductWithImages }) => {
  const { addToCart } = useCart();
  const mainImage = product.product_images?.[0]?.url || '/placeholder.svg';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      id: product.id, name: product.name, slug: product.slug,
      description: product.description || '', shortDescription: product.short_description || '',
      price: product.price, discountPrice: product.discount_price ?? undefined,
      stock: product.stock, sku: product.sku || '', brandId: product.brand_id || '',
      categoryId: product.category_id || '', images: product.product_images?.map(i => i.url) || [],
      specifications: product.specifications || {}, rating: product.rating,
      reviewCount: product.review_count, isFeatured: product.is_featured,
      isNew: product.is_new, isBestSeller: product.is_best_seller, createdAt: product.created_at,
    });
  };

  return (
    <Link to={`/product/${product.slug}`}>
      <NeonGradientCard>
        <div className="p-4 md:p-6">
          <div className="aspect-square rounded-xl overflow-hidden bg-secondary/50 mb-4">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          {product.brands && (
            <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-1">{product.brands.name}</p>
          )}
          <h3 className="font-display font-semibold text-sm leading-tight mb-2 line-clamp-2">{product.name}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {product.discount_price ? (
                <>
                  <span className="font-display font-bold">${product.discount_price}</span>
                  <span className="text-xs text-muted-foreground line-through">${product.price}</span>
                </>
              ) : (
                <span className="font-display font-bold">${product.price}</span>
              )}
            </div>
            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={handleAddToCart}>
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </NeonGradientCard>
    </Link>
  );
};

export default AccessoriesSection;
