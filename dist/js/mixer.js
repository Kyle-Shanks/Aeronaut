import * as Nodes from './nodes/index.js';
import SimpleSynth from './simpleSynth.js';
import Synth from './synth.js';

export default class Mixer {
    constructor(aeronaut) {
        this.AC = aeronaut.AC;
        this.el = document.createElement('div');
        this.el.id = 'mixer';

        this.masterEl = document.createElement('div');
        this.masterEl.className = 'group master';

        // Effect Elements
        this.createEffectElement('dis');
        this.createEffectElement('bit');
        this.createEffectElement('fil');
        this.createEffectElement('rev');
        this.createEffectElement('com');
        this.createEffectElement('vol');

        this.masterVolume = new Nodes.Gain(this.AC); // Master Volume
        this.masterVolume.setGain(0.75);

        this.channels = [];
        this.effects = {};
    }

    createEffectElement(label) {
        this[`${label}El`] = document.createElement('div');
        this[`${label}El`].className = `effect ${label}`;
        this[`${label}Label`] = document.createElement('span');
        this[`${label}Label`].className = 'label';
        this[`${label}Value`] = document.createElement('span');
        this[`${label}Value`].className = 'val';

        this[`${label}Label`].innerHTML = label;
        this[`${label}El`].appendChild(this[`${label}Label`]);
        this[`${label}El`].appendChild(this[`${label}Value`]);
        this.masterEl.appendChild(this[`${label}El`]);
    }

    install(host) {
        console.info('Mixer is installing...');

        // TODO: Need to create all of the synths and connect them to the audio context
        this.channels[0] = new SimpleSynth(this.AC, 0);
        this.channels[1] = new SimpleSynth(this.AC, 1);
        this.channels[2] = new SimpleSynth(this.AC, 2);
        this.channels[3] = new SimpleSynth(this.AC, 3);

        this.channels[4] = new Synth(this.AC, 4);
        this.channels[5] = new Synth(this.AC, 5);
        this.channels[6] = new Synth(this.AC, 6);
        this.channels[7] = new Synth(this.AC, 7);

        // Create all master effects
        this.effects.distortion = new Nodes.Distortion(this.AC);
        this.effects.bitcrusher = new Nodes.BitCrusher(this.AC);
        this.effects.filter = new Nodes.Filter(this.AC);
        this.effects.reverb = new Nodes.Reverb(this.AC);
        this.effects.compressor = new Nodes.Compressor(this.AC);

        // Connect all channels
        for (let id in this.channels) this.channels[id].connect(this.effects.distortion.getNode());

        this.effects.distortion.connect(this.effects.bitcrusher.getNode());
        this.effects.bitcrusher.connect(this.effects.filter.getNode());
        this.effects.filter.connect(this.effects.reverb.getNode());
        this.effects.reverb.connect(this.effects.compressor.getNode());
        this.effects.compressor.connect(this.masterVolume.getNode());

        this.masterVolume.connect(this.AC.destination);

        // Append all channels to this element
        this.synthGroup1 = document.createElement('div');
        this.synthGroup1.className = 'group';
        this.el.appendChild(this.synthGroup1);

        this.synthGroup2 = document.createElement('div');
        this.synthGroup2.className = 'group';
        this.el.appendChild(this.synthGroup2);

        this.channels[0].install(this.synthGroup1);
        this.channels[1].install(this.synthGroup1);
        this.channels[2].install(this.synthGroup1);
        this.channels[3].install(this.synthGroup1);
        this.channels[4].install(this.synthGroup2);
        this.channels[5].install(this.synthGroup2);
        this.channels[6].install(this.synthGroup2);
        this.channels[7].install(this.synthGroup2);

        // for (let id in this.channels) this.channels[id].install(this.synthGroup1);

        this.el.appendChild(this.masterEl);
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
        this.setContent(this.volValue, val.length === 2 ? val : `0${val}`);
    }
    updateDisEl = () => {
        const val = Math.floor(this.effects.distortion.getAmount() * 255).toString(16);
        this.setContent(this.disValue, val.length === 2 ? val : `0${val}`);
    }
    updateRevEl = () => {
        const val = Math.floor(this.effects.reverb.getAmount() * 255).toString(16);
        this.setContent(this.revValue, val.length === 2 ? val : `0${val}`);
    }
    updateBitEl = () => {
        const bitVal = (this.effects.bitcrusher.getBitDepth() - 1).toString(16);
        const val = Math.floor(this.effects.bitcrusher.getAmount() * 15).toString(16);
        this.setContent(this.bitValue, `${bitVal}${val}`);
    }
    updateFilEl = () => {
        const val = this.reverseAttenuate(this.effects.filter.getFreq() / this.effects.filter.maxFreq, 127);
        const hex = this.effects.filter.getType() === 'highpass'
            ? Math.round(val + 128).toString(16)
            : Math.round(val).toString(16);
        this.setContent(this.filValue, hex.length === 2 ? hex : `0${hex}`);
    }
    updateComEl = () => {
        const threshold = (this.effects.compressor.getThreshold() / -4).toString(16);
        const ratio = (this.effects.compressor.getRatio() - 1).toString(16);
        this.setContent(this.comValue, `${threshold}${ratio}`);
    }

    // Effect Functions
    setMasterVolume(args) {
        if (args.length > 2 || /[g-z]/.test(args)) { console.warn(`Misformatted vol`); return; }
        this.masterVolume.setGain(parseInt(args, 16) / 255);
        setTimeout(this.updateVolEl, 50);
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
        const freq = this.effects.filter.maxFreq * this.attenuate((val % 128), 127);;
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
            + '4DIS00;4REV0;4DEL00F0;4FIL80;4PAN80;4VIB00;'
            + '5DIS00;5REV0;5DEL00F0;5FIL80;5PAN80;5VIB00;'
            + '6DIS00;6REV0;6DEL00F0;6FIL80;6PAN80;6VIB00;'
            + '7DIS00;7REV0;7DEL00F0;7FIL80;7PAN80;7VIB00;'
            + 'DIS00;REV00;BIT70;FIL80;COM80;VOLBF'
        );
    }

    // Util
    setContent(el, ct) { if (el.innerHTML !== ct) el.innerHTML = ct; }
    attenuate(val, base = 16) { return Math.pow(val, 2) / Math.pow(base, 2); }
    reverseAttenuate(val, base) { return Math.sqrt(Math.pow(base, 2) * val); }
}
