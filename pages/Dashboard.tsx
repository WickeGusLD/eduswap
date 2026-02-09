import React from 'react';
import { SwapRequest, SwapStatus, Course } from '../types';
import { Bell, Clock, CheckCircle2, AlertCircle, Calendar, UserCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  mySwaps: SwapRequest[];
  courses: Course[];
}

const Dashboard: React.FC<DashboardProps> = ({ mySwaps, courses }) => {
  const pendingCount = mySwaps.filter(s => s.status === SwapStatus.PENDING).length;
  const matchCount = mySwaps.filter(s => s.status === SwapStatus.MATCH_FOUND).length;
  
  const activityData = [
    { day: 'Mon', swaps: 4 },
    { day: 'Tue', swaps: 7 },
    { day: 'Wed', swaps: 12 },
    { day: 'Thu', swaps: 8 },
    { day: 'Fri', swaps: 15 },
    { day: 'Sat', swaps: 5 },
    { day: 'Sun', swaps: 2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Student Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your anonymous course swaps.</p>
        </div>
        <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
             <UserCircle className="w-6 h-6 text-slate-400" />
             <span className="text-sm font-medium text-slate-600">
                Anonymous Mode
            </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Your Pending Requests</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{pendingCount}</h3>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl">
            <Clock className="text-amber-500 w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Your Matches</p>
            <h3 className="text-3xl font-bold text-indigo-600 mt-1">{matchCount}</h3>
          </div>
          <div className="p-3 bg-indigo-50 rounded-xl relative">
            <CheckCircle2 className="text-indigo-600 w-6 h-6" />
            {matchCount > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                </span>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Global Activity</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">Active</h3>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl">
            <Calendar className="text-emerald-500 w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications / Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-indigo-500" />
                Notifications
            </h3>
            <div className="space-y-4">
                {matchCount > 0 ? (
                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start space-x-3">
                        <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-indigo-900 font-semibold">Match Found!</p>
                            <p className="text-sm text-indigo-700 mt-1">
                                One of your course requests has been matched. Check the "My Swaps" tab to proceed.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                        No new matches yet.
                    </div>
                )}
                
                <div className="p-4 bg-white border border-slate-100 rounded-xl flex items-start space-x-3 hover:bg-slate-50 transition-colors">
                    <AlertCircle className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-slate-800 font-medium">Community Guideline</p>
                        <p className="text-sm text-slate-500 mt-1">
                            Please ensure course codes are accurate (e.g., "CS101" not "CS 101") to help the matching algorithm.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Mini Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Platform Activity</h3>
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData}>
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                        <YAxis hide />
                        <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                        <Bar dataKey="swaps" radius={[4, 4, 0, 0]}>
                            {activityData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 4 ? '#6366f1' : '#cbd5e1'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <p className="text-center text-sm text-slate-500 mt-2">Swap requests per day this week</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
