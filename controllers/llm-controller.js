import OpenAI from 'openai';
import axios from 'axios';
import fs from 'fs';
import { exec } from 'child_process';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const getEmotion = async (req, res) => {
    const { actions } = req.body;
    const interactionData = req.body;
    try {
        const teddyResponse = await prompt(interactionData);
        
        interactionHistory.push({
            actions,
            teddyResponse
        })

        // simulate TTS output
        console.log(`Teddy says: ${teddyResponse.content}`);

        // convert the teddy's response into speech and play it
        await textToSpeech(teddyResponse.content);

        return res.status(200).json({
            actions,
            teddyResponse: teddyResponse.content
        });
    } catch (error) {
        console.error('Error generating teddy response:', error.message);
        return res.status(500).json({
            error: 'Failed to generate teddy bear response.'
        });
    }
};

// TTS Function
async function textToSpeech(text, filename = 'teddy_response.mp3') {
    try {
        const url = 'https://texttospeech.googleapis.com/v1/text:synthesize';
        const response = await axios.post(
            url,
            {
                input: { text },
                voice: {
                    languageCode: 'en-US',
                    name: 'en-US-Wavenet-D', // Adjust the voice as needed
                    ssmlGender: 'NEUTRAL',
                },
                audioConfig: { audioEncoding: 'MP3' },
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.GOOGLE_CLOUD_API_KEY}`,
                },
            }
        );

        const audioContent = response.data.audioContent;
        fs.writeFileSync(filename, audioContent, 'base64');
        console.log(`Audio content written to file: ${filename}`);

        // Play the audio automatically (works on Linux/Mac with `afplay`, use `play` for Linux)
        exec(`afplay ${filename}`, (error) => {
            if (error) {
                console.error('Error playing the audio file:', error.message);
            }
        });
    } catch (error) {
        console.error('Error during text-to-speech conversion:', error.message);
    }
}

// vocalize teddy bear
const speakOutEmotion = async (emotion) => {
    console.log("Teddy says: ${emotion}");
    await textToSpeech(emotion);
}

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
                "You will decide your emotions based on the child's input data." + 
                "Your emotion intensity should also reflects the previous interactions with the child." +
                "You should respond in first-person POV as a teddy bear." +
                "Your response should be in a form of a sentence or two, as if you are speaking to the child." , 
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

