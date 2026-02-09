import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import MySwaps from './pages/MySwaps';
import Analytics from './pages/Analytics';
import { SwapRequest, SwapStatus, Course } from './types';
import { db } from './services/db';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [mySwaps, setMySwaps] = useState<SwapRequest[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');

  const fetchMyData = async () => {
    try {
        const id = db.getUserId();
        setUserId(id);

        const allSwaps = await db.getAllSwaps();
        const mySwapsData = allSwaps.filter(s => s.userId === id);
        
        const coursesData = await db.getCourses();
        
        setMySwaps(mySwapsData);
        setCourses(coursesData);
    } catch (error) {
        console.error("Failed to fetch data", error);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyData();
  }, [currentPage]); // Refresh data when page changes

  const handleCreateSwap = async (have: Partial<Course>, want: Partial<Course>) => {
    await db.createSwap(userId, have, want);
    await fetchMyData();
    setCurrentPage('swaps');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard mySwaps={mySwaps} courses={courses} />;
      case 'marketplace':
        return <Marketplace onCreateSwap={handleCreateSwap} />;
      case 'swaps':
        return <MySwaps mySwaps={mySwaps} />;
      case 'analytics':
        return <Analytics courses={courses} />;
      default:
        return <Dashboard mySwaps={mySwaps} courses={courses} />;
    }
  };

  if (isLoading) {
      return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
              <div className="text-center">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Loading EduSwap...</p>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto h-full">
            {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default App;
