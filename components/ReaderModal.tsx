import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Settings, BookOpen } from 'lucide-react';
import { Book } from '../types';

interface ReaderModalProps {
  book: Book;
  onClose: () => void;
}

export const ReaderModal: React.FC<ReaderModalProps> = ({ book, onClose }) => {
  const [page, setPage] = useState(1);
  const [fontSize, setFontSize] = useState(16);

  // Mock content generation
  const mockContent = `
    Chapter ${page}
    
    It was a bright and sunny morning in the heart of India. The streets were bustling with the symphony of life—auto-rickshaws honking, vendors shouting their wares, and the distant temple bells ringing.
    
    "${book.title}" is a journey into the soul of this vibrant land. 
    
    As you turn the pages of this digital edition, imagine the smell of old paper and jasmine flowers. The story of ${book.author}'s characters unfolds with every word.
    
    This is merely a preview of the digital experience provided by OneLib. In a real application, this would be the actual text of the book, rendered beautifully for your reading pleasure.
    
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
  `;

  return (
    <div className="fixed inset-0 z-[70] bg-white dark:bg-slate-900 flex flex-col animate-in fade-in duration-200">
      {/* Reader Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center gap-3">
           <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
             <X size={20} className="text-slate-600 dark:text-slate-300" />
           </button>
           <div>
             <h3 className="font-serif font-bold text-slate-800 dark:text-white text-sm sm:text-base line-clamp-1">{book.title}</h3>
             <p className="text-xs text-slate-500 dark:text-slate-400">{book.author}</p>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setFontSize(Math.max(12, fontSize - 2))}
             className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 font-serif font-bold"
           >
             A-
           </button>
           <button 
             onClick={() => setFontSize(Math.min(24, fontSize + 2))}
             className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 font-serif font-bold"
           >
             A+
           </button>
           <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>
           <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300">
             <Settings size={20} />
           </button>
        </div>
      </div>

      {/* Reader Content */}
      <div className="flex-1 overflow-y-auto bg-[#faf9f6] dark:bg-[#1a1a1a] p-4 sm:p-8 flex justify-center">
         <div 
           className="max-w-2xl w-full bg-white dark:bg-black shadow-sm border border-slate-100 dark:border-slate-800 min-h-full p-8 sm:p-12 leading-relaxed text-slate-800 dark:text-slate-300 font-serif transition-all"
           style={{ fontSize: `${fontSize}px` }}
         >
           <div className="whitespace-pre-wrap">
             {mockContent}
           </div>
           
           <div className="mt-12 flex justify-center text-xs text-slate-400 dark:text-slate-500">
             Page {page} of 240
           </div>
         </div>
      </div>

      {/* Reader Footer Controls */}
      <div className="px-4 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-center gap-8 items-center">
         <button 
           onClick={() => setPage(Math.max(1, page - 1))}
           disabled={page === 1}
           className="p-2 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-500 disabled:text-slate-300 dark:disabled:text-slate-700 disabled:cursor-not-allowed"
         >
           <ChevronLeft size={24} />
         </button>
         
         <div className="w-48 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
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