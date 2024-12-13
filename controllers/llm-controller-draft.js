// Importing required libraries
const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');
dotenv.config();

// Initialize OpenAI with Configuration object
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

// Define emotional modeling for personality classification
function calculateEmotion(data) {
    return {
        joy: data.handshake * 0.5 + data.headpat * 0.8 - data.squeeze * 0.2,
        frustration: data.squeeze * 0.7 + data.shake * 0.5,
        calmness: data.headpat * 0.9 - data.shake * 0.6,
        energy: data.shake * 0.8 + data.clap * 0.5
    };
}

function classifyPersonalityFromEmotion(emotion) {
    if (emotion.joy > 50 && emotion.energy > 40) return 'happy';
    if (emotion.frustration > 50) return 'irritated';
    if (emotion.calmness > 60) return 'wise';
    if (emotion.energy > 50) return 'playful';
    return 'sad';
}

// Define temporal interaction pattern analysis
function detectPattern(interactionHistory) {
    const recentInteractions = interactionHistory.slice(-3); // Last 3 interactions
    if (recentInteractions.every(i => i.data.handshake > 0)) return 'happy';
    if (recentInteractions.some(i => i.data.squeeze > 50)) return 'irritated';
    if (recentInteractions.some(i => i.data.shake > 30 && i.data.clap > 20)) return 'playful';
    return 'wise';
}

// Define intensity and frequency-based classification
function classifyByIntensityAndFrequency(data) {
    const intensity = data.squeeze + data.shake + data.clap;
    const frequency = Object.values(data).reduce((sum, val) => sum + val, 0);

    if (intensity < 30 && frequency > 50) return 'playful';
    if (intensity > 70) return 'irritated';
    if (frequency < 20) return 'sad';
    if (intensity < 20 && frequency < 50) return 'wise';
    return 'happy';
}

// Define comprehensive classification combining methods
function classifyPersonality(data, interactionHistory) {
    const emotion = calculateEmotion(data);
    const emotionBased = classifyPersonalityFromEmotion(emotion);
    const patternBased = detectPattern(interactionHistory);
    const intensityFrequencyBased = classifyByIntensityAndFrequency(data);

    // Priority order for personality classification
    if (emotionBased === 'irritated' || patternBased === 'irritated') return 'irritated';
    if (emotionBased === 'happy' && patternBased === 'happy') return 'happy';
    if (patternBased === 'playful' || intensityFrequencyBased === 'playful') return 'playful';
    if (emotionBased === 'wise' || patternBased === 'wise') return 'wise';
    return 'sad';
}

// Define personality prompts
const personalityPrompts = {
    happy: "I’m feeling so happy right now! Thank you for being so kind to me!",
    irritated: "Please stop shaking me so much. It’s making me feel irritated.",
    sad: "I’m feeling a bit ignored. Could we play together?",
    playful: "That was so much fun! Let’s keep playing together!",
    wise: "Gentle care is important. Let me share some advice to take good care of me."
};

// Memory to store past interactions
let interactionHistory = [];

// Function to efficiently manage interaction history
function updateInteractionHistory(data, personality) {
    // Add new interaction to the history
    interactionHistory.push({ data, personality });
}

// Function to generate a response using prompt chaining
async function generateResponseWithChain(personality) {
    const prompt = personalityPrompts[personality];

    // Include interaction history as a conversational thread
    const historyContext = interactionHistory
        .map(hist => `User: [${JSON.stringify(hist.data)}]
Teddy (${hist.personality}): Response from personality
`)
        .join('');

    // Add the current prompt to the ongoing conversation
    const currentPrompt = `User: [${JSON.stringify(interactionHistory[interactionHistory.length - 1]?.data || {})}]
Teddy (${personality}): ${prompt}`;

    const fullPrompt = `${historyContext}${currentPrompt}`;

    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo', // Updated model to avoid deprecation
        messages: [
            { role: 'system', content: "You are a teddy bear responding to interactions based on emotions." },
            { role: 'user', content: fullPrompt }
        ],
        max_tokens: 150
    });

    return response.data.choices[0].message.content.trim();
}

// Simulated incoming sensor data
async function processInteractionWithChain(data) {
    // Classify personality based on combined methods
    const personality = classifyPersonality(data, interactionHistory);

    // Update interaction history
    updateInteractionHistory(data, personality);

    // Generate LLM response using chaining
    const response = await generateResponseWithChain(personality);

    // Simulate TTS output
    console.log(`Teddy says: ${response}`);

    return { personality, response };
}

// Example usage
(async () => {
    const inputData = { handshake: 60, headpat: 20, squeeze: 10, clap: 5, shake: 5 }; // Example input JSON
    const result = await processInteractionWithChain(inputData);
    console.log(result); // Output the personality and response
})();
