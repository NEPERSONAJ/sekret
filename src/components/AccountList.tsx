import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ChevronDown, Loader2, Star, Shield, Server, ArrowUpRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from '@/lib/supabase';
import { Hero, Account, Game } from '../types';
import { useLanguage } from '@/hooks/useLanguage';
import PurchaseDialog from './PurchaseDialog';

interface AccountListProps {
  selectedHeroes: Hero[];
  selectedGame: Game;
}

export default function AccountList({ selectedHeroes, selectedGame }: AccountListProps) {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showHeroesDialog, setShowHeroesDialog] = useState(false);
  const [selectedHeroesAccount, setSelectedHeroesAccount] = useState<Account | null>(null);
  const { language } = useLanguage();
  const [noMatchingAccounts, setNoMatchingAccounts] = useState(false);

  useEffect(() => {
    if (selectedHeroes.length === 0) {
      setAccounts([]);
      setIsLoading(false);
      return;
    }
    fetchAccounts();
  }, [selectedHeroes, selectedGame]);

  async function fetchAccounts() {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*, game:games(name_en, name_ru, has_gacha_heroes)')
        .eq('status', 'active')
        .eq('game_id', selectedGame.id);

      if (error) throw error;

      if (data) {
        let formattedAccounts = data.map(account => ({
          ...account,
          titleEn: account.title_en,
          titleRu: account.title_ru,
          descriptionEn: account.description_en,
          descriptionRu: account.description_ru,
          gameId: account.game_id,
          game: {
            nameEn: account.game.name_en,
            nameRu: account.game.name_ru,
            hasGachaHeroes: account.game.has_gacha_heroes
          },
          heroes: Array.isArray(account.heroes) ? account.heroes : [],
          resources: Array.isArray(account.resources) ? account.resources : []
        }));

        if (selectedGame.hasGachaHeroes && selectedHeroes.length > 0) {
          const heroCounts = new Map();
          selectedHeroes.forEach(hero => {
            heroCounts.set(hero.id, (heroCounts.get(hero.id) || 0) + 1);
          });

          formattedAccounts = formattedAccounts.filter(account => {
            const accountHeroCounts = new Map();
            account.heroes.forEach(hero => {
              accountHeroCounts.set(hero.id, (accountHeroCounts.get(hero.id) || 0) + 1);
            });

            return Array.from(heroCounts.entries()).every(([heroId, count]) => {
              return (accountHeroCounts.get(heroId) || 0) >= count;
            });
          });

          if (formattedAccounts.length === 0) {
            setNoMatchingAccounts(true);
          } else {
            setNoMatchingAccounts(false);
          }
        }

        setAccounts(formattedAccounts);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const countDuplicateHeroes = (heroes: any[]) => {
    const counts = new Map();
    heroes.forEach(hero => {
      counts.set(hero.id, (counts.get(hero.id) || 0) + 1);
    });
    return counts;
  };

  const getUniqueHeroes = (heroes: any[]) => {
    return Array.from(new Set(heroes.map(h => h.id)))
      .map(id => heroes.find(h => h.id === id))
      .filter(Boolean);
  };

  const handleShowAllHeroes = (account: Account) => {
    setSelectedHeroesAccount(account);
    setShowHeroesDialog(true);
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (noMatchingAccounts) {
    return (
      <div className="text-center py-12">
        <p className="text-white/70">
          {language === 'en' 
            ? 'No accounts found with the selected number of duplicate heroes'
            : 'Не найдено аккаунтов с выбранным количеством дублей героев'}
        </p>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/70">
          {language === 'en' 
            ? 'Select heroes to see available accounts'
            : 'Выберите героев, чтобы увидеть доступные аккаунты'}
        </p>
      </div>
    );
  }

  return (
    <div id="accounts-section" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => {
          const heroCounts = countDuplicateHeroes(account.heroes);
          const uniqueHeroes = getUniqueHeroes(account.heroes);
          const displayHeroes = uniqueHeroes.slice(0, 8);
          const hasMoreHeroes = uniqueHeroes.length > 8;

          return (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white/10 rounded-lg overflow-hidden border border-white/10 hover:border-purple-400/50 transition-colors"
            >
              <div className="relative">
                <img
                  src={account.image}
                  alt={language === 'en' ? account.titleEn : account.titleRu}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge
                    className={`${
                      account.guaranteed
                        ? 'bg-purple-500/80 hover:bg-purple-500/90'
                        : 'bg-blue-500/80 hover:bg-blue-500/90'
                    } backdrop-blur-sm text-white px-3 py-1 flex items-center gap-2`}
                  >
                    <Shield className="h-4 w-4" />
                    {account.guaranteed
                      ? (language === 'en' ? 'Starter Account' : 'Стартовый аккаунт')
                      : (language === 'en' ? 'Personal Account' : 'Личный аккаунт')}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {account.server && (
                    <Badge
                      variant="outline"
                      className="backdrop-blur-sm bg-black/50 text-white border-white/20 flex items-center gap-1"
                    >
                      <Server className="h-3 w-3" />
                      {account.server}
                    </Badge>
                  )}
                </div>
                {account.adventureRank > 0 && (
                  <div className="absolute bottom-4 right-4">
                    <Badge
                      variant="outline"
                      className="backdrop-blur-sm bg-black/50 text-white border-white/20 flex items-center gap-1"
                    >
                      <ArrowUpRight className="h-3 w-3" />
                      {language === 'en' ? 'Level' : 'Уровень'} {account.adventureRank}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-4">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-white">
                    {language === 'en' ? account.titleEn : account.titleRu}
                  </h4>
                </div>

                <p className="text-sm text-white/70 text-center">
                  {language === 'en' ? account.descriptionEn : account.descriptionRu}
                </p>

                {selectedGame.hasGachaHeroes && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap justify-center gap-2">
                      {displayHeroes.map((hero: any) => {
                        const count = heroCounts.get(hero.id);
                        return (
                          <div 
                            key={hero.id}
                            className="flex items-center gap-1 bg-white/5 rounded pl-1 pr-2 py-1"
                          >
                            <div className="relative">
                              <img
                                src={hero.icon}
                                alt={hero.nameRu || hero.nameEn}
                                className={`w-6 h-6 ${
                                  selectedHeroes.some(h => h.id === hero.id)
                                    ? 'ring-2 ring-purple-400 brightness-125'
                                    : ''
                                }`}
                              />
                              {count > 1 && (
                                <div className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                                  {count}
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-white/70">
                              {truncateText(language === 'en' ? hero.nameEn : hero.nameRu, 12)}
                            </span>
                            {hero.type === 'legendary' && (
                              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {hasMoreHeroes && (
                      <div className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShowAllHeroes(account)}
                          className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                        >
                          {language === 'en' ? 'View all heroes' : 'Смотреть всех героев'} (+{uniqueHeroes.length - 8})
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {account.resources && account.resources.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {account.resources.map((resource, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-white/5 text-white/70"
                      >
                        {resource.name}: {resource.value}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xl font-bold text-white">{account.price} ₽</span>
                  <Button 
                    className="bg-purple-500 hover:bg-purple-600"
                    onClick={() => setSelectedAccount(account)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Buy' : 'Купить'}
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {selectedAccount && (
        <PurchaseDialog
          account={selectedAccount}
          open={!!selectedAccount}
          onClose={() => setSelectedAccount(null)}
        />
      )}

      <Dialog open={showHeroesDialog} onOpenChange={setShowHeroesDialog}>
        <DialogContent className="bg-black/95 border-white/10 text-white max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Account Heroes' : 'Герои аккаунта'}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[60vh]">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
              {selectedHeroesAccount && getUniqueHeroes(selectedHeroesAccount.heroes).map((hero: any) => {
                const count = countDuplicateHeroes(selectedHeroesAccount.heroes).get(hero.id);
                return (
                  <div
                    key={hero.id}
                    className="bg-white/5 p-3 border border-white/10 flex flex-col items-center"
                  >
                    <div className="relative w-full">
                      <img
                        src={hero.icon}
                        alt={language === 'en' ? hero.nameEn : hero.nameRu}
                        className="w-full aspect-square object-cover"
                      />
                      {count > 1 && (
                        <div className="absolute -top-2 -right-2 bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                          {count}
                        </div>
                      )}
                      {hero.type === 'legendary' && (
                        <div className="absolute top-2 right-2">
                          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                        </div>
                      )}
                    </div>
                    <div className="mt-3 text-center w-full">
                      <p className="font-medium text-white">
                        {language === 'en' ? hero.nameEn : hero.nameRu}
                      </p>
                      {hero.element && (
                        <p className="text-sm text-white/70 mt-1">
                          {hero.element}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}