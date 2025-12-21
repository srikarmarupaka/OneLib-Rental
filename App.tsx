import React, { useState, useEffect } from 'react';
import { 
  Library, 
  Search, 
  BookOpen, 
  ShoppingBag, 
  Star, 
  MapPin, 
  Download, 
  BookMarked,
  User as UserIcon,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Heart
} from 'lucide-react';
import { ONELIB_BENEFITS, LIBRARY_PARTNERS } from './constants';
import { Book, ViewState, BookCategory, User, ToastMessage } from './types';
import { LibrarianChat } from './components/LibrarianChat';
import { MembershipCard } from './components/MembershipCard';
import { AuthModal } from './components/AuthModal';
import { UserProfile } from './components/UserProfile';
import { ToastContainer } from './components/Toast';
import { ReaderModal } from './components/ReaderModal';
import { CartView } from './components/CartView';
import { WishlistView } from './components/WishlistView';
import { Navbar } from './components/Navbar';
import { fetchBooks, searchCategorizedBooks } from './services/bookService';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<BookCategory | 'All'>('All');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [cart, setCart] = useState<Book[]>([]); 
  
  // Data State
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [page, setPage] = useState(1);

  // Search State
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{title: Book[], author: Book[], publisher: Book[]} | null>(null);

  // App States
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [readingBook, setReadingBook] = useState<Book | null>(null);
  const [legalPageTitle, setLegalPageTitle] = useState('');

  // Initial Fetch
  useEffect(() => {
    loadBooks('Indian Literature', undefined, 1);
  }, []);

  // Debounced Search Effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length >= 3) {
        performSearch(searchQuery);
      } else if (searchQuery.length === 0) {
        setSearchResults(null);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    if (view !== ViewState.BROWSE) {
        setView(ViewState.BROWSE);
    }
    const results = await searchCategorizedBooks(query);
    setSearchResults(results);
    setIsSearching(false);
  };

  const loadBooks = async (query: string, category?: string, pageNum: number = 1) => {
    setIsLoadingBooks(true);
    const results = await fetchBooks(query, category, pageNum);
    setBooks(results);
    setIsLoadingBooks(false);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const query = categoryFilter === 'All' ? 'Indian Literature' : (categoryFilter === BookCategory.FICTION ? 'Indian Fiction' : categoryFilter);
    loadBooks(query, categoryFilter !== 'All' ? categoryFilter : undefined, newPage);
  };

  // Handle Search Input Change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle Search Submit (Prevent Default, rely on Effect)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Handle Category Filter Click
  const handleCategoryClick = (cat: BookCategory | 'All') => {
    setCategoryFilter(cat);
    setSearchQuery(''); // Clear search when picking a category
    setSearchResults(null);
    setPage(1); // Reset to page 1
    
    if (cat === 'All') {
      loadBooks('Indian Literature', undefined, 1);
    } else {
      loadBooks(cat === BookCategory.FICTION ? 'Indian Fiction' : cat, cat, 1);
    }
    
    if (view !== ViewState.BROWSE) {
      setView(ViewState.BROWSE);
    }
  };

  // Toast Helper
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleLogin = (email: string, name?: string) => {
    const mockUser: User = {
      id: Date.now().toString(),
      name: name || email.split('@')[0],
      email: email,
      oneLibCardId: "4512 9821 " + Math.floor(1000 + Math.random() * 9000) + " " + Math.floor(1000 + Math.random() * 9000),
      memberSince: new Date().toISOString(),
      rentedBooks: [],
      downloadedBooks: [],
      wishlist: []
    };
    
    setUser(mockUser);
    setAuthModalOpen(false);
    addToast(`Welcome back, ${mockUser.name}!`, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    setView(ViewState.HOME);
    addToast('You have been logged out.', 'info');
  };

  // Wishlist Logic
  const handleWishlistToggle = (book: Book, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    const isInWishlist = user.wishlist.some(b => b.id === book.id);
    
    if (isInWishlist) {
      setUser({
        ...user,
        wishlist: user.wishlist.filter(b => b.id !== book.id)
      });
      addToast("Removed from wishlist", 'info');
    } else {
      setUser({
        ...user,
        wishlist: [...user.wishlist, book]
      });
      addToast("Added to wishlist", 'success');
    }
  };

  const handleAddToCart = (book: Book) => {
    if (cart.find(b => b.id === book.id)) {
      addToast(`"${book.title}" is already in your cart.`, 'info');
      return;
    }
    setCart([...cart, book]);
    addToast(`Added "${book.title}" to rental cart.`, 'success');
  };

  const handleMoveToCart = (book: Book) => {
    handleAddToCart(book);
    // Remove from wishlist after moving to cart
    if (user) {
        setUser({
            ...user,
            wishlist: user.wishlist.filter(b => b.id !== book.id)
        });
    }
  };

  const handleCheckout = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    
    if (cart.length === 0) return;

    // Filter out books already rented
    const newRentals = cart.filter(book => !user.rentedBooks.find(rb => rb.id === book.id));
    const alreadyRented = cart.filter(book => user.rentedBooks.find(rb => rb.id === book.id));

    if (newRentals.length > 0) {
      setUser({
        ...user,
        rentedBooks: [...user.rentedBooks, ...newRentals]
      });
      setCart([]);
      setView(ViewState.PROFILE);
      addToast(`Successfully rented ${newRentals.length} book(s)!`, 'success');
    } else if (alreadyRented.length > 0) {
       addToast("You have already rented these books.", 'error');
       setCart([]);
    }
  };

  const handleRemoveFromCart = (bookId: string) => {
    setCart(cart.filter(b => b.id !== bookId));
    addToast("Removed from cart.", 'info');
  };

  const handleRentBook = (book: Book) => {
    if (user?.rentedBooks.find(b => b.id === book.id)) {
      addToast("You already have this book.", 'error');
      return;
    }
    
    handleAddToCart(book);
    setView(ViewState.CART);
  };

  const handleDownloadBook = (book: Book) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (!user.downloadedBooks.find(b => b.id === book.id)) {
      const updatedUser = {
        ...user,
        downloadedBooks: [...user.downloadedBooks, book]
      };
      setUser(updatedUser);
      addToast(`"${book.title}" downloaded successfully.`, 'success');
    } else {
      addToast(`"${book.title}" is already downloaded.`, 'info');
    }
  };

  const handleRenewBook = (book: Book) => {
    addToast(`Renewed "${book.title}" for another 14 days.`, 'success');
  };

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setView(ViewState.BOOK_DETAILS);
    window.scrollTo(0, 0);
  };

  const navigateToLegal = (title: string) => {
    setLegalPageTitle(title);
    setView(ViewState.LEGAL);
    window.scrollTo(0, 0);
  }

  // --- Components defined within App ---

  const BookCard = ({ book }: { book: Book }) => {
    const inWishlist = user?.wishlist.some(b => b.id === book.id);
    return (
      <div 
        className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden cursor-pointer flex flex-col h-full"
        onClick={() => handleBookClick(book)}
      >
        <div className="relative aspect-[2/3] overflow-hidden bg-slate-200">
          <img 
            src={book.coverUrl} 
            alt={book.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          <button 
            onClick={(e) => handleWishlistToggle(book, e)}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors z-10"
          >
            <Heart 
              size={16} 
              className={inWishlist ? "fill-pink-500 text-pink-500" : "text-slate-400 hover:text-pink-500"} 
            />
          </button>

          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-slate-800 flex items-center gap-1 shadow-sm">
            <Star size={10} className="text-amber-500 fill-amber-500" /> {book.rating}
          </div>
          {book.isDigitalFree && (
            <div className="absolute bottom-0 left-0 right-0 bg-emerald-600/90 text-white text-[10px] font-bold py-1 px-3 text-center uppercase tracking-wide">
              Free Digital Copy
            </div>
          )}
        </div>
        
        <div className="p-4 flex flex-col flex-1">
          <div className="mb-2">
            <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider line-clamp-1">{book.category}</span>
            <h3 className="font-serif font-bold text-slate-800 line-clamp-1 group-hover:text-amber-700 transition-colors" title={book.title}>{book.title}</h3>
            <p className="text-sm text-slate-500 line-clamp-1">{book.author}</p>
            <p className="text-[10px] text-slate-400 line-clamp-1">{book.publisher}</p>
          </div>
          
          <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400">Rent for 14 Days</span>
              <span className="font-bold text-slate-800">₹{book.rentPrice}</span>
            </div>
            <button className="p-2 bg-slate-100 rounded-full text-slate-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <BookOpen size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const SearchResultsGrid = () => {
    if (isSearching) {
      return (
        <div className="flex justify-center items-center py-24">
          <div className="text-center">
             <Loader2 className="animate-spin text-amber-600 mx-auto mb-2" size={40} />
             <p className="text-slate-500">Searching catalog...</p>
          </div>
        </div>
      );
    }

    if (!searchResults) return null;

    const { title, author, publisher } = searchResults;
    const hasResults = title.length > 0 || author.length > 0 || publisher.length > 0;

    if (!hasResults) {
      return (
        <div className="text-center py-20 bg-slate-50 rounded-xl">
          <p className="text-slate-500 text-lg">No books found matching "{searchQuery}".</p>
        </div>
      );
    }

    const Section = ({ label, items }: { label: string, items: Book[] }) => {
        if (items.length === 0) return null;
        return (
            <div className="mb-12">
                <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-xl font-bold text-slate-800">{label}</h3>
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <span className="text-sm text-slate-500">{items.length} matches</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {items.map(book => <BookCard key={book.id} book={book} />)}
                </div>
            </div>
        )
    }

    return (
      <div className="animate-in fade-in duration-500">
        <Section label="Matches in Title" items={title} />
        <Section label="Matches in Author" items={author} />
        <Section label="Matches in Publisher" items={publisher} />
      </div>
    );
  };

  const BookGrid = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-slate-900">Trending in India</h2>
          <p className="text-slate-500 mt-2">Curated reads from our partner libraries</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
           <button 
             onClick={() => handleCategoryClick('All')}
             className={`px-4 py-1.5 rounded-full border text-sm transition-colors ${categoryFilter === 'All' ? 'bg-amber-600 text-white border-amber-600' : 'border-slate-200 text-slate-600 hover:border-amber-600 hover:text-amber-600'}`}
           >
             All
           </button>
           {Object.values(BookCategory).slice(0, 4).map(cat => (
             <button 
               key={cat} 
               onClick={() => handleCategoryClick(cat)}
               className={`px-4 py-1.5 rounded-full border text-sm transition-colors ${categoryFilter === cat ? 'bg-amber-600 text-white border-amber-600' : 'border-slate-200 text-slate-600 hover:border-amber-600 hover:text-amber-600'}`}
             >
               {cat}
             </button>
           ))}
        </div>
      </div>

      {isLoadingBooks ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="animate-spin text-amber-600" size={40} />
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-xl">
          <p className="text-slate-500 text-lg">No books found.</p>
          <button 
            onClick={() => { setSearchQuery(''); handleCategoryClick('All'); }} 
            className="mt-4 text-amber-600 font-medium hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {books.map((book) => (
               <BookCard key={book.id} book={book} />
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-12 gap-4">
             <button
               onClick={() => handlePageChange(page - 1)}
               disabled={page === 1}
               className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <ChevronLeft size={18} /> Previous
             </button>
             
             <span className="text-sm font-medium text-slate-600 px-4">
               Page {page}
             </span>

             <button
               onClick={() => handlePageChange(page + 1)}
               disabled={books.length < 24} // Basic check, ideally API returns total count
               className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Next <ChevronRight size={18} />
             </button>
          </div>
        </>
      )}
    </div>
  );

  const Hero = () => (
    <div className="relative bg-slate-900 text-white overflow-hidden">
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2690&auto=format&fit=crop" 
          alt="Library" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 space-y-8 animate-in slide-in-from-left duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Live in 12 Indian Cities
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight">
            One Card. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              Infinite Stories.
            </span>
          </h1>
          <p className="text-lg text-slate-300 max-w-xl leading-relaxed">
            Connect with 500+ local libraries across India. Rent physical books delivered to your doorstep, or download free digital classics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setView(ViewState.BROWSE)}
              className="px-8 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2"
            >
              Start Reading <ChevronRight size={18} />
            </button>
            <button 
              onClick={() => user ? setView(ViewState.PROFILE) : setAuthModalOpen(true)}
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm font-semibold rounded-lg border border-white/10 transition-all"
            >
              {user ? 'My Dashboard' : 'Get OneLibCard'}
            </button>
          </div>
        </div>
        
        <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center perspective-1000 animate-in slide-in-from-right duration-700 delay-200">
          <div className="relative">
             <div className="absolute -inset-4 bg-amber-500/20 rounded-full blur-3xl animate-pulse"></div>
             <MembershipCard 
                name={user?.name || "Member Name"} 
                cardNumber={user?.oneLibCardId || "XXXX XXXX XXXX XXXX"}
             />
             <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce duration-[3000ms]">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                  <Download size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Free Downloads</p>
                  <p className="text-sm font-bold text-slate-800">50,000+ Titles</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  const BookDetails = () => {
    if (!selectedBook) return null;

    const isRented = user?.rentedBooks.some(b => b.id === selectedBook.id);
    const isDownloaded = user?.downloadedBooks.some(b => b.id === selectedBook.id);
    const inWishlist = user?.wishlist.some(b => b.id === selectedBook.id);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-300">
        <button 
          onClick={() => setView(ViewState.BROWSE)}
          className="mb-6 flex items-center text-slate-500 hover:text-amber-600 transition-colors"
        >
          <ChevronRight className="rotate-180" size={20} /> Back to Browse
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <div className="grid md:grid-cols-2">
            <div className="relative bg-slate-100 p-8 flex items-center justify-center">
               <img 
                src={selectedBook.coverUrl} 
                alt={selectedBook.title}
                className="w-64 shadow-2xl rounded-lg transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500"
               />
            </div>
            
            <div className="p-8 md:p-12 flex flex-col">
              <div className="mb-6">
                 <div className="flex items-center gap-2 mb-2">
                   <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wide">{selectedBook.category}</span>
                   {selectedBook.isDigitalFree && (
                     <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                       <Download size={12} /> Digital Free
                     </span>
                   )}
                 </div>
                 <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-2">{selectedBook.title}</h1>
                 <p className="text-xl text-slate-600 font-medium">{selectedBook.author}</p>
                 <p className="text-sm text-slate-500 mt-1">Publisher: {selectedBook.publisher}</p>
              </div>

              <div className="flex items-center gap-4 mb-8">
                 <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={18} className={i < Math.floor(selectedBook.rating) ? "fill-current" : "text-slate-300"} />
                    ))}
                 </div>
                 <span className="text-sm text-slate-400">|</span>
                 <span className="text-sm text-slate-500">Available at {selectedBook.libraryPartner}</span>
              </div>

              <div className="prose prose-slate mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                <p className="text-slate-600 leading-relaxed">
                  {selectedBook.description}
                </p>
              </div>

              <div className="mt-auto space-y-4">
                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                       <span className="font-semibold text-slate-700">Physical Rental</span>
                       <span className="font-bold text-2xl text-slate-900">₹{selectedBook.rentPrice}<span className="text-sm text-slate-400 font-normal">/14 days</span></span>
                    </div>
                    <div className="flex gap-2">
                        {isRented ? (
                          <button 
                            disabled
                            className="flex-1 py-3 bg-slate-200 text-slate-600 font-bold rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                          >
                             Already Rented
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleRentBook(selectedBook)}
                            className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-2"
                          >
                            <BookMarked size={20} /> Rent Physical Book
                          </button>
                        )}
                        <button 
                            onClick={() => handleWishlistToggle(selectedBook)}
                            className={`px-4 py-3 rounded-lg border font-bold transition-all flex items-center justify-center ${inWishlist ? 'bg-pink-50 border-pink-200 text-pink-600' : 'bg-white border-slate-200 text-slate-600 hover:border-pink-200 hover:text-pink-600'}`}
                            title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                        >
                            <Heart size={20} className={inWishlist ? "fill-pink-600" : ""} />
                        </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 text-center">Delivered within 2 days in metro cities.</p>
                 </div>

                 {selectedBook.isDigitalFree && (
                   isDownloaded ? (
                    <button 
                      onClick={() => setReadingBook(selectedBook)}
                      className="w-full py-3 bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 flex items-center justify-center gap-2 hover:bg-emerald-200 transition-colors"
                    >
                       <BookOpen size={20} /> Read Now
                    </button>
                   ) : (
                    <button 
                      onClick={() => handleDownloadBook(selectedBook)}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Download size={20} /> Download eBook (Free with Card)
                    </button>
                   )
                 )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const MembershipSection = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 mb-4">The OneLibCard</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Unlock the doors to knowledge across the nation. One card for physical access to libraries and unlimited digital learning.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center">
         <div className="flex justify-center">
            <div className="transform scale-125">
               <MembershipCard 
                  name={user?.name}
                  cardNumber={user?.oneLibCardId}
               />
            </div>
         </div>
         
         <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-800">Why go for OneLib?</h3>
            <ul className="space-y-4">
              {ONELIB_BENEFITS.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-1 min-w-[20px] h-5 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                     <span className="text-xs font-bold">✓</span>
                  </div>
                  <span className="text-slate-700">{benefit}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={() => user ? setView(ViewState.PROFILE) : setAuthModalOpen(true)}
              className="mt-6 px-8 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
            >
              {user ? 'View My Membership' : 'Apply for Membership (₹499/year)'}
            </button>
         </div>
      </div>

      {/* Partners Section */}
      <div className="mt-24">
        <h3 className="text-2xl font-bold text-slate-800 mb-8 text-center">Our Premier Library Partners</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LIBRARY_PARTNERS.map(lib => (
            <div key={lib.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
               <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
                 <Library size={20} />
               </div>
               <h4 className="font-bold text-slate-800 mb-1">{lib.name}</h4>
               <p className="text-sm text-slate-500 flex items-center gap-1">
                 <MapPin size={12} /> {lib.location}, {lib.city}
               </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const LegalPage = () => (
    <div className="max-w-4xl mx-auto px-4 py-16 min-h-[60vh]">
      <h1 className="text-4xl font-serif font-bold text-slate-900 mb-8">{legalPageTitle}</h1>
      <div className="prose prose-slate max-w-none">
        <p>Last Updated: {new Date().toLocaleDateString()}</p>
        <p>This is a placeholder for the {legalPageTitle} of OneLib India. In a production environment, this page would contain the full legal text compliant with Indian laws.</p>
        <h3>1. Introduction</h3>
        <p>Welcome to OneLib. By accessing our website, you agree to these terms.</p>
        <h3>2. Membership</h3>
        <p>Membership is non-transferable. You are responsible for all books rented under your card.</p>
        <h3>3. Returns and Late Fees</h3>
        <p>Books must be returned within 14 days. Late fees apply as per library rules.</p>
      </div>
      <button onClick={() => setView(ViewState.HOME)} className="mt-8 text-amber-600 font-medium hover:underline">
        &larr; Back to Home
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-amber-100 selection:text-amber-900">
      <Navbar 
        view={view}
        setView={setView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearchSubmit={handleSearchSubmit}
        handleSearchChange={handleSearchChange}
        user={user}
        cartCount={cart.length}
        setAuthModalOpen={setAuthModalOpen}
        isMobileMenuOpen={isMobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <main>
        {view === ViewState.HOME && (
          <>
            <Hero />
            <BookGrid />
            <MembershipSection />
          </>
        )}
        
        {view === ViewState.BROWSE && (
          <div className="pt-8">
             <div className="max-w-7xl mx-auto px-4 mb-4">
               <h1 className="text-3xl font-serif font-bold text-slate-900">
                  {searchQuery.length >= 3 
                    ? `Search Results: "${searchQuery}"` 
                    : 'Browse Catalog'}
               </h1>
             </div>
             {/* Conditionally render Search Results or Default Catalog */}
             {searchQuery.length >= 3 ? <SearchResultsGrid /> : <BookGrid />}
          </div>
        )}

        {view === ViewState.MEMBERSHIP && <MembershipSection />}
        
        {view === ViewState.BOOK_DETAILS && <BookDetails />}

        {view === ViewState.CART && (
          <CartView 
            cart={cart}
            onRemove={handleRemoveFromCart}
            onCheckout={handleCheckout}
            onBrowse={() => setView(ViewState.BROWSE)}
          />
        )}

        {view === ViewState.WISHLIST && user && (
            <WishlistView 
                wishlist={user.wishlist}
                onRemove={(book) => handleWishlistToggle(book)}
                onMoveToCart={handleMoveToCart}
                onBrowse={() => setView(ViewState.BROWSE)}
            />
        )}
        
        {/* If user clicks wishlist but isn't logged in, redirect home/browse logic or rely on auth modal in toggle */}
        {view === ViewState.WISHLIST && !user && (
            <div className="text-center py-20">
                <h2 className="text-xl font-bold mb-4">Please sign in to view your wishlist</h2>
                <button 
                  onClick={() => setAuthModalOpen(true)}
                  className="px-6 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800"
                >
                    Sign In
                </button>
            </div>
        )}

        {view === ViewState.PROFILE && user && (
          <UserProfile 
            user={user} 
            onLogout={handleLogout} 
            onBrowse={() => setView(ViewState.BROWSE)}
            onRenew={handleRenewBook}
            onRead={(book) => setReadingBook(book)}
          />
        )}

        {view === ViewState.LEGAL && <LegalPage />}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
               <Library className="text-amber-500" size={24} />
               <span className="font-serif font-bold text-white text-xl">OneLib India</span>
            </div>
            <p className="text-sm">Democratizing access to books across the sub-continent through technology and partnership.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => setView(ViewState.BROWSE)} className="hover:text-white transition-colors">Browse Books</button></li>
              <li><button onClick={() => setView(ViewState.HOME)} className="hover:text-white transition-colors">Libraries</button></li>
              <li><button onClick={() => setView(ViewState.MEMBERSHIP)} className="hover:text-white transition-colors">OneLibCard</button></li>
              <li><button onClick={() => navigateToLegal('Pricing')} className="hover:text-white transition-colors">Pricing</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigateToLegal('Help Center')} className="hover:text-white transition-colors">Help Center</button></li>
              <li><button onClick={() => addToast('Click the chat icon to talk to Veda.', 'info')} className="hover:text-white transition-colors">Librarian Chat</button></li>
              <li><button onClick={() => navigateToLegal('Terms of Service')} className="hover:text-white transition-colors">Terms of Service</button></li>
              <li><button onClick={() => navigateToLegal('Privacy Policy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Contact</h4>
            <p className="text-sm mb-2">support@onelib.in</p>
            <p className="text-sm">Mumbai, Maharashtra, India</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-xs">
          © 2024 OneLib India. All rights reserved.
        </div>
      </footer>

      <LibrarianChat />
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
      />

      {readingBook && (
        <ReaderModal 
          book={readingBook} 
          onClose={() => setReadingBook(null)} 
        />
      )}
    </div>
  );
};

export default App;