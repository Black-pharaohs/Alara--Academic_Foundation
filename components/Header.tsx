import React from 'react';
import { Code2, UserCircle, LogOut, LogIn } from 'lucide-react';
import { PyramidIcon } from './Icons';
import { AuthUser } from '../types';

interface HeaderProps {
  currentUser: AuthUser | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onProfileClick: () => void;
  onAdminDashboardClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentUser, 
  onLoginClick, 
  onLogoutClick, 
  onProfileClick,
  onAdminDashboardClick
}) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center cursor-pointer group" onClick={() => window.location.href = '/'}>
            <div className="bg-indigo-50 p-2 rounded-lg ml-3 group-hover:bg-indigo-100 transition-colors">
              <PyramidIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ألارا</h1>
              <p className="text-xs text-indigo-600 font-medium -mt-1">تأسيس المعرفة</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            
            {currentUser ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 hidden sm:inline">
                   مرحباً، <span className="font-bold">{currentUser.name}</span>
                </span>
                
                {(currentUser.role === 'admin' || currentUser.role === 'owner') && (
                   <button 
                     onClick={onAdminDashboardClick}
                     className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors"
                   >
                     لوحة التحكم
                   </button>
                )}

                {currentUser.role === 'student' && (
                   <button 
                     onClick={onProfileClick}
                     className="text-gray-600 hover:text-indigo-600"
                     title="الملف الشخصي"
                   >
                     <UserCircle className="w-6 h-6" />
                   </button>
                )}

                <button 
                  onClick={onLogoutClick}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>دخول / تسجيل</span>
              </button>
            )}
            
            <div className="hidden md:flex items-center gap-2 border-r border-gray-200 pr-4 mr-2">
              <div className="text-left">
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Powered By</p>
                <p className="text-xs font-bold text-gray-800">Black Pharaohs Code</p>
              </div>
              <Code2 className="w-6 h-6 text-gray-800" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};