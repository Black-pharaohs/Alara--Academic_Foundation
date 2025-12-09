import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, MajorRecommendation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRecommendations = async (profile: UserProfile): Promise<MajorRecommendation[]> => {
  const model = "gemini-2.5-flash";

  const systemInstruction = `
    أنت مستشار أكاديمي خبير وموجه مهني. مهمتك هي تحليل ملف الطالب واقتراح أفضل 3 تخصصات جامعية مناسبة له.
    قم بالتحليل بناءً على نقاط القوة الأكاديمية، والاهتمامات، والمهارات الشخصية، وتفضيلات بيئة العمل.
    يجب أن تكون التوصيات واقعية ومبنية على التوافق النفسي والعملي.
    قم بتوفير التفاصيل باللغة العربية الفصحى السهلة والمشجعة.
  `;

  const prompt = `
    تحليل ملف الطالب التالي:
    - الاسم: ${profile.name}
    - نقاط القوة الأكاديمية: ${profile.academicStrengths.join(', ')}
    - الاهتمامات: ${profile.interests.join(', ')}
    - المهارات الشخصية: ${profile.softSkills.join(', ')}
    - تفضيل العمل: ${profile.workPreference === 'team' ? 'ضمن فريق' : profile.workPreference === 'solo' ? 'فردي' : 'مختلط'}
    - بيئة العمل المفضلة: ${profile.environmentPreference}

    قدم 5 توصيات لتخصصات جامعية.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING, description: "اسم التخصص الجامعي" },
              matchScore: { type: Type.NUMBER, description: "نسبة التوافق من 0 إلى 100" },
              description: { type: Type.STRING, description: "وصف موجز للتخصص" },
              reasoning: { type: Type.STRING, description: "لماذا هذا التخصص مناسب لهذا الطالب تحديداً" },
              careerPaths: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "3-4 مسميات وظيفية مستقبلية"
              },
              requiredSkills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "المهارات الأساسية المطلوبة للنجاح في هذا التخصص"
              },
              curriculumHighlights: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "أبرز المواد الدراسية في هذا التخصص"
              }
            },
            required: ["id", "title", "matchScore", "description", "reasoning", "careerPaths", "requiredSkills", "curriculumHighlights"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as MajorRecommendation[];
    }
    throw new Error("لم يتم استلام بيانات صالحة من النموذج");
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback or re-throw
    throw error;
  }
};