import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Book } from '../types';

interface AudioPlayerModalProps {
  book: Book;
  onClose: () => void;
}

export const AudioPlayerModal: React.FC<AudioPlayerModalProps> = ({ book, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Mock Duration (random between 10 min and 60 min for demo)
  useEffect(() => {
      setDuration(600 + Math.random() * 3000); 
      setIsPlaying(true); // Auto-play on open
  }, []);

  // Simulate progress
  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setProgress((prev) => {
            if (prev >= duration) {
                setIsPlaying(false);
                return duration;
            }
            return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 rounded-full text-white z-10 transition-colors"
        >
            <X size={20} />
        </button>

        {/* Cover Art Background Area */}
        <div className="relative h-80 bg-slate-200 group">
            <img 
                src={book.coverUrl} 
                alt={book.title} 
                className="w-full h-full object-cover blur-md opacity-50 scale-110"
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <img 
                    src={book.coverUrl} 
                    alt={book.title} 
                    className="w-48 h-72 object-cover rounded-xl shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
                />
            </div>
        </div>

        {/* Player Controls */}
        <div className="p-8 bg-white">
            <div className="mb-6 text-center">
                <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{book.title}</h3>
                <p className="text-slate-500 text-sm">{book.author}</p>
                <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider rounded-full">
                    <Volume2 size={12} /> Audio Library
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-xs text-slate-400 font-medium mb-2">
                    <span>{formatTime(progress)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const clickedValue = (x / rect.width) * duration;
                    setProgress(clickedValue);
                }}>
                    <div 
                        className="h-full bg-amber-500 rounded-full relative"
                        style={{ width: `${(progress / duration) * 100}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-amber-500 rounded-full shadow"></div>
                    </div>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-8">
                <button 
                    onClick={() => setProgress(Math.max(0, progress - 15))}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <SkipBack size={24} />
                </button>
                
                <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                    {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                </button>

                <button 
                    onClick={() => setProgress(Math.min(duration, progress + 15))}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <SkipForward size={24} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};