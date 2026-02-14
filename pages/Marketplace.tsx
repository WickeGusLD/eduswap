import React, { useState, useEffect } from 'react';
import { Course, SwapRequest } from '../types';
import { Search, Plus, Filter, Clock, Tag } from 'lucide-react';
import { db } from '../services/db';

interface MarketplaceProps {
  onCreateSwap: (have: Partial<Course>, want: Partial<Course>) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ onCreateSwap }) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [allSwaps, setAllSwaps] = useState<SwapRequest[]>([]);
  
  // Create Form States - HAVE
  const [haveCode, setHaveCode] = useState('');
  const [haveTitle, setHaveTitle] = useState('');
  const [haveDays, setHaveDays] = useState<string[]>([]);
  const [haveTimeStr, setHaveTimeStr] = useState('');

  // Create Form States - WANT
  const [wantCode, setWantCode] = useState('');
  const [wantTitle, setWantTitle] = useState('');
  const [wantDays, setWantDays] = useState<string[]>([]);
  const [wantTimeStr, setWantTimeStr] = useState('');

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

  const daysOptions = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const toggleDay = (day: string, currentDays: string[], setDays: (d: string[]) => void) => {
    if (currentDays.includes(day)) {
        setDays(currentDays.filter(d => d !== day));
    } else {
        const order = { 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5 };
        const newDays = [...currentDays, day].sort((a, b) => order[a as keyof typeof order] - order[b as keyof typeof order]);
        setDays(newDays);
    }
  };

  const formatTimeSlot = (days: string[], time: string) => {
    if (days.length === 0 && !time) return '';
    const dayStr = days.length > 0 ? days.join('/') : '';
    
    if (!time) return dayStr;

    // Convert 24h to 12h
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    const timeFormatted = `${h12}:${minutes} ${ampm}`;
    
    return dayStr ? `${dayStr} ${timeFormatted}` : timeFormatted;
  };

  const handleCreate = async () => {
    if (haveCode && wantCode) {
      const haveTimeSlot = formatTimeSlot(haveDays, haveTimeStr);
      const wantTimeSlot = formatTimeSlot(wantDays, wantTimeStr);

      onCreateSwap(
          { code: haveCode.toUpperCase(), title: haveTitle, timeSlot: haveTimeSlot },
          { code: wantCode.toUpperCase(), title: wantTitle, timeSlot: wantTimeSlot }
      );
      
      // Reset form
      setHaveCode('');
      setHaveTitle('');
      setHaveDays([]);
      setHaveTimeStr('');
      
      setWantCode('');
      setWantTitle('');
      setWantDays([]);
      setWantTimeStr('');
      
      setActiveTab('browse');
      
      // Refresh list
      setTimeout(async () => {
         const swaps = await db.getAllSwaps();
         setAllSwaps(swaps);
      }, 500);
    }
  };

  const renderTimeSelector = (days: string[], setDays: (d: string[]) => void, timeStr: string, setTimeStr: (t: string) => void) => (
      <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="flex flex-wrap gap-2">
              {daysOptions.map(day => (
                  <button
                      key={day}
                      onClick={() => toggleDay(day, days, setDays)}
                      className={`text-xs font-medium px-2 py-1 rounded border transition-colors ${
                          days.includes(day) 
                              ? 'bg-indigo-600 text-white border-indigo-600' 
                              : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-300'
                      }`}
                  >
                      {day}
                  </button>
              ))}
          </div>
          <input 
              type="time" 
              className="w-full text-sm rounded border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 p-2"
              value={timeStr}
              onChange={(e) => setTimeStr(e.target.value)}
          />
      </div>
  );

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
                         <label className="block text-sm font-medium text-slate-700 mb-1">Course Code (CRN) <span className="text-red-500">*</span></label>
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
                         {renderTimeSelector(haveDays, setHaveDays, haveTimeStr, setHaveTimeStr)}
                     </div>
                 </div>

                 {/* RIGHT: I WANT */}
                 <div className="space-y-4">
                     <div className="flex items-center space-x-2 text-emerald-600 font-semibold uppercase tracking-wider text-xs mb-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>What you want</span>
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Target Course Code (CRN) <span className="text-red-500">*</span></label>
                         <input 
                            type="text" 
                            placeholder="e.g. MATH200" 
                            className="w-full rounded-lg border-slate-200 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 p-2.5"
                            value={wantCode}
                            onChange={(e) => setWantCode(e.target.value)}
                         />
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Target Course Title</label>
                         <input 
                            type="text" 
                            placeholder="e.g. Calculus II" 
                            className="w-full rounded-lg border-slate-200 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 p-2.5"
                            value={wantTitle}
                            onChange={(e) => setWantTitle(e.target.value)}
                         />
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Target Time Slot</label>
                         {renderTimeSelector(wantDays, setWantDays, wantTimeStr, setWantTimeStr)}
                     </div>

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
                                    <p className="text-slate-500 text-xs mt-1 truncate">{swap.wantCourse?.title}</p>
                                    {swap.wantCourse?.timeSlot && swap.wantCourse.timeSlot !== 'TBD' && (
                                        <div className="flex items-center text-slate-400 text-xs mt-1">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {swap.wantCourse.timeSlot}
                                        </div>
                                    )}
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