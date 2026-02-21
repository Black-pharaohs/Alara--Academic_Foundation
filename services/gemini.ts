import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, MajorRecommendation } from "../types";

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";

if (!apiKey) {
  console.warn("⚠️  تحذير: لم يتم العثور على GEMINI_API_KEY في متغيرات البيئة");
}

const ai = new GoogleGenAI({ apiKey });

export const generateRecommendations = async (profile: UserProfile): Promise<MajorRecommendation[]> => {
  // Validation
  if (!apiKey) {
    throw new Error("خطأ: لم يتم تكوين مفتاح API لـ Gemini. يرجى إضافة GEMINI_API_KEY في ملف .env");
  }

  if (!profile.name || !profile.academicStrengths.length) {
    throw new Error("خطأ: يجب ملء جميع الحقول المطلوبة قبل الإرسال");
  }

  const model = "gemini-2.5-flash";

  const systemInstruction = `
    أنت مستشار أكاديمي خبير وموجه مهني. مهمتك هي تحليل ملف الطالب واقتراح أفضل 5 تخصصات جامعية مناسبة له.
    قم بالتحليل بناءً على نقاط القوة الأكاديمية، والاهتمامات، والمهارات الشخصية، وتفضيلات بيئة العمل.
    يجب أن تكون التوصيات واقعية ومبنية على التوافق النفسي والعملي.
    قم بتوفير التفاصيل باللغة العربية الفصحى السهلة والمشجعة.
    بالنسبة لكل تخصص، اقترح 3 جامعات متميزة في تدريس هذا المجال، مع التركيز على الجامعات في المملكة العربية السعودية والمنطقة العربية بشكل أساسي.
  `;

  const prompt = `
    تحليل ملف الطالب التالي:
    - الاسم: ${profile.name}
    - نقاط القوة الأكاديمية: ${profile.academicStrengths.join(', ')}
    - الاهتمامات: ${profile.interests.join(', ')}
    - المهارات الشخصية: ${profile.softSkills.join(', ')}
    - تفضيل العمل: ${profile.workPreference === 'team' ? 'ضمن فريق' : profile.workPreference === 'solo' ? 'فردي' : 'مختلط'}
    - بيئة العمل المفضلة: ${profile.environmentPreference}
    - المنطقة/العنوان: ${profile.address}

    قدم 5 توصيات لتخصصات جامعية، واذكر أفضل الجامعات لدراستها.
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
              },
              topUniversities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "اسم الجامعة" },
                    location: { type: Type.STRING, description: "المدينة/الدولة" },
                    type: { type: Type.STRING, description: "نوع الجامعة (حكومية/خاصة)" }
                  }
                },
                description: "قائمة بأفضل 5 جامعات لدراسة هذا التخصص في المنطقة"
              }
            },
            required: ["id", "title", "matchScore", "description", "reasoning", "careerPaths", "requiredSkills", "curriculumHighlights", "topUniversities"]
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("لم يتم استلام بيانات صالحة من النموذج (response.text is empty)");
    }

    const recommendations = JSON.parse(response.text) as MajorRecommendation[];
    
    if (!Array.isArray(recommendations) || recommendations.length === 0) {
      throw new Error("لم يتم الحصول على توصيات صالحة من النموذج");
    }

    return recommendations;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    const errorMessage = error.message || "حدث خطأ غير متوقع أثناء معالجة البيانات";
    
    if (error.message?.includes("API key")) {
      throw new Error("خطأ في مفتاح API. يرجى التحقق من صحة GEMINI_API_KEY");
    }
    
    if (error.message?.includes("UNAUTHENTICATED")) {
      throw new Error("فشل المصادقة. تأكد من أن مفتاح API صحيح وفعال");
    }
    
    throw new Error(errorMessage);
  }
};