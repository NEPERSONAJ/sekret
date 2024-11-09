import { AdminConfig } from '@/types';

export const defaultConfig: AdminConfig = {
  telegram: {
    botToken: '',
    chatId: '',
  },
  ai: {
    apiKey: '',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo',
  },
};