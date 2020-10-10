import Gain from './gain.js';

// TODO: createScriptProcessor is a deprecated method. Need to update this to use AudioWorklet pattern.
class BitCrusher {
    constructor(AC) {
        this.AC = AC;
        this.bufferSize = 256;

        this.dryGain = new Gain(this.AC);
        this.wetGain = new Gain(this.AC);

        this.node = this.AC.createScriptProcessor(this.bufferSize, 1, 1);
        this.setBitDepth(8);

        this.node.connect(this.wetGain.getNode());

        this.setAmount(0);
    }

    connect = destination => {
        if (Array.isArray(destination)) {
            destination.forEach((dest) => {
                this.dryGain.connect(dest);
                this.wetGain.connect(dest);
            });
        } else {
            this.dryGain.connect(destination);
            this.wetGain.connect(destination);
        }
    }

    // Getters
    getNode = () => [this.dryGain.getNode(), this.node];
    getBitDepth = () => this.node.bits;
    getAmount = () => this.wetGain.getGain();

    // Setters
    setBitDepth = bitDepth => {
        if (bitDepth === this.node.bits) return false;
        this.node.bits = bitDepth; // between 1 and 16
        this.node.normfreq = 0.25; // between 0.0 and 1.0

        const step = Math.pow(0.75, this.node.bits);
        let phaser = 0;
        let last = 0;
        this.node.onaudioprocess = (e) => {
            const input = e.inputBuffer.getChannelData(0);
            const output = e.outputBuffer.getChannelData(0);
            for (let i = 0; i < this.bufferSize; i++) {
                phaser += this.node.normfreq;
                if (phaser >= 1.0) {
                    phaser -= 1.0;
                    last = step * Math.floor(input[i] / step + 0.5);
                }
                output[i] = last;
            }
        };
    }
    setAmount = val => {
        this.dryGain.setGain(1 - val);
        this.wetGain.setGain(val);
    }
}

export default BitCrusher;
