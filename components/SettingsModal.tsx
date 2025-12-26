import React, { useState } from 'react';
import { X, User, Lock, Save, Loader2, AlertCircle } from 'lucide-react';
import { User as UserType } from '../types';

interface SettingsModalProps {
  user: UserType;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile: (name: string, currentPass: string, newPass: string) => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ user, isOpen, onClose, onUpdateProfile }) => {
  const [name, setName] = useState(user.name);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword && newPassword.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
    }

    // Determine if we are changing sensitive info
    const isSensitiveChange = !!newPassword; 
    if (isSensitiveChange && !currentPassword) {
        setError("Please enter current password to change credentials.");
        return;
    }

    setIsLoading(true);
    try {
        await onUpdateProfile(name, currentPassword, newPassword);
        onClose();
    } catch (e) {
        setError("Failed to update profile. Verification failed.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
       <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 border dark:border-slate-800">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
             <h3 className="font-serif font-bold text-slate-800 dark:text-white">Account Settings</h3>
             <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20}/></button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
             {error && (
                 <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
                    <AlertCircle size={16} /> {error}
                 </div>
             )}

             <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Full Name</label>
                <div className="relative">
                   <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input 
                      type="text" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-10 p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                   />
                </div>
             </div>

             <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Email</label>
                <div className="relative">
                   <input 
                      type="email" 
                      value={user.email}
                      disabled
                      className="w-full p-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
                   />
                </div>
                <p className="text-[10px] text-slate-400">Email cannot be changed.</p>
             </div>

             <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-3 text-sm">Security</h4>
                <div className="space-y-3">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Current Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="password" 
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                placeholder="Required for password changes"
                                className="w-full pl-10 p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">New Password</label>
                        <input 
                            type="password" 
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="Leave blank to keep current"
                            className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                    </div>
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Confirm New Password</label>
                        <input 
                            type="password" 
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                    </div>
                </div>
             </div>

             <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-slate-900 dark:bg-amber-600 text-white font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Changes</>}
                </button>
             </div>
          </form>
       </div>
    </div>
  );
};