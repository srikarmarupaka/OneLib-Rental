import React, { useState, useEffect } from 'react';
import { Library, Search, Menu, ShoppingBag, User as UserIcon, Heart, X, LayoutDashboard, Bell, Check, Gift, Sun, Moon, Monitor, LogOut, ChevronRight, Home, BookOpen } from 'lucide-react';
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
  toggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  view,
  setView,
  searchQuery,
  setSearchQuery,
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

  const handleMobileNav = (newView: ViewState) => {
    setView(newView);
    setMobileMenuOpen(false);
  };

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
    <nav className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => setView(isLibrarian ? ViewState.LIBRARIAN_DASHBOARD : ViewState.HOME)}>
            <div className={`p-1.5 rounded-lg text-white ${isLibrarian ? 'bg-slate-900 dark:bg-slate-700' : 'bg-amber-600'}`}>
              <Library size={24} />
            </div>
            <span className="font-serif font-bold text-xl text-slate-800 dark:text-white">OneLib<span className={isLibrarian ? 'text-slate-900 dark:text-slate-200' : 'text-amber-600'}>.in</span></span>
            {isLibrarian && <span className="ml-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase rounded hidden sm:inline-block">Staff</span>}
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8">
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

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {!isLibrarian && (
              <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
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
            
            {/* Theme Dropdown - Hidden on Mobile */}
            <div className="relative hidden md:block">
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
            
            {/* Notifications - Hidden on Mobile */}
            {user && (
              <div className="relative hidden md:block">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 transition-colors relative z-50 ${showNotifications ? 'text-amber-600' : 'text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400'}`}
                >
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
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
                  </>
                )}
              </div>
            )}

            {!isLibrarian && (
              <>
                {/* Wishlist - Hidden on Mobile */}
                <button 
                  onClick={() => setView(ViewState.WISHLIST)}
                  className={`hidden md:block p-2 transition-colors relative ${view === ViewState.WISHLIST ? 'text-pink-600' : 'text-slate-600 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400'}`}
                  title="Wishlist"
                >
                  <Heart size={22} className={user?.wishlist.length ? "fill-pink-600 text-pink-600 dark:text-pink-400 dark:fill-pink-400" : ""} />
                </button>

                {/* Cart - Visible on Mobile */}
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

            {/* User Auth Section - Hidden on Mobile */}
            {user ? (
              <button 
                onClick={() => setView(isLibrarian ? ViewState.LIBRARIAN_DASHBOARD : ViewState.PROFILE)}
                className={`hidden md:flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full border transition-all ${
                  view === ViewState.PROFILE || view === ViewState.LIBRARIAN_DASHBOARD
                    ? isLibrarian ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white' : 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400' 
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-300'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${isLibrarian ? 'bg-slate-800' : 'bg-amber-600'}`}>
                  {isLibrarian ? <LayoutDashboard size={14}/> : user.name.charAt(0)}
                </div>
                <span className="text-sm font-medium hidden lg:block truncate max-w-[80px]">
                   {isLibrarian ? 'Librarian' : user.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button 
                onClick={() => setAuthModalOpen(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
              >
                <UserIcon size={16} />
                <span className="hidden lg:inline">Sign In</span>
              </button>
            )}
            
            {/* Hamburger Button - Visible Only on Mobile */}
            <button 
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
      
      {/* Revised Mobile Menu - MOVED OUTSIDE NAV TO FIX STACKING CONTEXT */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" 
             onClick={() => setMobileMenuOpen(false)}
           />
           
           {/* Drawer */}
           <div className="absolute right-0 top-0 h-full w-[85%] max-w-[320px] bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-100 dark:border-slate-800">
             
             {/* Mobile Header */}
             <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
               <span className="font-serif font-bold text-xl text-slate-800 dark:text-white">OneLib</span>
               <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                 <X size={20} className="text-slate-500 dark:text-slate-400" />
               </button>
             </div>

             {/* Scrollable Content */}
             <div className="flex-1 overflow-y-auto p-5 space-y-8">
                
                {/* Mobile Search */}
                {!isLibrarian && (
                  <form onSubmit={(e) => { handleSearchSubmit(e); setMobileMenuOpen(false); }} className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                     <input 
                       type="text" 
                       placeholder="Search books, authors..." 
                       className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none text-slate-900 dark:text-white placeholder-slate-500"
                       value={searchQuery}
                       onChange={handleSearchChange}
                     />
                  </form>
                )}

                {/* User Profile Summary */}
                {user ? (
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl flex items-center gap-3 border border-slate-100 dark:border-slate-700">
                     <div className="w-12 h-12 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                       {user.name.charAt(0)}
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                       <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                     </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false); }}
                    className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 dark:shadow-white/10"
                  >
                    <UserIcon size={18} /> Sign In / Join
                  </button>
                )}

                {/* Navigation Links */}
                <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Menu</p>
                   <div className="space-y-1">
                      {isLibrarian ? (
                         <button 
                            onClick={() => handleMobileNav(ViewState.LIBRARIAN_DASHBOARD)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === ViewState.LIBRARIAN_DASHBOARD ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                         >
                           <LayoutDashboard size={20} /> Dashboard
                         </button>
                      ) : (
                         <>
                           <button onClick={() => handleMobileNav(ViewState.HOME)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === ViewState.HOME ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                             <Home size={20} /> Home
                           </button>
                           <button onClick={() => handleMobileNav(ViewState.BROWSE)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === ViewState.BROWSE ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                             <BookOpen size={20} /> Browse Books
                           </button>
                           <button onClick={() => handleMobileNav(ViewState.MEMBERSHIP)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === ViewState.MEMBERSHIP ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                             <Check size={20} /> Membership
                           </button>
                           <button onClick={() => handleMobileNav(ViewState.DONATE)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === ViewState.DONATE ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                             <Gift size={20} /> Donate
                           </button>
                         </>
                      )}
                   </div>
                </div>
                
                {/* User Actions */}
                {user && !isLibrarian && (
                  <div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">My Account</p>
                     <div className="space-y-1">
                        <button onClick={() => handleMobileNav(ViewState.PROFILE)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === ViewState.PROFILE ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                           <UserIcon size={20} /> Profile
                        </button>
                        <button onClick={() => handleMobileNav(ViewState.WISHLIST)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === ViewState.WISHLIST ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                           <Heart size={20} /> Wishlist
                        </button>
                        
                        {/* Expandable Notifications */}
                        <div className="space-y-2">
                           <button 
                             onClick={() => setShowNotifications(!showNotifications)}
                             className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                           >
                              <div className="flex items-center gap-3">
                                <Bell size={20} /> 
                                <span>Notifications</span>
                              </div>
                              {unreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>}
                              <ChevronRight size={16} className={`transition-transform ${showNotifications ? 'rotate-90' : ''}`} />
                           </button>
                           
                           {showNotifications && (
                              <div className="pl-4 pr-2 space-y-2 animate-in slide-in-from-top-2">
                                 {notifications.length === 0 ? (
                                    <p className="text-sm text-slate-400 italic px-4 py-2">No new notifications</p>
                                 ) : (
                                    notifications.map(n => (
                                      <div key={n.id} className={`p-3 rounded-lg text-sm border ${n.isRead ? 'border-transparent opacity-60' : 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800'}`}>
                                         <p className="text-slate-800 dark:text-slate-200 mb-1">{n.message}</p>
                                         <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-slate-400">{new Date(n.timestamp).toLocaleTimeString()}</span>
                                            {!n.isRead && (
                                              <button onClick={(e) => { e.stopPropagation(); onMarkNotificationRead(n.id); }} className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">Mark Read</button>
                                            )}
                                         </div>
                                      </div>
                                    ))
                                 )}
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
                )}

                {/* Theme & Footer */}
                <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Appearance</p>
                   <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
                      {(['light', 'dark', 'system'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={`flex items-center justify-center py-2.5 rounded-lg transition-all ${theme === t ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-sm font-bold' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                          {t === 'light' ? <Sun size={18}/> : t === 'dark' ? <Moon size={18}/> : <Monitor size={18}/>}
                        </button>
                      ))}
                   </div>
                </div>
                
                <div className="pt-4 pb-8 text-center text-xs text-slate-400">
                    <p>© 2024 OneLib India</p>
                    <p className="mt-1">v1.0.2</p>
                </div>

             </div>
           </div>
        </div>
      )}
    </>
  );
};