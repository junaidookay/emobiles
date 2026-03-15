import { useNavigate } from 'react-router-dom';
import { Smartphone, Headphones, Watch, Laptop, Gamepad2, Cable, Speaker, Camera } from 'lucide-react';
import { BentoGrid, BentoCard } from '@/components/magicui/BentoGrid';
import { useCategories } from '@/hooks/useProducts';

const iconMap: Record<string, React.ReactNode> = {
  Smartphone: <Smartphone className="h-6 w-6" />,
  Headphones: <Headphones className="h-6 w-6" />,
  Watch: <Watch className="h-6 w-6" />,
  Laptop: <Laptop className="h-6 w-6" />,
  Tablet: <Gamepad2 className="h-6 w-6" />,
  Cable: <Cable className="h-6 w-6" />,
  Speaker: <Speaker className="h-6 w-6" />,
  Camera: <Camera className="h-6 w-6" />,
};

const BentoDiscovery = () => {
  const { data: categories } = useCategories();
  const navigate = useNavigate();

  const topCats = categories?.slice(0, 7) || [];

  const sizeClasses = [
    'md:col-span-2 md:row-span-2', // large
    'md:col-span-1 md:row-span-1',
    'md:col-span-1 md:row-span-1',
    'md:col-span-1 md:row-span-2', // tall
    'md:col-span-1 md:row-span-1',
    'md:col-span-1 md:row-span-1',
    'md:col-span-1 md:row-span-1',
  ];

  return (
    <section className="container py-20 md:py-28">
      <div className="text-center mb-14">
        <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
          Discover by <span className="text-gradient">Category</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Explore our curated collections of cutting-edge electronics
        </p>
      </div>

      <BentoGrid className="auto-rows-[14rem] md:auto-rows-[16rem]">
        {topCats.map((cat, i) => (
          <BentoCard
            key={cat.id}
            name={cat.name}
            description={`${cat.product_count || 0} products`}
            icon={iconMap[cat.icon || ''] || <Smartphone className="h-6 w-6" />}
            className={sizeClasses[i] || ''}
            onClick={() => navigate(`/shop?category=${cat.slug}`)}
            background={
              <img
                src={cat.image || '/placeholder.svg'}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            }
          />
        ))}
      </BentoGrid>
    </section>
  );
};

export default BentoDiscovery;
