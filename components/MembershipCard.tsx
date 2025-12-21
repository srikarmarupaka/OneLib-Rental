import React from 'react';
import { Sparkles, Wifi } from 'lucide-react';

interface MembershipCardProps {
  name?: string;
  cardNumber?: string;
  validThru?: string;
}

export const MembershipCard: React.FC<MembershipCardProps> = ({ 
  name = "Priya Sharma",
  cardNumber = "4512 9821 3314 0021",
  validThru = "12/28"
}) => {
  return (
    <div className="relative w-80 h-48 rounded-2xl overflow-hidden shadow-2xl transform transition-transform hover:scale-105 duration-500 group perspective-1000">
      {/* Background with texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-amber-700 z-0"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0"></div>
      
      {/* Card Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 z-10"></div>

      <div className="absolute inset-0 p-6 flex flex-col justify-between z-20 text-white font-sans">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center font-serif font-bold text-indigo-900">
               O
             </div>
             <span className="font-bold tracking-wider text-lg">OneLib</span>
          </div>
          <Wifi className="opacity-80 rotate-90" size={20} />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
             <div className="w-10 h-6 bg-yellow-200/20 rounded border border-yellow-200/30 flex items-center justify-center">
                <div className="w-6 h-4 bg-yellow-400/40 rounded-sm"></div>
             </div>
             <Wifi size={14} className="opacity-50" />
          </div>
          <p className="font-mono text-sm tracking-[0.2em] opacity-90 shadow-sm">
            {cardNumber}
          </p>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] text-amber-200 uppercase tracking-wider">Member Name</p>
            <p className="font-medium tracking-wide uppercase truncate max-w-[150px]">{name}</p>
          </div>
          <div className="flex flex-col items-end">
             <p className="text-[10px] text-amber-200 uppercase tracking-wider">Valid Thru</p>
             <p className="font-medium">{validThru}</p>
          </div>
        </div>
      </div>
      
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 opacity-20">
         <Sparkles size={80} />
      </div>
    </div>
  );
};
