
import React, { useState, useEffect } from 'react';
import { Shield, FileSpreadsheet, Trash2, Search, User, Lock, Users, LogOut, Settings } from 'lucide-react';
import { getSubmissions, clearSubmissions, Submission } from '../services/storage';
import { updateProfile, createAdmin, getAllAdmins } from '../services/auth';
import { AuthUser } from '../types';
import * as XLSX from 'xlsx';

interface AdminDashboardProps {
  currentUser: AuthUser;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'students' | 'profile' | 'admins'>('students');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Profile Form
  const [profileForm, setProfileForm] = useState({ name: currentUser.name, password: '' });
  
  // New Admin Form
  const [newAdminForm, setNewAdminForm] = useState({ name: '', username: '', password: '' });

  useEffect(() => {
    (async () => {
      const subs = await getSubmissions();
      setSubmissions(subs);
    })();
    if (currentUser.role === 'owner') {
      setAdminsList(getAllAdmins(currentUser));
    }
  }, [currentUser]);

  const showMsg = (text: string, type: 'success' | 'error') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const handleExport = () => {
    const dataToExport = submissions.map(sub => ({
      'تاريخ التسجيل': new Date(sub.date).toLocaleDateString('ar-EG'),
      'الاسم': sub.profile.name,
      'رقم الهاتف': sub.profile.phone,
      'البريد الإلكتروني': sub.profile.email,
      'المدرسة': sub.profile.schoolName,
      'العنوان': sub.profile.address,
      'التخصص المقترح': sub.topMajor,
      'نسبة التوافق': `${sub.matchScore}%`,
      'بيئة العمل المفضلة': sub.profile.environmentPreference,
      'نقاط القوة': sub.profile.academicStrengths.join(', ')
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    
    const wscols = [
      {wch: 15}, {wch: 20}, {wch: 15}, {wch: 25}, {wch: 20}, 
      {wch: 20}, {wch: 20}, {wch: 10}, {wch: 15}, {wch: 30}
    ];
    ws['!cols'] = wscols;

    XLSX.writeFile(wb, `Masari_Students_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
  };

  const handleDeleteAll = async () => {
    if (window.confirm('هل أنت متأكد من حذف جميع بيانات الطلاب؟ لا يمكن التراجع عن هذا الإجراء.')) {
      await clearSubmissions();
      setSubmissions([]);
      showMsg('تم حذف جميع السجلات بنجاح', 'success');
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      updateProfile(currentUser.id, {
        name: profileForm.name,
        password: profileForm.password || undefined
      });
      showMsg('تم تحديث البيانات بنجاح', 'success');
      setProfileForm(prev => ({ ...prev, password: '' }));
    } catch (err: any) {
      showMsg(err.message, 'error');
    }
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      createAdmin(currentUser, newAdminForm);
      setAdminsList(getAllAdmins(currentUser));
      setNewAdminForm({ name: '', username: '', password: '' });
      showMsg('تم إضافة المسؤول الجديد بنجاح', 'success');
    } catch (err: any) {
      showMsg(err.message, 'error');
    }
  };

  const filteredSubmissions = submissions.filter(sub => 
    sub.profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.profile.phone.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
           <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-lg">لوحة التحكم</span>
           </div>
           <div className="text-xs text-slate-400">
             مرحباً، {currentUser.name}
             <br/>
             <span className="text-indigo-400 uppercase">{currentUser.role === 'owner' ? 'المالك' : 'مسؤول'}</span>
           </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('students')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'students' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50'}`}
          >
            <Users className="w-5 h-5" />
            <span>الطلاب</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50'}`}
          >
            <User className="w-5 h-5" />
            <span>ملفي الشخصي</span>
          </button>

          {currentUser.role === 'owner' && (
            <button 
              onClick={() => setActiveTab('admins')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'admins' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50'}`}
            >
              <Settings className="w-5 h-5" />
              <span>إدارة المسؤولين</span>
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {msg.text && (
          <div className={`mb-6 p-4 rounded-lg border ${msg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {msg.text}
          </div>
        )}

        {/* Tab: Students */}
        {activeTab === 'students' && (
          <div className="animate-fadeIn space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">سجل الطلاب المسجلين</h1>
              <div className="flex gap-2">
                <button 
                  onClick={handleExport}
                  disabled={submissions.length === 0}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  تصدير Excel
                </button>
                <button 
                  onClick={handleDeleteAll}
                  disabled={submissions.length === 0}
                  className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-100 disabled:opacity-50 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  حذف الكل
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-4">
                <div className="relative flex-grow max-w-md">
                  <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="بحث..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-9 pl-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                    <tr>
                      <th className="px-6 py-3">الطالب</th>
                      <th className="px-6 py-3">الاتصال</th>
                      <th className="px-6 py-3">التخصص المقترح</th>
                      <th className="px-6 py-3">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{sub.profile.name}</div>
                          <div className="text-xs text-gray-500">{sub.profile.schoolName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">{sub.profile.phone}</div>
                          <div className="text-xs text-gray-500">{sub.profile.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full font-bold">
                             {sub.topMajor} ({sub.matchScore}%)
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(sub.date).toLocaleDateString('ar-EG')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Profile */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl animate-fadeIn">
             <h1 className="text-2xl font-bold text-gray-900 mb-6">تحديث البيانات الشخصية</h1>
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
               <form onSubmit={handleUpdateProfile} className="space-y-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                   <input
                     type="text"
                     required
                     value={profileForm.name}
                     onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                     className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الجديدة</label>
                   <div className="relative">
                     <Lock className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                     <input
                       type="password"
                       placeholder="اتركها فارغة إذا لم ترد التغيير"
                       value={profileForm.password}
                       onChange={e => setProfileForm({...profileForm, password: e.target.value})}
                       className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500"
                     />
                   </div>
                   <p className="text-xs text-gray-500 mt-1">يجب أن تكون 6 أحرف على الأقل</p>
                 </div>
                 <button
                    type="submit"
                    className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                 >
                   حفظ التغييرات
                 </button>
               </form>
             </div>
          </div>
        )}

        {/* Tab: Admins (Owner Only) */}
        {activeTab === 'admins' && currentUser.role === 'owner' && (
          <div className="animate-fadeIn space-y-8">
             <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">إضافة مسؤول جديد</h1>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-3xl">
                  <form onSubmit={handleAddAdmin} className="grid md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">اسم المسؤول</label>
                        <input
                          type="text"
                          required
                          value={newAdminForm.name}
                          onChange={e => setNewAdminForm({...newAdminForm, name: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
                        <input
                          type="text"
                          required
                          value={newAdminForm.username}
                          onChange={e => setNewAdminForm({...newAdminForm, username: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg ltr:text-right"
                        />
                     </div>
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                        <input
                          type="password"
                          required
                          value={newAdminForm.password}
                          onChange={e => setNewAdminForm({...newAdminForm, password: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                     </div>
                     <div>
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          إضافة المسؤول
                        </button>
                     </div>
                  </form>
                </div>
             </div>

             <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">قائمة المسؤولين الحاليين</h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-3xl">
                   <table className="w-full text-right">
                      <thead className="bg-gray-50 text-gray-500 text-sm">
                        <tr>
                          <th className="px-6 py-3">الاسم</th>
                          <th className="px-6 py-3">اسم المستخدم</th>
                          <th className="px-6 py-3">تاريخ الإضافة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {adminsList.map(admin => (
                          <tr key={admin.id}>
                            <td className="px-6 py-4">{admin.name}</td>
                            <td className="px-6 py-4 font-mono text-sm">{admin.username}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(admin.createdAt).toLocaleDateString('ar-EG')}
                            </td>
                          </tr>
                        ))}
                        {adminsList.length === 0 && (
                          <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">لا يوجد مسؤولين إضافيين</td></tr>
                        )}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};
