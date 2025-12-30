import { GoogleGenAI, Type } from "@google/genai";
import { ZLDArticle, WaterAnalysis, ZLDScenario, AgentReport } from "../types";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing! Please set API_KEY in your environment variables (Replit Secrets or Vercel Environment Variables).");
    throw new Error("API Key configuration missing");
  }
  return new GoogleGenAI({ apiKey });
};

// System instruction for the engineering persona
const SYSTEM_INSTRUCTION = `
You are a Principal ZLD (Zero Liquid Discharge) Process Engineer. 
Your expertise includes membrane technologies (RO, NF, FO), thermal processes (MVR, MEE, Crystallizers), and wastewater chemistry.
Your goal is to provide technically accurate, safety-conscious, and economically viable engineering solutions.
Always output specific technical data where possible.
`;

export const analyzeZLDArticle = async (text: string): Promise<Partial<ZLDArticle>> => {
  try {
    const ai = getAI();
    const prompt = `
      Analyze the following technical text regarding ZLD (Zero Liquid Discharge).
      1. Provide a concise engineering summary (max 150 words).
      2. Extract a list of specific technologies or chemicals mentioned.
      3. Generate a suitable title if one isn't clear.

      Text:
      ${text.substring(0, 30000)} 
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyTechnologies: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ['title', 'summary', 'keyTechnologies']
        }
      }
    });

    if (!response.text) throw new Error("No response from AI");
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error in analyzeZLDArticle:", error);
    throw error;
  }
};

export const generateScenarios = async (
  analysis: WaterAnalysis, 
  knowledgeBase: ZLDArticle[]
): Promise<ZLDScenario[]> => {
  try {
    const ai = getAI();
    
    // Context from knowledge base (last 3 articles to save tokens)
    const context = knowledgeBase.slice(-3).map(a => `Article: ${a.title}\nKey Tech: ${a.keyTechnologies.join(', ')}\nSummary: ${a.summary}`).join('\n---\n');

    const prompt = `
      Design 2 distinct ZLD process scenarios for the following water analysis:
      
      Flow Rate: ${analysis.flowRate} m3/hr
      TDS: ${analysis.tds} mg/L
      pH: ${analysis.ph}
      COD: ${analysis.cod} mg/L
      Chlorides: ${analysis.chlorides} mg/L
      Sulfates: ${analysis.sulfates} mg/L
      Hardness: ${analysis.hardness} mg/L

      Consider this learned knowledge:
      ${context}

      Scenario 1 should focus on OPEX optimization (Low Energy).
      Scenario 2 should focus on Robustness (High scaling potential handling).

      Return JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              recoveryRate: { type: Type.NUMBER },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ['Pretreatment', 'Membrane', 'Thermal', 'SolidHandling'] },
                    description: { type: Type.STRING }
                  }
                }
              },
              capexEstimate: { type: Type.STRING },
              opexEstimate: { type: Type.STRING },
              energyConsumption: { type: Type.NUMBER },
              risks: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      }
    });

    if (!response.text) throw new Error("Failed to generate scenarios");
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error in generateScenarios:", error);
    throw error;
  }
};

export const generateReport = async (scenario: ZLDScenario, analysis: WaterAnalysis): Promise<string> => {
  try {
    const ai = getAI();
    const prompt = `
      Write a formal engineering executive summary report in Markdown format for the selected ZLD Scenario.
      
      Water Data: TDS ${analysis.tds}, Flow ${analysis.flowRate}.
      Selected Scenario: ${scenario.name}
      Process Steps: ${scenario.steps.map(s => s.name).join(' -> ')}
      
      The report should include:
      1. Basis of Design
      2. Process Description
      3. Mass Balance Overview (Estimated)
      4. Economic Analysis (CAPEX/OPEX qualitative assessment)
      5. Conclusion

      Language: Persian (Farsi).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
          systemInstruction: "You are a professional engineering consultant writing a formal report."
      }
    });

    return response.text || "Error generating report.";
  } catch (error) {
    console.error("Error in generateReport:", error);
    return "خطا در تولید گزارش به دلیل مشکل در اتصال به هوش مصنوعی.";
  }
}

export const runAutonomousResearch = async (): Promise<AgentReport> => {
  try {
    const ai = getAI();
    const prompt = `
      Search for the latest research papers, technical articles, and case studies regarding "Zero Liquid Discharge (ZLD) technologies" and "Industrial Wastewater Treatment innovations" published recently.

      Based on the search results:
      1. Summarize 2-3 key findings or new technologies found.
      2. Propose a hypothetical application scenario for these findings (e.g., "Ideally suited for high-COD textile effluent").
      3. List the source titles and URLs explicitly.

      Output format: Markdown.
      Language: Persian (Farsi).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });

    // Extract grounding metadata (URLs)
    const sources: { uri: string; title: string }[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      response.candidates[0].groundingMetadata.groundingChunks.forEach(chunk => {
        if (chunk.web) {
          sources.push({ uri: chunk.web.uri || '', title: chunk.web.title || 'Web Source' });
        }
      });
    }

    return {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString('fa-IR'),
      status: 'success',
      searchQuery: 'Latest ZLD Technologies & Innovations',
      findings: response.text || "No text generated.",
      sources: sources
    };

  } catch (error: any) {
    console.error("Auto-agent error details:", error);
    
    let errorMessage = "خطا در اجرای فرآیند خودکار.";
    if (error.message?.includes("API Key")) {
        errorMessage = "خطا: API Key تنظیم نشده است.";
    }

    return {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString('fa-IR'),
      status: 'failed',
      searchQuery: 'Error executing search',
      findings: errorMessage,
      sources: []
    };
  }
};