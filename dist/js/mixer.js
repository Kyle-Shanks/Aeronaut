
export default class Mixer {
    constructor() {
        this.el = document.createElement('div');
        this.el.id = 'mixer';

        this.AC = new AudioContext();
        this.channels = [];
        this.effects = {};
    }

    install(host) {
        console.info('Mixer is installing...');

        // TODO: Need to create all of the synths and connect them to the audio context
        // TODO: Need to connect all of the synths to a master gain
        // TODO: Need to append all of the synths to this element

        host.appendChild(this.el);
    }

    start() {
        console.info('Mixer is starting...');

        // TODO: Start synths on all channels
        // TODO: Reset to preset (?)
    }

    run(msg) {
        console.log(msg);
    }
}
