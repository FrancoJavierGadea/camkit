import OnvifDiscovery from "../../../src/onvif/OnvifDiscovery.js";
import { runDiscovery } from "./discovery.js";
import { renderFull, renderMinimal } from "./render.js";


export default {
    command: 'discovery',
    alias: ['--discovery'],
    options: {
        hostIp: {
            defaultValue: null,
            alias: ['-ip', '--host-ip', '--my-ip'],
            required: true
        },
        timeout: {
            defaultValue: OnvifDiscovery.defaults.timeout,
            alias: ['-t', '--timeout']
        },
        multicast_ip: {
            defaultValue: OnvifDiscovery.defaults.multicast_ip,
            alias: ['--multicast-ip']
        },
        port: {
            defaultValue: OnvifDiscovery.defaults.port,
            alias: ['--port']
        },

        minimal: {
            defaultValue: false,
            alias: ['-m', '--minimal']
        }
    },
    async exec(params = {}){

        await runDiscovery(params);
    }
};