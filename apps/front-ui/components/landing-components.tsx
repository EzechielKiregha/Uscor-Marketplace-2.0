// components/LandingComponents.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';

import { useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { animate, useTransform } from "motion/react"
import { useEffect } from "react"

export default function AnimatedStats({ nombre }: { nombre: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (value) => Math.round(value)); // Use count as dependency

  useEffect(() => {
    const controls = animate(count, nombre, { duration: 2 }); // Adjust duration as needed
    return () => controls.stop();
  }, [count, nombre]); // Add dependencies to ensure proper reactivity

  return <motion.pre style={text}>{rounded}</motion.pre>;
}

/**
* ==============   Styles   ================
*/

const text = {
  fontSize: 64,
  color: "#8df0cc",
}

// 1. Statistics Section with scroll-triggered count-up
export const StatsSection: React.FC = () => {
  const stats: { label: string; value: number }[] = [
    { label: 'Produits', value: 1200 },
    { label: 'Ventes', value: 850 },
    { label: 'Clients satisfaits', value: 450 },
  ];

  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });

  React.useEffect(() => {
    if (inView) {
      controls.start((i: number) => ({
        count: stats[i].value,
        transition: { duration: 1.5, ease: 'easeOut' }
      }));
    }
  }, [controls, inView, stats]);

  return (
    <section ref={ref} className="py-4 bg-white ">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
        {stats.map((stat, index) => (
          <motion.div key={stat.label}>
            <motion.span>
              <AnimatedStats nombre={stat.value} />
            </motion.span>
            <p className="mt-2 text-lg text-gray-700 dark:text-gray-300">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// 2. Testimonials Carousel
export const Testimonials: React.FC = () => {
  const items = [
    { quote: 'Service incroyable et rapide!', author: 'Marie L.' },
    { quote: 'Des prix imbattables.', author: 'John K.' },
    { quote: 'Meubles de haute qualité.', author: 'Amina R.' },
  ];

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">Témoignages</h2>
        <div className="space-y-8">
          {items.map((item, idx) => (
            <Card key={idx} className="p-6">
              <CardContent>
                <p className="italic text-gray-700 dark:text-gray-300">“{item.quote}”</p>
                <p className="mt-4 font-semibold text-right text-gray-900 dark:text-gray-100">— {item.author}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

// 3. Newsletter Signup
export const NewsletterSignup: React.FC = () => {
  const color = useMotionValue(COLORS_TOP[0]);

  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #020617 50%, ${color})`;
  const border = useMotionTemplate`1px solid ${color}`;
  const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;

  return (
    <motion.section
      style={{
        backgroundImage,
      }}
      className="relative place-content-center overflow-hidden bg-gray-950 px-4 py-16 text-gray-200"
    >
      <div className="absolute inset-0 z-0">
        <Canvas>
          <Stars radius={50} count={2500} factor={4} fade speed={2} />
        </Canvas>
      </div>
      <div className="max-w-md mx-auto text-center text-white">
        <h3 className="text-2xl font-bold mb-4">Restez informé</h3>
        <p className="mb-6">Inscrivez-vous à notre newsletter pour recevoir les dernières offres.</p>
        <div className="flex items-center space-x-2">
          <motion.input
            style={{
              border,
              boxShadow,
            }}
            whileHover={{
              scale: 1.015,
            }}
            whileTap={{
              scale: 0.985,
            }}
            type="email"
            placeholder="Votre email"
            className="flex-1"
          />
          <motion.button
            style={{
              border,
              boxShadow,
            }}
            whileHover={{
              scale: 1.015,
            }}
            whileTap={{
              scale: 0.985,
            }}
            className="group relative flex w-fit items-center gap-1.5 rounded-full bg-gray-950/10 px-4 py-2 text-gray-50 transition-colors hover:bg-gray-950/50"
          >
            S'inscrire
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
};

// 4. How It Works
export const HowItWorks: React.FC = () => {
  const steps = [
    { title: 'Choisissez un produit', desc: 'Parcourez notre catalogue et trouvez ce qu’il vous faut.' },
    { title: 'Passez commande', desc: 'Utilisez vos Uscor Tokens pour finaliser l’achat.' },
    { title: 'Livraison rapide', desc: 'Recevez votre commande directement chez vous.' },
  ];

  return (
    <section className="py-16 bg-white ">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">Comment ça marche</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="p-6 border rounded-lg dark:border-gray-700"
            >
              <h3 className="text-xl font-semibold text-blue-600 mb-2">{step.title}</h3>
              <p className="text-gray-700 dark:text-gray-300">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
