
import React, { useEffect, useState } from 'react';
import { AuthUser } from '../types';
import { getSubmissions, Submission } from '../services/storage';
import { updateProfile } from '../services/auth';
import { User, Calendar, BookOpen, Mail, Edit2, Save, X, Phone, Lock } from 'lucide-react';

interface StudentProfileProps {
  user: AuthUser;
  onBack: () => void;
  onUpdate: (user: AuthUser) => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ user, onBack, onUpdate }) => {
  const [history, setHistory] = useState<Submission[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone || '',
    password: ''
  });
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    (async () => {
      const all = await getSubmissions();
      const mySubmissions = all.filter(
        s => (s.profile.userId === user.id) || (s.profile.email === user.username)
      );
      setHistory(mySubmissions);
    })();
  }, [user]);

  // Reset form when entering edit mode or when user changes
  useEffect(() => {
    setFormData({
      name: user.name,
      phone: user.phone || '',
      password: ''
    });
    setMsg({ text: '', type: '' });
  }, [user, isEditing]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedUser = updateProfile(user.id, {
        name: formData.name,
        phone: formData.phone,
        password: formData.password || undefined
      });
      onUpdate(updatedUser);
      setIsEditing(false);
      setMsg({ text: 'تم تحديث البيانات بنجاح', type: 'success' });
      setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    } catch (err: any) {
      setMsg({ text: err.message, type: 'error' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">الملف الشخصي للطالب</h2>
        <button onClick={onBack} className="text-gray-500 hover:text-indigo-600">
          العودة للرئيسية
        </button>
      </div>

      {msg.text && (
        <div className={`mb-6 p-4 rounded-lg border ${msg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {msg.text}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="bg-indigo-600 h-32 relative">
          <div className="absolute -bottom-10 right-8">
             <div className="w-24 h-24 bg-white rounded-full p-2 shadow-lg">
                <div className="w-full h-full bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-indigo-600" />
                </div>
             </div>
          </div>
          <div className="absolute top-4 left-4">
             <button 
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
             >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4" />
                    <span>إلغاء</span>
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" />
                    <span>تعديل البيانات</span>
                  </>
                )}
             </button>
          </div>
        </div>
        
        <div className="pt-12 px-8 pb-8">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4 max-w-lg">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                 <div className="relative">
                   <User className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                   <input
                     type="text"
                     value={formData.name}
                     onChange={e => setFormData({...formData, name: e.target.value})}
                     className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                     required
                   />
                 </div>
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                 <div className="relative">
                   <Phone className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                   <input
                     type="tel"
                     value={formData.phone}
                     onChange={e => setFormData({...formData, phone: e.target.value})}
                     className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                    كلمة المرور الجديدة 
                    <span className="text-xs font-normal text-gray-500 mr-1">(اتركها فارغة إذا لم ترد التغيير)</span>
                 </label>
                 <div className="relative">
                   <Lock className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                   <input
                     type="password"
                     value={formData.password}
                     onChange={e => setFormData({...formData, password: e.target.value})}
                     className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                     minLength={6}
                   />
                 </div>
               </div>

               <button
                 type="submit"
                 className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
               >
                 <Save className="w-4 h-4" />
                 <span>حفظ التغييرات</span>
               </button>
            </form>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
              <p className="text-indigo-600 font-medium">طالب</p>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span>{user.username}</span>
                </div>
                {user.phone && (
                   <div className="flex items-center gap-3 text-gray-600">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span>{user.phone}</span>
                   </div>
                )}
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
            </>
          )}
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