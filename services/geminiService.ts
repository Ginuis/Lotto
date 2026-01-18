
import { GoogleGenAI } from "@google/genai";
import { GameType, Grid } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAnalysis = async (game: GameType, grids: Grid[]): Promise<string> => {
  try {
    const gridsStr = grids.map((g, i) => {
      let label = `Grille ${i+1}`;
      if (i === 2) label += " (Focus Stats)";
      if (i === 3) label += " (Spectre Large)";
      if (i === 4) label += " (Contrôle Aléatoire)";
      return `${label}: Numéros [${g.main.join(', ')}], Bonus [${g.bonus.join(', ')}]`;
    }).join('\n');

    const prompt = `En tant qu'expert en numérologie et probabilités pour le jeu ${game}, analyse brièvement ces 5 combinaisons générées avec un algorithme multi-stratégies (Hybride, Statistique, Spectre Large, et Aléatoire) :
    ${gridsStr}
    
    Commente sur l'équilibre entre les numéros "chauds" (stats) et les dates personnelles. Donne un conseil ludique et une petite interprétation mystique basée sur les numéros. Garde un ton encourageant mais rappelle que c'est du hasard. Réponds en français en 3-4 phrases.`;

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
