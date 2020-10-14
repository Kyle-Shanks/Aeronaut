import Gain from './gain.js';

class StereoPanner {
    constructor(AC) {
        this.AC = AC;
        this.node = this.AC.createStereoPanner();
        this.gain = new Gain(this.AC);

        this.node.connect(this.gain.getNode());
        this.gain.setGain(1.5); // Compensation, panner reduces volume a bit for some reason
    }

    connect = (destination) => {
        if (Array.isArray(destination)) {
            destination.forEach((dest) => this.gain.connect(dest));
        } else {
            this.gain.connect(destination);
        }
    }

    // Getters
    getNode = () => this.node;
    getPan = () => this.node.pan.value;

    // Setters
    setPan = val => {
        this.node.pan.setValueAtTime(val, this.AC.currentTime);
    }
}

export default StereoPanner;