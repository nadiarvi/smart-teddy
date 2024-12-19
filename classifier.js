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
parser.on('data', async (data) =>  {
    try {
        // console.log("getting data...");
        const sensorData = JSON.parse(data);
        const { hand, head, body } = sensorData;

        handFeatures = handFeatures.slice(1).concat(hand);
        headFeatures = headFeatures.slice(1).concat(head);
        bodyFeatures = bodyFeatures.slice(FEATURE_COUNT).concat(body);

        i = (i + 1) % (N);
        if (i !== 0) {
            return;
        }

        const handPrediction = await handClassify(handFeatures);
        const headPrediction = await headClassify(headFeatures);
        const bodyPrediction = await bodyClassify(bodyFeatures);

        const result = {
            hand: handPrediction,
            head: headPrediction,
            body: bodyPrediction
        };
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
});

port.on('error', (err) => {
    console.error('SerialPort Error:', err.message);
});

port.on('close', () => {
    console.log('SerialPort closed');
});