// components/PlatformFeatures.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ShoppingCart, Megaphone, Repeat, Zap, UserCheck2, CreditCard, Users, Gift } from 'lucide-react';

// Feature definitions
const features = [
  {
    title: 'Marketplace',
    icon: ShoppingCart,
    description: 'Achetez & vendez des produits avec Uscor Tokens, profitez de commissions modérées (4–10%).'
  },
  {
    title: 'Publicités & Promotions',
    icon: Megaphone,
    description: 'Générez des revenus passifs: 2.5 Ts par annonce active sur vos produits.'
  },
  {
    title: 'Repost & Re-own',
    icon: Repeat,
    description: 'Repostez ou réacquérez des produits et gagnez 0.2% bonus sur chaque vente.'
  },
  {
    title: 'Affiliation',
    icon: Users,
    description: 'Référez 15 utilisateurs vérifiés & acheteurs pour gagner 2.5 Ts de bonus.'
  },
  {
    title: 'Freelance Gigs',
    icon: CreditCard,
    description: 'Offrez des services professionnels et gagnez via commissions sur chaque prestation.'
  },
  {
    title: 'KYC & Sécurité',
    icon: UserCheck2,
    description: 'Vérification avancée pour garantir la confiance et débloquer des fonctionnalités premium.'
  },
  {
    title: 'Recharge de Compte',
    icon: Zap,
    description: 'Alimentez votre portefeuille en Ts via MTN, Airtel, Orange, M-Pesa, et plus.'
  },
  {
    title: 'Bonus & Récompenses',
    icon: Gift,
    description: 'Accumulez des Ts bonus en participant aux challenges et programmes de fidélité.'
  }
];

export const PlatformFeatures: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
          Un Écosystème Complet pour Entreprises & Clients
        </h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Tous les services, avantages et flux de revenu intégrés pour maximiser votre potentiel.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feat, idx) => (
          <motion.div
            key={feat.title}
            className="rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(59,130,246,0.5)' }}
          >
            <Card>
              <CardHeader className="flex flex-col items-center">
                <feat.icon className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
                <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
                  {feat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-700 dark:text-gray-300">
                  {feat.description}
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
