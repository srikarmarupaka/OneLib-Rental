import React, { useEffect } from 'react';
import { X, Package, Truck, CheckCircle, Clock, MapPin, ArrowUp, Home } from 'lucide-react';
import { Rental, TrackingEvent, RentalStatus } from '../types';

interface TrackingModalProps {
  rental: Rental;
  onClose: () => void;
}

export const TrackingModal: React.FC<TrackingModalProps> = ({ rental, onClose }) => {
  
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; }
  }, []);

  const getStatusIcon = (status: RentalStatus) => {
    switch (status) {
      case 'pending': return <Clock size={20} />;
      case 'approved': return <CheckCircle size={20} />;
      case 'dispatched': return <Package size={20} />;
      case 'delivered': return <Home size={20} />;
      case 'return_requested': return <ArrowUp size={20} />;
      case 'return_scheduled': return <Truck size={20} />;
      case 'returned': return <CheckCircle size={20} />;
      default: return <Clock size={20} />;
    }
  };

  const currentStatusIndex = rental.trackingHistory.length - 1;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg relative z-10 overflow-hidden animate-in fade-in zoom-in-95 border dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
          <div>
             <h3 className="font-serif font-bold text-slate-800 dark:text-white text-lg">Track Order</h3>
             <p className="text-xs text-slate-500 dark:text-slate-400">Order ID: #{rental.id.slice(-8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={20}/>
          </button>
        </div>

        {/* Book Summary */}
        <div className="p-5 flex gap-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
           <img src={rental.bookCover} alt="Cover" className="w-16 h-24 object-cover rounded-lg shadow-sm" />
           <div>
              <h4 className="font-bold text-slate-900 dark:text-white">{rental.bookTitle}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Estimated Delivery: 2 Days</p>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${rental.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                 {getStatusIcon(rental.status)} {rental.status.replace('_', ' ')}
              </div>
           </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900/50">
           <div className="space-y-0 relative">
              {/* Vertical Line */}
              <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-700 z-0"></div>

              {[...rental.trackingHistory].reverse().map((event, idx) => {
                 const isLatest = idx === 0;
                 return (
                    <div key={idx} className="relative z-10 flex gap-4 mb-8 last:mb-0 group">
                       <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors shrink-0 ${isLatest ? 'bg-amber-600 border-amber-100 dark:border-amber-900 text-white shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'}`}>
                          {getStatusIcon(event.status)}
                       </div>
                       <div className="pt-1">
                          <p className={`font-bold text-sm ${isLatest ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                             {event.description}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">
                             {new Date(event.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                          {event.location && (
                             <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <MapPin size={12} /> {event.location}
                             </p>
                          )}
                       </div>
                    </div>
                 );
              })}
           </div>
        </div>

        {/* Footer (if needed for actions, e.g. Contact Support) */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
            <p className="text-xs text-slate-400">Need help with this order? <button className="text-amber-600 hover:underline">Contact Support</button></p>
        </div>

      </div>
    </div>
  );
};
