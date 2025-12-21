export enum BookCategory {
  FICTION = 'Fiction',
  NON_FICTION = 'Non-Fiction',
  ACADEMIC = 'Academic',
  KIDS = 'Kids',
  HISTORY = 'History',
  LITERATURE = 'Literature'
}

export enum Availability {
  AVAILABLE = 'Available',
  RENTED = 'Rented',
  DIGITAL_ONLY = 'Digital Only'
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  category: string; // Changed from Enum to string for API flexibility
  rating: number;
  rentPrice: number; // In INR
  isDigitalFree: boolean; // Free with OneLibCard
  availability: Availability;
  description: string;
  libraryPartner: string;
  publisher: string;
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

export interface User {
  id: string;
  name: string;
  email: string;
  oneLibCardId: string;
  memberSince: string;
  rentedBooks: Book[];
  downloadedBooks: Book[];
  wishlist: Book[];
}

export enum ViewState {
  HOME = 'HOME',
  BROWSE = 'BROWSE',
  MEMBERSHIP = 'MEMBERSHIP',
  BOOK_DETAILS = 'BOOK_DETAILS',
  PROFILE = 'PROFILE',
  CART = 'CART',
  WISHLIST = 'WISHLIST',
  LEGAL = 'LEGAL'
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}