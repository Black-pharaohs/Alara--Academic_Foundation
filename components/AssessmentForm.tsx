
import React, { useState } from 'react';
import { Check, User, BookOpen, Lightbulb, Briefcase, Mail, Phone, MapPin, School, AlertCircle } from 'lucide-react';
import { UserProfile, ACADEMIC_SUBJECTS, INTERESTS, SOFT_SKILLS } from '../types';

interface AssessmentFormProps {
  data: UserProfile;
  onChange: (updates: Partial<UserProfile>) => void;
  onSubmit: () => void;
}

const StepIndicator: React.FC<{ current: number; total: number }> = ({ current, total }) => {
  return (
    <div className="flex items-center justify-center mb-8 w-full">
      {Array.from({ length: total }).map((_, idx) => (
        <React.Fragment key={idx}>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
            idx + 1 <= current 
              ? 'bg-indigo-600 border-indigo-600 text-white' 
              : 'bg-white border-gray-300 text-gray-400'
          }`}>
            {idx + 1 < current ? <Check className="w-6 h-6" /> : <span>{idx + 1}</span>}
          </div>
          {idx < total - 1 && (
            <div className={`h-1 w-12 mx-2 transition-colors duration-300 ${
              idx + 1 < current ? 'bg-indigo-600' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const ToggleButton: React.FC<{ 
  label: string; 
  selected: boolean; 
  onClick: () => void; 
}> = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
      selected 
        ? 'bg-indigo-100 border-indigo-500 text-indigo-700 shadow-sm' 
        : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-gray-50'
    }`}
  >
    {label}
  </button>
);

const InputField: React.FC<{
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
  error?: string;
}> = ({ label, icon, value, onChange, placeholder, type = "text", readOnly = false, error }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
        {icon}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-right transition-shadow ${
          readOnly ? 'bg-gray-100 text-gray-500' : ''
        } ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
      />
    </div>
    {error && (
      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {error}
      </p>
    )}
  </div>
);

export const AssessmentForm: React.FC<AssessmentFormProps> = ({ data, onChange, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const totalSteps = 4;

  const validateStep1 = () => {
    const newErrors: {[key: string]: string} = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Regex for typical mobile numbers (e.g., 10 digits starting with 05 in SA/SD or similar)
    // Making it generic: starts with 0, 9-14 digits
    const phoneRegex = /^0\d{8,14}$/;

    if (!data.name || data.name.length < 3) newErrors.name = "الاسم يجب أن يكون 3 أحرف على الأقل";
    if (!data.email || !emailRegex.test(data.email)) newErrors.email = "يرجى إدخال بريد إلكتروني صحيح";
    if (!data.phone || !phoneRegex.test(data.phone)) newErrors.phone = "يرجى إدخال رقم هاتف صحيح (يبدأ بـ 0)";
    if (!data.schoolName) newErrors.schoolName = "اسم المدرسة مطلوب";
    if (!data.address) newErrors.address = "العنوان مطلوب";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!validateStep1()) return;
    }
    
    if (step < totalSteps) setStep(step + 1);
    else onSubmit();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleSelection = (field: keyof UserProfile, value: string) => {
    const currentList = data[field] as string[];
    if (currentList.includes(value)) {
      onChange({ [field]: currentList.filter(item => item !== value) });
    } else {
      onChange({ [field]: [...currentList, value] });
    }
  };

  const isNextDisabled = () => {
    switch (step) {
      case 2: return data.academicStrengths.length === 0;
      case 3: return data.interests.length === 0;
      case 4: return !data.workPreference || !data.environmentPreference;
      default: return false;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <StepIndicator current={step} total={totalSteps} />

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden min-h-[500px] flex flex-col">
        <div className="p-8 flex-grow">
          {/* Step 1: Registration / Basics */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center mb-8">
                <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">بيانات الطالب</h2>
                <p className="text-gray-500 mt-2">يرجى تأكيد البيانات التالية لبدء عملية التحليل</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <InputField 
                    label="الاسم الرباعي" 
                    icon={<User className="w-5 h-5" />}
                    value={data.name} 
                    onChange={(v) => {
                      onChange({ name: v });
                      if (errors.name) setErrors({...errors, name: ''});
                    }}
                    placeholder="مثال: أحمد محمد علي..."
                    error={errors.name}
                  />
                </div>
                
                <InputField 
                  label="رقم الهاتف" 
                  icon={<Phone className="w-5 h-5" />}
                  value={data.phone} 
                  onChange={(v) => {
                    onChange({ phone: v });
                    if (errors.phone) setErrors({...errors, phone: ''});
                  }}
                  placeholder="05xxxxxxxx"
                  type="tel"
                  error={errors.phone}
                />

                <InputField 
                  label="البريد الإلكتروني" 
                  icon={<Mail className="w-5 h-5" />}
                  value={data.email} 
                  onChange={(v) => {
                    onChange({ email: v });
                    if (errors.email) setErrors({...errors, email: ''});
                  }}
                  placeholder="name@example.com"
                  type="email"
                  readOnly={!!data.userId}
                  error={errors.email}
                />

                <InputField 
                  label="اسم المدرسة" 
                  icon={<School className="w-5 h-5" />}
                  value={data.schoolName} 
                  onChange={(v) => {
                    onChange({ schoolName: v });
                    if (errors.schoolName) setErrors({...errors, schoolName: ''});
                  }}
                  placeholder="اسم المدرسة الثانوية..."
                  error={errors.schoolName}
                />

                <InputField 
                  label="العنوان (المدينة/الحي)" 
                  icon={<MapPin className="w-5 h-5" />}
                  value={data.address} 
                  onChange={(v) => {
                    onChange({ address: v });
                    if (errors.address) setErrors({...errors, address: ''});
                  }}
                  placeholder="الرياض - حي الملز..."
                  error={errors.address}
                />
              </div>
            </div>
          )}

          {/* Step 2: Academics */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">نقاط القوة الأكاديمية</h2>
                <p className="text-gray-500 mt-2">ما هي المواد الدراسية التي تستمتع بها وتتفوق فيها؟</p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                {ACADEMIC_SUBJECTS.map((subject) => (
                  <ToggleButton
                    key={subject}
                    label={subject}
                    selected={data.academicStrengths.includes(subject)}
                    onClick={() => toggleSelection('academicStrengths', subject)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Interests & Skills */}
          {step === 3 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <Lightbulb className="w-6 h-6 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">الاهتمامات والمهارات</h2>
                <p className="text-gray-500 mt-2">ماذا تحب أن تفعل وكيف تتفاعل مع العالم؟</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">اهتماماتك</h3>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((item) => (
                    <ToggleButton
                      key={item}
                      label={item}
                      selected={data.interests.includes(item)}
                      onClick={() => toggleSelection('interests', item)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">مهاراتك الشخصية</h3>
                <div className="flex flex-wrap gap-2">
                  {SOFT_SKILLS.map((item) => (
                    <ToggleButton
                      key={item}
                      label={item}
                      selected={data.softSkills.includes(item)}
                      onClick={() => toggleSelection('softSkills', item)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Work Style */}
          {step === 4 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">بيئة العمل المفضلة</h2>
                <p className="text-gray-500 mt-2">كيف تتخيل يومك الوظيفي في المستقبل؟</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">تفضيل العمل الجماعي</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { val: 'team', label: 'ضمن فريق' },
                    { val: 'solo', label: 'عمل فردي' },
                    { val: 'mixed', label: 'مختلط' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => onChange({ workPreference: opt.val as any })}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        data.workPreference === opt.val
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">مكان العمل</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                   {[
                    { val: 'office', label: 'مكتبي' },
                    { val: 'field', label: 'ميداني' },
                    { val: 'lab', label: 'مختبر/بحثي' },
                    { val: 'remote', label: 'عن بعد' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => onChange({ environmentPreference: opt.val as any })}
                      className={`p-3 rounded-lg border text-sm transition-all ${
                        data.environmentPreference === opt.val
                          ? 'bg-green-50 border-green-500 text-green-700 font-medium'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-gray-50 px-8 py-5 flex justify-between items-center border-t border-gray-100">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`px-6 py-2 rounded-lg text-sm font-medium ${
              step === 1 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            السابق
          </button>
          
          <button
            onClick={handleNext}
            disabled={isNextDisabled()}
            className={`px-8 py-3 rounded-lg text-sm font-bold text-white shadow-md transition-all ${
              isNextDisabled()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 transform hover:translate-y-[-1px]'
            }`}
          >
            {step === totalSteps ? 'إنهاء وتحليل' : 'التالي'}
          </button>
        </div>
      </div>
    </div>
  );
};
