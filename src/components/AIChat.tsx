import { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIChatProps {
  onClose: () => void;
}

interface AIConfig {
  apiKey: string;
  apiUrl: string;
  model: string;
}

export default function AIChat({ onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [siteData, setSiteData] = useState<any>(null);
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);
  const { language } = useLanguage();
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSiteData();
    fetchAIConfig();
  }, []);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  async function fetchAIConfig() {
    try {
      const { data, error } = await supabase
        .from('configuration')
        .select('ai_api_key, ai_api_url, ai_model')
        .limit(1)
        .single();

      if (error) throw error;

      if (data) {
        setAiConfig({
          apiKey: data.ai_api_key,
          apiUrl: data.ai_api_url,
          model: data.ai_model,
        });
      }
    } catch (error) {
      console.error('Error fetching AI config:', error);
    }
  }

  async function fetchSiteData() {
    try {
      const [gamesData, heroesData, accountsData] = await Promise.all([
        supabase.from('games').select('*'),
        supabase.from('heroes').select('*'),
        supabase.from('accounts').select('*')
      ]);

      if (gamesData.error) throw gamesData.error;
      if (heroesData.error) throw heroesData.error;
      if (accountsData.error) throw accountsData.error;

      setSiteData({
        games: gamesData.data?.map(game => ({
          id: game.id,
          name: game.name_ru,
          description: `${game.name_ru} — одна из наших популярных игр, в которой доступно несколько вариантов аккаунтов.`
        })),
        heroes: heroesData.data?.map(hero => ({
          id: hero.id,
          name: hero.name_ru,
          rarity: hero.rarity,
          element: hero.element,
          description: `${hero.name_ru} — ${hero.rarity}-звёздный персонаж ${hero.element}`
        })),
        accounts: accountsData.data?.map(account => ({
          id: account.id,
          title: account.title_ru,
          description: account.description_ru,
          price: account.price,
          heroes: account.heroes,
          server: account.server,
          adventureRank: account.adventure_rank,
          guaranteed: account.guaranteed
        })),
        pricing: {
          currency: 'RUB',
          minPrice: Math.min(...(accountsData.data?.map(a => a.price) || [0])),
          maxPrice: Math.max(...(accountsData.data?.map(a => a.price) || [0])),
          currentDiscount: '20%',
          loyaltyProgram: '5% кэшбэк'
        },
        payment: {
          methods: ['Банковские карты', 'QIWI', 'Криптовалюта'],
          security: 'Все платежи обрабатываются безопасно',
          refundPolicy: '24-часовая гарантия на все аккаунты'
        },
        delivery: {
          type: 'Мгновенная цифровая доставка',
          process: 'Автоматическая доставка после проверки платежа',
          support: 'Круглосуточная поддержка клиентов'
        }
      });
    } catch (error) {
      console.error('Error fetching site data:', error);
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading || !siteData || !aiConfig) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(aiConfig.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiConfig.apiKey}`
        },
        body: JSON.stringify({
          model: aiConfig.model,
          messages: [
            {
              role: 'system',
              content: `Вы — опытный ИИ помощник для игрового маркетплейса StartAccount. Вот подробная информация о наших предложениях:

              Информация об играх:
              ${JSON.stringify(siteData.games, null, 2)}

              Информация о героях:
              ${JSON.stringify(siteData.heroes, null, 2)}

              Доступные аккаунты:
              ${JSON.stringify(siteData.accounts, null, 2)}

              Информация о ценах:
              ${JSON.stringify(siteData.pricing, null, 2)}

              Детали оплаты:
              ${JSON.stringify(siteData.payment, null, 2)}

              Информация о доставке:
              ${JSON.stringify(siteData.delivery, null, 2)}

              Инструкции:
              1. Вы владеете полной информацией обо всех аккаунтах, героях и ценах
              2. При запросе о конкретных аккаунтах или героях предоставляйте детальную информацию
              3. Помогайте пользователям находить аккаунты, соответствующие их требованиям
              4. Объясняйте игровые механики и синергии персонажей
              5. Предоставляйте точную информацию о ценах и способах оплаты
              6. Будьте дружелюбны и профессиональны
              7. Рекомендуйте аккаунты на основе предпочтений пользователя
              8. Объясняйте преимущества нашей гарантии и системы поддержки

              Пожалуйста, предоставляйте точные и полезные ответы на основе этих данных.
              Отвечайте на ${language === 'en' ? 'английском' : 'русском'}.`
            },
            ...messages.map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.content
            })),
            {
              role: 'user',
              content: input
            }
          ]
        })
      });

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.choices[0].message.content,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Ошибка чата:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: language === 'en' 
          ? 'Sorry, I encountered an error. Please try again.'
          : 'Извините, произошла ошибка. Пожалуйста, попробуйте снова.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full rounded-lg border border-white/10 bg-black/90 backdrop-blur-md overflow-hidden flex flex-col shadow-xl">
      <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {language === 'en' ? 'AI Assistant' : 'ИИ Помощник'}
          </h3>
          <p className="text-sm text-white/70">
            {language === 'en' 
              ? 'Ask about heroes, accounts, prices, or anything else'
              : 'Задайте вопрос о героях, аккаунтах, ценах или чем-либо еще'}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white/70 hover:text-white">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex items-start space-x-3 mb-4 ${
                message.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
              ref={index === messages.length - 1 ? lastMessageRef : null}
            >
              <Avatar className={`${
                message.sender === 'ai' ? 'bg-purple-500' : 'bg-blue-500'
              }`}>
                {message.sender === 'ai' ? 'AI' : language === 'en' ? 'You' : 'Вы'}
              </Avatar>
              <div className={`rounded-lg p-3 max-w-[80%] ${
                message.sender === 'ai' 
                  ? 'bg-white/10 text-white' 
                  : 'bg-purple-500/20 text-white ml-auto'
              }`}>
                {message.content}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white/50 text-sm"
            >
              {language === 'en' ? 'Typing...' : 'Печатает...'}
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>

      <div className="p-4 border-t border-white/10 bg-white/5">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={language === 'en' ? 'Type a message...' : 'Введите сообщение...'}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            className="bg-purple-500 hover:bg-purple-600"
            disabled={isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}