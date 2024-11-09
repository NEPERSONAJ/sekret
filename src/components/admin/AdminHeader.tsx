import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { LogOut, Users, GamepadIcon, Settings, ShoppingCart } from 'lucide-react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function AdminHeader() {
  const navigate = useNavigate();
  const { toast } = useToast();

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Successfully logged out',
      });
      
      navigate('/admin/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }

  const navItems = [
    { href: '/admin/accounts', icon: ShoppingCart, label: 'Accounts' },
    { href: '/admin/heroes', icon: Users, label: 'Heroes' },
    { href: '/admin/games', icon: GamepadIcon, label: 'Games' },
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <RouterLink to="/admin" className="text-xl font-bold text-white hover:text-purple-400 transition-colors">
            StartAccounts Admin
          </RouterLink>
          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map(({ href, icon: Icon, label }) => (
              <RouterLink
                key={href}
                to={href}
                className="text-gray-300 hover:text-white flex items-center space-x-2"
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </RouterLink>
            ))}
          </nav>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="text-gray-300 hover:text-white"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Выйти
        </Button>
      </div>
    </header>
  );
}