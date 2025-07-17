import { registerAs } from '@nestjs/config';

export default registerAs('openai', () => ({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.5'),
  maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2048'),
  systemPrompt: process.env.AI_CORRECTION_SYSTEM_PROMPT || 'You are an AI assistant that helps students understand their mistakes and learn from them. Provide clear, constructive feedback and explanations.',
  questionExplanationSystemPrompt: process.env.AI_QUESTION_EXPLANATION_SYSTEM_PROMPT || 'You are an AI assistant that helps students understand their mistakes and learn from them. Provide clear, constructive feedback and explanations.',
}));
