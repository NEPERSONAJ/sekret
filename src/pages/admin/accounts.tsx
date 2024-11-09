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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Account, Game, Hero } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function AccountsAdmin() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>('all'); // Changed from empty string to 'all'
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'ru'>('en');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    titleEn: '',
    titleRu: '',
    descriptionEn: '',
    descriptionRu: '',
    price: 0,
    image: '',
    gameId: '',
    server: '',
    adventureRank: 0,
    guaranteed: false,
    selectedHeroes: [] as string[],
    resources: [] as { name: string; value: number }[],
    metaTitleEn: '',
    metaTitleRu: '',
    metaDescriptionEn: '',
    metaDescriptionRu: '',
    metaKeywordsEn: '',
    metaKeywordsRu: '',
    status: 'active' as 'active' | 'sold' | 'hidden'
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [accountsData, gamesData, heroesData] = await Promise.all([
        supabase.from('accounts').select('*'),
        supabase.from('games').select('*'),
        supabase.from('heroes').select('*')
      ]);

      if (accountsData.error) throw accountsData.error;
      if (gamesData.error) throw gamesData.error;
      if (heroesData.error) throw heroesData.error;

      if (accountsData.data) {
        const formattedAccounts = accountsData.data.map(account => ({
          ...account,
          titleEn: account.title_en,
          titleRu: account.title_ru,
          descriptionEn: account.description_en,
          descriptionRu: account.description_ru,
          metaTitleEn: account.meta_title_en,
          metaTitleRu: account.meta_title_ru,
          metaDescriptionEn: account.meta_description_en,
          metaDescriptionRu: account.meta_description_ru,
          metaKeywordsEn: account.meta_keywords_en,
          metaKeywordsRu: account.meta_keywords_ru,
          gameId: account.game_id,
          adventureRank: account.adventure_rank,
          heroes: Array.isArray(account.heroes) ? account.heroes : []
        }));
        setAccounts(formattedAccounts);
      }

      if (gamesData.data) {
        const formattedGames = gamesData.data.map(game => ({
          ...game,
          nameEn: game.name_en,
          nameRu: game.name_ru,
          description: {
            en: game.description_en,
            ru: game.description_ru
          },
          hasGachaHeroes: game.has_gacha_heroes
        }));
        setGames(formattedGames);
      }

      if (heroesData.data) {
        const formattedHeroes = heroesData.data.map(hero => ({
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    // Get full hero objects for selected hero IDs
    const selectedHeroObjects = formData.selectedHeroes.map(heroId => {
      const hero = heroes.find(h => h.id === heroId);
      if (!hero) return null;
      return {
        id: hero.id,
        nameEn: hero.nameEn,
        nameRu: hero.nameRu,
        icon: hero.icon,
        type: hero.type,
        gameId: hero.gameId,
        rarity: hero.rarity,
        element: hero.element
      };
    }).filter(Boolean);

    const accountData = {
      title_en: formData.titleEn,
      title_ru: formData.titleRu,
      description_en: formData.descriptionEn,
      description_ru: formData.descriptionRu,
      price: formData.price,
      image: formData.image,
      game_id: formData.gameId,
      server: formData.server,
      adventure_rank: formData.adventureRank,
      guaranteed: formData.guaranteed,
      heroes: selectedHeroObjects,
      resources: formData.resources,
      meta_title_en: formData.metaTitleEn,
      meta_title_ru: formData.metaTitleRu,
      meta_description_en: formData.metaDescriptionEn,
      meta_description_ru: formData.metaDescriptionRu,
      meta_keywords_en: formData.metaKeywordsEn,
      meta_keywords_ru: formData.metaKeywordsRu,
      status: formData.status
    };

    try {
      if (selectedAccount) {
        const { error } = await supabase
          .from('accounts')
          .update(accountData)
          .eq('id', selectedAccount.id);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Account updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('accounts')
          .insert([accountData]);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Account created successfully',
        });
      }

      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving account:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save account',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(account: Account) {
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', account.id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Account deleted successfully',
      });
      
      fetchData();
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete account',
        variant: 'destructive',
      });
    }
  }

  function handleEdit(account: Account) {
    setSelectedAccount(account);
    setFormData({
      titleEn: account.titleEn,
      titleRu: account.titleRu,
      descriptionEn: account.descriptionEn,
      descriptionRu: account.descriptionRu,
      price: account.price,
      image: account.image,
      gameId: account.gameId,
      server: account.server || '',
      adventureRank: account.adventureRank || 0,
      guaranteed: account.guaranteed || false,
      selectedHeroes: (account.heroes || []).map(hero => hero?.id || '').filter(Boolean),
      resources: account.resources || [],
      metaTitleEn: account.metaTitleEn || '',
      metaTitleRu: account.metaTitleRu || '',
      metaDescriptionEn: account.metaDescriptionEn || '',
      metaDescriptionRu: account.metaDescriptionRu || '',
      metaKeywordsEn: account.metaKeywordsEn || '',
      metaKeywordsRu: account.metaKeywordsRu || '',
      status: account.status || 'active'
    });
    setIsDialogOpen(true);
  }

  function handleAdd() {
    setSelectedAccount(null);
    setFormData({
      titleEn: '',
      titleRu: '',
      descriptionEn: '',
      descriptionRu: '',
      price: 0,
      image: '',
      gameId: selectedGame === 'all' ? '' : selectedGame,
      server: '',
      adventureRank: 0,
      guaranteed: false,
      selectedHeroes: [],
      resources: [],
      metaTitleEn: '',
      metaTitleRu: '',
      metaDescriptionEn: '',
      metaDescriptionRu: '',
      metaKeywordsEn: '',
      metaKeywordsRu: '',
      status: 'active'
    });
    setIsDialogOpen(true);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'sold':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'hidden':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const filteredAccounts = accounts.filter(account => 
    selectedGame === 'all' || account.gameId === selectedGame
  );

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
            <h2 className="text-2xl font-bold text-white">Accounts</h2>
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
          <div className="flex items-center space-x-4">
            <Tabs value={activeLanguage} onValueChange={(v) => setActiveLanguage(v as 'en' | 'ru')}>
              <TabsList className="bg-gray-800">
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="ru">Русский</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button 
              onClick={handleAdd} 
              className="bg-purple-500 hover:bg-purple-600"
              disabled={selectedGame === 'all'} // Disable when "All Games" is selected
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map((account) => (
            <div
              key={account.id}
              className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700"
            >
              <img
                src={account.image}
                alt={activeLanguage === 'en' ? account.titleEn : account.titleRu}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">
                        {activeLanguage === 'en' ? account.titleEn : account.titleRu}
                      </h3>
                      <Badge className={getStatusColor(account.status)}>
                        {account.status}
                      </Badge>
                    </div>
                    <p className="text-purple-400 font-semibold mt-1">
                      {account.price} ₽
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      {activeLanguage === 'en' ? account.descriptionEn : account.descriptionRu}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(account)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(account)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {(account.heroes || []).map((hero, index) => {
                      if (!hero) return null;
                      return (
                        <img
                          key={`${hero.id}-${index}`}
                          src={hero.icon}
                          alt={activeLanguage === 'en' ? hero.nameEn : hero.nameRu}
                          className="w-8 h-8 rounded-full border border-white/20"
                          title={activeLanguage === 'en' ? hero.nameEn : hero.nameRu}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-gray-800 text-white max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {selectedAccount ? 'Edit Account' : 'Add New Account'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="w-full bg-gray-700">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="heroes">Heroes</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm">English Title</label>
                      <Input
                        value={formData.titleEn}
                        onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                        className="bg-gray-700 border-gray-600"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">Russian Title</label>
                      <Input
                        value={formData.titleRu}
                        onChange={(e) => setFormData({ ...formData, titleRu: e.target.value })}
                        className="bg-gray-700 border-gray-600"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm">Price (₽)</label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
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
                              {activeLanguage === 'en' ? game.nameEn : game.nameRu}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">Status</label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: 'active' | 'sold' | 'hidden') => 
                          setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="sold">Sold</SelectItem>
                          <SelectItem value="hidden">Hidden</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm">Server</label>
                      <Input
                        value={formData.server}
                        onChange={(e) => setFormData({ ...formData, server: e.target.value })}
                        className="bg-gray-700 border-gray-600"
                        placeholder="e.g., EU, Asia, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">Adventure Rank</label>
                      <Input
                        type="number"
                        value={formData.adventureRank}
                        onChange={(e) => setFormData({ ...formData, adventureRank: Number(e.target.value) })}
                        className="bg-gray-700 border-gray-600"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.guaranteed}
                      onCheckedChange={(checked) => setFormData({ ...formData, guaranteed: checked })}
                    />
                    <label className="text-sm">Guaranteed Account</label>
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm">English Meta Title</label>
                      <Input
                        value={formData.metaTitleEn}
                        onChange={(e) => setFormData({ ...formData, metaTitleEn: e.target.value })}
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">Russian Meta Title</label>
                      <Input
                        value={formData.metaTitleRu}
                        onChange={(e) => setFormData({ ...formData, metaTitleRu: e.target.value })}
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm">English Meta Description</label>
                      <Textarea
                        value={formData.metaDescriptionEn}
                        onChange={(e) => setFormData({ ...formData, metaDescriptionEn: e.target.value })}
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">Russian Meta Description</label>
                      <Textarea
                        value={formData.metaDescriptionRu}
                        onChange={(e) => setFormData({ ...formData, metaDescriptionRu: e.target.value })}
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm">English Meta Keywords</label>
                      <Input
                        value={formData.metaKeywordsEn}
                        onChange={(e) => setFormData({ ...formData, metaKeywordsEn: e.target.value })}
                        className="bg-gray-700 border-gray-600"
                        placeholder="keyword1, keyword2, keyword3"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">Russian Meta Keywords</label>
                      <Input
                        value={formData.metaKeywordsRu}
                        onChange={(e) => setFormData({ ...formData, metaKeywordsRu: e.target.value })}
                        className="bg-gray-700 border-gray-600"
                        placeholder="ключевое слово1, ключевое слово2"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="heroes" className="mt-4">
                  {formData.gameId && games.find(g => g.id === formData.gameId)?.hasGachaHeroes ? (
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                      {heroes
                        .filter(hero => hero.gameId === formData.gameId)
                        .sort((a, b) => {
                          // Sort by type (legendary first)
                          if (a.type === 'legendary' && b.type !== 'legendary') return -1;
                          if (a.type !== 'legendary' && b.type === 'legendary') return 1;
                          // Then by rarity
                          if (a.rarity !== b.rarity) return (b.rarity || 0) - (a.rarity || 0);
                          // Finally by name
                          return a.nameEn.localeCompare(b.nameEn);
                        })
                        .map((hero) => {
                          const count = formData.selectedHeroes.filter(id => id === hero.id).length;
                          
                          return (
                            <div
                              key={hero.id}
                              onClick={() => {
                                const newSelected = [...formData.selectedHeroes, hero.id];
                                setFormData({ ...formData, selectedHeroes: newSelected });
                              }}
                              className="p-2 rounded-lg border cursor-pointer transition-all bg-gray-700 border-gray-600 hover:border-gray-500"
                            >
                              <div className="relative">
                                <img
                                  src={hero.icon}
                                  alt={activeLanguage === 'en' ? hero.nameEn : hero.nameRu}
                                  className="w-full aspect-square rounded-lg object-cover"
                                />
                                {count > 0 && (
                                  <div className="absolute -top-2 -right-2 bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                                    {count}
                                  </div>
                                )}
                                {hero.type === 'legendary' && (
                                  <div className="absolute top-0 right-0 bg-yellow-500 text-xs px-1 rounded">
                                    ★
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-center mt-2 text-white/80">
                                {activeLanguage === 'en' ? hero.nameEn : hero.nameRu}
                              </p>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-white/60">
                      {!formData.gameId 
                        ? 'Please select a game first'
                        : 'This game does not support hero selection'}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="resources" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-white">Account Resources</h3>
                    <Button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        resources: [...formData.resources, { name: '', value: 0 }]
                      })}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Resource
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {formData.resources.map((resource, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Input
                          value={resource.name}
                          onChange={(e) => {
                            const newResources = [...formData.resources];
                            newResources[index].name = e.target.value;
                            setFormData({ ...formData, resources: newResources });
                          }}
                          placeholder={`${activeLanguage === 'en' ? 'Resource name' : 'Название ресурса'}`}
                          className="bg-gray-700 border-gray-600 flex-1"
                        />

                        <Input
                          type="number"
                          value={resource.value}
                          onChange={(e) => {
                            const newResources = [...formData.resources];
                            newResources[index].value = Number(e.target.value);
                            setFormData({ ...formData, resources: newResources });
                          }}
                          placeholder={`${activeLanguage === 'en' ? 'Amount' : 'Количество'}`}
                          className="bg-gray-700 border-gray-600 w-32"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newResources = formData.resources.filter((_, i) => i !== index);
                            setFormData({ ...formData, resources: newResources });
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

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
                  {selectedAccount ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}