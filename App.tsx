import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AssessmentForm } from './components/AssessmentForm';
import { ResultsDashboard } from './components/ResultsDashboard';
import { UserProfile, MajorRecommendation } from './types';
import { generateRecommendations } from './services/gemini';
import { Loader2, Code2, MapPin, Mail, Globe } from 'lucide-react';

// Initial empty state
const initialUserProfile: UserProfile = {
  name: '',
  email: '',
  phone: '',
  address: '',
  schoolName: '',
  academicStrengths: [],
  interests: [],
  softSkills: [],
  workPreference: '',
  environmentPreference: ''
};

function App() {
  const [view, setView] = useState<'hero' | 'assessment' | 'loading' | 'results'>('hero');
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
  const [recommendations, setRecommendations] = useState<MajorRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => {
    setView('assessment');
    window.scrollTo(0, 0);
  };

  const handleProfileUpdate = useCallback((updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  }, []);

  const handleSubmitAssessment = async () => {
    setView('loading');
    setError(null);
    try {
      const results = await generateRecommendations(userProfile);
      setRecommendations(results);
      setView('results');
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء تحليل البيانات. يرجى المحاولة مرة أخرى.");
      setView('assessment'); // Go back to assessment on error so they don't lose data
    }
  };

  const handleRestart = () => {
    setUserProfile(initialUserProfile);
    setRecommendations([]);
    setView('hero');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col" dir="rtl">
      <Header />
      
      <main className="flex-grow">
        {view === 'hero' && (
          <Hero onStart={handleStart} />
        )}

        {view === 'assessment' && (
          <div className="animate-fadeIn">
            <AssessmentForm 
              data={userProfile} 
              onChange={handleProfileUpdate} 
              onSubmit={handleSubmitAssessment} 
            />
            {error && (
              <div className="max-w-md mx-auto mt-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-center">
                {error}
              </div>
            )}
          </div>
        )}

        {view === 'loading' && (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-gray-800">جاري تحليل بياناتك...</h2>
            <p className="text-gray-500 mt-2">يقوم الذكاء الاصطناعي بدراسة ملفك لمطابقة أفضل التخصصات</p>
            
            <div className="mt-8 max-w-sm w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-200 overflow-hidden">
              <div className="bg-indigo-600 h-2.5 rounded-full animate-[loading_2s_ease-in-out_infinite] w-[50%]"></div>
            </div>
            <style>{`
              @keyframes loading {
                0% { transform: translateX(150%); }
                100% { transform: translateX(-150%); }
              }
            `}</style>
          </div>
        )}

        {view === 'results' && (
          <div className="animate-fadeIn">
            <ResultsDashboard 
              user={userProfile} 
              recommendations={recommendations} 
              onRestart={handleRestart}
            />
          </div>
        )}
      </main>

      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Company Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-600 rounded-lg">
                  <Code2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Black Pharaohs Code</h3>
                  <p className="text-sm text-indigo-400 font-medium">شركة بلاك فاروز كود البرمجية</p>
                </div>
              </div>
              <p className="text-base leading-relaxed max-w-md text-slate-400">
                شركة برمجية رائدة متخصصة في تطوير الحلول التقنية المبتكرة والأنظمة التعليمية الذكية. 
                نحن نؤمن بقوة التكنولوجيا في رسم مستقبل أفضل للطلاب وتمكينهم من تحقيق أهدافهم الأكاديمية والمهنية.
              </p>
            </div>

            {/* Contact / Links */}
            <div className="md:border-r md:border-slate-800 md:pr-12 space-y-6">
              <h4 className="text-lg font-bold text-white">تواصل معنا</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-indigo-500" />
                  <span>الخرطوم، السودان - المقر الرئيسي</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-indigo-500" />
                  <span>contact@blackpharaohs.code</span>
                </li>
                <li className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-indigo-500" />
                  <span>www.blackpharaohs-code.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} مساري - جميع الحقوق محفوظة لشركة Black Pharaohs Code.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;