const dgram = require('dgram');

export default function Listener(mini) {
    this.server = dgram.createSocket('udp4');

    this.server.on('message', (msg, rinfo) => { mini.mixer.run(`${msg}`); });

    this.server.on('listening', () => {
        const address = this.server.address();
        console.log(`Server listening for UDP: ${address.address}:${address.port}`);
    });

    this.server.on('error', (err) => {
        console.log(`Server error:\n${err.stack}`);
        server.close();
    });

    this.server.bind(49161);
}