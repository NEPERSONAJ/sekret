import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Game } from '@/types';

interface GameFormData {
  nameEn: string;
  nameRu: string;
  image: string;
  descriptionEn: string;
  descriptionRu: string;
  hasGachaHeroes: boolean;
  slug: string;
}

export default function GamesAdmin() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<GameFormData>({
    nameEn: '',
    nameRu: '',
    image: '',
    descriptionEn: '',
    descriptionRu: '',
    hasGachaHeroes: false,
    slug: '',
  });

  useEffect(() => {
    fetchGames();
  }, []);

  async function fetchGames() {
    try {
      const { data, error } = await supabase.from('games').select('*');
      if (error) throw error;
      if (data) {
        const formattedGames = data.map(game => ({
          ...game,
          id: game.id,
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
    } catch (error: any) {
      console.error('Error fetching games:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load games',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const gameData = {
      name_en: formData.nameEn,
      name_ru: formData.nameRu,
      image: formData.image,
      description_en: formData.descriptionEn,
      description_ru: formData.descriptionRu,
      has_gacha_heroes: formData.hasGachaHeroes,
      slug: formData.slug || formData.nameEn.toLowerCase().replace(/\s+/g, '-'),
    };

    try {
      if (selectedGame) {
        const { error } = await supabase
          .from('games')
          .update(gameData)
          .eq('id', selectedGame.id);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Game updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('games')
          .insert([gameData]);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Game created successfully',
        });
      }

      setIsDialogOpen(false);
      fetchGames();
    } catch (error: any) {
      console.error('Error saving game:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save game',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(game: Game) {
    if (!confirm('Are you sure you want to delete this game?')) return;

    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', game.id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Game deleted successfully',
      });
      
      fetchGames();
    } catch (error: any) {
      console.error('Error deleting game:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete game',
        variant: 'destructive',
      });
    }
  }

  function handleEdit(game: Game) {
    setSelectedGame(game);
    setFormData({
      nameEn: game.nameEn,
      nameRu: game.nameRu,
      image: game.image,
      descriptionEn: game.description.en,
      descriptionRu: game.description.ru,
      hasGachaHeroes: game.hasGachaHeroes,
      slug: game.slug,
    });
    setIsDialogOpen(true);
  }

  function handleAdd() {
    setSelectedGame(null);
    setFormData({
      nameEn: '',
      nameRu: '',
      image: '',
      descriptionEn: '',
      descriptionRu: '',
      hasGachaHeroes: false,
      slug: '',
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
          <h2 className="text-2xl font-bold text-white">Games</h2>
          <Button onClick={handleAdd} className="bg-purple-500 hover:bg-purple-600">
            <Plus className="h-4 w-4 mr-2" />
            Add Game
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div
              key={game.id}
              className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700"
            >
              <img
                src={game.image}
                alt={game.nameEn}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{game.nameEn}</h3>
                    <p className="text-gray-400">{game.nameRu}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(game)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(game)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {game.description.en.substring(0, 100)}...
                </p>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>
                {selectedGame ? 'Edit Game' : 'Add New Game'}
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
                <label className="text-sm">Image URL</label>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm">English Description</label>
                <Textarea
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm">Russian Description</label>
                <Textarea
                  value={formData.descriptionRu}
                  onChange={(e) => setFormData({ ...formData, descriptionRu: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.hasGachaHeroes}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, hasGachaHeroes: checked })
                  }
                />
                <label className="text-sm">Has Gacha Heroes</label>
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
                  {selectedGame ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}