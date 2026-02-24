import { UserProfile, MajorRecommendation } from '../types';
import { executeRun, runQuery } from './db';

// For centralized mode, call backend API. Otherwise use local db.
const API_BASE = process.env.NODE_ENV === 'development' ? 'http://localhost:4000/api' : '/api';

// Fallback logic handled within db.ts (persisting SQLite binary to localstorage) if API unreachable

export interface Submission {
  id: string;
  date: string;
  profile: UserProfile;
  topMajor: string;
  matchScore: number;
}

export const saveSubmission = async (profile: UserProfile, recommendations: MajorRecommendation[]) => {
  const id = Date.now().toString();
  const date = new Date().toISOString();
  const topMajor = recommendations[0]?.title || 'غير محدد';
  const matchScore = recommendations[0]?.matchScore || 0;

  // Try central API first
  try {
    const res = await fetch(`${API_BASE}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        user_id: profile.userId || null,
        date,
        student_name: profile.name,
        email: profile.email,
        phone: profile.phone,
        school_name: profile.schoolName,
        address: profile.address,
        academic_strengths: JSON.stringify(profile.academicStrengths),
        interests: JSON.stringify(profile.interests),
        soft_skills: JSON.stringify(profile.softSkills),
        work_preference: profile.workPreference,
        env_preference: profile.environmentPreference,
        top_major: topMajor,
        match_score: matchScore
      })
    });
    if (!res.ok) throw new Error('API error');
    console.log('✓ Submission sent to central API');
    return;
  } catch (err) {
    console.warn('Central API unavailable, saving locally:', err);
  }

  // fallback: local database
  try {
    await executeRun(`
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

    console.log('✓ Submission saved successfully to SQLite (fallback)');
  } catch (error) {
    console.error('✗ Failed to save submission locally as fallback:', error);
    throw error;
  }
};

export const getSubmissions = async (): Promise<Submission[]> => {
  // try central API
  try {
    const res = await fetch(`${API_BASE}/submissions`);
    if (res.ok) {
      return await res.json() as Submission[];
    }
    throw new Error('API error');
  } catch (err) {
    console.warn('Central API unavailable, querying local DB:', err);
  }

  // fallback local
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
    console.error('Failed to load submissions locally:', error);
    return [];
  }
};

export const clearSubmissions = async () => {
  // try central server
  try {
    const res = await fetch(`${API_BASE}/submissions`, { method: 'DELETE' });
    if (res.ok) {
      console.log('✓ central submissions cleared');
      return;
    }
    throw new Error('API error');
  } catch (err) {
    console.warn('central API unavailable, deleting locally:', err);
  }

  try {
    await executeRun(`DELETE FROM submissions`);
    console.log('✓ All submissions cleared (local)');
  } catch (error) {
    console.error('✗ Failed to clear submissions locally:', error);
    throw error;
  }
};
