import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBrands } from '@/hooks/useProducts';

const BrandShowcase = () => {
  const { data: brands } = useBrands();

  return (
    <section className="container py-20 md:py-28">
      <div className="text-center mb-14">
        <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
          Trusted <span className="text-gradient">Brands</span>
        </h2>
        <p className="text-muted-foreground text-lg">Partnered with the world's best</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-4xl mx-auto">
        {brands?.map((brand, i) => (
          <motion.div
            key={brand.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.02 }}
          >
            <Link
              to={`/shop?brand=${brand.slug}`}
              className="inline-flex px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-full border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
            >
              {brand.name}
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default BrandShowcase;
