import React from 'react';
import { SwapRequest, SwapStatus } from '../types';
import { RefreshCw, ArrowRight, Check, X, Link as LinkIcon, AlertCircle } from 'lucide-react';

interface MySwapsProps {
  mySwaps: SwapRequest[];
}

const MySwaps: React.FC<MySwapsProps> = ({ mySwaps }) => {
  
  const renderStatusBadge = (status: SwapStatus, matchType?: string | null) => {
    switch (status) {
      case SwapStatus.MATCH_FOUND:
        return (
          <span className="flex items-center bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Check className="w-3 h-3 mr-1" />
            Match Found {matchType ? `(${matchType})` : ''}
          </span>
        );
      case SwapStatus.PENDING:
        return (
          <span className="flex items-center bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin-slow" />
            Pending
          </span>
        );
      default:
        return <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold uppercase">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
       <div>
          <h1 className="text-3xl font-bold text-slate-800">My Swaps</h1>
          <p className="text-slate-500 mt-1">Track your requests and finalize matches.</p>
        </div>

        <div className="grid gap-6">
            {mySwaps.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
                    <RefreshCw className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-600">No Active Swaps</h3>
                    <p className="text-slate-400">Head to the Marketplace to start a request.</p>
                </div>
            )}

            {mySwaps.map((swap) => (
                <div key={swap.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center space-x-3">
                            <span className="text-sm text-slate-400">Request #{swap.id}</span>
                            {renderStatusBadge(swap.status, swap.matchType)}
                        </div>
                        <div className="text-sm text-slate-500">
                            Created on {new Date(swap.createdAt).toLocaleDateString()}
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-12">
                            {/* HAVE */}
                            <div className="text-center w-full md:w-1/3 p-4 rounded-xl bg-red-50 border border-red-100">
                                <span className="text-xs font-bold text-red-400 uppercase tracking-widest block mb-2">Dropping</span>
                                <h3 className="text-xl font-bold text-slate-800">{swap.haveCourse?.code}</h3>
                                <p className="text-slate-600">{swap.haveCourse?.title}</p>
                                <p className="text-xs text-slate-400 mt-1">{swap.haveCourse?.timeSlot}</p>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="p-2 bg-slate-100 rounded-full">
                                    <ArrowRight className="w-6 h-6 text-slate-400" />
                                </div>
                            </div>

                            {/* WANT */}
                            <div className="text-center w-full md:w-1/3 p-4 rounded-xl bg-green-50 border border-green-100">
                                <span className="text-xs font-bold text-green-500 uppercase tracking-widest block mb-2">Adding</span>
                                <h3 className="text-xl font-bold text-slate-800">{swap.wantCourse?.code}</h3>
                                <p className="text-slate-600">{swap.wantCourse?.title}</p>
                                <p className="text-xs text-slate-400 mt-1">{swap.wantCourse?.timeSlot}</p>
                            </div>
                        </div>

                        {/* Match Details Area */}
                        {swap.status === SwapStatus.MATCH_FOUND && (
                            <div className="mt-8 bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                                <h4 className="font-bold text-indigo-900 mb-3 flex items-center">
                                    {swap.matchType === 'CHAIN' ? (
                                        <LinkIcon className="w-5 h-5 mr-2" />
                                    ) : (
                                        <Check className="w-5 h-5 mr-2" />
                                    )}
                                    {swap.matchType === 'CHAIN' ? 'Complex Chain Match Found' : 'Direct Match Found'}
                                </h4>
                                
                                <p className="text-indigo-800 text-sm mb-4">
                                    {swap.matchType === 'CHAIN' 
                                        ? "We found a multi-student swap chain that satisfies your request. You will be swapping with multiple peers to achieve this outcome." 
                                        : "Another student wants exactly what you have, and has exactly what you want."
                                    }
                                </p>

                                <div className="flex items-center justify-end space-x-3">
                                    <button className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-medium">
                                        Decline
                                    </button>
                                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200 text-sm font-medium">
                                        Confirm Swap
                                    </button>
                                </div>
                            </div>
                        )}
                        
                         {swap.status === SwapStatus.PENDING && (
                             <div className="mt-6 flex items-center justify-center text-slate-400 text-sm">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                We are searching for a match. You will be notified instantly.
                             </div>
                         )}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default MySwaps;