import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useProducts, ProductWithImages } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import MagicCard from '@/components/magicui/MagicCard';
import { Badge } from '@/components/ui/badge';

const SmartphoneShowcase = () => {
  const { data: products, isLoading } = useProducts({ isNew: true, limit: 4 });

  if (isLoading) {
    return (
      <section className="container py-20">
        <div className="flex gap-6 overflow-hidden">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-[500px] w-[350px] rounded-2xl flex-shrink-0" />)}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-secondary/30 overflow-hidden">
      <div className="container py-20 md:py-28">
        <div className="flex items-end justify-between mb-14">
          <div>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              New <span className="text-gradient">Arrivals</span>
            </h2>
            <p className="text-muted-foreground text-lg">Fresh from the factory floor</p>
          </div>
          <Button variant="ghost" asChild className="hidden md:flex">
            <Link to="/shop">See All <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products?.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <ShowcaseCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ShowcaseCard = ({ product }: { product: ProductWithImages }) => {
  const mainImage = product.product_images?.[0]?.url || '/placeholder.svg';

  return (
    <Link to={`/product/${product.slug}`}>
      <MagicCard className="overflow-hidden group">
        <div className="aspect-[3/4] relative overflow-hidden">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />

          <div className="absolute top-4 left-4">
            <Badge className="bg-primary text-primary-foreground border-0 shadow-lg">NEW</Badge>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            {product.brands && (
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/50 mb-1">{product.brands.name}</p>
            )}
            <h3 className="font-display text-lg font-bold text-primary-foreground mb-2 line-clamp-2">{product.name}</h3>
            <div className="flex items-center gap-2">
              {product.discount_price ? (
                <>
                  <span className="font-display text-xl font-bold text-primary-foreground">${product.discount_price}</span>
                  <span className="text-sm text-primary-foreground/40 line-through">${product.price}</span>
                </>
              ) : (
                <span className="font-display text-xl font-bold text-primary-foreground">${product.price}</span>
              )}
            </div>
          </div>
        </div>
      </MagicCard>
    </Link>
  );
};

export default SmartphoneShowcase;
