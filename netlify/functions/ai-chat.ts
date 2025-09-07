import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  // CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,GET,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: ''
    };
  }

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ok: true })
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return { statusCode: 500, body: 'OPENAI_API_KEY not configured' };

    const body = event.body ? JSON.parse(event.body) : {};
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const response_format = body.response_format || 'json_object';

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.2,
        response_format: typeof response_format === 'string' ? { type: response_format } : response_format
      })
    });

    const data = await resp.json();
    if (!resp.ok) {
      return { statusCode: resp.status, body: JSON.stringify({ error: data.error || data }) };
    }

    const text = data.choices?.[0]?.message?.content || '';
    let json: any = null;
    try { json = JSON.parse(text); } catch { json = { content: text }; }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify(json)
    };
  } catch (e: any) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message || 'Server error' }) };
  }
};
