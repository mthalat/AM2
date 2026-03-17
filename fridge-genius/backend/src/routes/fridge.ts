import { Router, type IRouter } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY ?? "");
const visionModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const textModel   = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const router: IRouter = Router();

/* ── /scan ── */
router.post("/scan", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      res.status(400).json({ error: "Image is required" });
      return;
    }

    const dataUrlMatch = image.match(/^data:(.+);base64,(.+)$/);
    const mimeType  = dataUrlMatch ? dataUrlMatch[1] : "image/jpeg";
    const base64Data = dataUrlMatch ? dataUrlMatch[2] : image;

    const result = await visionModel.generateContent([
      {
        inlineData: { data: base64Data, mimeType },
      },
      `أنت خبير في التعرف على مكونات الطعام. افحص الصورة وأخرج قائمة بجميع المكونات الغذائية التي تراها (خضروات، فواكه، لحوم، صوصات، توابل، منتجات ألبان، إلخ).

أعد الرد ONLY كـ JSON بالشكل التالي بدون أي شيء آخر:
{
  "ingredients": ["مكون1", "مكون2", "مكون3"]
}

استخدم أسماء المكونات باللغة العربية. إذا لم تجد مكونات طعام، أعد قائمة فارغة.`,
    ]);

    const content = result.response.text() ?? "{}";

    let parsed: { ingredients?: string[] };
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { ingredients: [] };
    } catch {
      parsed = { ingredients: [] };
    }

    res.json({ ingredients: parsed.ingredients ?? [] });
  } catch (error) {
    console.error("Scan error:", error);
    res.status(500).json({ error: "فشل تحليل الصورة" });
  }
});

/* ── /recipes ── */
router.post("/recipes", async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      res.status(400).json({ error: "يجب تقديم قائمة المكونات" });
      return;
    }

    const ingredientsList = ingredients.join("، ");

    const result = await textModel.generateContent(
      `أنت طاهٍ محترف ومتخصص في اقتراح وصفات عملية.

المكونات المتوفرة في الثلاجة: ${ingredientsList}

اقترح 3 وصفات يمكن تحضيرها من هذه المكونات (أو معظمها). أعد الرد ONLY كـ JSON بالشكل التالي بدون أي شيء آخر:

{
  "recipes": [
    {
      "name": "اسم الطبق",
      "description": "وصف قصير شهي للطبق",
      "matchedIngredients": ["مكون1", "مكون2"],
      "missingIngredients": ["مكون ناقص1"],
      "steps": ["الخطوة الأولى", "الخطوة الثانية", "الخطوة الثالثة"],
      "calories": 450,
      "cookTime": "30 دقيقة",
      "difficulty": "سهل",
      "servings": 2
    }
  ]
}

تأكد أن:
- الوصفات عملية وواقعية
- السعرات الحرارية تقديرية لكنها معقولة
- الوقت واقعي
- الصعوبة: سهل / متوسط / صعب`
    );

    const content = result.response.text() ?? "{}";

    let parsed: { recipes?: object[] };
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { recipes: [] };
    } catch {
      parsed = { recipes: [] };
    }

    res.json({ recipes: parsed.recipes ?? [] });
  } catch (error) {
    console.error("Recipes error:", error);
    res.status(500).json({ error: "فشل اقتراح الوصفات" });
  }
});

export default router;
