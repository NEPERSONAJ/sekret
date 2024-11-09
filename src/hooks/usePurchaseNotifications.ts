import { useState, useEffect } from 'react';
import { PurchaseNotification } from '../types';
import { supabase } from '@/lib/supabase';

const generateRandomNotification = async (): Promise<PurchaseNotification | null> => {
  try {
    const { data: accounts } = await supabase
      .from('accounts')
      .select('id, title_ru, price, game_id, heroes')
      .eq('status', 'active')
      .limit(1)
      .order('random()');

    if (!accounts || accounts.length === 0) return null;

    const account = accounts[0];
    const heroes = account.heroes || [];

    const times = [
      'несколько секунд', '1 минуту', '2 минуты', '5 минут',
      '10 минут', '15 минут', '30 минут', '1 час', '2 часа'
    ];

    return {
      id: Date.now().toString(),
      gameId: account.game_id,
      accountTitle: account.title_ru,
      heroes: heroes.slice(0, 3),
      timeAgo: times[Math.floor(Math.random() * times.length)] + ' назад',
      price: account.price
    };
  } catch (error) {
    console.error('Error generating notification:', error);
    return null;
  }
};

export function usePurchaseNotifications() {
  const [notification, setNotification] = useState<PurchaseNotification | null>(null);
  const [hideAll, setHideAll] = useState(false);

  useEffect(() => {
    if (hideAll) return;

    const showNotification = async () => {
      const newNotification = await generateRandomNotification();
      if (newNotification) {
        setNotification(newNotification);
        setTimeout(() => setNotification(null), 5000);
      }
    };

    // Initial notification after 5 seconds
    const initialTimeout = setTimeout(showNotification, 5000);

    // Regular notifications every 30-60 seconds
    const interval = setInterval(showNotification, Math.random() * 30000 + 30000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [hideAll]);

  return {
    notification,
    clearNotification: () => setNotification(null),
    hideAllNotifications: () => setHideAll(true)
  };
}