
export enum BookCategory {
  FICTION = 'Fiction',
  NON_FICTION = 'Non-Fiction',
  ACADEMIC = 'Academic',
  KIDS = 'Kids',
  HISTORY = 'History',
  LITERATURE = 'Literature',
  SCI_FI = 'Sci-Fi',
  BIOGRAPHY = 'Biography'
}

export enum Availability {
  AVAILABLE = 'Available',
  RENTED = 'Rented',
  DIGITAL_ONLY = 'Digital Only',
  MAINTENANCE = 'Maintenance'
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  category: string; 
  rating: number;
  rentPrice: number; // In INR
  isDigitalFree: boolean; // Free with OneLibCard
  hasAudio: boolean; // Audio Library Feature
  availability: Availability;
  description: string;
  libraryPartner: string; // The Tenant (Library Name)
  publisher: string;
  totalCopies: number;
  availableCopies: number;
}

export interface LibraryPartner {
  id: string;
  name: string;
  location: string;
  city: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export type UserRole = 'member' | 'librarian';

export type RentalStatus = 'pending' | 'issued' | 'returned' | 'rejected' | 'overdue' | 'cancelled';

export interface Rental {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCover: string;
  userId: string;
  userName: string;
  requestDate: string;
  issueDate?: string;
  dueDate?: string;
  returnDate?: string;
  holdExpiresAt?: string; // Date when the reservation expires if not issued
  status: RentalStatus;
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  oneLibCardId?: string; // Optional for librarians
  employeeId?: string; // Only for librarians
  managedLibrary?: LibraryPartner; // For Tenant Librarians
  memberSince: string;
  rentedBooks: Book[]; // Kept for legacy compatibility, but Rentals are source of truth
  downloadedBooks: Book[];
  wishlist: Book[];
  notifications: Notification[];
  oneLibPoints: number;
}

export enum ViewState {
  HOME = 'HOME',
  BROWSE = 'BROWSE',
  MEMBERSHIP = 'MEMBERSHIP',
  BOOK_DETAILS = 'BOOK_DETAILS',
  AUTHOR_DETAILS = 'AUTHOR_DETAILS',
  PROFILE = 'PROFILE',
  CART = 'CART',
  WISHLIST = 'WISHLIST',
  LEGAL = 'LEGAL',
  LIBRARIAN_DASHBOARD = 'LIBRARIAN_DASHBOARD',
  DONATE = 'DONATE'
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
