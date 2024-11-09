import { useState, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Sparkles, MessageSquare, Menu, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from './components/ErrorBoundary';
import AdminDashboard from './pages/admin/AdminDashboard';
import HeroesAdmin from './pages/admin/heroes';
import GamesAdmin from './pages/admin/games';
import AccountsAdmin from './pages/admin/accounts';
import SettingsAdmin from './pages/admin/settings';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "@/components/ui/link";
import HeroSelector from './components/HeroSelector';
import AccountList from './components/AccountList';
import AIChat from './components/AIChat';
import Blog from './components/Blog';
import Reviews from './components/Reviews';
import Contact from './components/Contact';
import GameSelector from './components/GameSelector';
import PurchaseNotification from './components/PurchaseNotification';
import PromoBar from './components/PromoBar';
import Footer from './components/Footer';
import LanguageSelector from './components/LanguageSelector';
import { usePurchaseNotifications } from './hooks/usePurchaseNotifications';
import { useLanguage } from './hooks/useLanguage';
import { translations } from './i18n/translations';
import { Hero, Game } from './types';

function App() {
  const [selectedHeroes, setSelectedHeroes] = useState<Hero[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('accounts');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { notification, clearNotification, hideAllNotifications } = usePurchaseNotifications();
  const { language } = useLanguage();
  const t = translations[language];

  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <ErrorBoundary>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        }>
          <Routes>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/accounts" element={<AccountsAdmin />} />
            <Route path="/admin/heroes" element={<HeroesAdmin />} />
            <Route path="/admin/games" element={<GamesAdmin />} />
            <Route path="/admin/settings" element={<SettingsAdmin />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    );
  }

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
    setSelectedHeroes([]);
    // If it's not a gacha game, show accounts immediately
    if (!game.hasGachaHeroes) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    setIsSearching(true);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setIsSheetOpen(false);
  };

  const mobileNavItems = [
    { id: 'accounts', label: t.nav.accounts },
    { id: 'reviews', label: t.nav.reviews },
    { id: 'blog', label: t.nav.blog },
    { id: 'contact', label: t.nav.contact },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-[#1C1147] to-black">
      <nav className="border-b border-white/10 backdrop-blur-md fixed w-full z-50 top-0">
        <PromoBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 flex justify-center md:justify-start items-center space-x-2"
            >
              <Link href="/" className="flex items-center space-x-2">
                <Sparkles className="h-8 w-8 text-yellow-400" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-200 via-purple-400 to-pink-300 bg-clip-text text-transparent">
                  StartAccounts
                </h1>
              </Link>
            </motion.div>

            <div className="hidden md:flex items-center space-x-4">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="bg-white/10 border-white/20">
                  {mobileNavItems.map(({ id, label }) => (
                    <TabsTrigger
                      key={id}
                      value={id}
                      className="data-[state=active]:bg-white/20"
                    >
                      {label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <LanguageSelector />
            </div>

            <div className="flex md:hidden items-center space-x-2">
              <LanguageSelector />
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-gradient-to-b from-indigo-900 to-purple-900 border-white/10">
                  <SheetHeader>
                    <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-200 via-purple-400 to-pink-300 bg-clip-text text-transparent">
                      StartAccounts
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col space-y-4 mt-8">
                    {mobileNavItems.map(({ id, label }) => (
                      <Button
                        key={id}
                        variant="ghost"
                        className={`justify-start text-lg transition-all duration-200 ${
                          activeTab === id 
                            ? 'bg-white/10 text-white font-medium pl-4 border-l-4 border-purple-400'
                            : 'text-white/70 hover:text-white hover:bg-white/5'
                        }`}
                        onClick={() => handleTabChange(id)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
          <TabsContent value="accounts" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <GameSelector
                selectedGame={selectedGame}
                onSelectGame={handleGameSelect}
              />

              {selectedGame?.hasGachaHeroes && (
  <>
    <HeroSelector 
      selectedHeroes={selectedHeroes}
      onSelectHero={(hero) => setSelectedHeroes([...selectedHeroes, hero])}
      onRemoveHero={(hero) => setSelectedHeroes(selectedHeroes.filter(h => h.id !== hero.id))}
      onSearch={handleSearch}
      selectedGame={selectedGame}
    />
    {selectedHeroes.length > 0 && !isSearching && (
      <div className="flex justify-center">
        <Button
          onClick={handleSearch}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Search className="h-4 w-4 mr-2" />
          {language === 'en' ? 'Search Accounts' : 'Поиск аккаунтов'}
        </Button>
      </div>
    )}
  </>
)}

              <AnimatePresence>
                {isSearching && selectedGame && (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    exit={{ opacity: 0, height: 0 }}
  >
    <AccountList 
      selectedHeroes={selectedHeroes}
      selectedGame={selectedGame}
    />
  </motion.div>
)}
              </AnimatePresence>
            </motion.div>
          </TabsContent>

          <TabsContent value="reviews">
            <Reviews />
          </TabsContent>

          <TabsContent value="blog">
            <Blog />
          </TabsContent>

          <TabsContent value="contact">
            <Contact />
          </TabsContent>
        </Tabs>
      </main>

      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-16 right-0 w-[300px] h-[500px] mb-4"
            >
              <AIChat onClose={() => setIsChatOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="h-14 w-14 rounded-full bg-purple-500 hover:bg-purple-600 shadow-lg"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>

      <AnimatePresence>
        {notification && (
          <PurchaseNotification
            notification={notification}
            onClose={clearNotification}
            onHideAll={hideAllNotifications}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default App;
