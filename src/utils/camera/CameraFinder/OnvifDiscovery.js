import dgram from "node:dgram";
import crypto from "node:crypto";


export class OnvifDiscovery {

    static defaults = {
        MULTICAST_IP: '239.255.255.250',
        PORT: 3702
    };

    #socket;
    #eventTarget = new EventTarget();
    #timeoutId;
    #promise;
    #results;
    #settled = false;

    constructor(params = {}){

        const defaults = this.constructor.defaults;
        const {
            multicast_ip,
            port,
            localAddress,
        } = params;

        if(!localAddress) throw new Error('OnvifDiscovery: localAddress is required');

        this.localAddress = localAddress;

        this.multicast_ip = multicast_ip ?? defaults.MULTICAST_IP;
        this.port = port ?? defaults.PORT;
    }

    //MARK: Find
    async find({timeout = 3000, logs = false} = {}){

        if(this.#socket) return this.#promise.promise;

        this.#promise = Promise.withResolvers();
        this.#settled = false;

        this.#results = new Map();
        this.#socket = dgram.createSocket("udp4");

        const message = /*xml*/`
        <?xml version="1.0" encoding="UTF-8"?>
        <e:Envelope xmlns:e="http://www.w3.org/2003/05/soap-envelope"
                xmlns:w="http://schemas.xmlsoap.org/ws/2004/08/addressing"
                xmlns:d="http://schemas.xmlsoap.org/ws/2005/04/discovery"
                xmlns:dn="http://www.onvif.org/ver10/network/wsdl">
            <e:Header>
                <w:MessageID>uuid:${crypto.randomUUID()}</w:MessageID>
                <w:To>urn:schemas-xmlsoap-org:ws:2005:04:discovery</w:To>
                <w:Action>http://schemas.xmlsoap.org/ws/2005/04/discovery/Probe</w:Action>
            </e:Header>
            <e:Body>
                <d:Probe>
                    <d:Types>dn:NetworkVideoTransmitter</d:Types>
                </d:Probe>
            </e:Body>
        </e:Envelope>`;

        this.#socket.on("message", async (message, remoteInfo) => {

            const ip = remoteInfo.address;

            if(logs) console.log("📡 Device found:", ip);

            const xml = message.toString();

            if (!this.#results.has(ip)) this.#results.set(ip, xml);

            this.#eventTarget.dispatchEvent(new CustomEvent('device-found', {
                detail: {
                    ip,
                    xml,
                    founded: new Map(this.#results)
                }
            }));
        });

        this.#socket.on("error", (err) => {

            if(logs) console.error("Error en el socket:", err);

            this.#promise.reject(err);
            this.#settled = true;
            this.close();
        });

        this.#socket.bind(0, this.localAddress, () => {

            this.#socket.setBroadcast(true);
            this.#socket.addMembership(this.multicast_ip, this.localAddress);

            const buffer = Buffer.from(message);

            this.#socket.send(buffer, 0, buffer.length, this.port, this.multicast_ip, (err) => {

                if(err){
                    if(logs) console.error("Error al enviar el mensaje:", err);
                    
                    this.#promise.reject(err);
                    this.#settled = true;
                    this.close();
                    return;
                }

                if(logs) console.log("🚀 ONVIF probe sent");
                this.#eventTarget.dispatchEvent(new CustomEvent('probe-sent'));
            });
        });

        this.#timeoutId = setTimeout(() => {

            this.close();
            this.#eventTarget.dispatchEvent(new CustomEvent('timeout'));

        }, timeout);

        return this.#promise.promise;
    }

    //MARK: Events
    on(event, handler){
        this.#eventTarget.addEventListener(event, handler);
    }
    off(event, handler){
        this.#eventTarget.removeEventListener(event, handler);
    }

    close(){
        if(!this.#socket) return;

        try {
            this.#socket.removeAllListeners();
            this.#socket.close();
        } catch {}

        if(this.#timeoutId) clearTimeout(this.#timeoutId);

        this.#eventTarget.dispatchEvent(new CustomEvent('close'));

        if(this.#promise && !this.#settled){
            this.#promise.resolve(this.#results);
            this.#settled = true;
        }

        this.#socket = null;
        this.#promise = null;
        this.#timeoutId = null;
        this.#results = null;
    }
}

export default OnvifDiscovery;