const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(require('cors')());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ 
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1'
 });

app.post('/api/ai-assistant', async (req, res) => {
    const { userMessage } = req.body;

    // Шаг 1: достаём РЕАЛЬНЫЕ активности из базы (это и есть "retrieval" в RAG)
    const { data: activities } = await supabase
        .from('activities')
        .select('id, title, description, city, event_date, is_beginner_friendly')
        .eq('status', 'active');

    // Шаг 2: формируем контекст для модели — только актуальные данные, не выдумка
    const context = (activities && Array.isArray(activities)) ? activities.map(a => `ID:${a.id} | ${a.title} | ${a.description} | Город: ${a.city} | Дата: ${a.event_date}`).join('\n') : "На данный момент активных мероприятий нет.";

    // Шаг 3: системный промпт — ограничиваем модель ТОЛЬКО реальными данными
    const systemPrompt = `Ты — ассистент волонтёрской платформы GoVol. 
Твоя задача — помочь пользователю найти подходящую активность СТРОГО из списка ниже.
Никогда не выдумывай активности, которых нет в списке.
Если ничего подходящего нет — честно скажи об этом.
Отвечай кратко, дружелюбно, на русском языке, с указанием названия активности и даты.

Доступные активности:
${context}`;

    try {
        const completion = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ],
            temperature: 0.4
        });

        res.json({ reply: completion.choices[0].message.content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ reply: "Извини, что-то пошло не так. Попробуй ещё раз." });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));