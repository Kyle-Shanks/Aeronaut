import * as Nodes from './nodes/index.js';
import { clamp, attenuate, setContent, noteToFreq, getLengthFromBpm, bpmLengthToHex } from './util.js';

const WAVENAMES = ['si', 'tr', 'sq', 'sw'];
const WAVEFORMS = ['sine', 'triangle', 'square', 'sawtooth'];

export default class SimpleSynth {
    constructor(AC, id) {
        this.AC = AC;
        this.bpm = 120;

        this.el = document.createElement('div');
        this.el.id = `ch${id.toString(16)}`;
        this.el.className = 'channel simple';
        this.cidEl = document.createElement('span');
        this.cidEl.className = `cid`;
        this.cidEl.innerHTML = id.toString(16);
        this.envEl = document.createElement('span');
        this.envEl.className = `env`;
        this.oscEl = document.createElement('span');
        this.oscEl.className = `osc`;
        this.volEl = document.createElement('span');
        this.volEl.className = `vol`;

        this.canvas = document.createElement('canvas');
        this.canvas.width = 32;
        this.canvas.height = 32;
        this.ctx = this.canvas.getContext('2d');

        this.lastCnvUpdate = null;
        this.lastNote = null;

        this.el.appendChild(this.cidEl);
        this.el.appendChild(this.envEl);
        this.el.appendChild(this.oscEl);
        this.el.appendChild(this.volEl);
        this.el.appendChild(this.canvas);

        this.osc = new Nodes.Oscillator(this.AC);
        this.gain = new Nodes.Gain(this.AC); // ADSR Gain
        this.volume = new Nodes.Gain(this.AC); // Volume

        this.gainEnv = {
            a: 0.01,
            d: 0.4,
            s: 0,
            r: 0.01,
        };

        this.timeoutIds = [];
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
        setTimeout(() => { this.updateAllEl(); this.loop(); }, 500);
    }

    connect(destination) { this.volume.connect(destination); }

    // Special function for bpm update
    updateBpm = (bpm) => { this.bpm = bpm; }

    // Display Update Functions
    updateAllEl() {
        this.updateEnvEl();
        this.updateOscEl();
        this.updateVolEl();
    }
    updateEnvEl = () => {
        const a = Math.floor(this.gainEnv.a * 15).toString(16);
        const d = Math.floor(this.gainEnv.d * 15).toString(16);
        const s = Math.floor(this.gainEnv.s * 15).toString(16);
        const r = Math.floor(this.gainEnv.r * 15).toString(16);
        setContent(this.envEl, `${a}${d}${s}${r}`);
    }
    updateOscEl = () => {
        const waveform = this.osc.getType();
        const wavename = WAVENAMES[WAVEFORMS.indexOf(waveform)];
        setContent(this.oscEl, wavename);
    }
    updateVolEl = () => {
        const val = Math.floor(this.volume.getGain() * 255).toString(16);
        setContent(this.volEl, val.length === 2 ? val : `0${val}`);
    }

    run(msg) {
        const data = this.parse(msg);
        if (!data) { console.warn(`Unknown data`); return; }

        switch (data.cmd) {
            case 'osc': this.setOscWaveform(data); break;
            case 'env': this.setGainEnv(data); break;
            case 'vol': this.setVolume(data); break;
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
            // TODO: Add random env and osc functions
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

        const velocity = args.length >= 3 ? attenuate(parseInt(args.slice(2, 3), 16)) : 1;

        const lengthVal = args.length >= 4 ? parseInt(args.slice(3, 4), 16) : 7;
        const length = getLengthFromBpm(this.bpm, lengthVal);

        return { isNote: true, freq, length, velocity };
    }
    parseEnv(args) {
        if (args.length < 1 || /[g-z]/.test(args)) { console.warn(`Misformatted env`); return; }

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
    parseVol(args) {
        if (args.length > 2 || /[g-z]/.test(args)) { console.warn(`Misformatted vol`); return; }
        return { cmd: 'vol', val: parseInt(args, 16) / 255 };
    }

    // Param Update Functions
    setGainEnv(data) {
        if (!isNaN(data.attack)) this.gainEnv.a = clamp(data.attack, 0.01, 1);
        if (!isNaN(data.decay)) this.gainEnv.d = clamp(data.decay, 0.01, 1);
        if (!isNaN(data.sustain)) this.gainEnv.s = clamp(data.sustain, 0, 1);
        if (!isNaN(data.release)) this.gainEnv.r = clamp(data.release, 0.01, 1);

        setTimeout(this.updateEnvEl, 50);
    }
    setOscWaveform(data) {
        this.osc.setType(data.waveform);
        setTimeout(this.updateOscEl, 50);
    }
    setVolume(data) {
        this.volume.setGain(data.val);
        setTimeout(this.updateVolEl, 50);
    }

    // Note trigger methods
    noteOn = (note) => {
        const { freq, velocity, length } = note;
        // null or zero shouldn't play the note
        if (!freq || !velocity || !length) return;

        this.clearTimeouts();
        this.osc.setFreq(freq);

        // Gain Envelope ADS (R is in noteOff())
        if (this.gainEnv.a) {
            this.gain.setGain(0, 0.005); // Reset Volume
            this.gain.setGain(velocity, (this.gainEnv.a / 5)); // Attack

            if (this.gainEnv.a < length) {
                const timeoutId = setTimeout(() => {
                    this.gain.setGain(this.gainEnv.s * velocity, (this.gainEnv.d / 5)); // Decay
                }, (this.gainEnv.a * 1000));
                this.timeoutIds.push(timeoutId);
            }
        } else {
            this.gain.setGain(velocity, 0.005); // Reset Volume
            this.gain.setGain(this.gainEnv.s * velocity, (this.gainEnv.d / 5)); // Decay
        }

        // Note Off timeout based on note length
        const offTimeoutId = setTimeout(() => { this.noteOff(); }, (length * 1000));
        this.timeoutIds.push(offTimeoutId);
        this.lastNote = performance.now();
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

    // Canvas Functions
    draw() {
        if (this.lastCnvUpdate && performance.now() - this.lastCnvUpdate < 30) return;

        this.ctx.clearRect(0, 0, 32, 32);
        this.drawActivity();
        this.lastCnvUpdate = performance.now();
    }

    drawActivity() {
        if (!this.lastNote) return;

        const elapsed = performance.now() - this.lastNote;
        const max = 500;

        this.ctx.beginPath();
        this.ctx.arc(3, 6, 3, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = `rgba(255,255,255,${(1 - (elapsed / max))})`;
        this.ctx.fill();
        this.ctx.closePath();
    }

    loop = () => {
        this.draw();
        requestAnimationFrame(this.loop);
    }
}
