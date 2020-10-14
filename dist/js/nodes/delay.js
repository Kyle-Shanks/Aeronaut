import Filter from './filter.js';
import Gain from './gain.js';

class Delay {
    constructor(AC) {
        this.AC = AC;
        this.dryGain = new Gain(this.AC);
        this.wetGain = new Gain(this.AC);

        this.delayNode = this.AC.createDelay();
        this.tone = new Filter(this.AC);
        this.feedbackGain = new Gain(this.AC);

        this.tone.connect(this.delayNode);
        this.delayNode.connect(this.feedbackGain.getNode());
        this.feedbackGain.connect(this.wetGain.getNode());
        this.feedbackGain.connect(this.delayNode);

        this.maxDelayTime = 1;

        this.setAmount(0);
        this.setFeedback(0.7);
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
    getNode = () => [this.dryGain.getNode(), this.tone.getNode()];
    getAmount = () => this.wetGain.getGain();
    getDelayTime = () => this.delayNode.delayTime.value;
    getTone = () => this.tone.getFreq();
    getFeedback = () => this.feedbackGain.getGain();

    // Setters
    setAmount = val => {
        this.dryGain.setGain(1 - val);
        this.wetGain.setGain(val);
    }
    setFeedback = val => this.feedbackGain.setGain(val);
    setTone = val => this.tone.setFreq(val);
    setDelayTime = val => {
        if (val < 0 || val > this.maxDelayTime) return false;
        this.delayNode.delayTime.setValueAtTime(val, this.AC.currentTime);
    }
}

export default Delay;