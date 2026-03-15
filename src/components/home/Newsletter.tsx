import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Meteors from '@/components/magicui/Meteors';

const Newsletter = () => (
  <section className="container py-20 md:py-28">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="relative overflow-hidden rounded-3xl bg-hero-gradient p-10 md:p-20 text-center"
    >
      <Meteors number={10} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_70%)]" />

      <div className="relative z-10">
        <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
          Stay in the Loop
        </h2>
        <p className="text-primary-foreground/60 text-lg mb-10 max-w-md mx-auto">
          Get exclusive deals, new arrivals, and tech insights delivered to your inbox.
        </p>
        <div className="flex gap-3 max-w-md mx-auto">
          <Input
            placeholder="Enter your email"
            className="h-14 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/30 rounded-full px-6"
          />
          <Button variant="secondary" className="h-14 px-8 rounded-full font-semibold">
            Subscribe
          </Button>
        </div>
      </div>
    </motion.div>
  </section>
);

export default Newsletter;
