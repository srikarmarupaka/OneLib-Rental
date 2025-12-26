import React from 'react';
import { Trash2, ShoppingBag, Heart, BookOpen } from 'lucide-react';
import { Book } from '../types';

interface WishlistViewProps {
  wishlist: Book[];
  onRemove: (book: Book) => void;
  onMoveToCart: (book: Book) => void;
  onBrowse: () => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({ wishlist, onRemove, onMoveToCart, onBrowse }) => {
  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-pink-50 dark:bg-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-pink-400">
          <Heart size={40} />
        </div>
        <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-2">Your Wishlist is Empty</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Save books you want to read later.</p>
        <button 
          onClick={onBrowse}
          className="px-8 py-3 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors inline-flex items-center gap-2"
        >
          <BookOpen size={20} /> Browse Books
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-8">My Wishlist</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((book) => (
          <div key={book.id} className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <img src={book.coverUrl} alt={book.title} className="w-24 h-36 object-cover rounded-lg shadow-sm" />
            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white line-clamp-2">{book.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">{book.author}</p>
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">₹{book.rentPrice} <span className="text-slate-400 dark:text-slate-500 font-normal">/ 14 days</span></div>
              </div>
              
              <div className="flex flex-col gap-2 mt-4">
                 <button 
                   onClick={() => onMoveToCart(book)}
                   className="w-full py-2 bg-slate-900 dark:bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                 >
                   <ShoppingBag size={16} /> Rent Now
                 </button>
                 <button 
                   onClick={() => onRemove(book)}
                   className="w-full py-2 text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                 >
                   <Trash2 size={16} /> Remove
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};