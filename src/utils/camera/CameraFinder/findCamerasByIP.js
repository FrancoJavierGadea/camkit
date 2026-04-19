import net from "node:net";

export async function findCamerasByIP(params = {}) {

    const {
        base_ip = "192.168",
        minX = 1,
        maxX = 254,
        minY = 1,
        maxY = 254,
        ports = [80, 554, 8899, 34567], //80 = Web, 554 = RTCP, 8899 = Onvif, 34567 = 
        timeout = 300,
        blocks = 20
    } = params;


    function* ipGenerator(){

        for (let x = minX; x <= maxX; x++) {

            for (let y = minY; y <= maxY; y++) {

                yield `${base_ip}.${x}.${y}`;
            }
        }
    }

    const results = new Map();

    const generator = ipGenerator();

    const worker = async () => {

        while(true){

            const { value: ip, done } = generator.next();

            if(done) break;

            console.log(`Try: ${ip}`);

            const result = await scanIP(ip, ports, timeout);

            if(result.length > 0) {
                results.set(ip, result);
            }
        }
    };

    await Promise.all(
        Array.from({ length: blocks }, worker)
    );

    return results;
}


async function scanPort(ip, port, timeout = 300) {
    
    return new Promise(resolve => {

        const socket = new net.Socket();

        let status = false;

        socket.setTimeout(timeout);

        socket.connect(port, ip, () => {
            status = true;
            socket.destroy();
        });

        socket.on("timeout", () => socket.destroy());
        socket.on("error", () => {});
        socket.on("close", () => resolve(status));
    });
}

async function scanIP(ip, ports, timeout = 300) {

    const results = [];

    for(const port of ports) {

        const open = await scanPort(ip, port, timeout);

        if(open){

            results.push(port);
        }
    }

    return results;
}




