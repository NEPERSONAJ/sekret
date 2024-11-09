import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, ChevronDown, ShoppingCart } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/lib/supabase';
import { Game } from '../types';
import { useLanguage } from '@/hooks/useLanguage';

interface GameSelectorProps {
  selectedGame: Game | null;
  onSelectGame: (game: Game) => void;
}

interface GameWithCount extends Game {
  accountCount: number;
}

export default function GameSelector({ selectedGame, onSelectGame }: GameSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [games, setGames] = useState<GameWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowScrollIndicator(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  async function fetchGames() {
    try {
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select('*');

      if (gamesError) throw gamesError;

      const { data: accountsData, error: accountsError } = await supabase
        .from('accounts')
        .select('game_id, status')
        .eq('status', 'active');

      if (accountsError) throw accountsError;

      if (gamesData) {
        const accountCounts = accountsData?.reduce((acc: { [key: string]: number }, account) => {
          acc[account.game_id] = (acc[account.game_id] || 0) + 1;
          return acc;
        }, {});

        const formattedGames = gamesData.map(game => ({
          ...game,
          nameEn: game.name_en,
          nameRu: game.name_ru,
          description: {
            en: game.description_en,
            ru: game.description_ru
          },
          hasGachaHeroes: game.has_gacha_heroes,
          accountCount: accountCounts?.[game.id] || 0
        }));
        setGames(formattedGames);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleGameSelect = (game: GameWithCount) => {
    onSelectGame(game);
    setShowScrollIndicator(true);
  };

  const handleScrollToAccounts = () => {
    const accountsSection = document.getElementById('accounts-section');
    if (accountsSection) {
      accountsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredGames = games.filter(game =>
    (language === 'en' ? game.nameEn : game.nameRu)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">
          {language === 'en' ? 'Select Game' : 'Выберите игру'}
        </h2>
        <p className="text-white/70">
          {language === 'en' 
            ? 'Choose the game account you want to purchase'
            : 'Для начала выберите игру, аккаунт которой хотите приобрести'}
        </p>
      </div>

      <div className="relative">
        <Input
          placeholder={language === 'en' ? 'Search games...' : 'Поиск игры...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-white/10 border-white/20 text-white pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
      </div>

      <ScrollArea className="h-[400px] relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game, index) => {
            const isSelected = selectedGame?.id === game.id;
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <Card
                  className={`relative overflow-hidden cursor-pointer group transition-all duration-300 ${
                    isSelected
                      ? 'ring-2 ring-purple-500 border-transparent transform scale-105'
                      : 'border-white/10 hover:border-purple-500/50'
                  }`}
                  onClick={() => handleGameSelect(game)}
                >
                  <div className="relative h-48">
                    <img
                      src={game.image}
                      alt={language === 'en' ? game.nameEn : game.nameRu}
                      className={`w-full h-full object-cover transition-transform duration-300 ${
                        isSelected ? 'brightness-125 saturate-150' : 'group-hover:scale-105'
                      }`}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${
                      isSelected 
                        ? 'from-purple-900/80 via-black/30 to-transparent' 
                        : 'from-black/60 via-black/30 to-transparent'
                    }`} />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-purple-500/80 text-white backdrop-blur-sm flex items-center gap-1">
                        <ShoppingCart className="h-3 w-3" />
                        {game.accountCount} {language === 'en' ? 'accounts' : 'аккаунтов'}
                      </Badge>
                    </div>
                    <AnimatePresence>
                      {isSelected && showScrollIndicator && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ 
                              y: { 
                                repeat: Infinity,
                                duration: 2,
                                ease: "easeInOut"
                              }
                            }}
                            className="bg-purple-500 rounded-full p-3 shadow-lg shadow-purple-500/20 cursor-pointer hover:bg-purple-600 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleScrollToAccounts();
                            }}
                          >
                            <ChevronDown className="h-8 w-8 text-white" />
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-xl font-bold text-white">
                        {language === 'en' ? game.nameEn : game.nameRu}
                      </h3>
                      <p className="text-sm text-white/70 mt-1">
                        {language === 'en' ? game.description.en : game.description.ru}
                      </p>
                      {game.hasGachaHeroes && (
                        <div className="mt-2">
                          <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded">
                            {language === 'en' ? 'Gacha Game' : 'Гача игра'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}