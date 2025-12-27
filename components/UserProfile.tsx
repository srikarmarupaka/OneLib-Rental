import React, { useState } from 'react';
import { User, Book, BookOpen, Clock, Settings, LogOut, Gift, Share2, Copy, Truck, ArrowUpRight, Package, RefreshCw } from 'lucide-react';
import { MembershipCard } from './MembershipCard';
import { User as UserType, Book as BookType, Rental, RentalStatus } from '../types';
import { TrackingModal } from './TrackingModal';

interface UserProfileProps {
  user: UserType;
  rentals: Rental[];
  onLogout: () => void;
  onBrowse: () => void;
  onRenew: (bookId: string) => void;
  onRead: (book: BookType) => void;
  onSettingsClick: () => void;
  onRequestReturn: (rentalId: string) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, rentals, onLogout, onBrowse, onRenew, onRead, onSettingsClick, onRequestReturn }) => {
  const [activeTab, setActiveTab] = useState<'rentals' | 'downloads'>('rentals');
  const [copied, setCopied] = useState(false);
  const [trackingRental, setTrackingRental] = useState<Rental | null>(null);

  // Filter rentals specific to this user. We show all active, delivered, and recently returned.
  const userRentals = rentals.filter(r => r.userId === user.id && r.status !== 'cancelled' && r.status !== 'rejected');

  const referralCode = `ONE-${user.id.substring(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: RentalStatus) => {
    switch (status) {
        case 'pending': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
        case 'approved': return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400';
        case 'dispatched': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
        case 'delivered': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
        case 'return_requested': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
        case 'return_scheduled': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
        case 'returned': return 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
        case 'overdue': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
        default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Sidebar / Card Section */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 text-center">
            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full mx-auto mb-4 flex items-center justify-center text-amber-600 dark:text-amber-500 font-serif font-bold text-3xl">
              {user.name.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{user.email}</p>
            
            <div className="flex justify-center mb-6">
              <div className="transform scale-90 sm:scale-100">
                <MembershipCard 
                  name={user.name} 
                  cardNumber={user.oneLibCardId} 
                  validThru="12/28"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-700 pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{userRentals.filter(r => r.status === 'delivered').length}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Books with You</p>
              </div>
              <div className="text-center border-l border-slate-100 dark:border-slate-700">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-500 flex items-center justify-center gap-1">
                    {user.oneLibPoints} <Gift size={16} />
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Rewards Points</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Share2 size={80} />
             </div>
             <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Gift size={18} /> Refer & Earn</h3>
             <p className="text-sm text-indigo-100 mb-4">Share your code with friends. You both get <span className="font-bold text-white">100 Points</span> when they join!</p>
             
             <div className="bg-white/20 backdrop-blur-md rounded-lg p-3 flex justify-between items-center border border-white/20">
                 <code className="font-mono font-bold tracking-wider">{referralCode}</code>
                 <button 
                    onClick={handleCopyCode}
                    className="p-1.5 hover:bg-white/20 rounded transition-colors"
                    title="Copy Code"
                 >
                     {copied ? <span className="text-xs font-bold">Copied!</span> : <Copy size={16} />}
                 </button>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <button 
                onClick={onSettingsClick}
                className="w-full px-6 py-4 flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-50 dark:border-slate-700"
            >
              <Settings size={18} /> Account Settings
            </button>
            <button 
              onClick={onLogout}
              className="w-full px-6 py-4 flex items-center gap-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>

        {/* Right Content Section */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden min-h-[600px]">
            <div className="flex border-b border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('rentals')}
                className={`flex-1 py-4 text-sm font-semibold text-center border-b-2 transition-colors ${
                  activeTab === 'rentals' 
                    ? 'border-amber-600 text-amber-600 dark:text-amber-500' 
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                Orders & Rentals
              </button>
              <button
                onClick={() => setActiveTab('downloads')}
                className={`flex-1 py-4 text-sm font-semibold text-center border-b-2 transition-colors ${
                  activeTab === 'downloads' 
                    ? 'border-amber-600 text-amber-600 dark:text-amber-500' 
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                Digital Library
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'rentals' ? (
                userRentals.length > 0 ? (
                  <div className="space-y-4">
                    {userRentals.map(rental => (
                      <div key={rental.id} className="flex gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow bg-white dark:bg-slate-800">
                        <img src={rental.bookCover} alt={rental.bookTitle} className="w-16 h-24 object-cover rounded-md shadow-sm" />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                             <h3 className="font-serif font-bold text-slate-900 dark:text-white">{rental.bookTitle}</h3>
                             <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${getStatusColor(rental.status)}`}>
                                 {rental.status.replace('_', ' ')}
                             </span>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Order ID: #{rental.id.slice(-6)}</p>
                          
                          {/* Contextual Status Messages */}
                          {rental.status === 'pending' && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Waiting for librarian approval...</p>
                          )}
                          {rental.status === 'dispatched' && (
                              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1"><Truck size={12}/> Out for delivery</p>
                          )}
                          {(rental.status === 'delivered' || rental.status === 'overdue') && (
                              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded inline-block mt-1">
                                 <Clock size={12} /> Due: {rental.dueDate ? new Date(rental.dueDate).toLocaleDateString() : 'N/A'}
                              </div>
                          )}
                          {rental.status === 'return_requested' && (
                             <p className="text-xs text-purple-600 mt-1">Return request sent. Waiting for pickup schedule.</p>
                          )}
                          {rental.status === 'return_scheduled' && (
                             <p className="text-xs text-orange-600 mt-1">Pickup Scheduled. Please keep book ready.</p>
                          )}
                          {rental.status === 'returned' && (
                             <p className="text-xs text-slate-400 mt-1">Book returned to library.</p>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-3 mt-3">
                              {/* Track Order Button (Visible for Active states) */}
                              {rental.status !== 'pending' && rental.status !== 'cancelled' && (
                                  <button 
                                      onClick={() => setTrackingRental(rental)}
                                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                  >
                                      <Package size={14} /> Track Order
                                  </button>
                              )}
                              
                              {/* Renew Button */}
                              {rental.status === 'delivered' && (
                                <button 
                                  onClick={() => onRenew(rental.bookId)}
                                  className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                                >
                                  <RefreshCw size={14} /> Renew
                                </button>
                              )}
                              
                              {/* Return Button */}
                              {rental.status === 'delivered' && (
                                <button 
                                  onClick={() => onRequestReturn(rental.id)}
                                  className="text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 ml-auto border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                  <ArrowUpRight size={14} /> Request Return
                                </button>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-300">
                      <BookOpen size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No active rentals</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">You haven't rented any physical books yet.</p>
                    <button onClick={onBrowse} className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                      Browse Books
                    </button>
                  </div>
                )
              ) : (
                user.downloadedBooks.length > 0 ? (
                  <div className="space-y-4">
                    {user.downloadedBooks.map(book => (
                      <div key={book.id} className="flex gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                        <img src={book.coverUrl} alt={book.title} className="w-16 h-24 object-cover rounded-md shadow-sm grayscale" />
                        <div className="flex-1">
                          <h3 className="font-serif font-bold text-slate-900 dark:text-white">{book.title}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{book.author}</p>
                          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded inline-block">
                             Downloaded on {new Date().toLocaleDateString()}
                          </div>
                        </div>
                        <button 
                          onClick={() => onRead(book)}
                          className="self-center px-4 py-2 text-sm text-slate-600 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          Read Now
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-300">
                      <Book size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Empty Digital Library</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Download free classics with your OneLibCard.</p>
                    <button onClick={onBrowse} className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                      Browse Free Books
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tracking Modal */}
      {trackingRental && (
          <TrackingModal rental={trackingRental} onClose={() => setTrackingRental(null)} />
      )}
    </div>
  );
};