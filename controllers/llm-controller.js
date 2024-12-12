import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// getEmotion function
// Input: last interaction
// Output: teddy bear's current feeling, the dialogue of the teddy bear

export const getEmotion = async (req, res) => {
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

// speakOutEmotion function
// Input: teddy bear's response in text
// Output: teddy bear's response in voice
// Use openAI tts api
// Call function at the end of getEmotion function
const speakOutEmotion = ({ text }) => {
    // ... TODO: Implement the function
    return null;
}

