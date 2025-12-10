import { UserProfile, MajorRecommendation } from '../types';

const STORAGE_KEY = 'masari_submissions';
const ADMIN_PASSWORD = 'admin'; // For demonstration purposes

export interface Submission {
  id: string;
  date: string;
  profile: UserProfile;
  topMajor: string;
  matchScore: number;
}

export const saveSubmission = (profile: UserProfile, recommendations: MajorRecommendation[]) => {
  try {
    const submissions = getSubmissions();
    const newSubmission: Submission = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      profile,
      topMajor: recommendations[0]?.title || 'غير محدد',
      matchScore: recommendations[0]?.matchScore || 0
    };
    
    submissions.push(newSubmission);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
    console.log('Submission saved successfully');
  } catch (error) {
    console.error('Failed to save submission:', error);
  }
};

export const getSubmissions = (): Submission[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load submissions:', error);
    return [];
  }
};

export const clearSubmissions = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const checkAdminPassword = (password: string): boolean => {
  return password === ADMIN_PASSWORD;
};