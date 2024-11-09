import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Game, Hero } from '@/types';

export default function HeroesAdmin() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>('all'); // Changed from empty string to 'all'
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nameEn: '',
    nameRu: '',
    icon: '',
    type: 'epic',
    gameId: '',
    rarity: 5,
    element: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select('*');

      if (gamesError) throw gamesError;
      if (gamesData) {
        const formattedGames = gamesData.map(game => ({
          ...game,
          nameEn: game.name_en,
          nameRu: game.name_ru,
          description: {
            en: game.description_en,
            ru: game.description_ru
          },
          hasGachaHeroes: game.has_gacha_heroes,
          slug: game.slug
        }));
        setGames(formattedGames);
      }

      const { data: heroesData, error: heroesError } = await supabase
        .from('heroes')
        .select('*');

      if (heroesError) throw heroesError;
      if (heroesData) {
        const formattedHeroes = heroesData.map(hero => ({
          ...hero,
          nameEn: hero.name_en,
          nameRu: hero.name_ru,
          gameId: hero.game_id
        }));
        setHeroes(formattedHeroes);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const filteredAndSortedHeroes = heroes
    .filter(hero => selectedGame === 'all' || hero.gameId === selectedGame) // Updated filter condition
    .sort((a, b) => {
      // First sort by type (legendary first)
      if (a.type === 'legendary' && b.type !== 'legendary') return -1;
      if (a.type !== 'legendary' && b.type === 'legendary') return 1;
      
      // Then sort by rarity (higher first)
      if (a.rarity !== b.rarity) return (b.rarity || 0) - (a.rarity || 0);
      
      // Finally sort by name
      return a.nameEn.localeCompare(b.nameEn);
    });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const heroData = {
      name_en: formData.nameEn,
      name_ru: formData.nameRu,
      icon: formData.icon,
      type: formData.type,
      game_id: formData.gameId,
      rarity: formData.rarity,
      element: formData.element
    };

    try {
      if (selectedHero) {
        const { error } = await supabase
          .from('heroes')
          .update(heroData)
          .eq('id', selectedHero.id);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Hero updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('heroes')
          .insert([heroData]);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Hero created successfully',
        });
      }

      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving hero:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save hero',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(hero: Hero) {
    if (!confirm('Are you sure you want to delete this hero?')) return;

    try {
      const { error } = await supabase
        .from('heroes')
        .delete()
        .eq('id', hero.id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Hero deleted successfully',
      });
      
      fetchData();
    } catch (error: any) {
      console.error('Error deleting hero:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete hero',
        variant: 'destructive',
      });
    }
  }

  function handleEdit(hero: Hero) {
    setSelectedHero(hero);
    setFormData({
      nameEn: hero.nameEn,
      nameRu: hero.nameRu,
      icon: hero.icon,
      type: hero.type,
      gameId: hero.gameId,
      rarity: hero.rarity || 5,
      element: hero.element || ''
    });
    setIsDialogOpen(true);
  }

  function handleAdd() {
    setSelectedHero(null);
    setFormData({
      nameEn: '',
      nameRu: '',
      icon: '',
      type: 'epic',
      gameId: selectedGame === 'all' ? '' : selectedGame,
      rarity: 5,
      element: ''
    });
    setIsDialogOpen(true);
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white">Heroes</h2>
            <Select
              value={selectedGame}
              onValueChange={setSelectedGame}
            >
              <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select game" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Games</SelectItem>
                {games.map((game) => (
                  <SelectItem key={game.id} value={game.id}>
                    {game.nameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleAdd} 
            className="bg-purple-500 hover:bg-purple-600"
            disabled={selectedGame === 'all'} // Disable when "All Games" is selected
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Hero
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedHeroes.map((hero) => (
            <div
              key={hero.id}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={hero.icon}
                    alt={hero.nameEn}
                    className="w-16 h-16 rounded-full"
                  />
                  {hero.type === 'legendary' && (
                    <div className="absolute -top-1 -right-1 bg-yellow-500 text-xs px-2 py-0.5 rounded-full">
                      Legendary
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{hero.nameEn}</h3>
                  <p className="text-gray-400">{hero.nameRu}</p>
                  <p className="text-sm text-gray-500">
                    {games.find(g => g.id === hero.gameId)?.nameEn}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(hero)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(hero)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>
                {selectedHero ? 'Edit Hero' : 'Add New Hero'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm">English Name</label>
                <Input
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm">Russian Name</label>
                <Input
                  value={formData.nameRu}
                  onChange={(e) => setFormData({ ...formData, nameRu: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm">Icon URL</label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm">Type</label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="legendary">Legendary</SelectItem>
                      <SelectItem value="epic">Epic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Rarity</label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.rarity}
                    onChange={(e) => setFormData({ ...formData, rarity: parseInt(e.target.value) })}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm">Game</label>
                  <Select
                    value={formData.gameId}
                    onValueChange={(value) => setFormData({ ...formData, gameId: value })}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {games.map((game) => (
                        <SelectItem key={game.id} value={game.id}>
                          {game.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Element</label>
                  <Input
                    value={formData.element}
                    onChange={(e) => setFormData({ ...formData, element: e.target.value })}
                    className="bg-gray-700 border-gray-600"
                    placeholder="e.g., Fire, Water, etc."
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDialogOpen(false)}
                  className="bg-gray-700 hover:bg-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-purple-500 hover:bg-purple-600"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {selectedHero ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}