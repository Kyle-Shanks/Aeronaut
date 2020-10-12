import Gain from './gain.js';

const createDistCurve = (amount = 0) => {
    const k = amount;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    let x;

    for (let i = 0; i < n_samples; ++i) {
        x = i * 2 / n_samples - 1;
        curve[i] = (3 + k) * Math.atan(Math.sinh(x * 0.25) * 5) / (Math.PI + k * Math.abs(x));
    }
    return curve;
};

class Distortion {
    constructor(AC) {
        this.AC = AC;
        this.dryGain = new Gain(this.AC);
        this.wetGain = new Gain(this.AC);

        this.node = this.AC.createWaveShaper();
        this.node.curve = createDistCurve();
        this.node.oversample = 'none';

        this.node.connect(this.wetGain.getNode());

        this.distortion = 0;
        this.maxDistortion = 30;

        this.setDistortion(this.maxDistortion);
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
    getDistortion = () => this.distortion;
    getAmount = () => this.wetGain.getGain();

    // Setters
    setDistortion = val => {
        if (val < 0 || val > this.maxDistortion) return false;
        this.distortion = val;
        this.node.curve = createDistCurve(val);
    }
    setAmount = val => {
        this.dryGain.setGain(1 - val);
        this.wetGain.setGain(val);
    }
}

export default Distortion;