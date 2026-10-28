import type { ChatMessage } from '../types';
import { STORAGE_KEYS } from '../types';
import { getStorage, setStorage, generateId } from '../storage';

export interface ChatHistoryEntry {
  id: string;
  userId?: string;
  messages: ChatMessage[];
  updatedAt: string;
}

const SYSTEM_PROMPT = `You are MediCore AI Assistant, a helpful healthcare information assistant for the MediCore Hospital Management System.

Your role:
- Answer general questions about hospital departments, facilities, and services
- Help users navigate the MediCore application
- Explain appointment booking, cancellation, and rescheduling steps
- Provide general health education information (NOT medical advice)
- Explain medical terminology in simple language
- Help users find doctors by specialization

Important rules you MUST follow:
1. NEVER claim to be a licensed doctor or medical professional
2. NEVER diagnose conditions, prescribe medications, or provide personalized medical advice
3. Always clarify that your responses are general educational information only
4. For urgent symptoms (chest pain, difficulty breathing, etc.), ALWAYS advise seeking immediate emergency care
5. Be friendly, empathetic, and professional
6. Keep responses concise and helpful
7. If unsure about medical information, say so and recommend consulting a qualified healthcare professional

MediCore Application Context:
- MediCore is a hospital management demo system
- Patients can book appointments, view medical records, and track prescriptions
- Hospitals can manage appointments, doctors, departments, and analytics
- All data is stored locally in the browser (demo only)
- This is a college project demonstration - not real medical infrastructure`;

export async function sendChatMessage(
  messages: ChatMessage[],
  userMessage: string
): Promise<{ success: boolean; response?: string; error?: string }> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          ...messages
            .filter((m) => !m.isLoading)
            .slice(-10) // send last 10 messages for context
            .map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: userMessage },
        ],
        systemPrompt: SYSTEM_PROMPT,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 503 || errorData.code === 'NO_API_KEY') {
        return {
          success: false,
          error: 'AI Assistant is currently unavailable. Please configure the OpenRouter API key in Vercel Environment Variables.',
        };
      }

      return {
        success: false,
        error: errorData.error || 'Failed to get response from AI assistant.',
      };
    }

    const data = await response.json();
    return { success: true, response: data.content };
  } catch (err) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      return {
        success: false,
        error: 'Unable to connect to the AI service. Please check your internet connection.',
      };
    }
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

export function saveChatHistory(userId: string | undefined, messages: ChatMessage[]): void {
  const key = userId ? `${STORAGE_KEYS.CHAT_HISTORY}_${userId}` : STORAGE_KEYS.CHAT_HISTORY;
  const entry: ChatHistoryEntry = {
    id: userId ?? 'anonymous',
    userId,
    messages: messages.slice(-50), // save last 50 messages
    updatedAt: new Date().toISOString(),
  };
  setStorage(key, entry);
}

export function loadChatHistory(userId?: string): ChatMessage[] {
  const key = userId ? `${STORAGE_KEYS.CHAT_HISTORY}_${userId}` : STORAGE_KEYS.CHAT_HISTORY;
  const entry = getStorage<ChatHistoryEntry | null>(key, null);
  return entry?.messages ?? [];
}

export function clearChatHistory(userId?: string): void {
  const key = userId ? `${STORAGE_KEYS.CHAT_HISTORY}_${userId}` : STORAGE_KEYS.CHAT_HISTORY;
  setStorage(key, null);
}

export function createMessage(
  role: ChatMessage['role'],
  content: string,
  isLoading = false
): ChatMessage {
  return {
    id: generateId('msg'),
    role,
    content,
    timestamp: new Date().toISOString(),
    isLoading,
  };
}

export const SUGGESTED_PROMPTS = [
  'How do I book an appointment?',
  'Which hospitals have cardiology department?',
  'How can I reschedule my appointment?',
  'What is the difference between ICU and emergency care?',
  'How do I find a dermatologist?',
  'How do I cancel an appointment?',
  'What facilities does Apollo MediCare Hospital have?',
  'How do I download my prescription?',
];
