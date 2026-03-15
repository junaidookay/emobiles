import { Link } from 'react-router-dom';
import { Zap, Shield, Truck, Cpu, Wifi, Battery } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: Cpu, title: 'Latest Processors', desc: 'Cutting-edge chipsets for peak performance' },
  { icon: Battery, title: 'All-Day Battery', desc: 'Power that lasts from dawn to dusk' },
  { icon: Wifi, title: 'Next-Gen Connectivity', desc: '5G & WiFi 7 ready devices' },
  { icon: Shield, title: 'Premium Build', desc: 'Military-grade durability standards' },
  { icon: Zap, title: 'Fast Charging', desc: '0-80% in just 30 minutes' },
  { icon: Truck, title: 'Free Shipping', desc: 'On all orders over $50' },
];

const TechExperience = () => (
  <section className="bg-secondary/30">
    <div className="container py-20 md:py-28">
      <div className="text-center mb-16">
        <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
          Why Choose <span className="text-gradient">Us</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          We bring you the best technology with unmatched service
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="group text-center p-6 md:p-8 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-card-hover transition-all duration-500"
          >
            <div className="inline-flex p-4 rounded-2xl bg-primary/5 group-hover:bg-primary/10 group-hover:animate-pulse-glow transition-all duration-500 mb-5">
              <f.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-display font-bold text-sm md:text-base mb-2">{f.title}</h3>
            <p className="text-xs md:text-sm text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TechExperience;
