import Oscillator from './oscillator.js';
import Gain from './gain.js';

class LFO {
    constructor(AC) {
        this.AC = AC;

        this.depth = new Gain(this.AC);
        this.osc = new Oscillator(this.AC);
        this.osc.setType('sine');

        this.osc.connect(this.depth.getNode());

        this.maxRate = 100;
        this.maxDepth = 1000;
    }

    connect = (destination) => {
        if (Array.isArray(destination)) {
            destination.forEach((dest) => this.depth.connect(dest));
        } else {
            this.depth.connect(destination);
        }
    }
    start = () => this.osc.start();

    // These could potentially be used later for lfos affecting other lfos
    getNode = () => this.osc.getNode();
    getDepthNode = () => this.depth.getNode();

    // Setters
    setRate = val => {
        if (val < 0 || val > this.maxRate) return false;
        this.osc.setFreq(val);
    }
    setDepth = val => {
        if (val < 0 || val > this.maxDepth) return false;
        this.depth.setGain(val);
    }
    setType = type => this.osc.setType(type);
}

export default LFO;