const { handClassify } = require("../models/bear_idle_handshake_clapping/run-impulse");
const { shakeClassify } = require("../models/bear_idle_shaking/run-impulse");
const { headClassify } = require("../models/bear_idle_petting/run-impulse");


/* 
    FORMAT INCOMING DATA:
    { "features": 
        {
            "head"= [float],
            "hand" = [float],
            "body" = [float],
        }
    }

*/

const classify = (req, res) => {
    const { features } = req.body;
    console.log('sensorData', sensorData);
    console.log("data received. starting classification....")

    // classify results: headpat, handshake, clap, shake
    const head = headClassifier(features.head);
    const hand = handClassifier(features.hand);
    const body = bodyClassifier(features.body);

    let result = {};
    result.headpat = head.headpat;
    result.handshake = hand.handshake;
    result.clap = hand.clap;
    result.shake = hand.shake;

    console.log('result', result);
    res.status(200).send(result);
}

module.exports = {
    classify
};