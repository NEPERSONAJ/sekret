import { useState, useEffect } from 'react';
import { X, Search, Loader2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Hero, Game } from '../types';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/hooks/useLanguage';

interface HeroSelectorProps {
  selectedHeroes: Hero[];
  onSelectHero: (hero: Hero) => void;
  onRemoveHero: (hero: Hero) => void;
  onSearch: () => void;
  selectedGame: Game;
}

export default function HeroSelector({ selectedHeroes, onSelectHero, onRemoveHero, onSearch, selectedGame }: HeroSelectorProps) {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  useEffect(() => {
    if (selectedGame) {
      fetchHeroes();
    }
  }, [selectedGame]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowScrollIndicator(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  async function fetchHeroes() {
    try {
      const { data, error } = await supabase
        .from('heroes')
        .select('*')
        .eq('game_id', selectedGame.id);

      if (error) throw error;

      if (data) {
        const formattedHeroes = data.map(hero => ({
          ...hero,
          nameEn: hero.name_en,
          nameRu: hero.name_ru,
          gameId: hero.game_id
        }));
        setHeroes(formattedHeroes);
      }
    } catch (error) {
      console.error('Error fetching heroes:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSearch = () => {
    setShowScrollIndicator(true);
    onSearch();
  };

  const filteredHeroes = heroes
    .filter(hero => 
      (language === 'en' ? hero.nameEn : hero.nameRu)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => 
      (language === 'en' ? a.nameEn : a.nameRu)
        .localeCompare(language === 'en' ? b.nameEn : b.nameRu)
    );

  const selectedHeroGroups = selectedHeroes.reduce((acc, hero) => {
    acc.set(hero.id, (acc.get(hero.id) || 0) + 1);
    return acc;
  }, new Map<string, number>());

  const uniqueSelectedHeroes = Array.from(selectedHeroGroups.entries()).map(([id, count]) => ({
    hero: heroes.find(h => h.id === id)!,
    count
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-semibold text-white">
          {language === 'en' ? 'Select Heroes' : 'Выберите героев'}
        </h2>
        <div className="relative">
          <Button 
            onClick={handleSearch}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Search className="h-4 w-4 mr-2" />
            {language === 'en' ? 'Search' : 'Поиск'}
          </Button>
          <AnimatePresence>
            {showScrollIndicator && (
              <motion.div
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: [0, 10, 0] }}
                exit={{ opacity: 0 }}
                transition={{ 
                  y: { 
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut"
                  }
                }}
                className="absolute -bottom-16 left-1/2 transform -translate-x-1/2"
              >
                <div className="bg-purple-500 rounded-full p-2 shadow-lg shadow-purple-500/20">
                  <ChevronDown className="h-6 w-6 text-white" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="relative space-y-2">
        {selectedHeroes.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-2">
            {uniqueSelectedHeroes.map(({ hero, count }) => (
              <Badge
                key={hero.id}
                variant="secondary"
                className="bg-white/10 text-white"
              >
                {language === 'en' ? hero.nameEn : hero.nameRu}
                {count > 1 && (
                  <span className="ml-1 text-purple-400">
                    x{count}
                  </span>
                )}
                <button
                  onClick={() => onRemoveHero(hero)}
                  className="ml-1 hover:text-red-400 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <Input
          placeholder={language === 'en' ? 'Search heroes...' : 'Поиск героев...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-white/10 border-white/20 text-white"
        />
      </div>

      <ScrollArea className="h-[400px] rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {filteredHeroes.map((hero) => {
            const count = selectedHeroGroups.get(hero.id) || 0;
            const isSelected = count > 0;
            
            return (
              <div
                key={hero.id}
                className={`relative rounded-lg border transition-all duration-200 ${
                  isSelected
                    ? 'border-purple-400 bg-purple-400/20'
                    : 'border-white/10 hover:border-white/30 bg-white/5'
                }`}
              >
                <button
                  onClick={() => onSelectHero(hero)}
                  className="w-full p-2 text-center"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="relative w-16 h-16">
                      <img
                        src={hero.icon}
                        alt={language === 'en' ? hero.nameEn : hero.nameRu}
                        className={`w-full h-full rounded-full object-cover ${
                          isSelected ? 'brightness-125 saturate-150' : ''
                        }`}
                      />
                      {count > 0 && (
                        <div className="absolute -top-1 -right-1 bg-purple-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                          {count}
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-white font-medium">
                      {language === 'en' ? hero.nameEn : hero.nameRu}
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}