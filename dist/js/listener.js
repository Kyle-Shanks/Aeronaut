const dgram = require('dgram');

export default function Listener(aeronaut) {
    this.server = dgram.createSocket('udp4');

    this.server.on('message', (msg, rinfo) => {
        aeronaut.mixer.run(`${msg}`.replace(/\s+/g, ''));
    });

    this.server.on('listening', () => {
        const address = this.server.address();
        console.info(`Server listening for UDP: ${address.address}:${address.port}`);
    });

    this.server.on('error', (err) => {
        console.info(`Server error:\n${err.stack}`);
        server.close();
    });

    this.server.bind(49161);
}