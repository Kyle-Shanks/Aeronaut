import Gain from './gain.js';

class NoiseGenerator {
    constructor(AC) {
        this.AC = AC;

        const bufferSize = 2 * this.AC.sampleRate;
        const noiseBuffer = this.AC.createBuffer(1, bufferSize, this.AC.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

        this.node = this.AC.createBufferSource();
        this.node.buffer = noiseBuffer;
        this.node.loop = true;

        this.gainNode = new Gain(this.AC);
        this.node.connect(this.gainNode.getNode());
    }

    connect = (destination) => {
        if (Array.isArray(destination)) {
            destination.forEach((dest) => this.gainNode.connect(dest));
        } else {
            this.gainNode.connect(destination);
        }
    }
    start = () => this.node.start();

    // Getters
    getNode = () => this.node;
    getType = () => null;
    getFreq = () => this.node.frequency.value;

    // Setters
    setType = (type) => {}
    setFreq = (freq, time = 0) => {}
    setGain = val => this.gainNode.setGain(val);
}

export default NoiseGenerator;