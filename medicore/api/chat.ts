import type { VercelRequest, VercelResponse } from '@vercel/node';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  messages: Message[];
  systemPrompt?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check API key
  if (!OPENROUTER_API_KEY) {
    return res.status(503).json({
      error: 'AI Assistant is unavailable. API key not configured.',
      code: 'NO_API_KEY',
    });
  }

  try {
    const body = req.body as RequestBody;

    // Validate request
    if (!body.messages || !Array.isArray(body.messages)) {
      return res.status(400).json({ error: 'Invalid request: messages array required' });
    }

    // Limit message count
    if (body.messages.length > 20) {
      body.messages = body.messages.slice(-20);
    }

    // Limit message length
    const totalLength = body.messages.reduce((sum, m) => sum + m.content.length, 0);
    if (totalLength > 10000) {
      return res.status(400).json({ error: 'Request too large. Please shorten your messages.' });
    }

    // Build messages with system prompt
    const messages: Message[] = [];
    if (body.systemPrompt) {
      messages.push({ role: 'system', content: body.systemPrompt });
    }
    messages.push(...body.messages);

    // Call OpenRouter
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://medicore-demo.vercel.app',
        'X-Title': 'MediCore Hospital Management',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter error:', response.status, errorText);
      return res.status(502).json({
        error: 'AI service error. Please try again later.',
        details: response.statusText,
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'No response from AI service' });
    }

    return res.status(200).json({ content });
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
