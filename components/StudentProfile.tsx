
import React, { useEffect, useState } from 'react';
import { AuthUser } from '../types';
import { getSubmissions, Submission } from '../services/storage';
import { User, Calendar, BookOpen, MapPin, Phone, Mail } from 'lucide-react';

interface StudentProfileProps {
  user: AuthUser;
  onBack: () => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ user, onBack }) => {
  const [history, setHistory] = useState<Submission[]>([]);

  useEffect(() => {
    // Filter submissions for this student (matched by name/email in local storage simulation)
    // In a real app, this would query by userId
    const all = getSubmissions();
    const mySubmissions = all.filter(
      s => (s.profile.userId === user.id) || (s.profile.email === user.username)
    );
    setHistory(mySubmissions);
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">الملف الشخصي للطالب</h2>
        <button onClick={onBack} className="text-gray-500 hover:text-indigo-600">
          العودة للرئيسية
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="bg-indigo-600 h-32 relative">
          <div className="absolute -bottom-10 right-8">
             <div className="w-24 h-24 bg-white rounded-full p-2 shadow-lg">
                <div className="w-full h-full bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-indigo-600" />
                </div>
             </div>
          </div>
        </div>
        <div className="pt-12 px-8 pb-8">
          <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
          <p className="text-indigo-600 font-medium">طالب</p>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-5 h-5 text-gray-400" />
                <span>{user.username}</span>
             </div>
             {user.username.includes('@') === false && (
               <div className="flex items-center gap-3 text-gray-600">
                  <User className="w-5 h-5 text-gray-400" />
                  <span>اسم المستخدم: {user.username}</span>
               </div>
             )}
             <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span>تاريخ التسجيل: {new Date(user.createdAt).toLocaleDateString('ar-EG')}</span>
             </div>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-4">سجل التقييمات السابقة</h3>
      <div className="space-y-4">
        {history.length > 0 ? (
          history.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-300 transition-colors">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                   <div className="flex items-center gap-2 mb-2">
                      <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full font-bold">
                        {item.matchScore}% توافق
                      </span>
                      <span className="text-gray-400 text-sm">
                        {new Date(item.date).toLocaleDateString('ar-EG')}
                      </span>
                   </div>
                   <h4 className="text-lg font-bold text-gray-900">{item.topMajor}</h4>
                   <p className="text-gray-500 text-sm mt-1">
                     بناءً على: {item.profile.academicStrengths.join('، ')}
                   </p>
                </div>
                {/* Future: Add 'View Details' button to reload results */}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">لم تقم بإجراء أي تقييمات حتى الآن</p>
            <button 
              onClick={onBack}
              className="mt-4 text-indigo-600 font-bold hover:underline"
            >
              ابدأ التقييم الأول
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
