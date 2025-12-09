import React from 'react';
import { Compass, Code2 } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Compass className="h-8 w-8 text-indigo-600 ml-3" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">مساري</h1>
              <p className="text-xs text-indigo-600 font-medium -mt-1">بوابتك للمستقبل</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 border-r border-gray-200 pr-4 mr-4">
            <div className="text-left">
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Powered By</p>
              <p className="text-xs font-bold text-gray-800">Black Pharaohs Code</p>
            </div>
            <Code2 className="w-6 h-6 text-gray-800" />
          </div>
        </div>
      </div>
    </header>
  );
};