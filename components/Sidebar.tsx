import React from 'react';
import { LayoutDashboard, ShoppingBag, ArrowLeftRight, PieChart, GraduationCap } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
    { id: 'swaps', label: 'My Swaps', icon: ArrowLeftRight },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-full fixed left-0 top-0 z-10 shadow-xl">
      <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
        <div className="bg-indigo-500 p-2 rounded-lg">
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <div>
            <span className="text-xl font-bold tracking-tight block leading-none">EduSwap</span>
            <span className="text-xs text-slate-400 font-normal">Anonymous Exchange</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentPage === item.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-6 text-xs text-slate-500 border-t border-slate-800">
        <p>Community Driven.</p>
        <p>No Login Required.</p>
      </div>
    </div>
  );
};

export default Sidebar;