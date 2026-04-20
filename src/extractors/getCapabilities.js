import XMLParser from "../utils/xml/XMLParser.js";
import { Tag } from "../utils/xml/nodesUtils.js";
import { Cast } from "../utils/xml/ObjectUtils.js";


export async function getCapabilities(onvifDevice, params = {}) {

    const xml = await onvifDevice.getCapabilities();

    const results = {};

    const tagMap = {
        'Media': 'media',
        'Events': 'events',
        'PTZ': 'ptz',
        'Imaging': 'imaging',
        'Analytics': 'analitycs',
        'DeviceIO': 'deviceIO'
    };

    const tree = XMLParser.parse(xml);

    //Device
    const device = XMLParser.getNode(tree, Tag.endsWith('Device'));

    results.device = {
        xaddr: XMLParser.getText(device, Tag.endsWith('XAddr')),
    }

    //Supported versions
    const system = XMLParser.getNode(device, Tag.endsWith('System'));

    const supportedVersions = XMLParser.getNodes(system, Tag.endsWith('SupportedVersions'));

    results.device.supportedVersions = supportedVersions.map(version => {

        const major = XMLParser.getText(version, Tag.endsWith('Major'));
        const minor = XMLParser.getText(version, Tag.endsWith('Minor'));

        return Cast.toNumber({
            major, 
            minor, 
            version: `${major}.${minor}`
        }, 'major', 'minor');
    })
    .toSorted((a, b) => a.major - b.major || a.minor - b.minor);

    //Cam Capabilities
    for(const tag in tagMap) {

        const key = tagMap[tag];

        results[key] = {};

        const xaddr = XMLParser.getText(tree, Tag.endsWith(tag), Tag.endsWith('XAddr'));

        if(xaddr) {
            results[key].xaddr = xaddr;
            results[key].supported = true;
        }
        else {
            results[key].supported = false;
        }
    }

    //Streming capabilities
    if(results.media.supported){

        const streaming = XMLParser.getNodeAt(tree, Tag.endsWith('Media'), Tag.endsWith('StreamingCapabilities'));

        results.media.streaming = Cast.toBoolean({
            RTPMulticast: XMLParser.getText(streaming, Tag.endsWith('RTPMulticast')),
            RTP_TCP: XMLParser.getText(streaming, Tag.endsWith('RTP_TCP')),
            RTP_RTSP_TCP: XMLParser.getText(streaming, Tag.endsWith('RTP_RTSP_TCP')),
        });
    }

    //Events
    if(results.events.supported){

        results.events.pullPoint = Cast.toBoolean({
            supported: XMLParser.getText(tree, Tag.endsWith('Events'), Tag.endsWith('PullPointSupport'))
        });
    }

    return results;
}
