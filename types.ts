
export type UserRole = 'student' | 'admin' | 'owner';

export interface AuthUser {
  id: string;
  username: string; // email for students, username for admins
  name: string;
  role: UserRole;
  createdAt: string;
  phone?: string;
}

export interface UserProfile {
  userId?: string; // Link to AuthUser if logged in
  name: string;
  email: string;
  phone: string;
  address: string;
  schoolName: string;
  academicStrengths: string[];
  interests: string[];
  softSkills: string[];
  workPreference: 'team' | 'solo' | 'mixed' | '';
  environmentPreference: 'office' | 'field' | 'remote' | 'lab' | '';
}

export interface UniversityRecommendation {
  name: string;
  location: string;
  type: string; // e.g. "حكومية", "خاصة"
}

export interface MajorRecommendation {
  id: string;
  title: string;
  matchScore: number;
  description: string;
  reasoning: string;
  careerPaths: string[];
  requiredSkills: string[];
  curriculumHighlights: string[];
  topUniversities?: UniversityRecommendation[];
}

export interface AssessmentStepProps {
  data: UserProfile;
  updateData: (updates: Partial<UserProfile>) => void;
  onNext: () => void;
  onBack: () => void;
  isLastStep?: boolean;
}

export const ACADEMIC_SUBJECTS = [
  'الرياضيات', 'الفيزياء', 'الكيمياء', 'الأحياء', 
  'اللغة العربية', 'اللغة الإنجليزية', 'التاريخ', 
  'الجغرافيا', 'علوم الحاسوب', 'الفنون', 'الدراسات الإسلامية'
];

export const INTERESTS = [
  'حل المشكلات', 'التصميم والرسم', 'الكتابة والقراءة', 
  'مساعدة الآخرين', 'التكنولوجيا والبرمجة', 'بناء الأشياء', 
  'تحليل البيانات', 'الطبيعة والبيئة', 'إدارة الأموال', 'القيادة', 'العمل الاجتماعي', 'الرياضة'
];

export const SOFT_SKILLS = [
  'التواصل الفعال', 'العمل الجماعي', 'التفكير النقدي', 
  'الإبداع', 'إدارة الوقت', 'المرونة', 
  'الذكاء العاطفي', 'اتخاذ القرار', 'التعلم الذاتي', 'القيادة', 'الاهتمام بالتفاصيل', 'القدرة على التكيف'
];