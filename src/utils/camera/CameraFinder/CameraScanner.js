import net from 'node:net';

export class CameraScanner {

    static defaults = {
        base_ip: '192.168',
        minX: 1,
        maxX: 254,
        minY: 1,
        maxY: 254,
        ports: [80, 554, 8899, 34567],//80 = Web, 554 = RTC, 8899 = Onvif, 34567 = Fabricant ?
        timeout: 300,
        blocks: 20,
        logs: false
    };

    #results = new Map();
    #scanning = false;
    #pendingRequests = new Set();

    constructor(params = {}) {

        Object.assign(this, this.constructor.defaults, params);
    }

    *#ipGenerator() {
        for (let x = this.minX; x <= this.maxX; x++) {
            for (let y = this.minY; y <= this.maxY; y++) {
                yield `${this.base_ip}.${x}.${y}`;
            }
        }
    }

    async scan(params = {}){

        if(this.#scanning) throw new Error('CameraScanner is already scanning');

        const { logs = this.logs } = params;

        this.#results.clear();
        this.#scanning = true;

        const generator = this.#ipGenerator();

        const worker = async () => {

            while(this.#scanning) {

                const { value: ip, done } = generator.next();

                if(done) break;

                if(logs) console.log(`> Try: ${ip}`);

                const result = await this.#scanIP(ip);

                if(result.length > 0) {
                    this.#results.set(ip, result);
                }
            }
        };

        await Promise.all(
            Array.from({ length: this.blocks }, worker)
        );

        this.#scanning = false;

        return new Map(this.#results);
    }

    stop() {
        this.#scanning = false;

        for(const socket of this.#pendingRequests) {
            socket.destroy();
        }
    }

    async #scanPort(ip, port) {

        return new Promise(resolve => {

            const socket = new net.Socket();
            let status = false;

            this.#pendingRequests.add(socket);

            socket.setTimeout(this.timeout);

            socket.connect(port, ip, () => {
                status = true;
                socket.destroy();
            });

            socket.on('timeout', () => socket.destroy());
            socket.on('error', () => {});
            socket.on('close', () => {
                this.#pendingRequests.delete(socket);
                resolve(status);
            });
        });
    }

    async #scanIP(ip) {

        const results = [];

        for(const port of this.ports) {

            if(!this.#scanning) break;

            const open = await this.#scanPort(ip, port);

            if(open) {
                results.push(port);
            }
        }

        return results;
    }
}

export default CameraScanner;