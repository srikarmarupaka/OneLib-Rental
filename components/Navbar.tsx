import React from 'react';
import { Library, Search, Menu, ShoppingBag, User as UserIcon, Heart, X } from 'lucide-react';
import { ViewState, User } from '../types';

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
}

export const Navbar: React.FC<NavbarProps> = ({
  view,
  setView,
  searchQuery,
  // setSearchQuery is handled via handleSearchChange in input
  handleSearchSubmit,
  handleSearchChange,
  user,
  cartCount,
  setAuthModalOpen,
  isMobileMenuOpen,
  setMobileMenuOpen
}) => {
  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(ViewState.HOME)}>
            <div className="bg-amber-600 p-1.5 rounded-lg text-white">
              <Library size={24} />
            </div>
            <span className="font-serif font-bold text-xl text-slate-800">OneLib<span className="text-amber-600">.in</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => setView(ViewState.HOME)} 
              className={`text-sm font-medium hover:text-amber-600 transition-colors ${view === ViewState.HOME ? 'text-amber-600' : 'text-slate-600'}`}
            >
              Home
            </button>
            <button 
              onClick={() => setView(ViewState.BROWSE)}
              className={`text-sm font-medium hover:text-amber-600 transition-colors ${view === ViewState.BROWSE ? 'text-amber-600' : 'text-slate-600'}`}
            >
              Browse Books
            </button>
            <button 
              onClick={() => setView(ViewState.MEMBERSHIP)}
              className={`text-sm font-medium hover:text-amber-600 transition-colors ${view === ViewState.MEMBERSHIP ? 'text-amber-600' : 'text-slate-600'}`}
            >
              Membership
            </button>
          </div>

          <div className="flex items-center gap-4">
            <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
              <input 
                type="text" 
                placeholder="Search by title, author, publisher..." 
                className="pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none w-64 transition-all"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-600">
                <Search size={16} />
              </button>
            </form>
            
            <button 
              onClick={() => setView(ViewState.WISHLIST)}
              className={`p-2 transition-colors relative ${view === ViewState.WISHLIST ? 'text-pink-600' : 'text-slate-600 hover:text-pink-600'}`}
              title="Wishlist"
            >
              <Heart size={22} className={user?.wishlist.length ? "fill-pink-600 text-pink-600" : ""} />
            </button>

            <button 
              onClick={() => setView(ViewState.CART)}
              className={`relative p-2 transition-colors ${view === ViewState.CART ? 'text-amber-600' : 'text-slate-600 hover:text-amber-600'}`}
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-amber-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Auth Section */}
            {user ? (
              <button 
                onClick={() => setView(ViewState.PROFILE)}
                className={`flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full border transition-all ${
                  view === ViewState.PROFILE 
                    ? 'bg-amber-50 border-amber-200 text-amber-700' 
                    : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300'
                }`}
              >
                <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user.name.charAt(0)}
                </div>
                <span className="text-sm font-medium hidden sm:block truncate max-w-[80px]">{user.name.split(' ')[0]}</span>
              </button>
            ) : (
              <button 
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                <UserIcon size={16} />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
            
            <button 
              className="md:hidden p-2 text-slate-600"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
           <div className="absolute top-0 right-0 w-64 h-full bg-white shadow-xl p-6 flex flex-col" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-8">
               <span className="font-serif font-bold text-xl text-slate-800">OneLib</span>
               <button onClick={() => setMobileMenuOpen(false)}>
                 <X size={24} className="text-slate-500" />
               </button>
             </div>
             <div className="space-y-4">
                <button onClick={() => { setView(ViewState.HOME); setMobileMenuOpen(false); }} className="w-full text-left py-2 font-medium text-slate-700">Home</button>
                <button onClick={() => { setView(ViewState.BROWSE); setMobileMenuOpen(false); }} className="w-full text-left py-2 font-medium text-slate-700">Browse Books</button>
                <button onClick={() => { setView(ViewState.MEMBERSHIP); setMobileMenuOpen(false); }} className="w-full text-left py-2 font-medium text-slate-700">Membership</button>
                <button onClick={() => { setView(ViewState.WISHLIST); setMobileMenuOpen(false); }} className="w-full text-left py-2 font-medium text-slate-700">Wishlist</button>
                <button onClick={() => { setView(ViewState.CART); setMobileMenuOpen(false); }} className="w-full text-left py-2 font-medium text-slate-700">Cart ({cartCount})</button>
             </div>
           </div>
        </div>
      )}
    </nav>
  );
};