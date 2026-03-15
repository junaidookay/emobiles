import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Timer } from 'lucide-react';
import { motion } from 'framer-motion';

const DealOfTheWeek = () => (
  <section className="relative overflow-hidden">
    <div className="absolute inset-0 bg-hero-gradient opacity-90" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.1),transparent_60%)]" />

    <div className="container relative z-10 py-20 md:py-28">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-foreground/20 text-primary-foreground/80 text-sm font-medium mb-6">
            <Timer className="h-4 w-4" /> Limited Time Offer
          </div>
          <h2 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground mb-4 leading-[1.05]">
            Deal of<br />the Week
          </h2>
          <p className="text-lg text-primary-foreground/60 mb-8 max-w-md leading-relaxed">
            Up to 40% off on premium audio devices. Immerse yourself in crystal-clear sound.
          </p>
          <div className="flex gap-6 mb-10">
            {[
              { value: '03', label: 'Days' },
              { value: '14', label: 'Hours' },
              { value: '52', label: 'Mins' },
              { value: '09', label: 'Secs' },
            ].map(t => (
              <div key={t.label} className="text-center">
                <div className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">{t.value}</div>
                <div className="text-xs text-primary-foreground/50 uppercase tracking-wider mt-1">{t.label}</div>
              </div>
            ))}
          </div>
          <Button size="lg" variant="secondary" className="h-14 px-10 rounded-full text-base" asChild>
            <Link to="/shop?category=headphones">Shop Audio Deals <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative hidden lg:block"
        >
          <div className="absolute -inset-8 bg-primary-foreground/5 rounded-full blur-3xl" />
          <img
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop"
            alt="Premium Headphones"
            className="relative w-full max-w-md mx-auto rounded-3xl animate-float"
          />
        </motion.div>
      </div>
    </div>
  </section>
);

export default DealOfTheWeek;
