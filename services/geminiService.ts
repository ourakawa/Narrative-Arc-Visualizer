import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResponse } from "../types";

// Define the response schema using the Google GenAI Type enum
const narrativeBeatSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    beat_number: { type: Type.NUMBER, description: "シーンまたはビートの通し番号" },
    title: { type: Type.STRING, description: "そのシーンの短いタイトル" },
    summary: { type: Type.STRING, description: "そのシーンで何が起きたかの簡潔な要約（2-3行）" },
    act: { type: Type.STRING, enum: ["Act 1", "Act 2", "Act 3"], description: "三幕構成のどこに該当するか" },
    emotional_value: { type: Type.NUMBER, description: "感情の起伏 (-10: 絶望, 10: 最高潮の幸福)" },
    tension_level: { type: Type.NUMBER, description: "緊張感・サスペンスの度合い (0: 緩和, 10: 極限状態)" },
    analysis_comment: { type: Type.STRING, description: "研究者の視点での短い分析コメント（伏線、象徴など）" },
  },
  required: ["beat_number", "title", "summary", "act", "emotional_value", "tension_level", "analysis_comment"],
};

const analysisResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "作品の推定タイトル" },
    logline: { type: Type.STRING, description: "物語全体を1行で表したログライン" },
    overall_structure: { type: Type.STRING, description: "全体の構成に対する総評" },
    structural_defect_feedback: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "構造的欠陥アラート（例：「第二幕の中だるみ」「解決パートが短すぎる」など）。問題なければ「構造上の大きな欠陥は見当たらない」と記述。",
    },
    beats: {
      type: Type.ARRAY,
      items: narrativeBeatSchema,
      description: "物語全体のビートごとの配列",
    },
  },
  required: ["title", "logline", "overall_structure", "structural_defect_feedback", "beats"],
};

export const analyzeNarrative = async (text: string, modelId: string = "gemini-2.5-flash"): Promise<AnalysisResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemPrompt = `
あなたは日本映画学会に所属する優秀な映画研究者であり、同時に熟練した脚本アナリストです。
渡されたテキスト（プロットまたは脚本）を読み解き、物語の構造を工学的・定量的に分析してください。

以下のガイドラインに従ってJSONを出力してください：

1. **セグメンテーション**: 物語を主要なビート（出来事の単位）に分割してください。
2. **三幕構成の判定**: 古典的なハリウッド三幕構成、または序破急の理論に基づき、各ビートがどこに属するか判定してください。
3. **数値化（基準を厳守すること）**:
   - \`emotional_value\`: 主人公の状況や感情がポジティブかネガティブか数値化してください。基準は[-10: 絶望/死, 0: 平常/ニュートラル, +10: 最高の幸福/勝利]とします。
   - \`tension_level\`: 観客が感じるハラハラドキドキ（緊張感）を数値化してください。基準は[0: 緩和/静寂, 5: 葛藤/不安, 10: 命の危険/クライマックス]とします。
4. **分析**: 単なるあらすじではなく、「なぜこのシーンが必要か」という機能的な分析を含めてください。
5. **品質管理(QC)**: リテラ企画としての強みを活かし、プロデューサー視点で構造的な欠陥（中だるみ、唐突な展開、カタルシス不足など）があれば \`structural_defect_feedback\` に厳しく指摘してください。

出力は指定されたJSONスキーマに厳密に従い、毎回同じロジックで一貫性のある分析をしてください。
`;

  try {
    const response = await ai.models.generateContent({
      model: modelId, 
      contents: [
        { role: "user", parts: [{ text: `以下の物語を分析してください：\n\n${text}` }] },
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: analysisResponseSchema,
        temperature: 0.0, // Set to 0.0 for deterministic and consistent results
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResponse;
    } else {
      throw new Error("No response text received from AI.");
    }
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};