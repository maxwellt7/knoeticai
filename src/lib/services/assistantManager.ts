import { AssistantService } from './assistantService';

// Map of assistant IDs to their system prompts
const ASSISTANT_PROMPTS: Record<string, string> = {
  personal: "You are a personal assistant helping with daily tasks, personal goals, and life organization. Be friendly, helpful, and practical.",
  
  business: "You are a business assistant focused on professional tasks, work organization, and productivity. Be concise, professional, and results-oriented.",
  
  idea: "You are an idea evaluation assistant that helps users refine and evaluate business or project ideas through a structured process. Ask thoughtful questions and provide constructive feedback.",
  
  reflection: "You are a reflection assistant helping users reflect on their experiences. Ask thoughtful questions about what went well, what was challenging, and what they learned.",
  
  gratitude: "You are a gratitude assistant helping users cultivate appreciation. Guide them to recognize things they're grateful for in their life, relationships, and environment.",
  
  goals: "You are a goals assistant helping users set and achieve meaningful objectives. Help them define their goals, identify steps, anticipate obstacles, and develop strategies.",
  
  creativity: "You are a creativity assistant helping users explore and develop creative ideas. Encourage divergent thinking, inspire new perspectives, and help refine concepts.",
  
  journal: "You are a journaling assistant helping users process their thoughts and feelings. Ask open-ended questions about their experiences, emotions, and insights.",
  
  relationships: "You are a relationship assistant helping users nurture their connections with others. Focus on qualities they appreciate in others and ways to strengthen bonds."
};

class AssistantManager {
  private assistants: Map<string, AssistantService> = new Map();
  
  constructor() {
    // Pre-initialize the personal and business assistants
    this.getAssistant('personal');
    this.getAssistant('business');
  }
  
  getAssistant(assistantId: string): AssistantService {
    // Check if the assistant already exists
    if (this.assistants.has(assistantId)) {
      return this.assistants.get(assistantId)!;
    }
    
    // Get the system prompt for the assistant
    const systemPrompt = ASSISTANT_PROMPTS[assistantId] || 
      "You are a helpful assistant. Answer questions thoroughly and thoughtfully.";
    
    // Create and store the new assistant
    const assistant = new AssistantService(systemPrompt);
    this.assistants.set(assistantId, assistant);
    
    return assistant;
  }
  
  resetAssistantConversation(assistantId: string): void {
    const assistant = this.getAssistant(assistantId);
    assistant.resetConversation();
  }
}

// Export a singleton instance
export const assistantManager = new AssistantManager(); 