import React, { useState, useRef, useEffect } from 'react';
import { Activity, User, ChevronDown, Bell, LogOut } from 'lucide-react';
import { cn } from '../../lib/ambulance/utils';

export const Navbar = ({ driverName, isOnline, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="h-16 bg-white border-b border-gray-100 sticky top-0 z-50 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-red-500 p-2 rounded-lg">
          <Activity className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-800">LifeSync</span>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100">
          <div className={cn(
            "w-2.5 h-2.5 rounded-full animate-pulse",
            isOnline ? "bg-green-500" : "bg-red-500"
          )} />
          <span className="text-sm font-medium">
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>

        <button className="p-2 hover:bg-gray-100 rounded-full relative transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 pl-4 border-l border-gray-200 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
              <User className="w-5 h-5 text-red-500" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-none">{driverName}</p>
              <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-bold">Ambulance Driver</p>
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform",
              isDropdownOpen && "rotate-180"
            )} />
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden">
              <div className="px-4 py-2 border-b border-gray-50 mb-1">
                <p className="text-xs text-gray-500 font-medium">Signed in as</p>
                <p className="text-sm font-bold truncate">{driverName}</p>
              </div>
              <button 
                onClick={() => {
                  setIsDropdownOpen(false);
                  onLogout?.();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
