class StereoPanner {
    constructor(AC) {
        this.AC = AC;
        this.node = this.AC.createStereoPanner();
    }

    connect = (destination) => {
        if (Array.isArray(destination)) {
            destination.forEach((dest) => this.node.connect(dest));
        } else {
            this.node.connect(destination);
        }
    }

    // Getters
    getNode = () => this.node;

    // Setters
    setPan = val => {
        this.node.pan.setValueAtTime(val, this.AC.currentTime);
    }
}

export default StereoPanner;