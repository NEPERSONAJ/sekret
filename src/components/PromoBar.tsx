import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const promos = {
  en: [
    'Game Account Store StartAccounts',
    '🎉 Special offer: 20% off on all accounts this weekend!',
    '⭐ New accounts with rare characters available!',
    '💎 Double bonus for first-time buyers!',
  ],
  ru: [
    'Магазин Стартовых игровых аккаунтов StartAccounts',
    '🎉 Специальное предложение: скидка 20% на все аккаунты в эти выходные!',
    '⭐ Доступны новые аккаунты с редкими персонажами!',
    '💎 Двойной бонус для первых покупателей!',
  ],
};

export default function PromoBar() {
  const { language } = useLanguage();
  const [currentPromo, setCurrentPromo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromo((prev) => (prev + 1) % promos[language].length);
    }, 5000);

    return () => clearInterval(interval);
  }, [language]);

  return (
    <div className="bg-gradient-to-r from-purple-900/50 via-indigo-900/50 to-purple-900/50">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPromo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center space-y-1 text-center"
          >
            {currentPromo === 0 ? (
              <h1 className="text-lg font-bold bg-gradient-to-r from-yellow-200 via-purple-400 to-pink-300 bg-clip-text text-transparent">
                {promos[language][currentPromo]}
              </h1>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span className="text-white/90">{promos[language][currentPromo]}</span>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
