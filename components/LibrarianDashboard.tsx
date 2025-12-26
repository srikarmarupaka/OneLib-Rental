import React, { useState } from 'react';
import { Plus, Trash2, Edit2, RefreshCw, Box, CheckCircle, Search, Save, XCircle, Clock, BookOpen, UserCheck, BarChart3, Users, DollarSign, LogOut, Upload, FileSpreadsheet, Mail, Briefcase, Shield, User, Building, AlertCircle, AlertTriangle } from 'lucide-react';
import { Book, Availability, BookCategory, Rental, LibraryPartner, User as UserType } from '../types';

interface LibrarianDashboardProps {
  user: UserType;
  books: Book[];
  rentals: Rental[];
  onAddBooks: (books: Book[]) => void;
  onDeleteBook: (bookId: string) => void;
  onUpdateBook: (book: Book) => void;
  onIssueBook: (rentalId: string) => void;
  onReturnBook: (rentalId: string) => void;
  onRejectRental: (rentalId: string) => void;
  onCheckHolds: () => void;
  onLogout: () => void;
}

export const LibrarianDashboard: React.FC<LibrarianDashboardProps> = ({ 
  user,
  books, 
  rentals, 
  onAddBooks, 
  onDeleteBook, 
  onUpdateBook,
  onIssueBook, 
  onReturnBook,
  onRejectRental,
  onCheckHolds,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'requests' | 'circulation' | 'users' | 'maintenance' | 'profile'>('overview');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [maintenanceLog, setMaintenanceLog] = useState<string[]>([]);
  const [error, setError] = useState('');

  const tenantLibraryName = user.managedLibrary?.name || 'Central Warehouse';

  // Filter Data for this specific Tenant/Library
  const tenantBooks = books.filter(b => b.libraryPartner === tenantLibraryName);
  const tenantBookIds = tenantBooks.map(b => b.id);
  const tenantRentals = rentals.filter(r => tenantBookIds.includes(r.bookId));

  const pendingRentals = tenantRentals.filter(r => r.status === 'pending');
  const activeRentals = tenantRentals.filter(r => r.status === 'issued' || r.status === 'overdue');

  // Form State for New/Edit Book
  const [formBook, setFormBook] = useState<Partial<Book>>({
    title: '',
    author: '',
    category: BookCategory.FICTION,
    rentPrice: 49,
    publisher: '',
    libraryPartner: tenantLibraryName,
    availability: Availability.AVAILABLE,
    totalCopies: 1,
    availableCopies: 1
  });

  const handleEditClick = (book: Book) => {
    setEditingBook(book);
    setFormBook({ ...book });
    setShowAddForm(true);
    setError('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formBook.title || !formBook.author) {
        setError('Title and Author are required.');
        return;
    }
    
    if (formBook.rentPrice && formBook.rentPrice < 0) {
        setError('Rent price cannot be negative.');
        return;
    }

    const total = Number(formBook.totalCopies) || 1;
    // For new books, available = total. For edits, we need to calculate based on active rentals if we want accuracy,
    // but for simplicity in this edit form, we let librarian reset it or we just take form value.
    // Better approach for edit: Calculate difference.
    // Here we'll just set it. In a real app, this needs complex inventory reconciliation.
    const available = Number(formBook.availableCopies) ?? total;

    const bookPayload: Book = {
      id: editingBook ? editingBook.id : Date.now().toString(),
      title: formBook.title!,
      author: formBook.author!,
      category: formBook.category as string,
      rentPrice: Number(formBook.rentPrice),
      coverUrl: formBook.coverUrl || 'https://via.placeholder.com/128x192?text=New+Book',
      rating: editingBook ? editingBook.rating : 0,
      isDigitalFree: !!formBook.isDigitalFree,
      hasAudio: !!formBook.hasAudio,
      availability: available > 0 ? Availability.AVAILABLE : Availability.RENTED,
      description: formBook.description || 'Description...',
      libraryPartner: tenantLibraryName, // Enforce Tenant
      publisher: formBook.publisher || 'Unknown',
      totalCopies: total,
      availableCopies: available
    };

    if (editingBook) {
        onUpdateBook(bookPayload);
    } else {
        onAddBooks([bookPayload]);
    }

    setShowAddForm(false);
    setEditingBook(null);
    setFormBook({
        title: '',
        author: '',
        category: BookCategory.FICTION,
        rentPrice: 49,
        publisher: '',
        libraryPartner: tenantLibraryName,
        availability: Availability.AVAILABLE,
        totalCopies: 1,
        availableCopies: 1
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
        setError('Please upload a valid CSV file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const text = event.target?.result as string;
        // Simple CSV Parser: Title,Author,Category,Price,Publisher
        const lines = text.split('\n');
        const newBooks: Book[] = [];
        
        // Skip header if exists (simple check if first line has 'Title')
        const startIndex = lines[0].toLowerCase().includes('title') ? 1 : 0;

        for(let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const [title, author, category, price, publisher] = line.split(',').map(s => s.trim());
            
            if (title && author) {
                newBooks.push({
                    id: Date.now().toString() + Math.random(),
                    title,
                    author,
                    category: category || 'General',
                    rentPrice: Number(price) || 49,
                    publisher: publisher || 'Unknown',
                    coverUrl: 'https://via.placeholder.com/128x192?text=Bulk+Import',
                    rating: 0,
                    isDigitalFree: false,
                    hasAudio: false,
                    availability: Availability.AVAILABLE,
                    description: 'Imported via Bulk Upload',
                    libraryPartner: tenantLibraryName, // Enforce Tenant
                    totalCopies: 1,
                    availableCopies: 1
                });
            }
        }
        
        if (newBooks.length > 0) {
            onAddBooks(newBooks);
            setShowBulkUpload(false);
            setError('');
        } else {
            setError('No valid books found in CSV.');
        }
    };
    reader.readAsText(file);
  };

  const runMaintenanceJob = (jobName: string, action: () => void) => {
    setIsProcessing(true);
    setMaintenanceLog(prev => [`[${new Date().toLocaleTimeString()}] Starting: ${jobName}...`, ...prev]);
    
    setTimeout(() => {
      action();
      setMaintenanceLog(prev => [`[${new Date().toLocaleTimeString()}] Success: ${jobName} completed.`, ...prev]);
      setIsProcessing(false);
    }, 1500);
  };

  const filteredBooks = tenantBooks.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Calculated Stats for Tenant
  const totalRevenue = activeRentals.length * 49 + tenantRentals.filter(r => r.status === 'returned').length * 49; 
  const uniqueUsers = Array.from(new Set(tenantRentals.map(r => r.userId))).length;

  // Derive Users from rentals for "Users Tab" simulation
  const memberList = Array.from(new Set(tenantRentals.map(r => r.userId))).map(uid => {
      const rental = tenantRentals.find(r => r.userId === uid);
      return { id: uid, name: rental?.userName, lastActive: rental?.requestDate };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">{tenantLibraryName}</h1>
           <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1"><Building size={14}/> Dashboard & Operations</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
            <div className="flex flex-wrap gap-2">
                <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'overview' ? 'bg-amber-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>Overview</button>
                <button onClick={() => setActiveTab('requests')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'requests' ? 'bg-amber-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>Requests ({pendingRentals.length})</button>
                <button onClick={() => setActiveTab('circulation')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'circulation' ? 'bg-amber-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>Circulation</button>
                <button onClick={() => setActiveTab('inventory')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'inventory' ? 'bg-amber-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>Inventory</button>
                <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'users' ? 'bg-amber-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>Members</button>
                <button onClick={() => setActiveTab('maintenance')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'maintenance' ? 'bg-amber-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>System</button>
                <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'profile' ? 'bg-amber-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>Profile</button>
            </div>
            <button 
                onClick={onLogout}
                className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2"
            >
                <LogOut size={18} /> Sign Out
            </button>
        </div>
      </div>

      {/* --- OVERVIEW TAB --- */}
      {activeTab === 'overview' && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><DollarSign size={24}/></div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Est. Revenue</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">₹{totalRevenue}</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><BookOpen size={24}/></div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Active Rentals</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{activeRentals.length}</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg"><Clock size={24}/></div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Pending Requests</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{pendingRentals.length}</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><Users size={24}/></div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Active Members</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{uniqueUsers}</h3>
                    </div>
                </div>
             </div>

             <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
                 <BarChart3 className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
                 <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Analytics Dashboard</h3>
                 <p className="text-slate-500 dark:text-slate-400">More detailed charts and graphs would appear here in a production environment, connecting to Firebase Analytics.</p>
             </div>
        </div>
      )}

      {/* --- ONLINE REQUESTS TAB --- */}
      {activeTab === 'requests' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-750">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Clock size={20} className="text-amber-600 dark:text-amber-500"/> 
                    Pending Online Orders
                </h3>
            </div>
            {pendingRentals.length === 0 ? (
                <div className="p-12 text-center text-slate-500 dark:text-slate-400">No pending requests at the moment.</div>
            ) : (
                <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                    <thead className="bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-100 dark:border-slate-600">
                        <tr>
                            <th className="p-4">Request Date</th>
                            <th className="p-4">Member</th>
                            <th className="p-4">Book</th>
                            <th className="p-4">Hold Expires</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {pendingRentals.map(rental => (
                            <tr key={rental.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50">
                                <td className="p-4">{new Date(rental.requestDate).toLocaleDateString()}</td>
                                <td className="p-4 font-medium text-slate-900 dark:text-white">{rental.userName}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <img src={rental.bookCover} alt="" className="w-8 h-12 object-cover rounded shadow-sm"/>
                                        <span>{rental.bookTitle}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-red-500 font-medium">
                                    {rental.holdExpiresAt ? new Date(rental.holdExpiresAt).toLocaleString() : 'N/A'}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => onIssueBook(rental.id)}
                                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-1 text-xs font-bold"
                                        >
                                            <CheckCircle size={14} /> Issue
                                        </button>
                                        <button 
                                            onClick={() => onRejectRental(rental.id)}
                                            className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center gap-1 text-xs font-bold"
                                        >
                                            <XCircle size={14} /> Reject
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            )}
        </div>
      )}

      {/* --- CIRCULATION TAB (RETURNS) --- */}
      {activeTab === 'circulation' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
             <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-750">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <UserCheck size={20} className="text-indigo-600 dark:text-indigo-400"/> 
                    Active Circulation & Returns
                </h3>
            </div>
            {activeRentals.length === 0 ? (
                <div className="p-12 text-center text-slate-500 dark:text-slate-400">No books currently issued.</div>
            ) : (
                <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                    <thead className="bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-100 dark:border-slate-600">
                        <tr>
                            <th className="p-4">Issue Date</th>
                            <th className="p-4">Due Date</th>
                            <th className="p-4">Member</th>
                            <th className="p-4">Book</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {activeRentals.map(rental => (
                            <tr key={rental.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50">
                                <td className="p-4">{rental.issueDate ? new Date(rental.issueDate).toLocaleDateString() : '-'}</td>
                                <td className="p-4 text-amber-700 dark:text-amber-500 font-medium">{rental.dueDate ? new Date(rental.dueDate).toLocaleDateString() : '-'}</td>
                                <td className="p-4 font-medium text-slate-900 dark:text-white">{rental.userName}</td>
                                <td className="p-4">{rental.bookTitle}</td>
                                <td className="p-4">
                                     <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${rental.status === 'overdue' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'}`}>
                                        {rental.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button 
                                        onClick={() => onReturnBook(rental.id)}
                                        className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 flex items-center gap-1 text-xs font-bold ml-auto"
                                    >
                                        <Box size={14} /> Mark Returned
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            )}
        </div>
      )}

      {/* --- USERS TAB --- */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
             <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-750">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Users size={20} className="text-slate-600 dark:text-slate-400"/> 
                    Library Members
                </h3>
            </div>
            {memberList.length === 0 ? (
                <div className="p-12 text-center text-slate-500 dark:text-slate-400">No members found.</div>
            ) : (
                <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                    <thead className="bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-100 dark:border-slate-600">
                        <tr>
                            <th className="p-4">Member Name</th>
                            <th className="p-4">ID</th>
                            <th className="p-4">Last Activity</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {memberList.map((member, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50">
                                <td className="p-4 font-bold text-slate-900 dark:text-white">{member.name}</td>
                                <td className="p-4 font-mono text-xs">{member.id}</td>
                                <td className="p-4">{new Date(member.lastActive || '').toLocaleDateString()}</td>
                                <td className="p-4"><span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-xs font-bold">Active</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            )}
        </div>
      )}

      {/* --- INVENTORY TAB --- */}
      {activeTab === 'inventory' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center bg-slate-50 dark:bg-slate-750 gap-4">
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search inventory..." 
                        className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 w-full md:w-64"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setShowBulkUpload(!showBulkUpload)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        <Upload size={18} /> Bulk Add
                    </button>
                    <button 
                        onClick={() => { setEditingBook(null); setShowAddForm(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                    >
                        <Plus size={18} /> Add New Book
                    </button>
                </div>
            </div>

            {showBulkUpload && (
                <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800 animate-in slide-in-from-top-4">
                     <h3 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                         <FileSpreadsheet size={20} className="text-blue-600 dark:text-blue-400" /> Bulk Upload (CSV)
                     </h3>
                     <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Upload a CSV file with headers: Title, Author, Category, Price, Publisher</p>
                     {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
                     <input 
                        type="file" 
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-200 dark:hover:file:bg-blue-800"
                     />
                </div>
            )}

            {showAddForm && (
                <div className="p-6 bg-slate-50 dark:bg-slate-700/30 border-b border-slate-100 dark:border-slate-700 animate-in slide-in-from-top-4">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4">{editingBook ? 'Edit Book' : 'Add New Title'}</h3>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
                           <AlertCircle size={16} /> {error}
                        </div>
                    )}
                    <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <input 
                            className="p-2 border dark:border-slate-600 rounded bg-white dark:bg-slate-800 dark:text-white" 
                            placeholder="Book Title" 
                            required 
                            value={formBook.title}
                            onChange={e => setFormBook({...formBook, title: e.target.value})}
                        />
                        <input 
                            className="p-2 border dark:border-slate-600 rounded bg-white dark:bg-slate-800 dark:text-white" 
                            placeholder="Author" 
                            required 
                            value={formBook.author}
                            onChange={e => setFormBook({...formBook, author: e.target.value})}
                        />
                        <select 
                            className="p-2 border dark:border-slate-600 rounded bg-white dark:bg-slate-800 dark:text-white"
                            value={formBook.category}
                            onChange={e => setFormBook({...formBook, category: e.target.value})}
                        >
                            {Object.values(BookCategory).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                         <input 
                            className="p-2 border dark:border-slate-600 rounded bg-white dark:bg-slate-800 dark:text-white" 
                            placeholder="Price (INR)" 
                            type="number"
                            min="0"
                            value={formBook.rentPrice}
                            onChange={e => setFormBook({...formBook, rentPrice: Number(e.target.value)})}
                        />
                        <div className="flex flex-col">
                            <label className="text-xs text-slate-500 mb-1">Total Copies</label>
                            <input 
                                className="p-2 border dark:border-slate-600 rounded bg-white dark:bg-slate-800 dark:text-white" 
                                placeholder="Total Copies" 
                                type="number"
                                min="1"
                                value={formBook.totalCopies}
                                onChange={e => setFormBook({...formBook, totalCopies: Number(e.target.value)})}
                            />
                        </div>
                         <input 
                            className="p-2 border dark:border-slate-600 rounded bg-white dark:bg-slate-800 dark:text-white" 
                            placeholder="Publisher" 
                            value={formBook.publisher}
                            onChange={e => setFormBook({...formBook, publisher: e.target.value})}
                        />
                        <div className="flex gap-2 lg:col-span-2">
                            <button type="submit" className="flex-1 bg-slate-900 dark:bg-slate-600 text-white rounded flex items-center justify-center gap-2 py-2">
                                <Save size={16} /> Save Changes
                            </button>
                            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 border dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                    <thead className="bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-100 dark:border-slate-600">
                        <tr>
                            <th className="p-4">Title</th>
                            <th className="p-4">Author</th>
                            <th className="p-4">Stock (Avail/Total)</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filteredBooks.map(book => (
                            <tr key={book.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50">
                                <td className="p-4 font-medium text-slate-900 dark:text-white">{book.title}</td>
                                <td className="p-4">{book.author}</td>
                                <td className="p-4 font-mono font-bold">
                                    <span className={book.availableCopies === 0 ? "text-red-500" : "text-emerald-600"}>{book.availableCopies}</span> 
                                    <span className="text-slate-400 mx-1">/</span> 
                                    <span>{book.totalCopies}</span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${book.availableCopies > 0 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                        {book.availableCopies > 0 ? 'Available' : 'Out of Stock'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => handleEditClick(book)}
                                            className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors"
                                            title="Edit Book"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => onDeleteBook(book.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                                            title="Delete Book"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {filteredBooks.length === 0 && (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">No books found matching your search.</div>
            )}
        </div>
      )}

      {/* --- MAINTENANCE TAB --- */}
      {activeTab === 'maintenance' && (
        <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                            <RefreshCw size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Inventory Sync</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Sync with partner library APIs (Google Books)</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => runMaintenanceJob('Inventory Sync', () => {})}
                        disabled={isProcessing}
                        className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                        {isProcessing ? 'Processing...' : 'Run Now'}
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                            <Box size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Check Overdue Rentals</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Send email reminders to users (Cron Job)</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => runMaintenanceJob('Overdue Check', () => {})}
                        disabled={isProcessing}
                        className="w-full py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
                    >
                        {isProcessing ? 'Processing...' : 'Run Now'}
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Clean Expired Holds</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Cancel requests older than 2 days & restore stock</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => runMaintenanceJob('Expired Holds Cleanup', onCheckHolds)}
                        disabled={isProcessing}
                        className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                        {isProcessing ? 'Processing...' : 'Run Now'}
                    </button>
                </div>
            </div>

            <div className="bg-slate-900 dark:bg-black rounded-xl p-6 text-slate-300 font-mono text-sm h-[400px] overflow-y-auto border border-slate-800">
                <h3 className="text-white font-bold mb-4 border-b border-slate-700 pb-2">System Logs (Firebase Functions)</h3>
                <div className="space-y-2">
                    {maintenanceLog.length === 0 && <span className="opacity-50">Waiting for jobs...</span>}
                    {maintenanceLog.map((log, idx) => (
                        <div key={idx} className="break-words">
                            <span className="text-emerald-500 mr-2">$</span>{log}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* --- PROFILE TAB --- */}
      {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
               <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 text-center">
                    <div className="w-24 h-24 bg-slate-900 dark:bg-slate-700 rounded-full mx-auto mb-6 flex items-center justify-center text-white font-serif font-bold text-4xl shadow-lg shadow-slate-200 dark:shadow-none">
                        {user.name.charAt(0)}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">Librarian Access</p>

                    <div className="grid grid-cols-2 gap-4 mb-8 text-left max-w-md mx-auto">
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                             <div className="flex items-center gap-2 mb-1 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                                 <Briefcase size={12} /> Employee ID
                             </div>
                             <p className="font-mono font-medium text-slate-900 dark:text-white">{user.employeeId}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                             <div className="flex items-center gap-2 mb-1 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                                 <Building size={12} /> Library
                             </div>
                             <p className="font-medium text-slate-900 dark:text-white truncate" title={tenantLibraryName}>{tenantLibraryName}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700 col-span-2">
                             <div className="flex items-center gap-2 mb-1 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                                 <Mail size={12} /> Contact
                             </div>
                             <p className="font-medium text-slate-900 dark:text-white">{user.email}</p>
                        </div>
                    </div>

                    <button 
                        onClick={onLogout}
                        className="w-full max-w-md py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                        <LogOut size={20} /> Sign Out
                    </button>
               </div>
          </div>
      )}
    </div>
  );
};