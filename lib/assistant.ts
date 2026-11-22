/**
 * The AI assistant's single integration point.
 * Today it returns rule-based notes computed from the user's own records.
 * To connect a real AI model later: set AI_API_KEY on the server and implement `askModel`,
 * passing it ONLY the `facts` built below, so the model cannot invent activity.
 */
export type Insight = { kind: string; text: string; tone: string };

export function isModelConnected() {
  return Boolean(process.env.AI_API_KEY);
}

export async function askModel(_facts: object): Promise<string | null> {
  // Integration point (backend phase): call the chosen AI provider here with the facts and a strict
  // instruction to use only those facts. Returning null keeps the rule-based notes.
  return null;
}
