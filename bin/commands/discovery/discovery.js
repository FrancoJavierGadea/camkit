import OnvifDiscovery from "../../../src/onvif/OnvifDiscovery.js";
import { XMLParser } from "../../../src/utils/xml/XMLParser.js";
import { Tag } from "../../../src/utils/xml/nodesUtils.js";
import { renderFull, renderMinimal } from "./render.js";

export async function runDiscovery(params = {}) {

    const { hostIp, timeout, minimal } = params;

    const camera = new OnvifDiscovery({ localAddress: hostIp });

    const callbacks = minimal ? renderMinimal(params) : renderFull(params);

    camera.on('probe-sent', () => {

        callbacks.onProbeSent?.();
    });

    camera.on('device-found', (e) => {

        const { ip, xml } = e.detail;
        const tree = XMLParser.parse(xml);
        const address = XMLParser.getText(tree, Tag.endsWith('XAddrs'));

        callbacks.onDeviceFound?.({ ip, address });
    });
    
    camera.on('close', () => {

        callbacks.onClose?.();
    });

    const results = await camera.find({ timeout });
}