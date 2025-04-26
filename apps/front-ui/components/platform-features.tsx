// components/PlatformFeatures.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import * as motion from 'motion/react-client';
import type { Variants } from 'motion/react';
import { ShoppingCart, Megaphone, Repeat, Zap, UserCheck2, CreditCard, Users, Gift } from 'lucide-react';

// Feature definitions with gradient hues
type Feature = { title: string; icon: React.ComponentType<any>; description: string; hueA: number; hueB: number };
const features: Feature[] = [
  { title: 'Marketplace', icon: ShoppingCart, description: 'Achetez & vendez des produits avec Uscor Tokens, profitez de commissions modérées (4–10%).', hueA: 340, hueB: 10 },
  { title: 'Publicités', icon: Megaphone, description: 'Générez des revenus passifs: 2.5 Ts par annonce active.', hueA: 20, hueB: 40 },
  { title: 'Repost & Re-own', icon: Repeat, description: 'Repostez ou réacquérez des produits et gagnez 0.2% bonus.', hueA: 60, hueB: 90 },
  { title: 'Affiliation', icon: Users, description: 'Référez 15 utilisateurs vérifiés pour 2.5 Ts de bonus.', hueA: 80, hueB: 120 },
  { title: 'Freelance Gigs', icon: CreditCard, description: 'Offrez des services pros et gagnez via commissions.', hueA: 100, hueB: 140 },
  { title: 'KYC & Sécurité', icon: UserCheck2, description: 'Vérification avancée pour débloquer des fonctionnalités premium.', hueA: 205, hueB: 245 },
  { title: 'Recharge', icon: Zap, description: 'Alimentez votre portefeuille en Ts via mobile money.', hueA: 260, hueB: 290 },
  { title: 'Bonus & Récompenses', icon: Gift, description: 'Accumulez des Ts bonus avec nos programmes fidélité.', hueA: 290, hueB: 320 }
];

// Clip-path splash style and container styles
const cardContainerStyle: React.CSSProperties = {
  overflow: 'hidden',
  position: 'relative',
  borderRadius: 16,
  minHeight: 350,
};

const splashVariants: Variants = {
  offscreen: { opacity: 0 },
  onscreen: { opacity: 1, transition: { duration: 0.6 } }
};

const cardVariants: Variants = {
  offscreen: { y: 300, opacity: 0 },
  onscreen: { y: 50, opacity: 1, transition: { type: 'spring', bounce: 0.4, duration: 0.8 } }
};

const hue = (h: number) => `hsl(${h},100%,50%)`;

export const PlatformFeatures: React.FC = () => {
  return (
    <section style={{ minHeight: '100vh', padding: '4rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.5rem' }}>
      {features.map((feat, idx) => (
        <motion.div
          key={feat.title}
          style={cardContainerStyle}
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ amount: 0.6, once: true }}
          variants={cardVariants}
        >
          <motion.div
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: `linear-gradient(306deg, ${hue(feat.hueA)}, ${hue(feat.hueB)})`,
              clipPath: `path("M 0 303.5 C 0 292.454 8.995 285.101 20 283.5 L 460 219.5 C 470.085 218.033 480 228.454 480 239.5 L 500 430 C 500 441.046 491.046 450 480 450 L 20 450 C 8.954 450 0 441.046 0 430 Z")`,
            }}
            variants={splashVariants}
          />
          <Card className="relative">
            <CardHeader className="flex flex-col items-center pt-8">
              <feat.icon className="h-12 w-12 text-white mb-4" />
              <CardTitle className="text-xl text-white">
                {feat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white pb-8">
                {feat.description}
              </CardDescription>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </section>
  );
};
