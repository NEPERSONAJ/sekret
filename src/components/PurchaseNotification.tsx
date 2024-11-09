import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PurchaseNotification as PurchaseNotificationType } from '../types';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/lib/supabase';

interface PurchaseNotificationProps {
  notification: PurchaseNotificationType;
  onClose: () => void;
  onHideAll: () => void;
}

export default function PurchaseNotification({ notification, onClose, onHideAll }: PurchaseNotificationProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [gameName, setGameName] = useState<{ nameEn: string; nameRu: string } | null>(null);
  const { language } = useLanguage();

  // Fetch game name when notification changes
  React.useEffect(() => {
    async function fetchGameName() {
      try {
        const { data, error } = await supabase
          .from('games')
          .select('name_en, name_ru')
          .eq('id', notification.gameId)
          .single();

        if (error) throw error;

        if (data) {
          setGameName({
            nameEn: data.name_en,
            nameRu: data.name_ru
          });
        }
      } catch (error) {
        console.error('Error fetching game:', error);
      }
    }

    fetchGameName();
  }, [notification.gameId]);

  const handleClose = () => {
    setShowDialog(true);
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-4"
        >
          <Card className="bg-black border-white/20 p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/70 truncate">
                  {notification.timeAgo}
                </p>
                <p className="text-sm font-medium text-white truncate">
                  Куплен аккаунт {gameName ? (language === 'en' ? gameName.nameEn : gameName.nameRu) : ''} за {notification.price} ₽
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {notification.heroes.map((hero) => (
                    <img
                      key={hero.id}
                      src={hero.icon}
                      alt={language === 'en' ? hero.nameEn : hero.nameRu}
                      className="w-6 h-6 rounded-full border border-white/20"
                      title={language === 'en' ? hero.nameEn : hero.nameRu}
                    />
                  ))}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleClose}
                className="text-white/50 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="bg-black/90 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'en' ? 'Hide Notifications' : 'Скрыть уведомления'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              {language === 'en' 
                ? 'Would you like to hide all purchase notifications for this session?'
                : 'Хотите скрыть все уведомления о покупках на время этой сессии?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={onClose}
              className="bg-white/10 text-white hover:bg-white/20"
            >
              {language === 'en' ? 'Just this one' : 'Только это'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onHideAll}
              className="bg-purple-500 text-white hover:bg-purple-600"
            >
              {language === 'en' ? 'Hide all' : 'Скрыть все'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}