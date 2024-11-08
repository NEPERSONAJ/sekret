import { useState } from 'react';
import { Check, Send, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Account } from '../types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface PurchaseDialogProps {
  account: Account;
  open: boolean;
  onClose: () => void;
}

const contactMethods = [
  { id: 'telegram', label: 'Telegram' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'phone', label: 'Телефон' },
  { id: 'email', label: 'Email' },
  { id: 'other', label: 'Другое' }
];

export default function PurchaseDialog({ account, open, onClose }: PurchaseDialogProps) {
  const [contactMethod, setContactMethod] = useState('');
  const [contactValue, setContactValue] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getPlaceholder = () => {
    switch (contactMethod) {
      case 'telegram':
        return '@username или номер телефона';
      case 'whatsapp':
        return 'Номер телефона';
      case 'phone':
        return '+7 (XXX) XXX-XX-XX';
      case 'email':
        return 'email@example.com';
      case 'other':
        return 'Укажите предпочтительный способ связи';
      default:
        return 'Выберите метод связи выше';
    }
  };

  const handleSubmit = async () => {
    if (!contactMethod || !contactValue || !agreed) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { data: configs, error: configError } = await supabase
        .from('configuration')
        .select('telegram_bot_token, telegram_chat_id');

      if (configError) throw configError;

      if (!configs || configs.length === 0) {
        throw new Error('Конфигурация системы не настроена');
      }

      const config = configs[0];

      if (!config.telegram_bot_token || !config.telegram_chat_id) {
        throw new Error('Telegram бот не настроен');
      }

      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('name_en, name_ru')
        .eq('id', account.gameId)
        .single();

      if (gameError) throw gameError;

      const message = `
🎮 Новая заявка на покупку!

🎯 Игра: ${gameData.name_ru}
🏷️ Аккаунт: ${account.titleRu}
💰 Цена: ${account.price} ₽
📱 Способ связи: ${contactMethod}
📞 Контакт: ${contactValue}
    `.trim();

      const response = await fetch(`https://api.telegram.org/bot${config.telegram_bot_token}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: config.telegram_chat_id,
          text: message,
          parse_mode: 'HTML'
        })
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.description || 'Ошибка отправки сообщения');
      }
      
      setIsSubmitted(true);
      
      await supabase
        .from('orders')
        .insert([{
          account_id: account.id,
          status: 'pending',
          price: account.price,
          contact_method: contactMethod,
          contact_value: contactValue
        }]);

    } catch (error: any) {
      console.error('Failed to send message:', error);
      setError(error.message || 'Произошла ошибка при отправке заявки');
      toast({
        title: 'Ошибка',
        description: error.message || 'Произошла ошибка при отправке заявки',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-black/90 border-white/10 text-white backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {isSubmitted ? 'Заявка отправлена!' : 'Оформление покупки'}
          </DialogTitle>
        </DialogHeader>

        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 py-4"
          >
            <div className="flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-400" />
              </div>
            </div>
            <p className="text-center text-white/80">
              Спасибо за вашу заявку! Мы свяжемся с вами в ближайшее время для оформления покупки.
            </p>
            <Button
              onClick={onClose}
              className="w-full bg-purple-500 hover:bg-purple-600"
            >
              Закрыть
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-6 py-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-white/80">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-white/70">Выберите способ связи</Label>
              <RadioGroup
                value={contactMethod}
                onValueChange={setContactMethod}
                className="grid grid-cols-2 gap-2"
              >
                {contactMethods.map((method) => (
                  <div key={method.id} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={method.id}
                      id={method.id}
                      className="border-white/20 text-purple-400"
                    />
                    <Label
                      htmlFor={method.id}
                      className="text-white cursor-pointer"
                    >
                      {method.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-white/70">Контактные данные</Label>
              <Input
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder={getPlaceholder()}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                disabled={!contactMethod}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
                className="border-white/20 data-[state=checked]:bg-purple-500"
              />
              <label
                htmlFor="terms"
                className="text-sm text-white/70 leading-none cursor-pointer"
              >
                Я согласен на обработку персональных данных
              </label>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!contactMethod || !contactValue || !agreed || isSubmitting}
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}