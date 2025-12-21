import React from 'react';
import { Trash2, ArrowRight, BookOpen, ShoppingBag } from 'lucide-react';
import { Book } from '../types';

interface CartViewProps {
  cart: Book[];
  onRemove: (bookId: string) => void;
  onCheckout: () => void;
  onBrowse: () => void;
}

export const CartView: React.FC<CartViewProps> = ({ cart, onRemove, onCheckout, onBrowse }) => {
  const total = cart.reduce((sum, book) => sum + book.rentPrice, 0);

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Your Cart is Empty</h2>
        <p className="text-slate-500 mb-8">Looks like you haven't added any books to rent yet.</p>
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
      <h1 className="text-3xl font-serif font-bold text-slate-900 mb-8">Your Rental Cart</h1>
      
      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          {cart.map((book) => (
            <div key={book.id} className="flex gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
              <img src={book.coverUrl} alt={book.title} className="w-20 h-28 object-cover rounded-lg shadow-sm" />
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h3 className="text-lg font-serif font-bold text-slate-900">{book.title}</h3>
                  <p className="text-slate-500 text-sm">{book.author}</p>
                  <p className="text-slate-400 text-xs mt-1">Rental Period: 14 Days</p>
                </div>
                <div className="flex justify-between items-end">
                   <p className="font-bold text-slate-900">₹{book.rentPrice}</p>
                   <button 
                     onClick={() => onRemove(book.id)}
                     className="text-red-500 text-sm hover:text-red-700 flex items-center gap-1 font-medium transition-colors"
                   >
                     <Trash2 size={16} /> Remove
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
            <h3 className="font-bold text-slate-900 mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal ({cart.length} books)</span>
                <span>₹{total}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Delivery Charge</span>
                <span className="text-emerald-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tax (5%)</span>
                <span>₹{Math.round(total * 0.05)}</span>
              </div>
            </div>
            
            <div className="border-t border-slate-100 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-bold text-2xl text-slate-900">₹{total + Math.round(total * 0.05)}</span>
              </div>
            </div>

            <button 
              onClick={onCheckout}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Confirm Rental <ArrowRight size={18} />
            </button>
            <p className="text-xs text-slate-400 text-center mt-3">
              By confirming, you agree to return books by due date.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
