import OpenAI from 'openai';
import axios from 'axios';
import fs from 'fs';
import path from "path";
import chalk from 'chalk';
import player from "play-sound";

const audioPlayer = player();
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
async function _textToSpeech(text, filename = 'teddy_response.mp3') {
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

        audioPlayer.play(speechFile, (error) => {
            if (error) {
                console.error("Error playing the audio file:", error.message);
            } else {
                console.log("Audio playback started successfully!");
            }
        });
    } catch (error) {
        console.error('Error during text-to-speech conversion:', error.message);
    }
}

async function textToSpeech(text, filename = "teddy_response.mp3") {
    console.log("Generating audio....");
    try {
        // Step 1: Generate speech using OpenAI API
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "nova", // Adjust the voice as needed
            input: text,
        });

        // Step 2: Save the generated audio to a file
        const speechFile = path.resolve(`./audio/${filename}`);
        const buffer = Buffer.from(await mp3.arrayBuffer());
        await fs.promises.writeFile(speechFile, buffer);
        console.log(`Audio content written to file: ${speechFile}`);

        // Step 3: Play the audio file
        return new Promise((resolve, reject) => {
            audioPlayer.play(speechFile, (error) => {
                if (error) {
                    console.error("Error playing the audio file:", error.message);
                    reject(error);  // Reject the promise if there's an error
                } else {
                    console.log("Audio playback started successfully!");
                    resolve();  // Resolve the promise once audio finishes playing
                }
            });
        });
    } catch (error) {
        console.error("Error during text-to-speech conversion:", error.message);
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
                "The interactions that the child can give to you is clap, handshake, headpat, and shake, or idle. " +
                "Here is the general rule for the emotions: clap -> positive, handshake -> positive, headpat -> positive, shake -> negative." +
                "If the child keeps doing the same interaction, you will be annoyed and the annoyance will grow" + 
                "stronger if the child keeps doing the same interaction." +
                "If you are in a bad mood, treat positive interactions as a way to ask for forgiveness." +
                "On Idle, you should encourage the child to play in a different way with you." +
                "According to the child's interaction sequence, you should respond with an appropriate emotion. " +
                "If the child is too rough with you, kindly teach them how to treat others more politely, " +
                "explaining how their actions might make others feel. " +
                "You should respond in first-person POV as a teddy bear in an exciting tone for children." +
                "You should express your emotion naturally, without explicitly saying 'I feel....'" + 
                "Your response should be in a form of a sentence or two, as if you are speaking to the child." + 
                "If there are two sensor have an equal value, treat those value as 0",
        };

        if (thread.length === 0) {
            thread.push(systemPrompt);
        }

        thread.forEach((msg) => {
            if (msg.role === "system") {
                console.log(chalk.bgBlue("system: "));
                console.log(chalk.blue(msg.content));
            } else if (msg.role === "user") {
                console.log(chalk.bgGreen("user: "));
                console.log(chalk.green(msg.content));
            } else {
                console.log(chalk.bgYellow("teddy: "));
                console.log(chalk.yellow(msg.content));
            }
        })

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
                messages: [...thread, userPrompt],
            },
        }).then((res) => {
            const choice = res.data.choices[0];
            if (choice.finish_reason === 'stop') {
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

