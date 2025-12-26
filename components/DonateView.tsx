import React, { useState } from 'react';
import { Gift, Book, CreditCard, Heart, CheckCircle } from 'lucide-react';

interface DonateViewProps {
  onDonate: (type: 'book' | 'money', value: number) => void;
}

export const DonateView: React.FC<DonateViewProps> = ({ onDonate }) => {
  const [activeTab, setActiveTab] = useState<'book' | 'money'>('book');
  const [bookCount, setBookCount] = useState(1);
  const [amount, setAmount] = useState(500);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      if (activeTab === 'book') {
        onDonate('book', bookCount);
      } else {
        onDonate('money', amount);
      }
      setIsSuccess(false);
      setBookCount(1);
      setAmount(500);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-600 dark:text-pink-400 animate-bounce">
          <Heart size={32} fill="currentColor" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-4">Donate & Earn Rewards</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Support the OneLib community. Donate old books or funds to help us maintain the library network. 
          Earn <span className="font-bold text-amber-600 dark:text-amber-500">OneLib Points</span> for every contribution, which automatically apply as discounts on your rentals.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Info Card */}
        <div className="bg-slate-900 dark:bg-black text-white p-8 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Gift className="text-amber-400" /> Point System
            </h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-lg">
                  <Book size={24} className="text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Donate Books</h4>
                  <p className="text-slate-400 text-sm">Earn 50 Points per book.</p>
                  <p className="text-xs text-slate-500 mt-1">We arrange doorstep pickup.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-lg">
                  <CreditCard size={24} className="text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Donate Funds</h4>
                  <p className="text-slate-400 text-sm">Earn 1 Point for every ₹10.</p>
                  <p className="text-xs text-slate-500 mt-1">Tax deductible (80G).</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10">
            <div className="flex justify-between items-center">
               <span className="text-sm text-slate-400">Redemption Value</span>
               <span className="font-bold text-amber-400">1 Point = ₹1 Discount</span>
            </div>
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
          {isSuccess ? (
             <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in">
                <CheckCircle size={64} className="text-emerald-500 mb-4" />
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Thank You!</h3>
                <p className="text-slate-500 dark:text-slate-400">Your contribution is being processed.</p>
             </div>
          ) : (
             <>
                <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl mb-8">
                  <button 
                    onClick={() => setActiveTab('book')}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'book' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                  >
                    Donate Books
                  </button>
                  <button 
                    onClick={() => setActiveTab('money')}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'money' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                  >
                    Donate Funds
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {activeTab === 'book' ? (
                    <>
                       <div className="space-y-2">
                         <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Number of Books</label>
                         <div className="flex items-center gap-4">
                           <button type="button" onClick={() => setBookCount(Math.max(1, bookCount - 1))} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold">-</button>
                           <span className="text-2xl font-bold text-slate-900 dark:text-white w-12 text-center">{bookCount}</span>
                           <button type="button" onClick={() => setBookCount(bookCount + 1)} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold">+</button>
                         </div>
                       </div>
                       <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 rounded-lg">
                          <p className="text-sm text-emerald-800 dark:text-emerald-400 font-medium">You will earn: <span className="font-bold">{bookCount * 50} Points</span></p>
                       </div>
                    </>
                  ) : (
                    <>
                       <div className="space-y-2">
                         <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Amount (₹)</label>
                         <input 
                           type="number" 
                           min="100"
                           step="100"
                           value={amount}
                           onChange={(e) => setAmount(Number(e.target.value))}
                           className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-lg font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                         />
                       </div>
                       <div className="grid grid-cols-3 gap-2">
                          {[500, 1000, 2000].map(val => (
                            <button 
                              key={val}
                              type="button"
                              onClick={() => setAmount(val)}
                              className={`py-2 text-sm rounded-lg border ${amount === val ? 'bg-slate-900 dark:bg-slate-600 text-white border-slate-900 dark:border-slate-600' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'}`}
                            >
                              ₹{val}
                            </button>
                          ))}
                       </div>
                       <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg">
                          <p className="text-sm text-blue-800 dark:text-blue-400 font-medium">You will earn: <span className="font-bold">{Math.floor(amount / 10)} Points</span></p>
                       </div>
                    </>
                  )}

                  <button 
                    type="submit"
                    className="w-full py-4 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 shadow-lg shadow-amber-600/20 transition-all"
                  >
                    Confirm Donation
                  </button>
                </form>
             </>
          )}
        </div>
      </div>
    </div>
  );
};