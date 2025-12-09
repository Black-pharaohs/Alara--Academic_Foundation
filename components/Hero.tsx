import React from 'react';
import { ArrowLeft, Brain, Target, ShieldCheck } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="relative overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 min-h-[calc(100vh-64px)] flex flex-col justify-center">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-right">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline">اكتشف تخصصك الجامعي</span>{' '}
                <span className="block text-indigo-600 xl:inline">بذكاء ودقة</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                نستخدم خوارزميات الذكاء الاصطناعي المتقدمة لتحليل مهاراتك واهتماماتك، لنقدم لك توصيات مدروسة لمسارك الأكاديمي والمهني المستقبلي.
              </p>
              
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 text-center sm:text-right">
                 <div className="flex items-center gap-2 text-gray-600">
                    <Brain className="w-5 h-5 text-indigo-500" />
                    <span>تحليل الشخصية</span>
                 </div>
                 <div className="flex items-center gap-2 text-gray-600">
                    <Target className="w-5 h-5 text-indigo-500" />
                    <span>توافق المسار</span>
                 </div>
                 <div className="flex items-center gap-2 text-gray-600">
                    <ShieldCheck className="w-5 h-5 text-indigo-500" />
                    <span>خصوصية تامة</span>
                 </div>
              </div>

              <div className="mt-10 sm:mt-12 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <button
                    onClick={onStart}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-all transform hover:scale-105"
                  >
                    ابدأ التقييم الآن
                    <ArrowLeft className="mr-2 w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:left-0 lg:w-1/2 bg-indigo-50 flex items-center justify-center">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full opacity-90"
          src="https://picsum.photos/800/1200"
          alt="Students studying"
        />
        <div className="absolute inset-0 bg-indigo-900 mix-blend-multiply opacity-20"></div>
      </div>
    </div>
  );
};