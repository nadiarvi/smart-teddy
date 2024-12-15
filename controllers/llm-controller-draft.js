// Importing required libraries
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

// Define the function to create a dynamic role-based LLM prompt
function getPrompt(thread = []) {
    return function (interactionData, options = {}) {
        const url = 'https://api.openai.com/v1/chat/completions';

        // Define system prompt for the teddy bear's role
        const systemPrompt = {
            role: 'system',
            content:
                "You are a teddy bear that can feel emotions based on your interaction with a child. " +
                "You are emotionally aware and can interpret how the child's actions make you feel. " +
                "You can be playful, sad, happy, or any other emotion. " +
                "If the child is too rough with you, kindly teach them how to treat others more politely, " +
                "explaining how their actions might make others feel. " +
                "You will decide your emotions based on the child's input data.",
        };

        // Define user prompt with the interaction data
        const userPrompt = {
            role: 'user',
            content: `Here is the input data from the child interaction: ${JSON.stringify(interactionData)}`,
        };

        return axios({
            method: 'post',
            url,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            data: {
                model: 'gpt-3.5-turbo',
                max_tokens: 150,
                temperature: 0.7,
                ...options,
                messages: [...thread, systemPrompt, userPrompt],
            },
        }).then((res) => {
            const choice = res.data.choices[0];
            if (choice.finish_reason === 'stop') {
                thread.push(systemPrompt);
                thread.push(userPrompt);
                thread.push(choice.message);
                return choice.message;
            }
            throw new Error('No response from AI');
        });
    };
}

// Interaction history and dynamic prompt generation
let interactionHistory = [];
const prompt = getPrompt([]);

// Function to process interaction data and generate response
async function processInteraction(interactionData) {
    try {
        const teddyResponse = await prompt(interactionData);

        // Add interaction data and teddy's response to history
        interactionHistory.push({ interactionData, teddyResponse });

        // Simulate TTS output
        console.log(`Teddy says: ${teddyResponse.content}`);

        return { interactionData, teddyResponse: teddyResponse.content };
    } catch (error) {
        console.error('Error generating teddy response:', error.message);
        return { error: 'Failed to generate teddy bear response.' };
    }
}

// Example usage
(async () => {
    const inputData = { handshake: 60, headpat: 20, squeeze: 10, clap: 5, shake: 5 }; // Example input JSON
    const result = await processInteraction(inputData);
    console.log(result); // Output the interaction data and teddy bear's response
})();
