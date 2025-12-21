import React, { useState } from 'react';
import { User, Book, BookOpen, Clock, Settings, LogOut } from 'lucide-react';
import { MembershipCard } from './MembershipCard';
import { User as UserType, Book as BookType } from '../types';

interface UserProfileProps {
  user: UserType;
  onLogout: () => void;
  onBrowse: () => void;
  onRenew: (book: BookType) => void;
  onRead: (book: BookType) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout, onBrowse, onRenew, onRead }) => {
  const [activeTab, setActiveTab] = useState<'rentals' | 'downloads'>('rentals');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Sidebar / Card Section */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full mx-auto mb-4 flex items-center justify-center text-amber-600 font-serif font-bold text-3xl">
              {user.name.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            <p className="text-sm text-slate-500 mb-6">{user.email}</p>
            
            <div className="flex justify-center mb-6">
              <div className="transform scale-90 sm:scale-100">
                <MembershipCard 
                  name={user.name} 
                  cardNumber={user.oneLibCardId} 
                  validThru="12/28"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{user.rentedBooks.length}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Active Rentals</p>
              </div>
              <div className="text-center border-l border-slate-100">
                <p className="text-2xl font-bold text-slate-900">{user.downloadedBooks.length}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Downloads</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <button className="w-full px-6 py-4 flex items-center gap-3 text-slate-600 hover:bg-slate-50 transition-colors border-b border-slate-50">
              <Settings size={18} /> Account Settings
            </button>
            <button 
              onClick={onLogout}
              className="w-full px-6 py-4 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>

        {/* Right Content Section */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[600px]">
            <div className="flex border-b border-slate-100">
              <button
                onClick={() => setActiveTab('rentals')}
                className={`flex-1 py-4 text-sm font-semibold text-center border-b-2 transition-colors ${
                  activeTab === 'rentals' 
                    ? 'border-amber-600 text-amber-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Active Rentals
              </button>
              <button
                onClick={() => setActiveTab('downloads')}
                className={`flex-1 py-4 text-sm font-semibold text-center border-b-2 transition-colors ${
                  activeTab === 'downloads' 
                    ? 'border-amber-600 text-amber-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Digital Library
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'rentals' ? (
                user.rentedBooks.length > 0 ? (
                  <div className="space-y-4">
                    {user.rentedBooks.map(book => (
                      <div key={book.id} className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                        <img src={book.coverUrl} alt={book.title} className="w-16 h-24 object-cover rounded-md shadow-sm" />
                        <div className="flex-1">
                          <h3 className="font-serif font-bold text-slate-900">{book.title}</h3>
                          <p className="text-sm text-slate-500 mb-2">{book.author}</p>
                          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded inline-block">
                             <Clock size={12} /> Due in 12 days
                          </div>
                        </div>
                        <button 
                          onClick={() => onRenew(book)}
                          className="self-center px-4 py-2 text-sm text-amber-600 font-medium border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors"
                        >
                          Renew
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                      <BookOpen size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">No active rentals</h3>
                    <p className="text-slate-500 mb-6">You haven't rented any physical books yet.</p>
                    <button onClick={onBrowse} className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                      Browse Books
                    </button>
                  </div>
                )
              ) : (
                user.downloadedBooks.length > 0 ? (
                  <div className="space-y-4">
                    {user.downloadedBooks.map(book => (
                      <div key={book.id} className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                        <img src={book.coverUrl} alt={book.title} className="w-16 h-24 object-cover rounded-md shadow-sm grayscale" />
                        <div className="flex-1">
                          <h3 className="font-serif font-bold text-slate-900">{book.title}</h3>
                          <p className="text-sm text-slate-500 mb-2">{book.author}</p>
                          <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block">
                             Downloaded on {new Date().toLocaleDateString()}
                          </div>
                        </div>
                        <button 
                          onClick={() => onRead(book)}
                          className="self-center px-4 py-2 text-sm text-slate-600 font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          Read Now
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                      <Book size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Empty Digital Library</h3>
                    <p className="text-slate-500 mb-6">Download free classics with your OneLibCard.</p>
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
    </div>
  );
};
