import * as Nodes from './nodes/index.js';
import SimpleSynth from './simpleSynth.js';
import { clamp, noteToFreq } from './util.js';

const WAVENAMES = ['si', 'tr', 'sq', 'sw'];
const WAVEFORMS = ['sine', 'triangle', 'square', 'sawtooth'];

export default class Synth extends SimpleSynth {
    constructor(AC, id) {
        super(AC, id);

        this.el.className = 'channel synth'

        this.vibrato = new Nodes.LFO(this.AC);
        this.delay = new Nodes.Delay(this.AC);
        this.distortion = new Nodes.Distortion(this.AC);
        this.reverb = new Nodes.Reverb(this.AC);
        this.filter = new Nodes.Filter(this.AC);
        this.panner = new Nodes.StereoPanner(this.AC);
    }

    install(host) {
        this.vibrato.connect(this.osc.getNode().detune);
        this.osc.connect(this.gain.getNode());
        this.gain.connect(this.panner.getNode());
        this.panner.connect(this.delay.getNode());
        this.delay.connect(this.distortion.getNode());
        this.distortion.connect(this.filter.getNode());
        this.filter.connect(this.reverb.getNode());
        this.reverb.connect(this.volume.getNode());

        this.volume.setGain(0.75);
        this.gain.setGain(0);
        this.osc.start();
        this.vibrato.start();

        host.appendChild(this.el);
    }


    // Display Update Functions
    updateAllEl() {
        this.updateEnvEl();
        this.updateOscEl();
        this.updateVolEl();
    }

    run(msg) {
        const data = this.parse(msg);
        if (!data) { console.warn(`Unknown data`); return; }

        switch (data.cmd) {
            case 'osc': this.setOscWaveform(data); break;
            case 'env': this.setGainEnv(data); break;
            case 'vol': this.setVolume(data); break;
            // Effects
            case 'vib': this.setVibrato(data); break;
            case 'pan': this.setPan(data); break;
            case 'del': this.setDelay(data); break;
            case 'dis': this.setDistortion(data); break;
            case 'fil': this.setFilter(data); break;
            case 'rev': this.setReverb(data); break;
            // Play Note
            default: this.noteOn(data);
        }
    }

    // Parse Functions
    parse(msg) {
        const cmd = msg.slice(0, 3).toLowerCase();
        const args = msg.slice(3).toLowerCase();

        switch (cmd) {
            case 'env': return this.parseEnv(args);
            case 'osc': return this.parseOsc(args);
            case 'vol': return this.parseVol(args);
            // Effects
            case 'vib': return this.parseVibrato(args);
            case 'pan': return this.parsePan(args);
            case 'del': return this.parseDelay(args);
            case 'dis': return this.parseDistortion(args);
            case 'fil': return this.parseFilter(args);
            case 'rev': return this.parseReverb(args);
            // TODO: Add random env and osc functions
            // case 'ren': return { isRen: true };
            // case 'ros': return { isRos: true };
            default: return this.parseNote(msg);
        }
    }

    parseVibrato(args) {
        if (args.length > 2 || /[g-z]/.test(args)) { console.warn(`Misformatted vib`); return; }
        const depth = parseInt(args.slice(0, 1), 16) * 10;
        const rate = (parseInt(args.slice(1), 16) / 15) * 50;

        return { cmd: 'vib', depth, rate };
    }
    parsePan(args) {
        if (args.length > 2 || /[g-z]/.test(args)) { console.warn(`Misformatted pan`); return; }
        const pan = Math.max(parseInt(args, 16) - 128, -127) / 127;
        return { cmd: 'pan', pan };
    }
    parseDelay(args) {
        if (args.length > 4 || /[g-z]/.test(args)) { console.warn(`Misformatted del`); return; }
        const time = parseInt(args.slice(0, 1), 16) / 15;
        const feedback = parseInt(args.slice(1, 2), 16) / 15;
        const tone = (parseInt(args.slice(2, 3), 16) / 15) * 11000;
        const amount = parseInt(args.slice(3,4), 16) / 15;

        return { cmd: 'del', time, feedback, tone, amount };
    }
    parseDistortion(args) {
        if (args.length > 2 || /[g-z]/.test(args)) { console.warn(`Misformatted dis`); return; }
        return { cmd: 'dis', amount: parseInt(args, 16) / 255 };
    }
    parseReverb(args) {
        if (args.length > 2 || /[g-z]/.test(args)) { console.warn(`Misformatted rev`); return; }
        return { cmd: 'rev', amount: parseInt(args, 16) / 255 };
    }
    parseFilter(args) {
        if (args.length > 2 || /[g-z]/.test(args)) { console.warn(`Misformatted fil`); return; }
        const val = parseInt(args, 16);
        const freq = this.filter.maxFreq * this.attenuate((val % 128), 127);;
        const waveform = val >= 128 ? 'highpass' : 'lowpass';

        return { cmd: 'fil', freq, waveform };
    }

    setVibrato(data) {
        if (!isNaN(data.depth)) this.vibrato.setDepth(data.depth);
        if (!isNaN(data.rate)) this.vibrato.setRate(data.rate);
        // setTimeout(this.updateVibEl, 50);
    }
    setPan(data) {
        this.panner.setPan(data.pan);
        // setTimeout(this.updatePanEl, 50);
    }
    setDelay(data) {
        if (!isNaN(data.time)) this.delay.setDelayTime(data.time);
        if (!isNaN(data.feedback)) this.delay.setFeedback(data.feedback);
        if (!isNaN(data.tone)) this.delay.setTone(data.tone);
        if (!isNaN(data.amount)) this.delay.setAmount(data.amount);
        // setTimeout(this.updateDelEl, 50);
    }
    setDistortion(data) {
        this.distortion.setAmount(data.amount);
        // setTimeout(this.updateDisEl, 50);
    }
    setReverb(data) {
        this.reverb.setAmount(data.amount);
        // setTimeout(this.updateRevEl, 50);
    }
    setFilter(data) {
        this.filter.setType(data.waveform);
        this.filter.setFreq(data.freq);
        // setTimeout(this.updateFilEl, 50);
    }

    // Util Functions
    valToHex(num) { return Math.floor(num * 15).toString(16); }
    setContent(el, ct) { if (el.innerHTML !== ct) el.innerHTML = ct; }
    attenuate(val, base = 16) { return Math.pow(val, 2) / Math.pow(base, 2); }
}
