import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MagicCard from '@/components/magicui/MagicCard';
import { useProducts, ProductWithImages } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const FeaturedDevices = () => {
  const { data: products, isLoading } = useProducts({ featured: true, limit: 4 });

  if (isLoading) {
    return (
      <section className="container py-20">
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[400px] rounded-2xl" />)}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-secondary/30">
      <div className="container py-20 md:py-28">
        <div className="flex items-end justify-between mb-14">
          <div>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Featured <span className="text-gradient">Devices</span>
            </h2>
            <p className="text-muted-foreground text-lg">Handpicked premium technology</p>
          </div>
          <Button variant="ghost" asChild className="hidden md:flex">
            <Link to="/shop">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {products?.slice(0, 4).map((product, i) => (
            <FeaturedCard key={product.id} product={product} large={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
};

const FeaturedCard = ({ product, large }: { product: ProductWithImages; large?: boolean }) => {
  const mainImage = product.product_images?.[0]?.url || '/placeholder.svg';
  const discount = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  return (
    <Link to={`/product/${product.slug}`} className={large ? 'md:row-span-2' : ''}>
      <MagicCard className="h-full overflow-hidden">
        <div className={`relative ${large ? 'aspect-[3/4]' : 'aspect-[16/9]'} overflow-hidden`}>
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />

          <div className="absolute top-4 left-4 flex gap-2">
            {product.is_new && <Badge className="bg-primary text-primary-foreground border-0">NEW</Badge>}
            {discount > 0 && <Badge className="bg-accent text-accent-foreground border-0">-{discount}%</Badge>}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            {product.brands && (
              <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/60 mb-1">{product.brands.name}</p>
            )}
            <h3 className="font-display text-xl md:text-2xl font-bold text-primary-foreground mb-2 line-clamp-2">{product.name}</h3>
            <div className="flex items-center gap-3">
              {product.discount_price ? (
                <>
                  <span className="font-display text-2xl font-bold text-primary-foreground">${product.discount_price}</span>
                  <span className="text-sm text-primary-foreground/50 line-through">${product.price}</span>
                </>
              ) : (
                <span className="font-display text-2xl font-bold text-primary-foreground">${product.price}</span>
              )}
            </div>
          </div>
        </div>
      </MagicCard>
    </Link>
  );
};

export default FeaturedDevices;
