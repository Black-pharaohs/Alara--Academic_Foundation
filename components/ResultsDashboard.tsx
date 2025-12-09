import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { MajorRecommendation, UserProfile } from '../types';
import { ChevronDown, ChevronUp, GraduationCap, Briefcase, Star, Info, LayoutDashboard } from 'lucide-react';

interface ResultsDashboardProps {
  user: UserProfile;
  recommendations: MajorRecommendation[];
  onRestart: () => void;
}

const MajorCard: React.FC<{ 
  rec: MajorRecommendation; 
  isExpanded: boolean; 
  onToggle: () => void; 
  rank: number 
}> = ({ rec, isExpanded, onToggle, rank }) => {
  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 border border-gray-100 ${isExpanded ? 'ring-2 ring-indigo-500' : ''}`}>
      <div 
        onClick={onToggle}
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-start"
      >
        <div className="flex items-start gap-4">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white shrink-0 ${
            rank === 1 ? 'bg-indigo-600' : rank === 2 ? 'bg-indigo-400' : 'bg-indigo-300'
          }`}>
            #{rank}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{rec.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{rec.description}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            <span className="font-bold">{rec.matchScore}%</span>
            <span>توافق</span>
          </div>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-6 pt-2 bg-gray-50 border-t border-gray-100 animate-fadeIn">
          <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <h4 className="flex items-center gap-2 font-bold text-indigo-900 mb-2">
              <Info className="w-4 h-4" />
              لماذا اخترنا هذا التخصص لك؟
            </h4>
            <p className="text-indigo-800 text-sm leading-relaxed">{rec.reasoning}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="flex items-center gap-2 font-bold text-gray-900 mb-3">
                <Briefcase className="w-4 h-4 text-gray-500" />
                المسارات الوظيفية
              </h4>
              <ul className="space-y-2">
                {rec.careerPaths.map((path, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    {path}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="flex items-center gap-2 font-bold text-gray-900 mb-3">
                <Star className="w-4 h-4 text-gray-500" />
                المهارات المطلوبة
              </h4>
              <div className="flex flex-wrap gap-2">
                {rec.requiredSkills.map((skill, idx) => (
                  <span key={idx} className="bg-white border border-gray-200 px-2 py-1 rounded text-xs text-gray-600">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="flex items-center gap-2 font-bold text-gray-900 mb-3">
              <GraduationCap className="w-4 h-4 text-gray-500" />
              أبرز مواد المنهج
            </h4>
            <div className="flex flex-wrap gap-2">
                {rec.curriculumHighlights.map((curr, idx) => (
                  <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                    {curr}
                  </span>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ComparisonSection: React.FC<{ recommendations: MajorRecommendation[] }> = ({ recommendations }) => {
  const [activeTab, setActiveTab] = useState<'careers' | 'skills' | 'curriculum'>('careers');

  const tabs = [
    { id: 'careers', label: 'المسارات الوظيفية', icon: Briefcase, color: 'text-indigo-500' },
    { id: 'skills', label: 'المهارات المطلوبة', icon: Star, color: 'text-amber-500' },
    { id: 'curriculum', label: 'أبرز المواد', icon: GraduationCap, color: 'text-blue-500' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-gray-100 pb-4 gap-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-indigo-600" />
          مقارنة التخصصات
        </h3>
        
        <div className="flex p-1 bg-gray-100 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : 'text-gray-400'}`} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {recommendations.slice(0, 5).map((rec, idx) => (
          <div key={rec.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex flex-col h-full hover:border-indigo-200 transition-colors">
            <div className="mb-3 pb-3 border-b border-gray-200">
              <div className="flex justify-between items-center mb-1">
                 <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                   idx === 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'
                 }`}>
                   #{idx + 1}
                 </span>
                 <span className="text-xs font-bold text-green-600">{rec.matchScore}%</span>
              </div>
              <h4 className="font-bold text-sm text-gray-900 h-10 flex items-center leading-tight">{rec.title}</h4>
            </div>

            <ul className="space-y-2 flex-grow">
              {activeTab === 'careers' && rec.careerPaths.slice(0,4).map((item, i) => (
                <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
              {activeTab === 'skills' && rec.requiredSkills.slice(0,5).map((item, i) => (
                <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
              {activeTab === 'curriculum' && rec.curriculumHighlights.slice(0,4).map((item, i) => (
                <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ user, recommendations, onRestart }) => {
  const [expandedId, setExpandedId] = useState<string | null>(recommendations[0]?.id || null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Prepare data for the chart
  const chartData = recommendations.map(rec => ({
    name: rec.title,
    match: rec.matchScore,
    fullMark: 100
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-12 animate-fadeIn">
        <h2 className="text-3xl font-extrabold text-gray-900">نتائج التحليل لـ {user.name}</h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          بناءً على ملفك الشخصي ونقاط قوتك، وجدنا أن التخصصات التالية هي الأنسب لك.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Col: Recommendations List */}
        <div className="lg:col-span-2 space-y-6 animate-slideUp">
          {recommendations.map((rec, index) => (
            <MajorCard 
              key={rec.id} 
              rec={rec} 
              rank={index + 1}
              isExpanded={expandedId === rec.id}
              onToggle={() => toggleExpand(rec.id)}
            />
          ))}
        </div>

        {/* Right Col: Stats & Summary */}
        <div className="space-y-8 animate-slideUp" style={{animationDelay: '0.1s'}}>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-bold text-gray-900 mb-4">مقارنة التوافق</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 10}} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="match" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-blue-800 rounded-xl shadow-lg p-6 text-white">
            <h3 className="font-bold text-xl mb-2">نصيحة إضافية</h3>
            <p className="text-indigo-100 text-sm leading-relaxed mb-4">
              تذكر أن اختيار التخصص هو الخطوة الأولى فقط. المهارات العملية مثل {user.softSkills.slice(0, 2).join(' و ')} ستكون داعماً قوياً لك في أي مجال تختاره.
            </p>
            <button 
              onClick={onRestart}
              className="w-full bg-white/10 hover:bg-white/20 border border-white/30 text-white font-medium py-2 rounded-lg transition-colors"
            >
              بدء تقييم جديد
            </button>
          </div>
        </div>
      </div>
      
      {/* Comparison Section */}
      <ComparisonSection recommendations={recommendations} />
    </div>
  );
};