import OpenAI from 'openai';

let openai: OpenAI | null = null;

export const initOpenAI = (apiKey: string): OpenAI => {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // For client-side usage
  });

  return openai;
};

export const getOpenAI = (): OpenAI => {
  if (!openai) {
    throw new Error('OpenAI client not initialized. Call initOpenAI first');
  }

  return openai;
};

export const isOpenAIInitialized = (): boolean => {
  return openai !== null;
};

// Simple chat completion function
export const getChatCompletion = async (
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  options: { model?: string; temperature?: number } = {}
): Promise<string> => {
  if (!openai) {
    throw new Error('OpenAI client not initialized');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: options.model || 'gpt-3.5-turbo',
      messages,
      temperature: options.temperature || 0.7,
    });

    return completion.choices[0]?.message?.content || 'No response generated';
  } catch (error: any) {
    console.error('Error in OpenAI chat completion:', error);
    throw new Error(`OpenAI API Error: ${error.message}`);
  }
}; 