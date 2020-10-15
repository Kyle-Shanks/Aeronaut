import SimpleSynth from './simpleSynth.js';
import Synth from './synth.js';
import * as Nodes from './nodes/index.js';
import { clamp, attenuate, reverseAttenuate, setContent } from './util.js';

export default class Mixer {
    constructor(aeronaut) {
        this.AC = aeronaut.AC;
        this.bpm = 120;

        this.el = document.createElement('div');
        this.el.id = 'mixer';

        this.masterEl = document.createElement('div');
        this.masterEl.className = 'group master';
        this.masterEl2 = document.createElement('div');
        this.masterEl2.className = 'group master';

        // Effect Elements
        this.createEffectElement('dis', this.masterEl);
        this.createEffectElement('bit', this.masterEl);
        this.createEffectElement('fil', this.masterEl);
        this.createEffectElement('rev', this.masterEl);
        this.createEffectElement('com', this.masterEl2);
        this.createEffectElement('vol', this.masterEl2);

        // Bpm Element
        this.bpmEl = document.createElement('div');
        this.bpmEl.className = 'effect bpm';
        this.masterEl2.appendChild(this.bpmEl);

        this.masterVolume = new Nodes.Gain(this.AC); // Master Volume
        this.masterVolume.setGain(0.75);

        this.channels = [];
        this.effects = {};
    }

    createEffectElement(label, container) {
        this[`${label}El`] = document.createElement('div');
        this[`${label}El`].className = `effect ${label}`;
        this[`${label}Label`] = document.createElement('span');
        this[`${label}Label`].className = 'label';
        this[`${label}Value`] = document.createElement('span');
        this[`${label}Value`].className = 'val';

        this[`${label}Label`].innerHTML = label;
        this[`${label}El`].appendChild(this[`${label}Label`]);
        this[`${label}El`].appendChild(this[`${label}Value`]);
        container.appendChild(this[`${label}El`]);
    }

    install(host) {
        console.info('Mixer is installing...');

        // Create the full synths
        this.channels[0] = new Synth(this.AC, 0);
        this.channels[1] = new Synth(this.AC, 1);
        this.channels[2] = new Synth(this.AC, 2);
        this.channels[3] = new Synth(this.AC, 3);

        // Create the simple synths
        this.channels[4] = new SimpleSynth(this.AC, 4);
        this.channels[5] = new SimpleSynth(this.AC, 5);
        this.channels[6] = new SimpleSynth(this.AC, 6);
        this.channels[7] = new SimpleSynth(this.AC, 7);
        this.channels[8] = new SimpleSynth(this.AC, 8);
        this.channels[9] = new SimpleSynth(this.AC, 9);
        this.channels[10] = new SimpleSynth(this.AC, 10);
        this.channels[11] = new SimpleSynth(this.AC, 11);
        this.channels[12] = new SimpleSynth(this.AC, 12);
        this.channels[13] = new SimpleSynth(this.AC, 13);
        this.channels[14] = new SimpleSynth(this.AC, 14);
        this.channels[15] = new SimpleSynth(this.AC, 15);

        // Create all master effects
        this.effects.distortion = new Nodes.Distortion(this.AC);
        this.effects.bitcrusher = new Nodes.BitCrusher(this.AC);
        this.effects.filter = new Nodes.Filter(this.AC);
        this.effects.reverb = new Nodes.Reverb(this.AC);
        this.effects.compressor = new Nodes.Compressor(this.AC);

        // Connect all channels
        for (let id in this.channels) this.channels[id].connect(this.effects.distortion.getNode());

        // Connect all effects
        this.effects.distortion.connect(this.effects.bitcrusher.getNode());
        this.effects.bitcrusher.connect(this.effects.filter.getNode());
        this.effects.filter.connect(this.effects.reverb.getNode());
        this.effects.reverb.connect(this.effects.compressor.getNode());
        this.effects.compressor.connect(this.masterVolume.getNode());

        this.masterVolume.connect(this.AC.destination);

        // Append all channels to group elements
        this.synthGroup1 = document.createElement('div');
        this.synthGroup1.className = 'group synth';
        this.el.appendChild(this.synthGroup1);

        this.synthGroup2 = document.createElement('div');
        this.synthGroup2.className = 'group';
        this.el.appendChild(this.synthGroup2);

        this.synthGroup3 = document.createElement('div');
        this.synthGroup3.className = 'group';
        this.el.appendChild(this.synthGroup3);

        this.synthGroup4 = document.createElement('div');
        this.synthGroup4.className = 'group';
        this.el.appendChild(this.synthGroup4);

        this.channels[0].install(this.synthGroup1);
        this.channels[1].install(this.synthGroup1);
        this.channels[2].install(this.synthGroup1);
        this.channels[3].install(this.synthGroup1);
        this.channels[4].install(this.synthGroup2);
        this.channels[5].install(this.synthGroup2);
        this.channels[6].install(this.synthGroup2);
        this.channels[7].install(this.synthGroup2);
        this.channels[8].install(this.synthGroup3);
        this.channels[9].install(this.synthGroup3);
        this.channels[10].install(this.synthGroup3);
        this.channels[11].install(this.synthGroup3);
        this.channels[12].install(this.synthGroup4);
        this.channels[13].install(this.synthGroup4);
        this.channels[14].install(this.synthGroup4);
        this.channels[15].install(this.synthGroup4);

        this.el.appendChild(this.masterEl);
        this.el.appendChild(this.masterEl2);
        host.appendChild(this.el);
    }

    start() {
        console.info('Mixer is starting...');

        // Start synth on all channels
        for (let id in this.channels) this.channels[id].start();

        setTimeout(this.reset, 500);
    }

    // Display Update Functions
    updateVolEl = () => {
        const val = Math.floor(this.masterVolume.getGain() * 255).toString(16);
        setContent(this.volValue, val.length === 2 ? val : `0${val}`);
    }
    updateBpmEl = () => {
        setContent(this.bpmEl, this.bpm);
    }
    updateDisEl = () => {
        const val = Math.floor(this.effects.distortion.getAmount() * 255).toString(16);
        setContent(this.disValue, val.length === 2 ? val : `0${val}`);
    }
    updateRevEl = () => {
        const val = Math.floor(this.effects.reverb.getAmount() * 255).toString(16);
        setContent(this.revValue, val.length === 2 ? val : `0${val}`);
    }
    updateBitEl = () => {
        const bitVal = (this.effects.bitcrusher.getBitDepth() - 1).toString(16);
        const val = Math.floor(this.effects.bitcrusher.getAmount() * 15).toString(16);
        setContent(this.bitValue, `${bitVal}${val}`);
    }
    updateFilEl = () => {
        const val = reverseAttenuate(this.effects.filter.getFreq() / this.effects.filter.maxFreq, 127);
        const hex = this.effects.filter.getType() === 'highpass'
            ? Math.round(val + 128).toString(16)
            : Math.round(val).toString(16);
        setContent(this.filValue, hex.length === 2 ? hex : `0${hex}`);
    }
    updateComEl = () => {
        const threshold = (this.effects.compressor.getThreshold() / -4).toString(16);
        const ratio = (this.effects.compressor.getRatio() - 1).toString(16);
        setContent(this.comValue, `${threshold}${ratio}`);
    }

    // Effect Functions
    setMasterVolume(args) {
        if (args.length > 2 || /[g-z]/.test(args)) { console.warn(`Misformatted vol`); return; }
        this.masterVolume.setGain(parseInt(args, 16) / 255);
        setTimeout(this.updateVolEl, 50);
    }
    setBpm(args) {
        if (args.length < 2 || args.length > 3 || /\D/.test(args)) { console.warn(`Misformatted bpm`); return; }
        this.bpm = clamp(parseInt(args), 30, 300);
        for (let id in this.channels) this.channels[id].updateBpm(this.bpm);
        setTimeout(this.updateBpmEl, 50);
    }
    setDistortion(args) {
        if (args.length > 2 || /[g-z]/.test(args)) { console.warn(`Misformatted dis`); return; }
        this.effects.distortion.setAmount(parseInt(args, 16) / 255);
        setTimeout(this.updateDisEl, 50);
    }
    setReverb(args) {
        if (args.length > 2 || /[g-z]/.test(args)) { console.warn(`Misformatted rev`); return; }
        this.effects.reverb.setAmount(parseInt(args, 16) / 255);
        setTimeout(this.updateRevEl, 50);
    }
    setBitcrusher(args) {
        if (args.length > 2 || /[g-z]/.test(args)) { console.warn(`Misformatted bit`); return; }
        const bitDepth = parseInt(args.slice(0,1), 16);
        const amount = parseInt(args.slice(1), 16);

        if (!isNaN(bitDepth)) this.effects.bitcrusher.setBitDepth(bitDepth + 1);
        if (!isNaN(amount)) this.effects.bitcrusher.setAmount(amount / 15);
        setTimeout(this.updateBitEl, 50);
    }
    setFilter(args) {
        if (args.length > 2 || /[g-z]/.test(args)) { console.warn(`Misformatted fil`); return; }
        const val = parseInt(args, 16);
        const freq = this.effects.filter.maxFreq * attenuate((val % 128), 127);;
        const waveform = val >= 128 ? 'highpass' : 'lowpass';

        this.effects.filter.setType(waveform);
        this.effects.filter.setFreq(freq);
        setTimeout(this.updateFilEl, 50);
    }
    setCompressor(args) {
        if (args.length > 2 || /[g-z]/.test(args)) { console.warn(`Misformatted com`); return; }
        const threshold = parseInt(args.slice(0, 1), 16);
        const ratio = parseInt(args.slice(1), 16);

        if (!isNaN(threshold)) this.effects.compressor.setThreshold(threshold * -4);
        if (!isNaN(ratio)) this.effects.compressor.setRatio(ratio + 1);
        setTimeout(this.updateComEl, 50);
    }

    // Run Command Function
    run(msg) {
        if (msg.length < 3) return;

        // Multiple message check
        if (msg.indexOf(';') > -1) {
            const parts = msg.split(';');
            for (let id in parts) this.run(parts[id]);
            return;
        }

        if (/\W/.test(msg)) return;

        // Command check
        if (msg.length > 3) {
            const cmd = msg.slice(0,3).toLowerCase();
            const args = msg.slice(3).toLowerCase();

            if (cmd === 'dis') return this.setDistortion(args);
            else if (cmd === 'rev') return this.setReverb(args);
            else if (cmd === 'bit') return this.setBitcrusher(args);
            else if (cmd === 'fil') return this.setFilter(args);
            else if (cmd === 'com') return this.setCompressor(args);
            else if (cmd === 'vol') return this.setMasterVolume(args);
            else if (cmd === 'bpm') return this.setBpm(args);
        }

        // Channel check
        const channelId = parseInt(msg.slice(0, 1), 16);
        if (!isNaN(channelId) && channelId < this.channels.length) {
            this.channels[channelId].run(msg.slice(1));
        }
    }

    reset = () => {
        this.run(
            '0ENV0600;0OSCSI;1ENV0600;1OSCSI;2ENV0600;2OSCSI;3ENV0600;3OSCSI;'
            + '4ENV0600;4OSCSI;5ENV0600;5OSCSI;6ENV0600;6OSCSI;7ENV0600;7OSCSI;'
            + '8ENV0600;8OSCSI;9ENV0600;9OSCSI;AENV0600;AOSCSI;BENV0600;BOSCSI;'
            + 'CENV0600;COSCSI;DENV0600;DOSCSI;EENV0600;EOSCSI;FENV0600;FOSCSI;'
            + '0DIS00;0REV00;0DEL00;0FIL80;0PAN80;0VIB00;'
            + '1DIS00;1REV00;1DEL00;1FIL80;1PAN80;1VIB00;'
            + '2DIS00;2REV00;2DEL00;2FIL80;2PAN80;2VIB00;'
            + '3DIS00;3REV00;3DEL00;3FIL80;3PAN80;3VIB00;'
            + 'DIS00;REV00;BIT70;FIL80;COM80;VOL80;BPM120'
        );
    }
}
