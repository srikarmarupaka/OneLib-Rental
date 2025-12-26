import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, Loader2, Briefcase, Building, MapPin, AlertCircle } from 'lucide-react';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, role: UserRole, name?: string, libraryDetails?: { name: string, city: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLibrarian, setIsLibrarian] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Library Registration State
  const [libraryName, setLibraryName] = useState('');
  const [city, setCity] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const validateEmail = (email: string) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Input Validation
    if (!validateEmail(email)) {
        setError("Please enter a valid email address.");
        return;
    }

    if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
    }

    if (!isLogin && !name.trim()) {
        setError("Name is required for registration.");
        return;
    }

    if (isLibrarian && !isLogin && (!libraryName.trim() || !city.trim())) {
        setError("Library details are required.");
        return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      onLogin(
          email, 
          isLibrarian ? 'librarian' : 'member', 
          name,
          (isLibrarian && !isLogin) ? { name: libraryName, city } : undefined
      );
      setIsLoading(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto border dark:border-slate-800">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-2">
              {isLibrarian ? (isLogin ? 'Staff Access' : 'Register Library') : (isLogin ? 'Welcome Back' : 'Join OneLib')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {isLibrarian 
                ? (isLogin ? 'Enter your employee credentials.' : 'Set up your own library tenant on OneLib.')
                : (isLogin ? 'Enter your details to access your library card.' : 'Create an account to get your digital OneLibCard.')}
            </p>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mb-6">
             <button 
               type="button"
               onClick={() => setIsLibrarian(false)}
               className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isLibrarian ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
             >
               Member
             </button>
             <button 
               type="button"
               onClick={() => { setIsLibrarian(true); }}
               className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isLibrarian ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-500 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
             >
               Librarian
             </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
                   <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* Common Name Field for Registration */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                    placeholder="e.g. Rahul Verma"
                  />
                </div>
              </div>
            )}

            {/* Librarian Registration Extra Fields */}
            {isLibrarian && !isLogin && (
                <>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Library Name</label>
                        <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            value={libraryName}
                            onChange={(e) => setLibraryName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                            placeholder="e.g. Community Reads"
                        />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">City / Location</label>
                        <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                            placeholder="e.g. Pune"
                        />
                        </div>
                    </div>
                </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                {isLibrarian ? 'Employee Email' : 'Email Address'}
              </label>
              <div className="relative">
                {isLibrarian ? (
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                ) : (
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                )}
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  placeholder={isLibrarian ? "admin@library.com" : "name@example.com"}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full mt-6 py-3 font-bold rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${isLibrarian ? 'bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white shadow-slate-900/20' : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'}`}
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  {isLogin ? 'Sign In' : (isLibrarian ? 'Register Library' : 'Create Account')}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-amber-600 dark:text-amber-500 hover:text-amber-700 transition-colors"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};