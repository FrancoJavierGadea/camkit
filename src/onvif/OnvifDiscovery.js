import dgram from "node:dgram";
import crypto from "node:crypto";

/**
 * @typedef {Object} OnvifDiscoveryConstructorParams
 * @property {string} localAddress - Required: Local IP address to bind the socket.
 * @property {string} [multicast_ip] - Multicast IP address to send the probe (default: '239.255.255.250')
 * @property {number} [port] - Port number to send the probe (default: 3702)
 * @property {number} [timeout] - Discovery timeout in milliseconds (default: 3000)
 */
/**
 * Current discovery results:
 * IP address -> raw XML response
 * 
 * @typedef {Map<string, string>} OnvifDiscoveryResults
 */
/**
 * Supported ONVIF discovery event names.
 * 
 * @typedef {'probe-sent' | 'device-found' | 'error' | 'timeout' | 'close'} OnvifDiscoveryEventName
 */
/**
 * Event payload for ONVIF discovery events.
 * 
 * @typedef {Object} OnvifDiscoveryEventDetail
 * @property {string} ip - Device IP address.
 * @property {string} xml - Raw XML response from the device.
 * @property {OnvifDiscoveryResults} results - Current discovered devices.
 */
/**
 * Custom event emitted during the discovery process.
 * 
 * @typedef {CustomEvent<OnvifDiscoveryEventDetail>} OnvifDiscoveryEvent
 */
/**
 * Event listener callback for discovery events.
 * 
 * @typedef {(event: OnvifDiscoveryEvent) => void} OnvifDiscoveryEventHandler
 */


//MARK: OnvifDiscovery
export class OnvifDiscovery {

    static defaults = {
        multicast_ip: '239.255.255.250',
        port: 3702,
        timeout: 3000
    };

    static events = {
        PROBE_SENT: 'probe-sent',
        DEVICE_FOUND: 'device-found',
        ERROR: 'error',
        TIMEOUT: 'timeout',
        CLOSE: 'close'
    };

    #socket;
    #eventTarget = new EventTarget();
    #timeoutId;
    #promise;
    #results;
    #settled = false;

    /** @param {OnvifDiscoveryConstructorParams} params */
    constructor(params = {}){

        const defaults = this.constructor.defaults;

        Object.assign(this, defaults, params);

        const {localAddress} = params;

        if(!localAddress) throw new Error('OnvifDiscovery: localAddress is required');

        this.localAddress = localAddress;
    }

    //MARK: Find
    /**
     * Starts the ONVIF discovery process by sending a WS-Discovery probe
     * over UDP multicast and collecting responses from compatible devices.
     *
     * During the discovery lifecycle, events such as `'probe-sent'`,
     * `'device-found'`, `'error'`, `'timeout'`, and `'close'` may be emitted.
     *
     * Resolves with a map of discovered devices where:
     * IP address -> raw XML discovery response.
     *
     * @param {{ timeout?: number }} [params] - Optional discovery settings.
     * @returns {Promise<OnvifDiscoveryResults>} A promise that resolves with all discovered devices.
     */
    async find(params = {}){

        const E = OnvifDiscovery.events;
        const {timeout = this.timeout} = params;

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

 
 
            const xml = message.toString();

            if(!this.#results.has(ip)) this.#results.set(ip, xml);

            //MARK: Device found
            this.#eventTarget.dispatchEvent(new CustomEvent(E.DEVICE_FOUND, {
                detail: {
                    ip,
                    xml,
                    results: new Map(this.#results)
                }
            }));
        });

        this.#socket.on("error", (err) => {

            this.#eventTarget.dispatchEvent(new CustomEvent(E.ERROR, {detail: err}));

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
                    //MARK: Error
                    this.#eventTarget.dispatchEvent(new CustomEvent(E.ERROR, {detail: err}));
                    
                    this.#promise.reject(err);
                    this.#settled = true;
                    this.close();
                    return;
                }

                //MARK: Probe sent
                this.#eventTarget.dispatchEvent(new CustomEvent(E.PROBE_SENT));
            });
        });

        this.#timeoutId = setTimeout(() => {

            this.close();
            this.#eventTarget.dispatchEvent(new CustomEvent(E.TIMEOUT));

        }, timeout);

        return this.#promise.promise;
    }

    //MARK: Events
    /**
     * @param {OnvifDiscoveryEventName} event 
     * @param {OnvifDiscoveryEventHandler} handler 
     */
    on(event, handler){
        this.#eventTarget.addEventListener(event, handler);
    }
    /**
     * @param {OnvifDiscoveryEventName} event 
     * @param {OnvifDiscoveryEventHandler} handler 
     */
    off(event, handler){
        this.#eventTarget.removeEventListener(event, handler);
    }

    /**
     * Stops the discovery process, closes the UDP socket,
     * clears the timeout, and releases internal resources.
     *
     * If a discovery operation is still pending, the promise is resolved
     * with the devices found so far before emitting the `'close'` event.
     */
    close(){
        const E = OnvifDiscovery.events;

        if(!this.#socket) return;

        try {
            this.#socket.removeAllListeners();
            this.#socket.close();
        } catch {}

        if(this.#timeoutId) clearTimeout(this.#timeoutId);

        this.#eventTarget.dispatchEvent(new CustomEvent(E.CLOSE));

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