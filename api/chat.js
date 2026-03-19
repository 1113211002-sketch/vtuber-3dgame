const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 15;

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: '找不到 API Key' });

    try {
        const { contents, systemPrompt, knowledgeBase } = req.body;
        
        // 修正：模型名稱改為正確的版本 gemini-1.5-flash
        const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const fullSystemInstruction = `${systemPrompt}\n\n【知識庫】\n${knowledgeBase}\n\n請務必只回傳 JSON 格式。`;

        const geminiPayload = {
            contents: contents,
            systemInstruction: { parts: [{ text: fullSystemInstruction }] },
            // 確保使用底線 google_search
            tools: [{ google_search: {} }] 
        };

        const response = await fetch(googleApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiPayload)
        });

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: '伺服器錯誤' });
    }
}