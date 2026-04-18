module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: { message: 'GEMINI_API_KEY mangler. Vercel → Settings → Environment Variables.' }
    });
  }

  try {
    const msg = req.body.messages?.[0];
    const parts = [];

    for (const block of (msg?.content || [])) {
      if (block.type === 'document' && block.source?.data) {
        parts.push({ inline_data: { mime_type: 'application/pdf', data: block.source.data } });
      } else if (block.type === 'text') {
        parts.push({ text: block.text });
      }
    }

    const geminiBody = {
      contents: [{ parts }],
      generationConfig: { maxOutputTokens: 2500, temperature: 0 }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(geminiBody) }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: { message: data.error?.message || 'Gemini fejl' } });
    }

    const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
    return res.status(200).json({ content: [{ text }] });

  } catch (err) {
    return res.status(500).json({ error: { message: err.message } });
  }
};
