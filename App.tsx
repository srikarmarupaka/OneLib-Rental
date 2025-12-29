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
  Heart,
  ArrowUpDown,
  Volume2,
  ExternalLink,
  MessageCircle,
  Trash2,
  PenTool,
  Send,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { ONELIB_BENEFITS, LIBRARY_PARTNERS } from './constants';
import { Book, ViewState, BookCategory, User, ToastMessage, UserRole, Rental, Availability, Notification, LibraryPartner, Review, RentalStatus } from './types';
import { LibrarianChat } from './components/LibrarianChat';
import { MembershipCard } from './components/MembershipCard';
import { AuthModal } from './components/AuthModal';
import { UserProfile } from './components/UserProfile';
import { ToastContainer } from './components/Toast';
import { ReaderModal } from './components/ReaderModal';
import { AudioPlayerModal } from './components/AudioPlayerModal';
import { CartView } from './components/CartView';
import { WishlistView } from './components/WishlistView';
import { Navbar } from './components/Navbar';
import { LibrarianDashboard } from './components/LibrarianDashboard';
import { DonateView } from './components/DonateView';
import { SettingsModal } from './components/SettingsModal';
import { fetchBooks, searchCategorizedBooks } from './services/bookService';
import { mockLibrarianLogin } from './services/firebase';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<BookCategory | 'All'>('All');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [cart, setCart] = useState<Book[]>([]); 
  
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    }
    return 'system';
  });

  // Data State
  const [books, setBooks] = useState<Book[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [libraries, setLibraries] = useState<LibraryPartner[]>(LIBRARY_PARTNERS); // Manage dynamic libraries
  const [reviews, setReviews] = useState<Review[]>([
      { id: '1', bookId: 'mock1', userId: 'u_demo', userName: 'Anjali R.', rating: 5, comment: 'A masterpiece of Indian literature.', date: new Date().toISOString() },
      { id: '2', bookId: 'mock1', userId: 'u_demo2', userName: 'Rajesh K.', rating: 4, comment: 'Great read, but the pacing is slow.', date: new Date(Date.now() - 86400000).toISOString() }
  ]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [page, setPage] = useState(1);
  const [sortOption, setSortOption] = useState<'relevance' | 'price_low' | 'price_high' | 'rating'>('relevance');

  // Search State
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{title: Book[], author: Book[], publisher: Book[]} | null>(null);

  // App States
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readingBook, setReadingBook] = useState<Book | null>(null);
  const [playingBook, setPlayingBook] = useState<Book | null>(null); // State for Audio Player
  const [legalPageTitle, setLegalPageTitle] = useState('');

  // Apply Theme
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      const isDark = 
        theme === 'dark' || 
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();
    localStorage.setItem('theme', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

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
    // Only switch to browse if user is NOT a librarian
    if (view !== ViewState.BROWSE && user?.role !== 'librarian') {
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

  // Notification Helper
  const addNotification = (userId: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => {
     const newNotif: Notification = {
         id: Date.now().toString() + Math.random(),
         userId,
         message,
         type,
         isRead: false,
         timestamp: new Date().toISOString()
     };
     setNotifications(prev => [newNotif, ...prev]);
  };

  const handleMarkNotificationRead = (id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleLogin = async (email: string, role: UserRole, name?: string, libraryDetails?: { name: string, city: string }) => {
    if (role === 'librarian') {
        let librarianUser: any;
        
        if (libraryDetails) {
            // New Librarian Registration
            const newLibrary: LibraryPartner = {
                id: 'lib_' + Date.now(),
                name: libraryDetails.name,
                location: 'Main Branch',
                city: libraryDetails.city
            };
            
            // Add to libraries list
            setLibraries(prev => [...prev, newLibrary]);

            librarianUser = {
                id: 'lib_' + email.split('@')[0],
                email,
                role: 'librarian',
                name: name || 'Admin',
                employeeId: 'ADMIN-' + Math.floor(Math.random()*1000),
                managedLibrary: newLibrary,
                memberSince: new Date().toISOString(),
                rentedBooks: [],
                downloadedBooks: [],
                wishlist: []
            };
            addToast(`Library "${libraryDetails.name}" Registered Successfully!`, 'success');
        } else {
            // Mock Existing Login
            librarianUser = await mockLibrarianLogin(email);
            // Assign default managed library if missing in mock
            if (!librarianUser.managedLibrary) {
                librarianUser.managedLibrary = libraries[0];
            }
            addToast(`Staff Login Successful: ${email}`, 'success');
        }

        setUser(librarianUser as User);
        setView(ViewState.LIBRARIAN_DASHBOARD);
        
    } else {
        const mockUser: User = {
            id: 'u_' + email.split('@')[0], // Simple ID generation
            name: name || email.split('@')[0],
            email: email,
            role: 'member',
            oneLibCardId: "4512 9821 " + Math.floor(1000 + Math.random() * 9000) + " " + Math.floor(1000 + Math.random() * 9000),
            memberSince: new Date().toISOString(),
            rentedBooks: [],
            downloadedBooks: [],
            wishlist: [],
            notifications: [],
            oneLibPoints: 0
        };
        setUser(mockUser);
        addToast(`Welcome back, ${mockUser.name}!`, 'success');
    }
    setAuthModalOpen(false);
  };

  const handleUpdateProfile = async (name: string, currentPass: string, newPass: string) => {
    // Basic Security Check Simulation
    if (!user) return;
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            // In a real app, verify currentPass with backend
            setUser(prev => prev ? ({ ...prev, name: name }) : null);
            addToast("Profile updated successfully.", 'success');
            resolve();
        }, 1500);
    });
  };

  const handleLogout = () => {
    setUser(null);
    setView(ViewState.HOME);
    setCart([]);
    addToast('You have been logged out.', 'info');
  };

  // --- REVIEW CRUD OPERATIONS ---

  const handleAddReview = (bookId: string, rating: number, comment: string) => {
      if (!user) {
          setAuthModalOpen(true);
          return;
      }
      if (!comment.trim()) {
          addToast("Comment cannot be empty.", 'error');
          return;
      }
      
      const newReview: Review = {
          id: 'rev_' + Date.now(),
          bookId,
          userId: user.id,
          userName: user.name,
          rating,
          comment,
          date: new Date().toISOString()
      };

      setReviews(prev => [newReview, ...prev]);
      addToast("Review published successfully!", 'success');
  };

  const handleDeleteReview = (reviewId: string) => {
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      addToast("Review deleted.", 'info');
  };

  // --- LIBRARIAN ACTIONS ---

  const handleAddBooks = (newBooks: Book[]) => {
      // Role Check
      if (user?.role !== 'librarian') {
          addToast("Unauthorized action.", 'error');
          return;
      }
      setBooks(prev => [...newBooks, ...prev]);
      addToast(`${newBooks.length} book(s) added to inventory.`, 'success');
  };

  const handleDeleteBook = (bookId: string) => {
      if (user?.role !== 'librarian') return;
      setBooks(prev => prev.filter(b => b.id !== bookId));
      addToast("Book removed from inventory.", 'info');
  };

  const handleUpdateBook = (updatedBook: Book) => {
      if (user?.role !== 'librarian') return;
      setBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
      addToast("Book details updated successfully.", 'success');
  };

  // Replaces handleIssueBook with a broader function, but keeping alias for initial approval
  const handleIssueBook = (rentalId: string) => {
      handleUpdateStatus(rentalId, 'approved');
  };

  const handleUpdateStatus = (rentalId: string, status: string) => {
      const rental = rentals.find(r => r.id === rentalId);
      if (!rental) return;

      let notifMsg = '';
      let toastMsg = '';
      const now = new Date().toISOString();
      const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 14);

      setRentals(prev => prev.map(r => {
          if (r.id === rentalId) {
             const updated = { ...r, status: status as RentalStatus };
             
             // Add event to history
             let eventDesc = `Status updated to ${status}`;
             if (status === 'approved') {
                 updated.issueDate = now;
                 updated.dueDate = nextWeek.toISOString();
                 updated.holdExpiresAt = undefined;
                 eventDesc = "Order Approved by Librarian";
                 notifMsg = `Your rental for "${r.bookTitle}" is approved!`;
             } else if (status === 'dispatched') {
                 eventDesc = "Book Dispatched from Library via Courier";
                 notifMsg = `Great news! "${r.bookTitle}" is on its way.`;
             } else if (status === 'delivered') {
                 eventDesc = "Delivered to Member's Address";
                 notifMsg = `"${r.bookTitle}" has been delivered. Happy reading!`;
             } else if (status === 'return_scheduled') {
                 eventDesc = "Return Pickup Scheduled";
                 notifMsg = `Pickup scheduled for "${r.bookTitle}". Please keep the book ready.`;
             } else if (status === 'returned') {
                 updated.returnDate = now;
                 eventDesc = "Returned to Library Inventory";
                 notifMsg = `We received "${r.bookTitle}". Thank you for returning it on time.`;
             }

             updated.trackingHistory = [
                 ...r.trackingHistory, 
                 { status: status as RentalStatus, timestamp: now, location: 'System Update', description: eventDesc }
             ];
             return updated;
          }
          return r;
      }));

      // Handle Inventory Logic for Returns
      if (status === 'returned' || status === 'rejected' || status === 'cancelled') {
           setBooks(prev => prev.map(b => {
                if (b.id === rental.bookId) {
                    const newAvailable = Math.min(b.availableCopies + 1, b.totalCopies);
                    return { ...b, availableCopies: newAvailable, availability: newAvailable > 0 ? Availability.AVAILABLE : Availability.RENTED };
                }
                return b;
           }));
      }

      if (notifMsg) addNotification(rental.userId, notifMsg, 'info');
      addToast(`Status updated to ${status}`, 'success');
  };

  const handleRejectRental = (rentalId: string) => {
      if (user?.role !== 'librarian') return;
      handleUpdateStatus(rentalId, 'rejected');
      addToast("Rental request rejected.", 'info');
  };

  // --- USER TRACKING ACTIONS ---

  const handleRequestReturn = (rentalId: string) => {
      const rental = rentals.find(r => r.id === rentalId);
      if (!rental) return;
      
      setRentals(prev => prev.map(r => {
          if (r.id === rentalId) {
              const now = new Date().toISOString();
              return {
                  ...r,
                  status: 'return_requested',
                  trackingHistory: [...r.trackingHistory, {
                      status: 'return_requested',
                      timestamp: now,
                      location: 'User Dashboard',
                      description: 'Return requested by member'
                  }]
              }
          }
          return r;
      }));
      
      addToast("Return request sent. A librarian will schedule pickup shortly.", 'success');
  };

  // Cron Job Simulation to check for expired holds
  const handleCheckHolds = () => {
      const now = new Date();
      let expiredCount = 0;

      const updatedRentals = rentals.map(r => {
          if (r.status === 'pending' && r.holdExpiresAt && new Date(r.holdExpiresAt) < now) {
              expiredCount++;
              return { ...r, status: 'cancelled' as const };
          }
          return r;
      });

      if (expiredCount > 0) {
          // Identify which books to restore
          const cancelledRentals = rentals.filter(r => r.status === 'pending' && r.holdExpiresAt && new Date(r.holdExpiresAt) < now);
          
          setRentals(updatedRentals);

          // Restore inventory for cancelled holds
          setBooks(prev => {
              const newBooks = [...prev];
              cancelledRentals.forEach(r => {
                  const bookIdx = newBooks.findIndex(b => b.id === r.bookId);
                  if (bookIdx !== -1) {
                      newBooks[bookIdx].availableCopies = Math.min(newBooks[bookIdx].availableCopies + 1, newBooks[bookIdx].totalCopies);
                      if (newBooks[bookIdx].availableCopies > 0) {
                          newBooks[bookIdx].availability = Availability.AVAILABLE;
                      }
                  }
              });
              return newBooks;
          });

          addToast(`${expiredCount} expired hold(s) cancelled and inventory released.`, 'info');
      } else {
          addToast("No expired holds found.", 'info');
      }
  };

  // --- USER ACTIONS ---

  const handleWishlistToggle = (book: Book, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) { setAuthModalOpen(true); return; }

    const isInWishlist = user.wishlist.some(b => b.id === book.id);
    if (isInWishlist) {
      setUser({ ...user, wishlist: user.wishlist.filter(b => b.id !== book.id) });
      addToast("Removed from wishlist", 'info');
    } else {
      setUser({ ...user, wishlist: [...user.wishlist, book] });
      addToast("Added to wishlist", 'success');
    }
  };

  const handleAddToCart = (book: Book) => {
    if (cart.find(b => b.id === book.id)) {
      addToast(`"${book.title}" is already in your cart.`, 'info');
      return;
    }
    // Check real-time stock (simple local check for demo)
    if (book.availableCopies <= 0) {
        addToast("Sorry, this book is currently out of stock.", 'error');
        return;
    }
    setCart([...cart, book]);
    addToast(`Added "${book.title}" to rental cart.`, 'success');
  };

  const handleMoveToCart = (book: Book) => {
    handleAddToCart(book);
    if (user) {
        setUser({ ...user, wishlist: user.wishlist.filter(b => b.id !== book.id) });
    }
  };

  const handleCheckout = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    
    if (cart.length === 0) return;

    // Filter out books already requested by this user to prevent duplicates
    const existingRentalBookIds = rentals
        .filter(r => r.userId === user.id && (r.status === 'pending' || r.status === 'approved' || r.status === 'dispatched' || r.status === 'delivered'))
        .map(r => r.bookId);

    const booksToRent = cart.filter(book => !existingRentalBookIds.includes(book.id));

    if (booksToRent.length === 0) {
       addToast("You have already requested these books.", 'error');
       setCart([]);
       return;
    }

    // Double check stock before finalizing
    const outOfStock = booksToRent.filter(b => {
        const liveBook = books.find(lb => lb.id === b.id);
        return !liveBook || liveBook.availableCopies <= 0;
    });

    if (outOfStock.length > 0) {
        addToast(`Some items are out of stock: ${outOfStock.map(b => b.title).join(', ')}`, 'error');
        return;
    }

    // Points Logic
    const subtotal = booksToRent.reduce((sum, book) => sum + book.rentPrice, 0);
    const tax = Math.round(subtotal * 0.05);
    const grossTotal = subtotal + tax;
    const availablePoints = user.oneLibPoints;
    const pointsToUse = Math.min(availablePoints, grossTotal);
    const remainingPoints = availablePoints - pointsToUse;

    // 2 Days Hold Calculation
    const holdDuration = 2 * 24 * 60 * 60 * 1000;
    const holdExpiresAt = new Date(Date.now() + holdDuration).toISOString();
    const now = new Date().toISOString();

    const newRentals: Rental[] = booksToRent.map(book => ({
            id: 'ord_' + Date.now() + Math.random().toString(36).substr(2, 5),
            bookId: book.id,
            bookTitle: book.title,
            bookCover: book.coverUrl,
            userId: user.id,
            userName: user.name,
            requestDate: now,
            holdExpiresAt: holdExpiresAt,
            status: 'pending',
            trackingHistory: [
                { status: 'pending', timestamp: now, location: 'Web', description: 'Order placed by member' }
            ]
    }));

    if (newRentals.length > 0) {
      setRentals(prev => [...prev, ...newRentals]);
      
      // Update Inventory (Decrement Available Copies)
      setBooks(prev => prev.map(b => {
          if (newRentals.some(r => r.bookId === b.id)) {
              const newAvailable = Math.max(0, b.availableCopies - 1);
              return { ...b, availableCopies: newAvailable, availability: newAvailable > 0 ? Availability.AVAILABLE : Availability.RENTED };
          }
          return b;
      }));

      setCart([]);
      
      // Update User Points
      setUser({ ...user, oneLibPoints: remainingPoints });

      setView(ViewState.PROFILE);
      addNotification(user.id, `Order placed! Your books are on hold for 2 days. Please visit the library or wait for delivery.`, 'info');
      addToast(`Order placed! Books reserved for 48 hours.`, 'success');
    }
  };

  const handleDonate = (type: 'book' | 'money', value: number) => {
     if (!user) {
         setAuthModalOpen(true);
         return;
     }

     // Calculate points earned
     const pointsEarned = type === 'book' ? value * 50 : Math.floor(value / 10);
     
     // Update user points
     setUser(prev => prev ? ({ ...prev, oneLibPoints: prev.oneLibPoints + pointsEarned }) : null);

     addNotification(user.id, `Thank you for your donation! You earned ${pointsEarned} OneLib Points.`, 'success');
     addToast(`Donation successful! Earned ${pointsEarned} Points.`, 'success');
  };

  const handleRemoveFromCart = (bookId: string) => {
    setCart(cart.filter(b => b.id !== bookId));
    addToast("Removed from cart.", 'info');
  };

  const handleRentBook = (book: Book) => {
    if (book.availableCopies <= 0) {
        addToast("This book is currently out of stock.", 'error');
        return;
    }

    const isAlreadyRequested = rentals.some(r => r.bookId === book.id && r.userId === user?.id && r.status !== 'returned' && r.status !== 'cancelled' && r.status !== 'rejected');
    
    if (isAlreadyRequested) {
      addToast("You have already requested or rented this book.", 'error');
      return;
    }
    
    handleAddToCart(book);
    setView(ViewState.CART);
  };

  const handleDownloadBook = (book: Book) => {
    if (!user) { setAuthModalOpen(true); return; }

    if (!user.downloadedBooks.find(b => b.id === book.id)) {
      const updatedUser = { ...user, downloadedBooks: [...user.downloadedBooks, book] };
      setUser(updatedUser);
      addToast(`"${book.title}" downloaded successfully.`, 'success');
    } else {
      addToast(`"${book.title}" is already downloaded.`, 'info');
    }
  };

  const handleRenewBook = (bookId: string) => {
    setRentals(prev => prev.map(r => {
        if (r.bookId === bookId && r.userId === user?.id && r.status === 'delivered') {
            const newDue = new Date(r.dueDate || Date.now());
            newDue.setDate(newDue.getDate() + 14);
            return { ...r, dueDate: newDue.toISOString() };
        }
        return r;
    }));
    addToast(`Renewed rental for another 14 days.`, 'success');
  };

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setView(ViewState.BOOK_DETAILS);
    window.scrollTo(0, 0);
  };

  const handleAuthorClick = (authorName: string) => {
      setSelectedAuthor(authorName);
      setView(ViewState.AUTHOR_DETAILS);
      window.scrollTo(0, 0);
  };

  const navigateToLegal = (title: string) => {
    setLegalPageTitle(title);
    setView(ViewState.LEGAL);
    window.scrollTo(0, 0);
  }

  // Sorting Logic
  const getSortedBooks = () => {
      let sorted = [...books];
      switch (sortOption) {
          case 'price_low':
              return sorted.sort((a, b) => a.rentPrice - b.rentPrice);
          case 'price_high':
              return sorted.sort((a, b) => b.rentPrice - a.rentPrice);
          case 'rating':
              return sorted.sort((a, b) => b.rating - a.rating);
          default:
              return sorted;
      }
  };

  const displayedBooks = getSortedBooks();

  // --- Components defined within App ---

  const BookCard: React.FC<{ book: Book }> = ({ book }) => {
    const inWishlist = user?.wishlist.some(b => b.id === book.id);
    const isOutOfStock = book.availableCopies === 0;

    return (
      <div 
        className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 overflow-hidden cursor-pointer flex flex-col h-full"
        onClick={() => handleBookClick(book)}
      >
        <div className="relative aspect-[2/3] overflow-hidden bg-slate-200 dark:bg-slate-700">
          <img 
            src={book.coverUrl} 
            alt={book.title} 
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${isOutOfStock ? 'grayscale opacity-70' : ''}`}
          />
          
          <button 
            onClick={(e) => handleWishlistToggle(book, e)}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 transition-colors z-10"
          >
            <Heart 
              size={16} 
              className={inWishlist ? "fill-pink-500 text-pink-500" : "text-slate-400 dark:text-slate-300 hover:text-pink-500"} 
            />
          </button>

          <div className="absolute top-2 left-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 shadow-sm">
            <Star size={10} className="text-amber-500 fill-amber-500" /> {book.rating}
          </div>
          
          {book.hasAudio && (
             <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-md text-white text-[10px] font-bold uppercase flex items-center gap-1">
                <Volume2 size={10} /> Audio
             </div>
          )}

          {isOutOfStock ? (
             <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40">
                 <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase rounded transform -rotate-12 shadow-lg">Out of Stock</span>
             </div>
          ) : (
             book.isDigitalFree && (
                <div className="absolute bottom-0 left-0 right-0 bg-emerald-600/90 text-white text-[10px] font-bold py-1 px-3 text-center uppercase tracking-wide">
                  Free Digital Copy
                </div>
             )
          )}
        </div>
        
        <div className="p-4 flex flex-col flex-1">
          <div className="mb-2">
            <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider line-clamp-1">{book.category}</span>
            <h3 className="font-serif font-bold text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors" title={book.title}>{book.title}</h3>
            <button 
                onClick={(e) => { e.stopPropagation(); handleAuthorClick(book.author); }}
                className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 hover:text-amber-600 dark:hover:text-amber-400 hover:underline text-left"
            >
                {book.author}
            </button>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1">{book.publisher}</p>
          </div>
          
          <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 dark:text-slate-500">{isOutOfStock ? 'Waitlist Only' : 'Rent for 14 Days'}</span>
              <span className="font-bold text-slate-800 dark:text-white">₹{book.rentPrice}</span>
            </div>
            <button 
                disabled={isOutOfStock}
                className={`p-2 rounded-full transition-colors ${isOutOfStock ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-amber-600 dark:group-hover:bg-amber-500 group-hover:text-white'}`}
            >
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
             <p className="text-slate-500 dark:text-slate-400">Searching catalog...</p>
          </div>
        </div>
      );
    }

    if (!searchResults) return null;

    const { title, author, publisher } = searchResults;
    const hasResults = title.length > 0 || author.length > 0 || publisher.length > 0;

    if (!hasResults) {
      return (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-lg">No books found matching "{searchQuery}".</p>
        </div>
      );
    }

    const Section = ({ label, items }: { label: string, items: Book[] }) => {
        if (items.length === 0) return null;
        return (
            <div className="mb-12">
                <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">{label}</h3>
                    <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{items.length} matches</span>
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
          <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">Trending in India</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Curated reads from our partner libraries</p>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
           {/* Sorting Dropdown */}
           <div className="relative group mr-4">
              <button className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:border-amber-600 dark:hover:border-amber-500 hover:text-amber-600 dark:hover:border-amber-500 transition-colors">
                  <ArrowUpDown size={14} /> 
                  Sort: {sortOption === 'relevance' ? 'Relevance' : sortOption === 'price_low' ? 'Price: Low to High' : sortOption === 'price_high' ? 'Price: High to Low' : 'Top Rated'}
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 hidden group-hover:block z-10 p-1">
                  <button onClick={() => setSortOption('relevance')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md">Relevance</button>
                  <button onClick={() => setSortOption('price_low')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md">Price: Low to High</button>
                  <button onClick={() => setSortOption('price_high')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md">Price: High to Low</button>
                  <button onClick={() => setSortOption('rating')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md">Top Rated</button>
              </div>
           </div>

           <button 
             onClick={() => handleCategoryClick('All')}
             className={`px-4 py-1.5 rounded-full border text-sm transition-colors ${categoryFilter === 'All' ? 'bg-amber-600 text-white border-amber-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-600 hover:text-amber-600'}`}
           >
             All
           </button>
           {Object.values(BookCategory).slice(0, 4).map(cat => (
             <button 
               key={cat} 
               onClick={() => handleCategoryClick(cat)}
               className={`px-4 py-1.5 rounded-full border text-sm transition-colors ${categoryFilter === cat ? 'bg-amber-600 text-white border-amber-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-600 hover:text-amber-600'}`}
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
      ) : displayedBooks.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-lg">No books found.</p>
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
            {displayedBooks.map((book) => (
               <BookCard key={book.id} book={book} />
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-12 gap-4">
             <button
               onClick={() => handlePageChange(page - 1)}
               disabled={page === 1}
               className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <ChevronLeft size={18} /> Previous
             </button>
             
             <span className="text-sm font-medium text-slate-600 dark:text-slate-400 px-4">
               Page {page}
             </span>

             <button
               onClick={() => handlePageChange(page + 1)}
               disabled={books.length < 24} // Basic check, ideally API returns total count
               className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Next <ChevronRight size={18} />
             </button>
          </div>
        </>
      )}
    </div>
  );

  const Hero = () => (
    <div className="relative bg-slate-900 dark:bg-slate-950 text-white overflow-hidden">
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2690&auto=format&fit=crop" 
          alt="Library" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent dark:from-slate-950 dark:via-slate-950/60"></div>
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
             <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce duration-[3000ms] border border-slate-100 dark:border-slate-700">
                <div className="p-2 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-lg">
                  <Download size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Free Downloads</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">50,000+ Titles</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AuthorDetails = () => {
      if (!selectedAuthor) return null;
      const authorBooks = books.filter(b => b.author === selectedAuthor);

      return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-300">
              <button 
                onClick={() => setView(ViewState.BROWSE)}
                className="mb-6 flex items-center text-slate-500 dark:text-slate-400 hover:text-amber-600 transition-colors"
              >
                <ChevronRight className="rotate-180" size={20} /> Back to Browse
              </button>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 mb-12">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                      <div className="w-32 h-32 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-4xl font-serif font-bold text-slate-400 dark:text-slate-500">
                          {selectedAuthor.charAt(0)}
                      </div>
                      <div>
                          <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white mb-2">{selectedAuthor}</h1>
                          <div className="flex items-center gap-2 mb-4">
                              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase rounded-full">Author</span>
                              <span className="text-slate-500 dark:text-slate-400 text-sm">• {authorBooks.length} Books Available</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                              {selectedAuthor} is a celebrated author in our collection. Their works explore deep themes and have captivated readers across India. 
                              (This is a generated placeholder bio for the author).
                          </p>
                      </div>
                  </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Books by {selectedAuthor}</h2>
              {authorBooks.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {authorBooks.map(book => <BookCard key={book.id} book={book} />)}
                  </div>
              ) : (
                  <p className="text-slate-500 dark:text-slate-400">No books found in our current catalog.</p>
              )}
          </div>
      );
  };

  const BookDetails = () => {
    if (!selectedBook) return null;

    const isRented = rentals.some(r => r.bookId === selectedBook.id && r.userId === user?.id && r.status !== 'returned' && r.status !== 'cancelled' && r.status !== 'rejected');
    const isDownloaded = user?.downloadedBooks.some(b => b.id === selectedBook.id);
    const inWishlist = user?.wishlist.some(b => b.id === selectedBook.id);
    const isOutOfStock = selectedBook.availableCopies === 0;
    
    // Filter reviews
    const bookReviews = reviews.filter(r => r.bookId === selectedBook.id);
    
    // Review Form State
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-300">
        <button 
          onClick={() => setView(ViewState.BROWSE)}
          className="mb-6 flex items-center text-slate-500 dark:text-slate-400 hover:text-amber-600 transition-colors"
        >
          <ChevronRight className="rotate-180" size={20} /> Back to Browse
        </button>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700 mb-8">
          <div className="grid md:grid-cols-2">
            <div className="relative bg-slate-100 dark:bg-slate-900 p-8 flex items-center justify-center">
               <img 
                src={selectedBook.coverUrl} 
                alt={selectedBook.title}
                className={`w-64 shadow-2xl rounded-lg transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500 ${isOutOfStock ? 'grayscale opacity-70' : ''}`}
               />
               {isOutOfStock && (
                   <div className="absolute top-4 left-4 px-4 py-2 bg-red-600 text-white font-bold rounded-lg shadow-lg z-10 animate-bounce">
                       Out of Stock
                   </div>
               )}
            </div>
            
            <div className="p-8 md:p-12 flex flex-col">
              <div className="mb-6">
                 <div className="flex items-center gap-2 mb-2">
                   <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold uppercase tracking-wide">{selectedBook.category}</span>
                   {selectedBook.isDigitalFree && (
                     <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                       <Download size={12} /> Digital Free
                     </span>
                   )}
                   {selectedBook.hasAudio && (
                     <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                       <Volume2 size={12} /> Audio
                     </span>
                   )}
                 </div>
                 <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-2">{selectedBook.title}</h1>
                 <button 
                    onClick={() => handleAuthorClick(selectedBook.author)}
                    className="text-xl text-slate-600 dark:text-slate-300 font-medium hover:text-amber-600 dark:hover:text-amber-400 hover:underline text-left"
                 >
                    {selectedBook.author}
                 </button>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Publisher: {selectedBook.publisher}</p>
              </div>

              <div className="flex items-center gap-4 mb-8">
                 <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={18} className={i < Math.floor(selectedBook.rating) ? "fill-current" : "text-slate-300 dark:text-slate-600"} />
                    ))}
                 </div>
                 <span className="text-sm text-slate-400 dark:text-slate-500">|</span>
                 <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                     Available at {selectedBook.libraryPartner}
                     {selectedBook.availableCopies > 0 ? (
                         <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-bold">({selectedBook.availableCopies} copies)</span>
                     ) : (
                         <span className="ml-2 text-red-600 dark:text-red-400 font-bold">(0 copies)</span>
                     )}
                 </span>
              </div>

              <div className="prose prose-slate dark:prose-invert mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedBook.description}
                </p>
              </div>

              <div className="mt-auto space-y-4">
                 <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                       <span className="font-semibold text-slate-700 dark:text-slate-300">Physical Rental</span>
                       <span className="font-bold text-2xl text-slate-900 dark:text-white">₹{selectedBook.rentPrice}<span className="text-sm text-slate-400 dark:text-slate-500 font-normal">/14 days</span></span>
                    </div>
                    <div className="flex gap-2">
                        {isRented ? (
                          <button 
                            disabled
                            className="flex-1 py-3 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400 font-bold rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                          >
                             Already Requested / Rented
                          </button>
                        ) : isOutOfStock ? (
                          <button 
                            disabled
                            className="flex-1 py-3 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400 font-bold rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                          >
                             Out of Stock
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
                            className={`px-4 py-3 rounded-lg border font-bold transition-all flex items-center justify-center ${inWishlist ? 'bg-pink-50 dark:bg-pink-900/30 border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-pink-200 hover:text-pink-600 dark:hover:text-pink-400'}`}
                            title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                        >
                            <Heart size={20} className={inWishlist ? "fill-pink-600 dark:fill-pink-400" : ""} />
                        </button>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center">Delivered within 2 days in metro cities.</p>
                 </div>

                 {selectedBook.hasAudio && (
                    <button 
                      onClick={() => setPlayingBook(selectedBook)}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                    >
                       <Volume2 size={20} /> Listen to Audiobook
                    </button>
                 )}

                 {selectedBook.isDigitalFree && (
                   isDownloaded ? (
                    <button 
                      onClick={() => setReadingBook(selectedBook)}
                      className="w-full py-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-2 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
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

        {/* Reviews Section */}
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                 <MessageCircle size={24} /> Community Reviews ({bookReviews.length})
             </h3>

             {user && (
                 <div className="mb-8 bg-slate-50 dark:bg-slate-750 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                     <h4 className="font-bold text-slate-800 dark:text-white mb-2 text-sm flex items-center gap-2"><PenTool size={16}/> Write a Review</h4>
                     <div className="flex items-center gap-1 mb-3">
                         {[1, 2, 3, 4, 5].map((star) => (
                             <button 
                                key={star} 
                                onClick={() => setRating(star)}
                                className="focus:outline-none transition-transform hover:scale-110"
                             >
                                 <Star 
                                    size={20} 
                                    className={star <= rating ? "fill-amber-500 text-amber-500" : "text-slate-300 dark:text-slate-600"} 
                                 />
                             </button>
                         ))}
                     </div>
                     <textarea 
                        className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                        rows={3}
                        placeholder="Share your thoughts about this book..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                     ></textarea>
                     <div className="flex justify-end mt-2">
                         <button 
                            onClick={() => {
                                handleAddReview(selectedBook.id, rating, comment);
                                setComment('');
                                setRating(5);
                            }}
                            className="px-4 py-2 bg-amber-600 text-white text-sm font-bold rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
                         >
                             <Send size={14} /> Post Review
                         </button>
                     </div>
                 </div>
             )}

             <div className="space-y-6">
               {bookReviews.length === 0 ? (
                   <p className="text-slate-500 dark:text-slate-400 text-center py-4 italic">No reviews yet. Be the first to review!</p>
               ) : (
                   bookReviews.map(review => (
                    <div key={review.id} className="pb-6 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0 group">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs">
                                    {review.userName.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{review.userName}</p>
                                    <div className="flex text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={10} className={i < review.rating ? "fill-current" : "text-slate-200 dark:text-slate-600"} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(review.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 pl-10 relative">
                            {review.comment}
                            {user?.id === review.userId && (
                                <button 
                                    onClick={() => handleDeleteReview(review.id)}
                                    className="absolute right-0 top-0 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                    title="Delete Review"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </p>
                    </div>
                   ))
               )}
             </div>
        </div>
      </div>
    );
  };

  const MembershipSection = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-4">The OneLibCard</h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
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
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Why go for OneLib?</h3>
            <ul className="space-y-4">
              {ONELIB_BENEFITS.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-1 min-w-[20px] h-5 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center">
                     <span className="text-xs font-bold">✓</span>
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={() => user ? setView(ViewState.PROFILE) : setAuthModalOpen(true)}
              className="mt-6 px-8 py-3 bg-slate-900 dark:bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            >
              {user ? 'View My Membership' : 'Apply for Membership (₹499/year)'}
            </button>
         </div>
      </div>

      {/* Partners Section */}
      <div className="mt-24">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-8 text-center">Nearest Partner Libraries</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {libraries.map(lib => (
            <div key={lib.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
               <div className="flex items-start justify-between mb-4">
                 <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center">
                   <Library size={20} />
                 </div>
                 <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] uppercase font-bold rounded">
                   {lib.city}
                 </span>
               </div>
               
               <h4 className="font-bold text-slate-800 dark:text-white mb-1 line-clamp-1" title={lib.name}>{lib.name}</h4>
               <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-4">
                 <MapPin size={12} /> {lib.location}
               </p>
               
               <a 
                 href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lib.name}, ${lib.location}, ${lib.city}`)}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="mt-auto w-full py-2 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 font-medium rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors flex items-center justify-center gap-2 text-sm"
               >
                 <MapPin size={16} /> View on Map
               </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const LegalPage = () => (
    <div className="max-w-4xl mx-auto px-4 py-16 min-h-[60vh]">
      <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white mb-8">{legalPageTitle}</h1>
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p>Last Updated: {new Date().toLocaleDateString()}</p>
        <p>This is a placeholder for the {legalPageTitle} of OneLib India. In a production environment, this page would contain the full legal text compliant with Indian laws.</p>
        <h3>1. Introduction</h3>
        <p>Welcome to OneLib. By accessing our website, you agree to these terms.</p>
        <h3>2. Membership</h3>
        <p>Membership is non-transferable. You are responsible for all books rented under your card.</p>
        <h3>3. Returns and Late Fees</h3>
        <p>Books must be returned within 14 days. Late fees apply as per library rules.</p>
      </div>
      <button onClick={() => setView(ViewState.HOME)} className="mt-8 text-amber-600 dark:text-amber-500 font-medium hover:underline">
        &larr; Back to Home
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-amber-100 dark:selection:bg-amber-900/30 selection:text-amber-900 dark:selection:text-amber-100 transition-colors duration-300">
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
        notifications={user?.id ? notifications.filter(n => n.userId === user.id) : []}
        onMarkNotificationRead={handleMarkNotificationRead}
        theme={theme}
        setTheme={setTheme}
        toggleTheme={() => {}} // Legacy override to satisfy potential strict check if not removed
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
               <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">
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
        
        {view === ViewState.AUTHOR_DETAILS && <AuthorDetails />}

        {view === ViewState.CART && (
          <CartView 
            cart={cart}
            user={user}
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
                <h2 className="text-xl font-bold mb-4 dark:text-white">Please sign in to view your wishlist</h2>
                <button 
                  onClick={() => setAuthModalOpen(true)}
                  className="px-6 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-full text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-700"
                >
                    Sign In
                </button>
            </div>
        )}

        {view === ViewState.DONATE && (
            <DonateView onDonate={handleDonate} />
        )}

        {view === ViewState.PROFILE && user && (
          <UserProfile 
            user={user} 
            rentals={rentals}
            onLogout={handleLogout} 
            onBrowse={() => setView(ViewState.BROWSE)}
            onRenew={handleRenewBook}
            onRead={(book) => setReadingBook(book)}
            onSettingsClick={() => setIsSettingsOpen(true)}
            onRequestReturn={handleRequestReturn}
          />
        )}

        {view === ViewState.LIBRARIAN_DASHBOARD && user?.role === 'librarian' && (
           <LibrarianDashboard 
             user={user}
             books={books}
             rentals={rentals}
             onAddBooks={handleAddBooks}
             onDeleteBook={handleDeleteBook}
             onUpdateBook={handleUpdateBook}
             onIssueBook={handleIssueBook}
             onUpdateStatus={handleUpdateStatus}
             onReturnBook={(id: string) => handleUpdateStatus(id, 'returned')}
             onRejectRental={handleRejectRental}
             onCheckHolds={handleCheckHolds}
             onLogout={handleLogout}
           />
        )}

        {view === ViewState.LEGAL && <LegalPage />}
      </main>

      <footer className="bg-slate-900 dark:bg-black text-slate-400 py-12 mt-20 border-t border-slate-800">
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

      {playingBook && (
        <AudioPlayerModal 
          book={playingBook}
          onClose={() => setPlayingBook(null)}
        />
      )}

      {user && (
        <SettingsModal 
            user={user}
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            onUpdateProfile={handleUpdateProfile}
        />
      )}
    </div>
  );
};

export default App;