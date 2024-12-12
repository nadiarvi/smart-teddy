const { lightClassifier } = require("../models/light/run-impulse");

const handshake = (data) => {
    return data && data.length ? 'Handshake successful' : '';
}

const headpat = (data) => {
    return data && data.length ? 'Headpat successful' : '';
}

const squeeze = (data) => {
    return data && data.length ? 'Squeeze successful' : '';
}

const clap = (data) => {
    return data && data.length ? 'Clap successful' : '';
}

const shake = (data) => {
    return data && data.length ? 'Shake successful' : '';
}

const classify = (req, res) => {
    // data format: dictionary, key: action, value: array of data sensor}
    const { userInput } = req.body;
    const actions = Object.keys(userInput);

    let classification = {};

    actions.forEach(action => {
        data = userInput[action];
        switch(action) {
            case 'handshake':
                classification[action] = handshake(data);
                break;
            case 'headpat':
                classification[action] = headpat(data);
                break;
            case 'squeeze':
                classification[action] = squeeze(data);
                break;
            case 'clap':
                classification[action] = clap(data);
                break;
            case 'shake':
                classification[action] = shake(data);
                break;
            default:
                console.log('Invalid action');
        }
    })

    res.status(200).send(classification);
    // res.status(200).send(greet);
}

const sampleClassifier = (req, res) => {
    const { features } = req.body;
    console.log('features', features);

    const result = lightClassifier(features);
    console.log('result', result);

    res.status(200).send(result);
}

module.exports = {
    classify,
    sampleClassifier
};