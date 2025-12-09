import React from 'react';
import { Compass } from 'lucide-react';

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
          <nav className="flex space-x-4 space-x-reverse">
            <span className="text-sm text-gray-500">نظام توجيه ذكي يساعد الطلاب على اختيار التخصص الجامعي المناسب</span>
          </nav>
        </div>
      </div>
    </header>
  );
};