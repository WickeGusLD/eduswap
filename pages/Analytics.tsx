import React, { useState, useEffect } from 'react';
import { Course, AnalyticsData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { generateAnalyticsInsights } from '../services/geminiService';
import { db } from '../services/db';
import { Sparkles, Loader2, Database } from 'lucide-react';

interface AnalyticsProps {
  courses: Course[];
}

const Analytics: React.FC<AnalyticsProps> = ({ courses }) => {
  const [insights, setInsights] = useState<string>("");
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [demandData, setDemandData] = useState<AnalyticsData[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setLoadingData(true);
        const data = await db.getAnalytics();
        setDemandData(data);
        setLoadingData(false);
    };
    fetchData();
  }, []);

  const trendData = [
    { time: 'Day 1', requests: 12 },
    { time: 'Day 2', requests: 19 },
    { time: 'Day 3', requests: 35 },
    { time: 'Day 4', requests: 22 },
    { time: 'Day 5', requests: 45 },
    { time: 'Day 6', requests: 60 },
  ];

  const pieData = [
    { name: 'Direct Matches', value: 400 },
    { name: 'Chain Matches', value: 300 },
    { name: 'Unmatched', value: 300 },
  ];
  const COLORS = ['#10b981', '#6366f1', '#cbd5e1'];

  const handleGenerateInsights = async () => {
    if (demandData.length === 0) return;
    setLoadingInsights(true);
    const text = await generateAnalyticsInsights(demandData);
    setInsights(text);
    setLoadingInsights(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
         <div>
            <h1 className="text-3xl font-bold text-slate-800">Analytics Dashboard</h1>
            <p className="text-slate-500 mt-1">Real-time insights into course demand and swap efficiency.</p>
         </div>
         <button 
            onClick={handleGenerateInsights}
            disabled={loadingInsights || loadingData}
            className="flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-70"
         >
            {loadingInsights ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            <span>Generate AI Report</span>
         </button>
      </div>

      {insights && (
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-indigo-100 p-6 rounded-2xl animate-fade-in">
            <h3 className="text-indigo-900 font-bold mb-3 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-indigo-600" />
                AI-Generated Market Insights
            </h3>
            <div className="prose prose-indigo max-w-none text-indigo-800 text-sm leading-relaxed whitespace-pre-line">
                {insights}
            </div>
        </div>
      )}

      {loadingData ? (
          <div className="h-80 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-100">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-3" />
              <p className="text-slate-500">Loading database statistics...</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Supply vs Demand Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Supply vs. Demand</h3>
                    <div className="flex items-center text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        <Database className="w-3 h-3 mr-1" />
                        Live DB Data
                    </div>
                </div>
                
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={demandData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="courseCode" tick={{fill: '#64748b'}} axisLine={{stroke: '#cbd5e1'}} />
                            <YAxis tick={{fill: '#64748b'}} axisLine={{stroke: '#cbd5e1'}} allowDecimals={false} />
                            <Tooltip 
                                contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                cursor={{fill: '#f8fafc'}}
                            />
                            <Legend wrapperStyle={{paddingTop: '20px'}} />
                            <Bar dataKey="demand" name="Students Wanting" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="supply" name="Seats Available" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Activity Trend */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Swap Request Activity</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="time" tick={{fill: '#64748b'}} axisLine={{stroke: '#cbd5e1'}} />
                            <YAxis tick={{fill: '#64748b'}} axisLine={{stroke: '#cbd5e1'}} />
                            <Tooltip 
                                contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                            />
                            <Line type="monotone" dataKey="requests" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Match Success Rate */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="w-full md:w-1/2">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Matching Efficiency</h3>
                        <p className="text-slate-500 mb-6">Distribution of direct swaps vs. complex chain swaps.</p>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                                <span className="text-slate-600 text-sm">Direct Matches (40%)</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
                                <span className="text-slate-600 text-sm">Chain Matches (30%) - <span className="text-indigo-600 font-medium">High Efficiency</span></span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-slate-300 mr-2"></div>
                                <span className="text-slate-600 text-sm">Unmatched (30%)</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-1/2 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
