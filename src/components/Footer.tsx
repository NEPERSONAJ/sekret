import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/i18n/translations';
import { Sparkles, Heart, Shield, Mail, MessageSquare, Instagram } from 'lucide-react';
import { Link } from '@/components/ui/link';

export default function Footer() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <footer className="border-t border-white/10 bg-black/50 backdrop-blur-lg mt-12">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 text-center md:text-left"
          >
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <Sparkles className="h-6 w-6 text-yellow-400" />
              <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-200 via-purple-400 to-pink-300 bg-clip-text text-transparent">
                StartAccount
              </h3>
            </div>
            <p className="text-sm text-white/70">
              {language === 'en' 
                ? 'Your trusted marketplace for game accounts'
                : 'Ваш надежный маркетплейс игровых аккаунтов'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center md:text-left"
          >
            <h4 className="font-semibold text-white mb-4">
              {language === 'en' ? 'Quick Links' : 'Быстрые ссылки'}
            </h4>
            <ul className="space-y-2 text-white/70">
              {Object.entries(t.nav).map(([key, value]) => (
                <li key={key}>
                  <Link href={`#${key}`} className="hover:text-purple-400 transition-colors">
                    {value}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center md:text-left"
          >
            <h4 className="font-semibold text-white mb-4">
              {language === 'en' ? 'Legal' : 'Юридическая информация'}
            </h4>
            <ul className="space-y-2 text-white/70">
              {Object.entries(t.footer.links).map(([key, value]) => (
                <li key={key}>
                  <Link href={`#${key}`} className="hover:text-purple-400 transition-colors">
                    {value}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center md:text-left"
          >
            <h4 className="font-semibold text-white mb-4">
              {language === 'en' ? 'Contact Us' : 'Свяжитесь с нами'}
            </h4>
            <div className="space-y-4">
              <Link 
                href="mailto:support@startaccount.ru" 
                className="flex items-center justify-center md:justify-start space-x-2 text-white/70 hover:text-purple-400 transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>support@startaccount.ru</span>
              </Link>
              <div className="flex justify-center md:justify-start space-x-4">
                <Link 
                  href="https://t.me/startaccount" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 bg-white/5 rounded-lg hover:bg-purple-500/20 transition-colors"
                >
                  <MessageSquare className="h-5 w-5 text-purple-400" />
                </Link>
                <Link 
                  href="https://instagram.com/startaccount" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 bg-white/5 rounded-lg hover:bg-purple-500/20 transition-colors"
                >
                  <Instagram className="h-5 w-5 text-purple-400" />
                </Link>
                <Link href="#" className="p-2 bg-white/5 rounded-lg hover:bg-purple-500/20 transition-colors">
                  <Shield className="h-5 w-5 text-purple-400" />
                </Link>
                <Link href="#" className="p-2 bg-white/5 rounded-lg hover:bg-purple-500/20 transition-colors">
                  <Heart className="h-5 w-5 text-purple-400" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <p className="text-sm text-white/50 text-center">
            {t.footer.disclaimer}
          </p>
        </div>
      </div>
    </footer>
  );
}