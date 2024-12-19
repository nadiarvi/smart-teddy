const { handClassify } = require("./models/bear_idle_handshake_clapping/run-impulse");
const { bodyClassify } = require("./models/bear_idle_shaking/run-impulse");
const { headClassify } = require("./models/bear_idle_petting/run-impulse");
const { SerialPort, ReadlineParser } = require('serialport');
const axios = require('axios');

const path = '/dev/tty.usbmodem11101';
const baudRate = 115200;
const server = "http://localhost:3000";

// TODO: CROSS CHECK WITH YOUNGIN
const  WINDOW_SIZE = 50;
const FEATURE_COUNT = 3;

const N = 50;

let handFeatures = Array(N).fill(0);
let headFeatures = Array(N).fill(0);
let bodyFeatures = Array(N* FEATURE_COUNT).fill(0);

const port = new SerialPort({ path, baudRate });
const parser = port.pipe(new ReadlineParser());

console.log("SerialPort connected");
let i = 0;
let processing = false;
parser.on('data', async (data) =>  {
    if (processing) {
        return;
    }
    processing = true;

    try {
        console.log("getting data...");
        const sensorData = JSON.parse(data);
        const { hand, head, body } = sensorData;

        handFeatures = handFeatures.slice(1).concat(hand);
        headFeatures = headFeatures.slice(1).concat(head);
        bodyFeatures = bodyFeatures.slice(FEATURE_COUNT).concat(body);

        i = (i + 1) % (N);
        if (i !== 0) {
            processing = false; // Reset flag and exit if not ready
            return;
        }

        const handPrediction = await handClassify(handFeatures);
        const headPrediction = await headClassify(headFeatures);
        const bodyPrediction = await bodyClassify(bodyFeatures);

        const result = {
            "clap": handPrediction.find(item => item.label === 'clapping').value,
            "handshake": handPrediction.find(item => item.label === 'handshaking').value,
            "headpat": headPrediction.find(item => item.label === 'petting').value,
            "shake": bodyPrediction.find(item => item.label === 'shaking').value,
        };
        
        //hardcore to fix wrong classification result
        if (result.clap != 0 && result.clap == result.handshake) {
            result.clap = 0;
            result.handshake = 0;
        }

        //set threshold to remove noise
        for (const [key, value] of Object.entries(result)) {
            if (value <= 0.3) {
            result[key] = 0;
            }
        }

        console.log(result);

        try {
            const response = await axios.post(`${server}/api/llm/getEmotion`, JSON.stringify(result), {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Emotion fetched:', response.data);
        } catch (error) {
            console.error('Error fetching emotion:', error);
        }

    } catch (error) {
        console.error(error);
    }

    processing = false;
});

port.on('error', (err) => {
    console.error('SerialPort Error:', err.message);
});

port.on('close', () => {
    console.log('SerialPort closed');
});