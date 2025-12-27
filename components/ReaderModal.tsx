import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Settings, BookOpen, Type, Check } from 'lucide-react';
import { Book } from '../types';

interface ReaderModalProps {
  book: Book;
  onClose: () => void;
}

export const ReaderModal: React.FC<ReaderModalProps> = ({ book, onClose }) => {
  const [page, setPage] = useState(1);
  const [fontSize, setFontSize] = useState(18);
  const [showSettings, setShowSettings] = useState(false);
  const [readerTheme, setReaderTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');

  // Lock scroll on mount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Mock content generation
  const mockContent = `
    Chapter ${page}
    
    It was a bright and sunny morning in the heart of India. The streets were bustling with the symphony of life—auto-rickshaws honking, vendors shouting their wares, and the distant temple bells ringing.
    
    "${book.title}" is a journey into the soul of this vibrant land. 
    
    As you turn the pages of this digital edition, imagine the smell of old paper and jasmine flowers. The story of ${book.author}'s characters unfolds with every word.
    
    This is merely a preview of the digital experience provided by OneLib. In a real application, this would be the actual text of the book, rendered beautifully for your reading pleasure.
    
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
    
    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  `;

  const getThemeClasses = () => {
    switch (readerTheme) {
      case 'sepia': return 'bg-[#f4ecd8] text-[#5b4636]';
      case 'dark': return 'bg-[#1a1a1a] text-[#d1d5db]';
      default: return 'bg-white text-slate-900';
    }
  };

  const getFontClass = () => {
    return fontFamily === 'serif' ? 'font-serif' : 'font-sans';
  };

  return (
    <div className="fixed inset-0 z-[70] bg-white dark:bg-slate-900 flex flex-col animate-in fade-in duration-200">
      {/* Reader Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm relative z-20">
        <div className="flex items-center gap-3 overflow-hidden">
           <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors flex-shrink-0">
             <X size={20} className="text-slate-600 dark:text-slate-300" />
           </button>
           <div className="min-w-0">
             <h3 className="font-serif font-bold text-slate-800 dark:text-white text-sm sm:text-base line-clamp-1">{book.title}</h3>
             <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{book.author}</p>
           </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
           {/* Quick Font Size Controls (Hidden on very small screens if needed, but useful) */}
           <div className="hidden sm:flex items-center">
             <button 
               onClick={() => setFontSize(Math.max(14, fontSize - 2))}
               className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 font-serif font-bold text-xs"
             >
               A-
             </button>
             <button 
               onClick={() => setFontSize(Math.min(32, fontSize + 2))}
               className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 font-serif font-bold text-lg"
             >
               A+
             </button>
             <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>
           </div>
           
           <button 
             onClick={() => setShowSettings(!showSettings)}
             className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
           >
             <Settings size={20} />
           </button>
        </div>

        {/* Settings Dropdown */}
        {showSettings && (
          <div className="absolute top-full right-4 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 p-4 z-30 animate-in slide-in-from-top-2">
             {/* Mobile Font Size Controls */}
             <div className="sm:hidden mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Font Size</p>
                <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                   <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} className="flex-1 py-1 text-center font-bold hover:bg-white dark:hover:bg-slate-600 rounded">A-</button>
                   <span className="text-xs px-2">{fontSize}px</span>
                   <button onClick={() => setFontSize(Math.min(32, fontSize + 2))} className="flex-1 py-1 text-center font-bold hover:bg-white dark:hover:bg-slate-600 rounded">A+</button>
                </div>
             </div>

             <div className="mb-4">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Theme</p>
                <div className="flex gap-2">
                   <button 
                     onClick={() => setReaderTheme('light')}
                     className={`flex-1 h-10 rounded-lg border flex items-center justify-center ${readerTheme === 'light' ? 'border-amber-500 ring-1 ring-amber-500' : 'border-slate-200 dark:border-slate-600'}`}
                     style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                   >
                     {readerTheme === 'light' && <Check size={16} />}
                     <span className={readerTheme === 'light' ? 'sr-only' : 'text-xs'}>Light</span>
                   </button>
                   <button 
                     onClick={() => setReaderTheme('sepia')}
                     className={`flex-1 h-10 rounded-lg border flex items-center justify-center ${readerTheme === 'sepia' ? 'border-amber-500 ring-1 ring-amber-500' : 'border-[#eaddcf]'}`}
                     style={{ backgroundColor: '#f4ecd8', color: '#5b4636' }}
                   >
                     {readerTheme === 'sepia' && <Check size={16} />}
                     <span className={readerTheme === 'sepia' ? 'sr-only' : 'text-xs'}>Sepia</span>
                   </button>
                   <button 
                     onClick={() => setReaderTheme('dark')}
                     className={`flex-1 h-10 rounded-lg border flex items-center justify-center ${readerTheme === 'dark' ? 'border-amber-500 ring-1 ring-amber-500' : 'border-slate-700'}`}
                     style={{ backgroundColor: '#1a1a1a', color: '#d1d5db' }}
                   >
                     {readerTheme === 'dark' && <Check size={16} />}
                     <span className={readerTheme === 'dark' ? 'sr-only' : 'text-xs'}>Dark</span>
                   </button>
                </div>
             </div>

             <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Typeface</p>
                <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                   <button 
                     onClick={() => setFontFamily('sans')} 
                     className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${fontFamily === 'sans' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                   >
                     Sans
                   </button>
                   <button 
                     onClick={() => setFontFamily('serif')} 
                     className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all font-serif ${fontFamily === 'serif' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                   >
                     Serif
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Reader Content */}
      <div className={`flex-1 overflow-y-auto flex justify-center transition-colors duration-300 ${readerTheme === 'dark' ? 'bg-[#111]' : readerTheme === 'sepia' ? 'bg-[#f0e6d2]' : 'bg-[#f8fafc]'}`}>
         <div 
           className={`max-w-2xl w-full min-h-full p-6 sm:p-12 leading-relaxed transition-all shadow-sm ${getThemeClasses()} ${getFontClass()}`}
           style={{ fontSize: `${fontSize}px` }}
           onClick={() => setShowSettings(false)}
         >
           <div className="whitespace-pre-wrap">
             {mockContent}
           </div>
           
           <div className="mt-12 flex justify-center text-xs opacity-50">
             Page {page} of 240
           </div>
         </div>
      </div>

      {/* Reader Footer Controls */}
      <div className="px-4 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-center gap-4 sm:gap-8 items-center z-20">
         <button 
           onClick={() => setPage(Math.max(1, page - 1))}
           disabled={page === 1}
           className="p-2 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-500 disabled:text-slate-300 dark:disabled:text-slate-700 disabled:cursor-not-allowed"
         >
           <ChevronLeft size={24} />
         </button>
         
         <div className="w-32 sm:w-48 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${(page / 240) * 100}%` }}
            ></div>
         </div>

         <button 
           onClick={() => setPage(Math.min(240, page + 1))}
           disabled={page === 240}
           className="p-2 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-500 disabled:text-slate-300 dark:disabled:text-slate-700 disabled:cursor-not-allowed"
         >
           <ChevronRight size={24} />
         </button>
      </div>
    </div>
  );
};