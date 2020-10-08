import Gain from './nodes/gain.js';
import SimpleSynth from './simpleSynth.js';

export default class Mixer {
    constructor() {
        this.el = document.createElement('div');
        this.el.id = 'mixer';

        this.AC = new AudioContext();
        this.masterVolume = new Gain(this.AC); // Master Volume

        this.channels = [];
        this.effects = {};
    }

    install(host) {
        console.info('Mixer is installing...');
        this.masterVolume.connect(this.AC.destination);
        this.masterVolume.setGain(0.75);

        // TODO: Need to create all of the synths and connect them to the audio context
        this.channels[0] = new SimpleSynth(this.AC, 0);
        this.channels[1] = new SimpleSynth(this.AC, 1);
        this.channels[2] = new SimpleSynth(this.AC, 2);
        this.channels[3] = new SimpleSynth(this.AC, 3);

        // Connect all channels to master output
        for (let id in this.channels) this.channels[id].connect(this.masterVolume.getNode());

        // Append all channels to this element
        for (let id in this.channels) this.channels[id].install(this.el);

        host.appendChild(this.el);
    }

    start() {
        console.info('Mixer is starting...');

        // Start synth on all channels
        for (let id in this.channels) this.channels[id].start();

        // TODO: Reset to preset (?)
    }

    run(msg) {
        console.log(msg);
        if (msg.length < 3) return;

        // Multiple message check
        if (msg.indexOf(';') > -1) {
            const parts = msg.split(';');
            for (let id in parts) this.run(parts[id]);
            return;
        }

        // TODO: Check for special commands here

        // Channel check
        const channelId = parseInt(msg.slice(0, 1), 16);
        if (!isNaN(channelId) && channelId < this.channels.length) {
            this.channels[channelId].run(msg.slice(1));
        }
    }
}
