import { UserProfile, MajorRecommendation } from '../types';
import { executeRun, runQuery } from './db';

// Fallback logic handled within db.ts (persisting SQLite binary to localstorage)

export interface Submission {
  id: string;
  date: string;
  profile: UserProfile;
  topMajor: string;
  matchScore: number;
}

export const saveSubmission = (profile: UserProfile, recommendations: MajorRecommendation[]) => {
  try {
    const id = Date.now().toString();
    const date = new Date().toISOString();
    const topMajor = recommendations[0]?.title || 'غير محدد';
    const matchScore = recommendations[0]?.matchScore || 0;

    // Use SQLite Insert
    executeRun(`
      INSERT INTO submissions (
        id, user_id, date, student_name, email, phone, school_name, address,
        academic_strengths, interests, soft_skills, work_preference, env_preference,
        top_major, match_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      profile.userId || null,
      date,
      profile.name,
      profile.email,
      profile.phone,
      profile.schoolName,
      profile.address,
      JSON.stringify(profile.academicStrengths),
      JSON.stringify(profile.interests),
      JSON.stringify(profile.softSkills),
      profile.workPreference,
      profile.environmentPreference,
      topMajor,
      matchScore
    ]);

    console.log('Submission saved successfully to SQLite');
  } catch (error) {
    console.error('Failed to save submission:', error);
  }
};

export const getSubmissions = (): Submission[] => {
  try {
    const rows = runQuery(`SELECT * FROM submissions ORDER BY date DESC`);
    
    return rows.map((row: any) => ({
      id: row.id,
      date: row.date,
      topMajor: row.top_major,
      matchScore: row.match_score,
      profile: {
        userId: row.user_id,
        name: row.student_name,
        email: row.email,
        phone: row.phone,
        schoolName: row.school_name,
        address: row.address,
        academicStrengths: JSON.parse(row.academic_strengths || '[]'),
        interests: JSON.parse(row.interests || '[]'),
        softSkills: JSON.parse(row.soft_skills || '[]'),
        workPreference: row.work_preference,
        environmentPreference: row.env_preference
      }
    }));
  } catch (error) {
    console.error('Failed to load submissions:', error);
    return [];
  }
};

export const clearSubmissions = () => {
  executeRun(`DELETE FROM submissions`);
};
