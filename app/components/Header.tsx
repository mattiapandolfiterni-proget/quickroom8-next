import { Button } from '@/components/ui/button';
import { Home, User, MessageSquare, Heart, LogOut, Shield, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { NotificationCenter } from './NotificationCenter';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Header = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl">QuickRoom8</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-1">
              <NotificationCenter />
              <LanguageSwitcher />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shadow-sm hover:shadow-md transition-shadow">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile">{t('nav.myProfile')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/list-room">{t('nav.listARoom')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-listings">{t('nav.myListings')}</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <Shield className="w-4 h-4 mr-2" />
                        {t('nav.adminPanel')}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('nav.signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <LanguageSwitcher />
              <Button variant="outline" size="sm" asChild className="text-xs px-2 sm:px-4">
                <Link to="/auth">{t('nav.signIn')}</Link>
              </Button>
              <Button size="sm" asChild className="text-xs px-2 sm:px-4">
                <Link to="/auth">{t('nav.getStarted')}</Link>
              </Button>
            </div>
          )}
        </div>
        
        {user && (
          <nav className="flex items-center justify-around gap-2 pb-3 pt-2 border-t border-border/50">
            <Button variant="ghost" size="sm" asChild className="flex-col h-auto py-2 px-3 gap-1 shadow-sm hover:shadow-md transition-all hover:scale-105">
              <Link to="/browse">
                <Home className="w-5 h-5" />
                <span className="text-xs">{t('nav.browse')}</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="flex-col h-auto py-2 px-3 gap-1 shadow-sm hover:shadow-md transition-all hover:scale-105">
              <Link to="/favorites">
                <Heart className="w-5 h-5" />
                <span className="text-xs">{t('nav.favorites')}</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="flex-col h-auto py-2 px-3 gap-1 shadow-sm hover:shadow-md transition-all hover:scale-105">
              <Link to="/messages">
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs">{t('nav.messages')}</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="flex-col h-auto py-2 px-3 gap-1 shadow-sm hover:shadow-md transition-all hover:scale-105">
              <Link to="/appointments">
                <Calendar className="w-5 h-5" />
                <span className="text-xs">{t('nav.appointments')}</span>
              </Link>
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
};
