class EQ2 {
    constructor(AC) {
        this.AC = AC;
        this.maxGain = 8;

        // Low
        this.low = this.AC.createBiquadFilter();
        this.low.type = "lowshelf";
        this.low.frequency.value = 320.0;
        this.low.gain.value = 0.0;
        // High
        this.high = this.AC.createBiquadFilter();
        this.high.type = "highshelf";
        this.high.frequency.value = 3200.0;
        this.high.gain.value = 0.0;

        this.low.connect(this.high);
    }

    connect = (destination) => {
        if (Array.isArray(destination)) {
            destination.forEach((dest) => this.high.connect(dest));
        } else {
            this.high.connect(destination);
        }
    }

    // Getters
    getNode = () => this.low;
    getLowGain = () => this.low.gain.value;
    getHighGain = () => this.high.gain.value;

    // Setters
    setLowGain = (gain, time = 0) => {
        if (gain < -this.maxGain || gain > this.maxGain) return false;
        time
            ? this.low.gain.setTargetAtTime(gain, this.AC.currentTime, time)
            : this.low.gain.setValueAtTime(gain, this.AC.currentTime);
    }
    setHighGain = (gain, time = 0) => {
        if (gain < -this.maxGain || gain > this.maxGain) return false;
        time
            ? this.high.gain.setTargetAtTime(gain, this.AC.currentTime, time)
            : this.high.gain.setValueAtTime(gain, this.AC.currentTime);
    }
}

export default EQ2;