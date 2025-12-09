import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AssessmentForm } from './components/AssessmentForm';
import { ResultsDashboard } from './components/ResultsDashboard';
import { UserProfile, MajorRecommendation } from './types';
import { generateRecommendations } from './services/gemini';
import { Loader2 } from 'lucide-react';

// Initial empty state
const initialUserProfile: UserProfile = {
  name: '',
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
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans" dir="rtl">
      <Header />
      
      <main>
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

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} مساري - جميع الحقوق محفوظة. تم التطوير باستخدام تقنيات الذكاء الاصطناعي بواسطة شركة Black Pharaohs Code.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;