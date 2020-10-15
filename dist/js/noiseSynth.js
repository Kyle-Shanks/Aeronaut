import * as Nodes from './nodes/index.js';
import SimpleSynth from './simpleSynth.js';
import { setContent } from './util.js';

export default class NoiseSynth extends SimpleSynth {
    constructor(AC, id) {
        super(AC, id);

        this.el.className = 'channel noise';
        this.osc = new Nodes.NoiseGenerator(this.AC);
    }

    updateOscEl = () => { setContent(this.oscEl, '--'); }
}
