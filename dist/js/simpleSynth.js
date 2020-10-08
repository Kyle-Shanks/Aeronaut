import * as Nodes from './nodes/index.js';
import { clamp, noteToFreq } from './util.js';

const WAVENAMES = ['si', 'tr', 'sq', 'sw'];
const WAVEFORMS = ['sine', 'triangle', 'square', 'sawtooth'];

export default class SimpleSynth {
    constructor(AC, id) {
        this.AC = AC;

        this.el = document.createElement('div');
        this.el.id = `ch${id.toString(16)}`;
        this.el.className = 'channel';
        this.cidEl = document.createElement('span');
        this.cidEl.className = `cid`;
        this.envEl = document.createElement('span');
        this.envEl.className = `env`;
        this.oscEl = document.createElement('span');
        this.oscEl.className = `osc`;

        this.cidEl.innerHTML = id.toString(16);

        this.el.appendChild(this.cidEl);
        this.el.appendChild(this.envEl);
        this.el.appendChild(this.oscEl);

        this.volume = new Nodes.Gain(this.AC); // Volume
        this.gain = new Nodes.Gain(this.AC); // ADSR Gain
        this.osc = new Nodes.Oscillator(this.AC);

        this.gainEnv = {
            a: 0.01,
            d: 0.4,
            s: 0,
            r: 0.01,
        };

        this.timeoutIds = [];
        this.noteHeld = null;
    }

    install(host) {
        this.volume.setGain(0.75);

        this.gain.connect(this.volume.getNode());
        this.gain.setGain(0);

        this.osc.connect(this.gain.getNode());
        this.osc.start();

        host.appendChild(this.el);
    }

    start() {
        this.updateAllEl();
    }

    connect(destination) {
        this.volume.connect(destination);
    }

    // Display Update Functions
    updateAllEl() {
        this.updateEnvEl();
        this.updateOscEl();
    }
    updateEnvEl() {
        this.setContent(
            this.envEl,
            `${this.valToHex(this.gainEnv.a)}${this.valToHex(this.gainEnv.d)}${this.valToHex(this.gainEnv.s)}${this.valToHex(this.gainEnv.r)}`
        );
    }
    updateOscEl() {
        const waveform = this.osc.getType();
        const wavename = WAVENAMES[WAVEFORMS.indexOf(waveform)];
        this.setContent(this.oscEl, wavename);
    }

    run(msg) {
        console.log(`${this.el.id} running ${msg}`);
        const data = this.parse(msg);
        if (!data) { console.warn(`Unknown data`); return; }

        switch (data.cmd) {
            case 'osc': this.setOscWaveform(data); break;
            case 'env': this.setGainEnv(data); break;
            default: this.noteOn(data);
        }
    }

    parse(msg) {
        const cmd = msg.slice(0, 3).toLowerCase();
        const val = msg.slice(3).toLowerCase();

        switch (cmd) {
            case 'env': return this.parseEnv(val);
            case 'osc': return this.parseOsc(val);
            // case 'ren': return { isRen: true };
            // case 'ros': return { isRos: true };
            default: return this.parseNote(msg);
        }
    }

    parseNote(args) {
        if (args.length < 2) { console.warn(`Misformatted note`); return; }

        const octave = clamp(parseInt(args.slice(0, 1), 36), 0, 8);
        const note = args.slice(1, 2);
        const freq = noteToFreq(note, octave);

        const velocity = args.length >= 3 ? this.attenuate(parseInt(args.slice(2, 3), 16)) : 1;
        const length = args.length >= 4 ? (parseInt(args.slice(3, 4), 16) / 15) : 0.125;

        return { isNote: true, freq, length, velocity };
    }

    parseEnv(args) {
        if (args.length < 1) { console.warn(`Misformatted env`); return; }

        const attack = parseInt(args.slice(0, 1), 16) / 15
        const decay = args.length > 1 ? parseInt(args.slice(1, 2), 16) / 15 : null
        const sustain = args.length > 2 ? parseInt(args.slice(2, 3), 16) / 15 : null
        const release = args.length > 3 ? parseInt(args.slice(3, 4), 16) / 15 : null
        return { cmd: 'env', attack, decay, sustain, release, }
    }

    parseOsc(args) {
        if (args.length !== 2) { console.warn(`Misformatted osc`); return; }
        const index = WAVENAMES.indexOf(args);
        if (index == -1) return;
        return { cmd: 'osc', waveform: WAVEFORMS[index] };
    }

    setGainEnv(data) {
        if (!isNaN(data.attack)) this.gainEnv.a = clamp(data.attack, 0.01, 1);
        if (!isNaN(data.decay)) this.gainEnv.d = clamp(data.decay, 0.01, 1);
        if (!isNaN(data.sustain)) this.gainEnv.s = clamp(data.sustain, 0, 1);
        if (!isNaN(data.release)) this.gainEnv.r = clamp(data.release, 0.01, 1);

        this.updateEnvEl();
    }

    setOscWaveform(data) {
        this.osc.setType(data.waveform);
        this.updateOscEl();
    }

    // Note trigger methods
    noteOn = (note) => {
        const { freq, velocity, length } = note;
        this.clearTimeouts();

        this.osc.setFreq(freq);

        // Gain Envelope ADS (R is in noteOff())
        if (this.gainEnv.a) {
            this.gain.setGain(0); // Reset Volume
            this.gain.setGain(velocity, (this.gainEnv.a / 5)); // Attack

            if (this.gainEnv.a < length) {
                const timeoutId = setTimeout(() => {
                    this.gain.setGain(this.gainEnv.s * velocity, (this.gainEnv.d / 5)); // Decay
                }, (this.gainEnv.a * 1000));
                this.timeoutIds.push(timeoutId);
            }
        } else {
            this.gain.setGain(velocity); // Reset Volume
            this.gain.setGain(this.gainEnv.s * velocity, (this.gainEnv.d / 5)); // Decay
        }

        // Note Off timeout based on note length
        const offTimeoutId = setTimeout(() => { this.noteOff(); }, (length * 1000));
        this.timeoutIds.push(offTimeoutId);
    }
    noteOff = () => {
        this.clearTimeouts();
        this.gain.setGain(0, (this.gainEnv.r / 5));
    }
    noteStop = () => {
        this.clearTimeouts();
        this.gain.setGain(0);
    }

    clearTimeouts() {
        this.timeoutIds.forEach((id) => clearTimeout(id));
    }

    // Util Functions
    valToHex(num) { return Math.floor(num * 15).toString(16); }
    setContent(el, ct) { if (el.innerHTML !== ct) el.innerHTML = ct; }
    attenuate(val, base = 16) { return Math.pow(val, 2) / Math.pow(base, 2); }
}
