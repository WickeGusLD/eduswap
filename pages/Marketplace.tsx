import React, { useState, useEffect } from 'react';
import { Course, SwapRequest } from '../types';
import { Search, Plus, Filter, BookOpen, Clock, Tag } from 'lucide-react';
import { getSwapAdvice } from '../services/geminiService';
import { db } from '../services/db';

interface MarketplaceProps {
  onCreateSwap: (have: Partial<Course>, want: Partial<Course>) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ onCreateSwap }) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [allSwaps, setAllSwaps] = useState<SwapRequest[]>([]);
  
  // Create Form States
  const [haveCode, setHaveCode] = useState('');
  const [haveTitle, setHaveTitle] = useState('');
  const [haveTime, setHaveTime] = useState('');
  const [wantCode, setWantCode] = useState('');
  
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

  useEffect(() => {
    const loadSwaps = async () => {
        const swaps = await db.getAllSwaps();
        setAllSwaps(swaps.filter(s => s.status !== 'COMPLETED' && s.status !== 'CANCELLED'));
    };
    loadSwaps();
  }, []); // Reload when component mounts

  // Filter swaps based on search
  const filteredSwaps = allSwaps.filter(s => {
      const term = searchTerm.toLowerCase();
      return (
          s.haveCourse?.code.toLowerCase().includes(term) ||
          s.haveCourse?.title.toLowerCase().includes(term) ||
          s.wantCourse?.code.toLowerCase().includes(term)
      );
  });

  const handleCreate = async () => {
    if (haveCode && wantCode) {
      onCreateSwap(
          { code: haveCode.toUpperCase(), title: haveTitle, timeSlot: haveTime },
          { code: wantCode.toUpperCase(), title: 'Target Course' }
      );
      // Reset form
      setHaveCode('');
      setHaveTitle('');
      setHaveTime('');
      setWantCode('');
      setAiAdvice(null);
      setActiveTab('browse');
      
      // Refresh list
      setTimeout(async () => {
         const swaps = await db.getAllSwaps();
         setAllSwaps(swaps);
      }, 500);
    }
  };

  const getAdvice = async () => {
    if (haveCode && wantCode) {
        setIsLoadingAdvice(true);
        const advice = await getSwapAdvice(haveCode, wantCode);
        setAiAdvice(advice);
        setIsLoadingAdvice(false);
    }
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Course Marketplace</h1>
          <p className="text-slate-500 mt-1">Post your courses or find a trade partner.</p>
        </div>
        <div className="flex bg-white p-1 rounded-lg border border-slate-200">
            <button 
                onClick={() => setActiveTab('browse')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'browse' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Browse Requests
            </button>
            <button 
                onClick={() => setActiveTab('create')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'create' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Post New Swap
            </button>
        </div>
      </div>

      {activeTab === 'create' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 animate-fade-in">
             <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <Plus className="w-6 h-6 mr-2 text-indigo-500" />
                Post a Swap Request
             </h2>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* LEFT: I HAVE */}
                 <div className="space-y-4">
                     <div className="flex items-center space-x-2 text-rose-500 font-semibold uppercase tracking-wider text-xs mb-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        <span>What you are dropping</span>
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Course Code <span className="text-red-500">*</span></label>
                         <input 
                            type="text" 
                            placeholder="e.g. CS101" 
                            className="w-full rounded-lg border-slate-200 focus:ring-2 focus:ring-rose-100 focus:border-rose-400 p-2.5"
                            value={haveCode}
                            onChange={(e) => setHaveCode(e.target.value)}
                         />
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Course Title</label>
                         <input 
                            type="text" 
                            placeholder="e.g. Intro to CS" 
                            className="w-full rounded-lg border-slate-200 focus:ring-2 focus:ring-rose-100 focus:border-rose-400 p-2.5"
                            value={haveTitle}
                            onChange={(e) => setHaveTitle(e.target.value)}
                         />
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Time Slot</label>
                         <input 
                            type="text" 
                            placeholder="e.g. Mon/Wed 10am" 
                            className="w-full rounded-lg border-slate-200 focus:ring-2 focus:ring-rose-100 focus:border-rose-400 p-2.5"
                            value={haveTime}
                            onChange={(e) => setHaveTime(e.target.value)}
                         />
                     </div>
                 </div>

                 {/* RIGHT: I WANT */}
                 <div className="space-y-4">
                     <div className="flex items-center space-x-2 text-emerald-600 font-semibold uppercase tracking-wider text-xs mb-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>What you want</span>
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Target Course Code <span className="text-red-500">*</span></label>
                         <input 
                            type="text" 
                            placeholder="e.g. MATH200" 
                            className="w-full rounded-lg border-slate-200 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 p-2.5"
                            value={wantCode}
                            onChange={(e) => setWantCode(e.target.value)}
                            onBlur={getAdvice} 
                         />
                     </div>
                     
                     {/* AI Advice */}
                     {(aiAdvice || isLoadingAdvice) && (
                        <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                            <div className="flex items-start space-x-3">
                                <BookOpen className="w-5 h-5 text-indigo-600 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-indigo-500 uppercase mb-1">AI Match Probability</p>
                                    {isLoadingAdvice ? (
                                        <p className="text-sm text-indigo-800 animate-pulse">Analyzing demand patterns...</p>
                                    ) : (
                                        <p className="text-sm text-indigo-900 leading-relaxed">{aiAdvice}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                     )}

                     <div className="pt-4">
                        <button 
                            onClick={handleCreate}
                            disabled={!haveCode || !wantCode}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-200"
                        >
                            Post Request
                        </button>
                     </div>
                 </div>
             </div>
          </div>
      )}

      {activeTab === 'browse' && (
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center space-x-4 bg-slate-50/50">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Search for a course you have or want..." 
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-white bg-white shadow-sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSwaps.length === 0 ? (
                        <div className="col-span-full text-center py-20">
                            <p className="text-slate-400">No active swap requests found matching your search.</p>
                        </div>
                    ) : (
                        filteredSwaps.map(swap => (
                            <div key={swap.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all group relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-indigo-500 transition-colors"></div>
                                
                                <div className="mb-4">
                                    <div className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        Offering
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-xl">{swap.haveCourse?.code}</h3>
                                    <p className="text-slate-600 text-sm truncate">{swap.haveCourse?.title}</p>
                                    <div className="flex items-center text-slate-400 text-xs mt-2">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {swap.haveCourse?.timeSlot || 'Time TBD'}
                                    </div>
                                </div>
                                
                                <div className="border-t border-slate-100 my-3 pt-3">
                                    <div className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Looking For
                                    </div>
                                    <div className="flex items-center text-indigo-600 font-semibold">
                                        <Tag className="w-4 h-4 mr-1.5" />
                                        {swap.wantCourse?.code}
                                    </div>
                                </div>

                                <button 
                                    className="w-full mt-2 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200"
                                >
                                    I Have {swap.wantCourse?.code}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
