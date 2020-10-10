import revBase64 from './reverbBase64.js';
import Gain from './gain.js';

const base64ToArrayBuffer = base64 => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes.buffer;
}

class Reverb {
    constructor(AC) {
        this.AC = AC;
        this.node = this.AC.createConvolver();
        this.dryGain = new Gain(this.AC);
        this.wetGain = new Gain(this.AC);
        this.node.connect(this.wetGain.getNode());

        this.AC.decodeAudioData(base64ToArrayBuffer(revBase64),
            buffer => this.node.buffer = buffer,
            e => alert('Error when decoding audio data' + e.err)
        );

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
    getAmount = () => this.wetGain.getGain();

    // Setters
    setAmount = val => {
        this.dryGain.setGain(1 - val);
        this.wetGain.setGain(val);
    }
}

export default Reverb;