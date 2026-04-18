module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: { message: 'GROQ_API_KEY mangler. Vercel → Settings → Environment Variables.' }
    });
  }

  try {
    const { text, prompt } = req.body;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'Du er en JSON-ekstraktor. Svar KUN med valid JSON. Ingen forklaringer, ingen markdown, ingen kommentarer.' },
          { role: 'user', content: prompt + '\n\nFakturatekst:\n' + text }
        ],
        max_tokens: 2500,
        temperature: 0,
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: { message: data.error?.message || 'Groq fejl' } });
    }

    const result = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ content: [{ text: result }] });

  } catch (err) {
    return res.status(500).json({ error: { message: err.message } });
  }
};
