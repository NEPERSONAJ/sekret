import { Globe, MessageSquare, Instagram } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from '@/hooks/useLanguage';
import { Link } from '@/components/ui/link';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <Link
        href="https://t.me/startaccount"
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
      >
        <MessageSquare className="h-5 w-5 text-white" />
      </Link>
      <Link
        href="https://instagram.com/startaccount"
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
      >
        <Instagram className="h-5 w-5 text-white" />
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-white">
            <Globe className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-black/90 border-white/10">
          <DropdownMenuItem 
            onClick={() => setLanguage('en')}
            className={`${language === 'en' ? 'bg-purple-500/20' : ''} text-white hover:bg-white/10`}
          >
            English
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setLanguage('ru')}
            className={`${language === 'ru' ? 'bg-purple-500/20' : ''} text-white hover:bg-white/10`}
          >
            Русский
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}