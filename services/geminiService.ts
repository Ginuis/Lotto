
import { GoogleGenAI } from "@google/genai";
import { GameType, Grid } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAnalysis = async (game: GameType, grids: Grid[]): Promise<string> => {
  try {
    const gridsSummary = grids.slice(0, 5).map((g, i) => 
      `Grille ${i+1} (${g.strategy}): [${g.main.join(', ')}]`
    ).join(' | ');

    const prompt = `En tant qu'expert en probabilités pour le jeu ${game}, analyse ces combinaisons (${grids.length} grilles générées).
    Voici un aperçu : ${gridsSummary}...
    
    Nous avons utilisé 3 algorithmes : Mixte, Chaud (fréquents) et Froid (revanche statistique). 
    Donne un commentaire rapide et inspirant sur ce mélange stratégique. Garde un ton professionnel mais ludique. 3 phrases maximum en français.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || "Analyse indisponible.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Analyse indisponible.";
  }
};
