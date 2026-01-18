
import { GoogleGenAI } from "@google/genai";
import { GameType, Grid } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAnalysis = async (game: GameType, grids: Grid[]): Promise<string> => {
  try {
    const gridsStr = grids.map((g, i) => 
      `Grille ${i+1}${i === 3 ? ' (Spectre Large)' : ''}: Numéros [${g.main.join(', ')}], Bonus [${g.bonus.join(', ')}]`
    ).join('\n');

    const prompt = `En tant qu'expert en numérologie et probabilités pour le jeu ${game}, analyse brièvement ces 5 combinaisons générées :
    ${gridsStr}
    
    Porte une attention particulière à la grille 4 (Spectre Large) qui utilise des numéros élevés. Donne un conseil ludique et une petite interprétation mystique basée sur les numéros. Garde un ton encourageant mais rappelle que c'est du hasard. Réponds en français en 3-4 phrases.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
        topP: 0.95
      }
    });

    return response.text || "L'IA n'a pas pu analyser vos grilles cette fois-ci.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Analyse indisponible pour le moment.";
  }
};
