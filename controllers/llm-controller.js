const OpenAI = require('openai');
const chalk = require('chalk');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const getEmotion = async (req, res) => {
    const { actions } = req.body;

    // TODO: REFINE THE PROMPT
    const systemPrompt = `
        You are a teddy bear who has a feeling, and you are playing with a kid.
        Given the kid's action and your past feelings, respond with your current feeling.
    `;

    const userPrompt = `
        - Recent actions: ${recent}
        - Past feelings: ${past}
    `;

    const response = await openai.chat.completion.create({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content: systemPrompt,
            },
            {
                role: 'user',
                content: actions,
            },
        ],
    })

    
}