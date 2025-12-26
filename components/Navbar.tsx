import React, { useState } from 'react';
import { Library, Search, Menu, ShoppingBag, User as UserIcon, Heart, X, LayoutDashboard, Bell, Check, Gift, Sun, Moon, Monitor } from 'lucide-react';
import { ViewState, User, Notification } from '../types';

interface NavbarProps {
  view: ViewState;
  setView: (view: ViewState) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearchSubmit: (e: React.FormEvent) => void;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  user: User | null;
  cartCount: number;
  setAuthModalOpen: (open: boolean) => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme?: () => void; // Deprecated but kept for compatibility if needed
}

export const Navbar: React.FC<NavbarProps> = ({
  view,
  setView,
  searchQuery,
  handleSearchSubmit,
  handleSearchChange,
  user,
  cartCount,
  setAuthModalOpen,
  isMobileMenuOpen,
  setMobileMenuOpen,
  notifications,
  onMarkNotificationRead,
  theme,
  setTheme
}) => {
  const isLibrarian = user?.role === 'librarian';
  const [showNotifications, setShowNotifications] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(isLibrarian ? ViewState.LIBRARIAN_DASHBOARD : ViewState.HOME)}>
            <div className={`p-1.5 rounded-lg text-white ${isLibrarian ? 'bg-slate-900 dark:bg-slate-700' : 'bg-amber-600'}`}>
              <Library size={24} />
            </div>
            <span className="font-serif font-bold text-xl text-slate-800 dark:text-white">OneLib<span className={isLibrarian ? 'text-slate-900 dark:text-slate-200' : 'text-amber-600'}>.in</span></span>
            {isLibrarian && <span className="ml-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase rounded">Staff</span>}
          </div>

          <div className="hidden md:flex items-center gap-8">
            {!isLibrarian ? (
              <>
                <button 
                  onClick={() => setView(ViewState.HOME)} 
                  className={`text-sm font-medium hover:text-amber-600 dark:hover:text-amber-400 transition-colors ${view === ViewState.HOME ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300'}`}
                >
                  Home
                </button>
                <button 
                  onClick={() => setView(ViewState.BROWSE)}
                  className={`text-sm font-medium hover:text-amber-600 dark:hover:text-amber-400 transition-colors ${view === ViewState.BROWSE ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300'}`}
                >
                  Browse Books
                </button>
                <button 
                  onClick={() => setView(ViewState.MEMBERSHIP)}
                  className={`text-sm font-medium hover:text-amber-600 dark:hover:text-amber-400 transition-colors ${view === ViewState.MEMBERSHIP ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300'}`}
                >
                  Membership
                </button>
                <button 
                  onClick={() => setView(ViewState.DONATE)}
                  className={`text-sm font-medium hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1 ${view === ViewState.DONATE ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300'}`}
                >
                  <Gift size={14} /> Donate & Earn
                </button>
              </>
            ) : (
              <button 
                onClick={() => setView(ViewState.LIBRARIAN_DASHBOARD)}
                className={`text-sm font-medium hover:text-slate-900 dark:hover:text-white transition-colors ${view === ViewState.LIBRARIAN_DASHBOARD ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-300'}`}
              >
                Dashboard
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {!isLibrarian && (
              <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-slate-800 border-none rounded-full text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none w-48 lg:w-64 transition-all"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-600">
                  <Search size={16} />
                </button>
              </form>
            )}
            
            {/* Theme Dropdown */}
            <div className="relative">
                <button 
                    onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    title="Change Theme"
                >
                    {theme === 'light' ? <Sun size={20} /> : theme === 'dark' ? <Moon size={20} /> : <Monitor size={20} />}
                </button>

                {isThemeMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsThemeMenuOpen(false)}></div>
                        <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                            {[
                                { id: 'light', icon: Sun, label: 'Light' },
                                { id: 'dark', icon: Moon, label: 'Dark' },
                                { id: 'system', icon: Monitor, label: 'System' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setTheme(item.id as 'light' | 'dark' | 'system');
                                        setIsThemeMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${theme === item.id ? 'text-amber-600 font-bold bg-amber-50 dark:bg-amber-900/20' : 'text-slate-700 dark:text-slate-300'}`}
                                >
                                    <item.icon size={16} /> {item.label}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
            
            {user && (
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 transition-colors relative ${showNotifications ? 'text-amber-600' : 'text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400'}`}
                >
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 flex justify-between items-center">
                      <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200">Notifications</h4>
                      <button onClick={() => setShowNotifications(false)}><X size={16} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" /></button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">No new notifications</div>
                      ) : (
                        notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className={`p-4 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${notification.isRead ? 'opacity-60' : 'bg-blue-50/30 dark:bg-blue-900/10'}`}
                          >
                            <div className="flex gap-3">
                               <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notification.type === 'success' ? 'bg-emerald-500' : notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                               <div className="flex-1">
                                  <p className="text-sm text-slate-800 dark:text-slate-200 leading-snug">{notification.message}</p>
                                  <p className="text-[10px] text-slate-400 mt-1">{new Date(notification.timestamp).toLocaleTimeString()}</p>
                               </div>
                               {!notification.isRead && (
                                 <button onClick={() => onMarkNotificationRead(notification.id)} className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 h-fit">
                                   <Check size={16} />
                                 </button>
                               )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isLibrarian && (
              <>
                <button 
                  onClick={() => setView(ViewState.WISHLIST)}
                  className={`p-2 transition-colors relative ${view === ViewState.WISHLIST ? 'text-pink-600' : 'text-slate-600 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400'}`}
                  title="Wishlist"
                >
                  <Heart size={22} className={user?.wishlist.length ? "fill-pink-600 text-pink-600 dark:text-pink-400 dark:fill-pink-400" : ""} />
                </button>

                <button 
                  onClick={() => setView(ViewState.CART)}
                  className={`relative p-2 transition-colors ${view === ViewState.CART ? 'text-amber-600' : 'text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400'}`}
                >
                  <ShoppingBag size={22} />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 bg-amber-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in">
                      {cartCount}
                    </span>
                  )}
                </button>
              </>
            )}

            {/* User Auth Section */}
            {user ? (
              <button 
                onClick={() => setView(isLibrarian ? ViewState.LIBRARIAN_DASHBOARD : ViewState.PROFILE)}
                className={`flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full border transition-all ${
                  view === ViewState.PROFILE || view === ViewState.LIBRARIAN_DASHBOARD
                    ? isLibrarian ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white' : 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400' 
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-300'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${isLibrarian ? 'bg-slate-800' : 'bg-amber-600'}`}>
                  {isLibrarian ? <LayoutDashboard size={14}/> : user.name.charAt(0)}
                </div>
                <span className="text-sm font-medium hidden sm:block truncate max-w-[80px]">
                   {isLibrarian ? 'Librarian' : user.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button 
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
              >
                <UserIcon size={16} />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
            
            <button 
              className="md:hidden p-2 text-slate-600 dark:text-slate-300"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/70 md:hidden" onClick={() => setMobileMenuOpen(false)}>
           <div className="absolute top-0 right-0 w-64 h-full bg-white dark:bg-slate-900 shadow-xl p-6 flex flex-col" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-8">
               <span className="font-serif font-bold text-xl text-slate-800 dark:text-white">OneLib</span>
               <button onClick={() => setMobileMenuOpen(false)}>
                 <X size={24} className="text-slate-500 dark:text-slate-400" />
               </button>
             </div>
             <div className="space-y-4">
                {isLibrarian ? (
                    <button onClick={() => { setView(ViewState.LIBRARIAN_DASHBOARD); setMobileMenuOpen(false); }} className="w-full text-left py-2 font-medium text-slate-700 dark:text-slate-300">Dashboard</button>
                ) : (
                    <>
                        <button onClick={() => { setView(ViewState.HOME); setMobileMenuOpen(false); }} className="w-full text-left py-2 font-medium text-slate-700 dark:text-slate-300">Home</button>
                        <button onClick={() => { setView(ViewState.BROWSE); setMobileMenuOpen(false); }} className="w-full text-left py-2 font-medium text-slate-700 dark:text-slate-300">Browse Books</button>
                        <button onClick={() => { setView(ViewState.MEMBERSHIP); setMobileMenuOpen(false); }} className="w-full text-left py-2 font-medium text-slate-700 dark:text-slate-300">Membership</button>
                        <button onClick={() => { setView(ViewState.DONATE); setMobileMenuOpen(false); }} className="w-full text-left py-2 font-medium text-slate-700 dark:text-slate-300">Donate</button>
                        <button onClick={() => { setView(ViewState.WISHLIST); setMobileMenuOpen(false); }} className="w-full text-left py-2 font-medium text-slate-700 dark:text-slate-300">Wishlist</button>
                        <button onClick={() => { setView(ViewState.CART); setMobileMenuOpen(false); }} className="w-full text-left py-2 font-medium text-slate-700 dark:text-slate-300">Cart ({cartCount})</button>
                    </>
                )}
             </div>
           </div>
        </div>
      )}
    </nav>
  );
};