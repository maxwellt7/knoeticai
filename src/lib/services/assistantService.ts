import { getChatCompletion, isOpenAIInitialized } from './openai';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class AssistantService {
  private messages: ChatMessage[] = [];
  private systemPrompt: string;

  constructor(systemPrompt: string) {
    this.systemPrompt = systemPrompt;
    this.messages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];
  }

  async sendMessage(message: string): Promise<string> {
    if (!isOpenAIInitialized()) {
      throw new Error('OpenAI not initialized. Please add your API key.');
    }

    // Add the user message to the conversation
    this.messages.push({
      role: 'user',
      content: message
    });

    try {
      // Get response from OpenAI
      const response = await getChatCompletion(this.messages);

      // Add the assistant response to the conversation
      this.messages.push({
        role: 'assistant',
        content: response
      });

      return response;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return 'Sorry, I encountered an error processing your request.';
    }
  }

  resetConversation(): void {
    this.messages = [
      {
        role: 'system',
        content: this.systemPrompt
      }
    ];
  }
} 